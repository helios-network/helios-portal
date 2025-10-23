import apiClient, { shouldDisableRefetch } from "@/lib/api/apiClient"
import type {
    ChainStatsResponse,
    TotalTransactionCountResponse,
    TvlChartItem,
    TransactionCountChartItem
} from "@/types/api"
import { useQueries } from "@tanstack/react-query"

export interface HomeDataParams {
    refreshInterval?: number
    blocksLimit?: number
    transactionsLimit?: number
}

export interface HomeData {
    totalTransactions: string | undefined
    chainStats: any
    recentBlocks: any
    recentTransactions: any
    tvlChartData: TvlChartItem[]
    transactionCountChartData: TransactionCountChartItem[]
    isLoading: boolean
    isError: boolean
    errors: (Error | null)[]
}

export const useHomeData = ({
    refreshInterval = 30000,
    blocksLimit = 6,
    transactionsLimit = 5,
}: HomeDataParams = {}): HomeData => {
    // Disable refetch if auth failed
    const actualRefreshInterval = shouldDisableRefetch() ? false : refreshInterval

    // Only enable queries if refreshInterval is provided (meaning we're on home page)
    const isEnabled = refreshInterval !== undefined

    const queries = useQueries({
        queries: [
            // Total Transactions API
            {
                queryKey: ["eth_getTransactionCount_total"],
                queryFn: async () => {
                    const response = await apiClient.post<
                        TotalTransactionCountResponse["result"] | undefined
                    >("", {
                        jsonrpc: "2.0",
                        method: "eth_getTransactionCountOnChain",
                        params: [],
                        id: 1,
                    })
                    if (response?.result) {
                        return parseInt(response.result, 16).toString()
                    }
                    return response?.result
                },
                staleTime: 5 * 60 * 1000,
                refetchInterval: actualRefreshInterval,
                enabled: isEnabled,
                retry: false,
            },
            // Chain Stats API
            {
                queryKey: ["chain-stats"],
                queryFn: async () => {
                    const response = await apiClient.post<ChainStatsResponse | undefined>(
                        "",
                        {
                            jsonrpc: "2.0",
                            method: "eth_getChainStats",
                            params: [],
                            id: 1,
                        },
                    )
                    return response?.result
                },
                staleTime: 5 * 60 * 1000,
                refetchInterval: actualRefreshInterval,
                enabled: isEnabled,
                retry: false,
            },
            // Recent Blocks API
            {
                queryKey: ["eth_listBlocks", 1, blocksLimit],
                queryFn: async () => {
                    try {
                        const response = await apiClient.post<{
                            data: any[]
                            metadata: {
                                total: number
                                page: number
                                limit: number
                            }
                        }>("", {
                            jsonrpc: "2.0",
                            method: "eth_listBlocks",
                            params: [1, blocksLimit, {}],
                            id: 1,
                        })

                        if (!response) return undefined

                        return {
                            id: response.id,
                            jsonrpc: response.jsonrpc,
                            result: response.result,
                            mapNameTag: response.mapNameTag || {},
                        }
                    } catch (error) {
                        throw error
                    }
                },
                staleTime: 5 * 60 * 1000,
                refetchInterval: actualRefreshInterval,
                refetchOnWindowFocus: false,
                refetchOnMount: false,
                enabled: isEnabled,
                retry: false,
            },
            // Recent Transactions API
            {
                queryKey: ["eth_listTransactions", 1, transactionsLimit],
                queryFn: async () => {
                    try {
                        const response = await apiClient.post<{
                            data: any[]
                            metadata: {
                                total: number
                                page: number
                                limit: number
                            }
                        }>("", {
                            jsonrpc: "2.0",
                            method: "eth_listTransactions",
                            params: [1, transactionsLimit, {}],
                            id: 1,
                        })

                        if (!response) return undefined

                        return {
                            id: response.id,
                            jsonrpc: response.jsonrpc,
                            result: response.result,
                            mapNameTag: response.mapNameTag || {},
                        }
                    } catch (error) {
                        throw error
                    }
                },
                staleTime: 5 * 60 * 1000,
                refetchInterval: actualRefreshInterval,
                refetchOnWindowFocus: false,
                refetchOnMount: false,
                enabled: isEnabled,
                retry: false,
            },
            {
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
                staleTime: 5 * 60 * 1000,
                refetchInterval: false,
                enabled: isEnabled,
                retry: false,
            },
            {
                queryKey: ["home_transaction_count_chart"],
                queryFn: async () => {
                    const response = await apiClient.post<TransactionCountChartItem[]>(
                        "",
                        {
                            jsonrpc: "2.0",
                            method: "eth_getTransactionCountChart",
                            params: ["", ""],
                            id: 1,
                        },
                    )
                    return response?.result || []
                },
                staleTime: 5 * 60 * 1000,
                refetchInterval: false,
                enabled: isEnabled,
                retry: false,
            },
        ],
    })

    const [
        totalTransactionsQuery,
        chainStatsQuery,
        recentBlocksQuery,
        recentTransactionsQuery,
        tvlChartQuery,
        transactionCountChartQuery,
    ] = queries

    return {
        totalTransactions: totalTransactionsQuery.data,
        chainStats: chainStatsQuery.data,
        recentBlocks: recentBlocksQuery.data,
        recentTransactions: recentTransactionsQuery.data,
        tvlChartData: tvlChartQuery.data || [],
        transactionCountChartData: transactionCountChartQuery.data || [],
        isLoading: queries.some((query) => query.isLoading),
        isError: queries.some((query) => query.isError),
        errors: queries.map((query) => query.error),
    }
}