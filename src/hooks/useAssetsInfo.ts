import { APP_COLOR_SECONDARY } from "../config/app"
import { TOKEN_COLORS } from "../config/constants"
import { getAllWhitelistedAssets } from "../helpers/rpc-calls"
import { fromWeiToEther, secondsToMilliseconds } from "../utils/number"
import { fetchCGTokenData } from "../utils/price"
import { useQuery } from "@tanstack/react-query"

export const useAssetsInfo = () => {
  const qAssets = useQuery({
    queryKey: ["whitelistedAssets"],
    queryFn: getAllWhitelistedAssets,
    refetchInterval: secondsToMilliseconds(10)
  })

  const qTokenData = useQuery({
    queryKey: ["tokenData", qAssets.data?.map((a) => a.denom.toLowerCase())],
    queryFn: () =>
      fetchCGTokenData(qAssets.data?.map((a) => a.denom.toLowerCase()) || []),
    enabled: !!qAssets.data
  })

  let totalTVL = 0
  let assetsWithTVL: any[] = []

  if (qAssets.data) {
    assetsWithTVL = qAssets.data.map((asset) => {
      const symbol = asset.denom.toLowerCase() as keyof typeof TOKEN_COLORS

      const tokenAmount = parseFloat(asset.totalShares) / asset.baseWeight
      const tokenAmountFormatted = fromWeiToEther(tokenAmount.toString())
      const tokenData = (qTokenData.data && qTokenData.data[symbol]) || {
        price: 0,
        symbolIcon: ""
      }
      const tvlUSD = parseFloat(tokenAmountFormatted) * tokenData.price

      const isHelios = asset.denom === "ahelios"

      return {
        ...asset,
        color: TOKEN_COLORS[symbol] || APP_COLOR_SECONDARY,
        tokenAmount: tokenAmountFormatted,
        tvlUSD,
        name: isHelios ? "HELIOS" : asset.denom.toUpperCase(),
        symbol: isHelios ? "HELIOS" : symbol.toUpperCase(),
        symbolIcon: isHelios ? "helios" : "token:" + asset.denom
      }
    })

    totalTVL = assetsWithTVL.reduce((sum, asset) => sum + asset.tvlUSD, 0)
  }

  return {
    forceRefresh: qAssets.refetch,
    assets: assetsWithTVL,
    totalTVL,
    holders: 0, // @TODO
    isLoading: qAssets.isLoading || qTokenData.isLoading,
    error: qAssets.error || qTokenData.error
  }
}
