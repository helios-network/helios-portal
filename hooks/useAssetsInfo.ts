import { getAllWhitelistedAssets } from "@/helpers/rpc-calls"
import { fromWeiToEther, secondsToMilliseconds } from "@/utils/number"
import { useQuery } from "@tanstack/react-query"
import { useTokenRegistry } from "./useTokenRegistry"
import { HELIOS_NETWORK_ID } from "@/config/app"

type UseAssetsInfoOptions = { updateBalance?: boolean }

export const useAssetsInfo = (options: UseAssetsInfoOptions = {}) => {
  const { updateBalance = false } = options
  const { getTokenByAddress } = useTokenRegistry()

  const qAssets = useQuery({
    queryKey: ["whitelistedAssets"],
    queryFn: getAllWhitelistedAssets,
    refetchInterval: secondsToMilliseconds(60)
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

      const enrichedAssets = await Promise.all(
        data.map(async (asset) => {
          const enriched = await getTokenByAddress(
            asset.contractAddress,
            HELIOS_NETWORK_ID,
            { updateBalance }
          )
          if (!enriched) return null

          const tokenAmount = parseFloat(asset.totalShares) / asset.baseWeight
          const tokenAmountString = tokenAmount.toLocaleString("fullwide", {
            useGrouping: false
          })
          const tokenAmountFormatted = fromWeiToEther(tokenAmountString)
          const tvlUSD = parseFloat(tokenAmountFormatted) * enriched.price.usd

          return {
            ...asset,
            tokenAmount: tokenAmountFormatted,
            tvlUSD,
            enriched,
            holders: enriched.stats.holdersCount
          }
        })
      )

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
