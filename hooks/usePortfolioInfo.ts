import { useQuery } from "@tanstack/react-query"
import { useAccount } from "wagmi"
import { getTokensBalance } from "@/helpers/rpc-calls"
import { toHex, secondsToMilliseconds } from "@/utils/number"
import { TokenExtended } from "@/types/token"
import { ethers } from "ethers"
import { HELIOS_NETWORK_ID } from "@/config/app"
import { getTokenDetailsInBatch } from "./useTokenEnrichmentBatch"
import { fetchCGTokenData } from "@/utils/price"
import { TOKEN_COLORS } from "@/config/constants"
import { APP_COLOR_DEFAULT } from "@/config/app"

// Cache configuration constants
const TOKEN_BALANCE_STALE_TIME = secondsToMilliseconds(20)
const TOKEN_BALANCE_REFETCH_INTERVAL = secondsToMilliseconds(30)
const ENRICHED_PORTFOLIO_STALE_TIME = secondsToMilliseconds(30)
const ENRICHED_PORTFOLIO_REFETCH_INTERVAL = secondsToMilliseconds(60)

export const usePortfolioInfo = () => {
  const { address } = useAccount()

  const qTokenBalances = useQuery({
    queryKey: ["tokensBalance", address],
    queryFn: () => getTokensBalance(address!, toHex(1), toHex(10)),
    enabled: !!address,
    staleTime: TOKEN_BALANCE_STALE_TIME,
    refetchInterval: TOKEN_BALANCE_REFETCH_INTERVAL
  })

  const enrichedTokensQuery = useQuery({
    queryKey: ["enrichedPortfolio", address, qTokenBalances.dataUpdatedAt],
    enabled: !!qTokenBalances.data,
    refetchOnWindowFocus: false,
    staleTime: ENRICHED_PORTFOLIO_STALE_TIME,
    refetchInterval: ENRICHED_PORTFOLIO_REFETCH_INTERVAL,
    queryFn: async (): Promise<TokenExtended[]> => {
      // ⚡ PHASE 5C: Batch fetch all token metadata in 1-2 HTTP requests instead of N
      const tokenAddresses = qTokenBalances.data!.Balances.map(b => b.address)

      // Batch fetch metadata for all tokens at once
      const batchMetadata = await getTokenDetailsInBatch(tokenAddresses)

      // Fetch price data for all symbols at once
      const symbols = Object.values(batchMetadata)
        .map(m => m.metadata.symbol.toLowerCase())
      const cgData = await fetchCGTokenData(symbols)

      // Map balances to enriched tokens
      const results = qTokenBalances.data!.Balances.map((token) => {
        const metadata = batchMetadata[token.address]
        if (!metadata) return null

        const symbol = metadata.metadata.symbol.toLowerCase()
        const cgToken = cgData[symbol]
        const unitPrice = cgToken?.price || 0

        // Find origin blockchain
        let originBlockchain = "42000"
        for (const chainMetadata of metadata.metadata.chainsMetadatas) {
          if (chainMetadata.isOriginated) {
            originBlockchain = `${chainMetadata.chainId}`
            break
          }
        }

        const amount = parseFloat(
          ethers.formatUnits(token.balance, metadata.metadata.decimals)
        )

        const enriched: TokenExtended = {
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
            amount,
            totalPrice: amount * unitPrice
          },
          functionnal: {
            address: token.address,
            chainId: HELIOS_NETWORK_ID,
            denom: metadata.metadata.base,
            decimals: metadata.metadata.decimals
          },
          stats: {
            holdersCount: metadata.holdersCount,
            totalSupply: metadata.total_supply
          },
          originBlockchain
        }

        return enriched
      })

      return results.filter((token): token is TokenExtended => token !== null)
    }
  })

  const totalUSD =
    enrichedTokensQuery.data?.reduce(
      (sum, token) => sum + token.balance.totalPrice,
      0
    ) || 0

  return {
    totalUSD,
    portfolio: enrichedTokensQuery.data || [],
    isLoading: qTokenBalances.isLoading || enrichedTokensQuery.isLoading,
    error: qTokenBalances.error || enrichedTokensQuery.error
  }
}
