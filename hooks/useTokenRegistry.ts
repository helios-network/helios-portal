"use client"

import { useState, useRef } from "react"
import { useChainId, useAccount } from "wagmi"
import {
  fetchTokenBalance,
  fetchTokenInfo,
  fetchTokenBalanceOnly
} from "@/hooks/useTokenInfo"
import { TokenExtended } from "@/types/token"
import { fetchCGTokenData } from "@/utils/price"
import { TOKEN_COLORS } from "@/config/constants"
import { APP_COLOR_DEFAULT, HELIOS_NETWORK_ID } from "@/config/app"
import { getTokenDetail, getTokensDetails } from "@/helpers/rpc-calls"

export const useTokenRegistry = () => {
  const [tokens, setTokens] = useState<TokenExtended[]>([])
  const currentChainId = useChainId()
  const { address: userAddress } = useAccount()

  const inFlightRequests = useRef<Map<string, Promise<TokenExtended | null>>>(
    new Map()
  )

  const getTokenKey = (address: string, chainId: number) =>
    `${address.toLowerCase()}-${chainId}`

  type GetTokenOpts = { updateBalance?: boolean }

  const getTokenByAddress = async (
    tokenAddress: string,
    tempChainId?: number,
    opts: GetTokenOpts = { updateBalance: false }
  ): Promise<TokenExtended | null> => {
    const chainId = tempChainId || currentChainId
    const key = getTokenKey(tokenAddress, chainId)

    // Check if we already have this token
    const existing = tokens.find(
      (t) =>
        t.functionnal.address.toLowerCase() === tokenAddress.toLowerCase() &&
        t.functionnal.chainId === chainId
    )
    if (existing) {
      if (opts.updateBalance && userAddress) {
        const info = await fetchTokenBalanceOnly(
          tokenAddress,
          chainId,
          userAddress,
          existing.functionnal.decimals
        )
        existing.balance.amount = info.readableBalance
        existing.balance.totalPrice = info.readableBalance * existing.price.usd
      }
      return existing
    }

    // Avoid duplicate concurrent requests
    if (inFlightRequests.current.has(key)) {
      return inFlightRequests.current.get(key)!
    }

    // Start and cache the request
    const promise = (async () => {
      try {
        const data = await getTokenDetail(tokenAddress)
        if (!data) throw new Error("Token not found")

        // Use only RPC metadata for static fields; defer on-chain balance unless explicitly requested
        const symbol = data.metadata.symbol.toLowerCase()
        const cgData = await fetchCGTokenData([symbol])
        const cgToken = cgData[symbol]
        const unitPrice = cgToken?.price || 0

        let originBlockchain = "42000"

        if (data.metadata.chainsMetadatas && data.metadata.chainsMetadatas.length > 0) {
          for (const chainMetadata of data.metadata.chainsMetadatas) {
            if (chainMetadata.isOriginated) {
              originBlockchain = `${chainMetadata.chainId}`
              break
            }
          }
        }

        const newToken: TokenExtended = {
          display: {
            name: data.metadata.name,
            description: "",
            logo: cgToken?.logo || "",
            symbol,
            symbolIcon: symbol === "hls" ? "helios" : "token:" + symbol,
            color:
              TOKEN_COLORS[symbol as keyof typeof TOKEN_COLORS] ||
              APP_COLOR_DEFAULT
          },
          price: { usd: unitPrice },
          balance: {
            amount: 0,
            totalPrice: 0
          },
          functionnal: {
            address: tokenAddress,
            chainId,
            denom: data.metadata.base,
            decimals: data.metadata.decimals
          },
          stats: {
            holdersCount: data.holdersCount,
            totalSupply: data.total_supply
          },
          originBlockchain: originBlockchain
        }

        if (opts.updateBalance && userAddress) {
          try {
            const info = await fetchTokenBalanceOnly(
              tokenAddress,
              chainId,
              userAddress,
              newToken.functionnal.decimals
            )
            newToken.balance.amount = info.readableBalance
            newToken.balance.totalPrice =
              info.readableBalance * newToken.price.usd
          } catch (e) {
            console.error(
              "Failed to update balance for token:",
              tokenAddress,
              e
            )
          }
        }

        setTokens((prev) => [...prev, newToken])
        return newToken
      } catch (err) {
        console.error(
          "Error while fetching token address : " + tokenAddress,
          err
        )
        return null
      } finally {
        inFlightRequests.current.delete(key) // Clean up the cache
      }
    })()

    inFlightRequests.current.set(key, promise)
    return promise
  }

  const getTokenBySymbol = (
    symbol: string,
    tempChainId?: number
  ): TokenExtended | null => {
    const chainId = tempChainId || currentChainId
    const loweredSymbol = symbol.toLowerCase()

    return (
      tokens.find(
        (t) =>
          t.display.symbol.toLowerCase() === loweredSymbol &&
          t.functionnal.chainId === chainId
      ) || null
    )
  }

  const getTokenByAddresses = async (
    tokenAddresses: string[],
    tempChainId?: number,
    opts: GetTokenOpts = { updateBalance: false }
  ): Promise<(TokenExtended | null)[]> => {
    const chainId = tempChainId || currentChainId

    if (!tokenAddresses || tokenAddresses.length === 0) return []

    // Check which tokens are already cached
    const cachedTokens: (TokenExtended | null)[] = []
    const uncachedAddresses: string[] = []
    const uncachedIndices: number[] = []

    tokenAddresses.forEach((address, idx) => {
      const existing = tokens.find(
        (t) =>
          t.functionnal.address.toLowerCase() === address.toLowerCase() &&
          t.functionnal.chainId === chainId
      )
      if (existing) {
        cachedTokens[idx] = existing
      } else {
        cachedTokens[idx] = null
        uncachedAddresses.push(address)
        uncachedIndices.push(idx)
      }
    })

    // If all cached, return early
    if (uncachedAddresses.length === 0) return cachedTokens

    // Batch fetch uncached token metadata
    try {
      const tokenDetails = await getTokensDetails(uncachedAddresses)
      if (!tokenDetails || tokenDetails.length === 0) return cachedTokens

      const symbols = tokenDetails.map(t => t?.metadata?.symbol?.toLowerCase()).filter(Boolean)
      const cgData = await fetchCGTokenData(symbols)

      // Enrich each uncached token
      const enrichedTokens = uncachedAddresses.map((address, idx) => {
        const metadata = tokenDetails[idx]
        if (!metadata) return null

        const symbol = metadata.metadata.symbol.toLowerCase()
        const cgToken = cgData[symbol]
        const unitPrice = cgToken?.price || 0

        let originBlockchain = "42000"
        if (metadata.metadata.chainsMetadatas && metadata.metadata.chainsMetadatas.length > 0) {
          for (const chainMetadata of metadata.metadata.chainsMetadatas) {
            if (chainMetadata.isOriginated) {
              originBlockchain = `${chainMetadata.chainId}`
              break
            }
          }
        }

        const newToken: TokenExtended = {
          display: {
            name: metadata.metadata.name,
            description: "",
            logo: cgToken?.logo || "",
            symbol,
            symbolIcon: symbol === "hls" ? "helios" : `token:${symbol}`,
            color: TOKEN_COLORS[symbol as keyof typeof TOKEN_COLORS] || APP_COLOR_DEFAULT
          },
          price: { usd: unitPrice },
          balance: {
            amount: 0,
            totalPrice: 0
          },
          functionnal: {
            address,
            chainId,
            denom: metadata.metadata.base,
            decimals: metadata.metadata.decimals
          },
          stats: {
            holdersCount: metadata.holdersCount,
            totalSupply: metadata.total_supply
          },
          originBlockchain
        }

        // Update balances if requested
        if (opts.updateBalance && userAddress) {
          return (async () => {
            try {
              const info = await fetchTokenBalanceOnly(
                address,
                chainId,
                userAddress,
                newToken.functionnal.decimals
              )
              newToken.balance.amount = info.readableBalance
              newToken.balance.totalPrice = info.readableBalance * newToken.price.usd
            } catch (e) {
              console.error("Failed to update balance for token:", address, e)
            }
            return newToken
          })()
        }

        return newToken
      })

      // Wait for all balance updates if needed
      const resolvedTokens = await Promise.all(enrichedTokens)

      // Add newly enriched tokens to cache
      setTokens((prev) => [...prev, ...resolvedTokens.filter((t): t is TokenExtended => t !== null)])

      // Map results back to original indices
      resolvedTokens.forEach((token, idx) => {
        cachedTokens[uncachedIndices[idx]] = token
      })

      return cachedTokens
    } catch (err) {
      console.error("Error while fetching tokens:", err)
      return cachedTokens
    }
  }

  return {
    tokens,
    getTokenByAddress,
    getTokenByAddresses,
    getTokenBySymbol
  }
}
