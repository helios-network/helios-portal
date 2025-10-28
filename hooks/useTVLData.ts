import { useQuery } from "@tanstack/react-query"
import apiClient from "@/lib/api/apiClient"
import type { TvlChartItem } from "@/types/api"

/**
 * Hook for fetching TVL chart data
 * OPTIMIZATION: Separated from useHomeData to prevent loading unnecessary queries
 * 
 * This hook only fetches eth_getTvlChart, unlike useHomeData which fetches 6+ queries
 * but most of them aren't used on the home page.
 */
export const useTVLData = () => {
    const CHART_STALE_TIME = 10 * 60 * 1000 // 10 minutes - charts change less frequently

    return useQuery({
        queryKey: ["home_tvl_chart"],
        queryFn: async () => {
            const response = await apiClient.post<TvlChartItem[]>("", {
                jsonrpc: "2.0",
                method: "eth_getTvlChart",
                params: ["", ""],
                id: 1,
            })
            return response?.result || []
        },
        staleTime: CHART_STALE_TIME,
        refetchInterval: false, // Chart data doesn't need constant refetch
        retry: false,
    })
}