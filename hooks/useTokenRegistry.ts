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
import { APP_COLOR_DEFAULT } from "@/config/app"
import { getTokenDetail } from "@/helpers/rpc-calls"

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

        for (const chainMetadata of data.metadata.chainsMetadatas) {
          if (chainMetadata.isOriginated) {
            originBlockchain = `${chainMetadata.chainId}`
            break
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

  return {
    tokens,
    getTokenByAddress,
    getTokenBySymbol
  }
}
