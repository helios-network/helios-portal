import { useQuery } from "@tanstack/react-query"
import { request } from "@/helpers/request"
import { secondsToMilliseconds } from "@/utils/number"

export interface WhitelistedAsset {
  denom: string
  baseWeight: number
  chainId: string
  chainName: string
  decimals: number
  symbol: string
  contractAddress: string
  totalShares: string
  networkPercentageSecurisation: string
}

export const useWhitelistedAssets = () => {
  const query = useQuery({
    queryKey: ["whitelistedAssets"],
    queryFn: () =>
      request<WhitelistedAsset[]>("eth_getAllWhitelistedAssets", []),
    staleTime: secondsToMilliseconds(300), // 5 minutes
    refetchInterval: secondsToMilliseconds(600) // 10 minutes
  })

  return {
    assets: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch
  }
}
