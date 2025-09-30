// API Response Types

export interface ChainStatsResponse {
    id: number
    createdAt: string
    updatedAt: string
    price: number
    marketCap: number
    totalTransactions: string
    tps: number
    medGasPrice: number
    transactionHistory: {
        count: number
        date: string
    }[]
    tvlValue: string
    totalTokenVoting: string
    totalGovernanceVote: string
    latestBlock: string
}

export interface TotalTransactionCountResponse {
    result: string
}

export interface TvlChartItem {
    date: string
    tvlValue: number
}

export interface TvlChartResponse {
    jsonrpc: string
    id: number
    result: TvlChartItem[]
}

export interface TransactionCountChartItem {
    date: string
    count: number
}

export interface TransactionCountChartResponse {
    jsonrpc: string
    id: number
    result: TransactionCountChartItem[]
}