import { getAllWhitelistedAssets } from "@/helpers/rpc-calls"
import { fromWeiToEther, secondsToMilliseconds } from "@/utils/number"
import { useQuery } from "@tanstack/react-query"
import { HELIOS_NETWORK_ID } from "@/config/app"
import { getTokenDetailsInBatch } from "./useTokenEnrichmentBatch"
import { fetchCGTokenData } from "@/utils/price"
import { TOKEN_COLORS } from "@/config/constants"
import { APP_COLOR_DEFAULT } from "@/config/app"

type UseAssetsInfoOptions = { updateBalance?: boolean }

export const useAssetsInfo = (options: UseAssetsInfoOptions = {}) => {
  const { updateBalance = false } = options

  const qAssets = useQuery({
    queryKey: ["whitelistedAssets"],
    queryFn: getAllWhitelistedAssets,
    staleTime: secondsToMilliseconds(300), // 5 minutes - prevents refetch immediately
    refetchInterval: secondsToMilliseconds(600) // 10 minutes - matches useWhitelistedAssets
  })

  const qFilteredAssets = useQuery({
    queryKey: [
      "filteredAssets",
      qAssets.data,
      qAssets.dataUpdatedAt,
      updateBalance
    ],
    enabled: !!qAssets.data,
    queryFn: async () => {
      const data = qAssets.data || []

      const tokenAddresses = data.map(asset => asset.contractAddress)

      // Batch fetch metadata for all tokens at once
      const batchMetadata = await getTokenDetailsInBatch(tokenAddresses)

      // Fetch price data for all symbols at once
      const symbols = Object.values(batchMetadata)
        .map(m => m.metadata.symbol.toLowerCase())
      const cgData = await fetchCGTokenData(symbols)

      // Map assets to enriched format
      const enrichedAssets = data.map((asset) => {
        const metadata = batchMetadata[asset.contractAddress]
        if (!metadata) return null

        const symbol = metadata.metadata.symbol.toLowerCase()
        const cgToken = cgData[symbol]
        const unitPrice = cgToken?.price || 0

        const tokenAmount = parseFloat(asset.totalShares) / asset.baseWeight
        const tokenAmountString = tokenAmount.toLocaleString("fullwide", {
          useGrouping: false
        })
        const tokenAmountFormatted = fromWeiToEther(tokenAmountString)
        const tvlUSD = parseFloat(tokenAmountFormatted) * unitPrice

        return {
          ...asset,
          tokenAmount: tokenAmountFormatted,
          tvlUSD,
          enriched: {
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
              address: asset.contractAddress,
              chainId: HELIOS_NETWORK_ID,
              denom: metadata.metadata.base,
              decimals: metadata.metadata.decimals
            },
            stats: {
              holdersCount: metadata.holdersCount,
              totalSupply: metadata.total_supply
            }
          },
          holders: metadata.holdersCount
        }
      })

      return enrichedAssets.filter((v) => v !== null)
    }
  })

  const totalTVL =
    qFilteredAssets.data?.reduce((sum, asset) => sum + asset.tvlUSD, 0) || 0
  const totalHolders =
    qFilteredAssets.data?.reduce((sum, asset) => sum + asset.holders, 0) || 0

  return {
    forceRefresh: qAssets.refetch,
    assets: qFilteredAssets.data || [],
    totalTVL,
    totalHolders,
    isLoading: qAssets.isLoading || qFilteredAssets.isLoading,
    error: qAssets.error || qFilteredAssets.error
  }
}
