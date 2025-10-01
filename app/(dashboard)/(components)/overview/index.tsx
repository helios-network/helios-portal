"use client"

import { Area, AreaChart, ResponsiveContainer, Tooltip } from "recharts"
import { useHomeData } from "@/hooks/useHomeData"
import { useWhitelistedAssets } from "@/hooks/useWhitelistedAssets"
import {
    formatNumberWithNotation,
    formatTokenAmount
} from "@/helpers/format"
import { Card } from "@/components/card"
import { Heading } from "@/components/heading"
import { RechartsTooltip } from "@/components/recharts/tooltip"
import s from "./overview.module.scss"

interface ChartProps {
    data: { date: string; value: number }[]
    gradientId: string
    prefix?: string
}

const CustomTooltip = ({ active, payload, prefix }: any) => {
    if (active && payload && payload.length) {
        return (
            <RechartsTooltip>
                <strong>
                    {prefix}{formatNumberWithNotation(payload[0].value)}
                </strong>
                <span>{payload[0].payload.date}</span>
            </RechartsTooltip>
        )
    }
    return null
}

const Chart = ({ data, gradientId, prefix }: ChartProps) => {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
                <defs>
                    <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-blue-500)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="var(--color-blue-500)" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <Tooltip content={<CustomTooltip prefix={prefix} />} cursor={{ stroke: 'var(--color-blue-500)', strokeWidth: 1 }} />
                <Area
                    type="monotone"
                    dataKey="value"
                    stroke="var(--color-blue-500)"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill={`url(#${gradientId})`}
                />
            </AreaChart>
        </ResponsiveContainer>
    )
}

export function Overview() {
    const {
        totalTransactions: homeDataTotalTransactions,
        chainStats: homeDataChainStats,
        tvlChartData,
        transactionCountChartData,
    } = useHomeData({
        refreshInterval: 30000,
    })

    const { assets } = useWhitelistedAssets()

    // Sum all totalShares from whitelisted assets
    const totalGovernanceVotes = assets.reduce((sum, asset) => {
        return sum + BigInt(asset.totalShares || "0")
    }, BigInt(0))

    const finalTotalTransactions = homeDataTotalTransactions
    const finalChainStats = homeDataChainStats

    const dataTotal =
        tvlChartData.length > 0
            ? tvlChartData.map((item: any) => ({
                date: item.date,
                value: item.tvlValue,
            }))
            : [
                { date: "Jan", value: 0 },
                { date: "Feb", value: 0 },
                { date: "Mar", value: 0 },
                { date: "Apr", value: 0 },
                { date: "May", value: 0 },
                { date: "Jun", value: 0 },
                { date: "Jul", value: 0 },
                { date: "Aug", value: 0 },
                { date: "Sep", value: 0 },
                { date: "Oct", value: 0 },
                { date: "Nov", value: 0 },
                { date: "Dec", value: 0 },
            ]

    const dataGovernance =
        transactionCountChartData.length > 0
            ? transactionCountChartData.map((item: any) => ({
                date: item.date,
                value: item.count,
            }))
            : [
                { date: "Jan", value: 0 },
                { date: "Feb", value: 0 },
                { date: "Mar", value: 0 },
                { date: "Apr", value: 0 },
                { date: "May", value: 0 },
                { date: "Jun", value: 0 },
                { date: "Jul", value: 0 },
                { date: "Aug", value: 0 },
                { date: "Sep", value: 0 },
                { date: "Oct", value: 0 },
            ]

    return (
        <div className={s.overview}>
            <Card className={s.card}>
                <Heading
                    icon="hugeicons:coins-dollar"
                    title="Total Value Locked"
                />
                <div className={s.content}>
                    <div className={s.stats}>
                        <div className={s.value}>
                            $
                            {finalChainStats?.tvlValue
                                ? formatNumberWithNotation(Number(finalChainStats.tvlValue))
                                : formatNumberWithNotation(0)}
                        </div>
                        <div className={s.meta}>
                            Restaked Assets:{" "}
                            <strong>
                                {finalChainStats?.totalTokenVoting
                                    ? formatTokenAmount(finalChainStats.totalTokenVoting, 18, 2)
                                    : "0"}{" "}
                                Tokens
                            </strong>
                        </div>
                    </div>
                    <div className={s.chart}>
                        <Chart data={dataTotal} gradientId="tvlGradient" prefix="$" />
                    </div>
                </div>
            </Card>

            <Card className={s.card}>
                <Heading
                    icon="hugeicons:structure-01"
                    title="Total Transactions"
                />
                <div className={s.content}>
                    <div className={s.stats}>
                        <div className={s.value}>
                            {finalTotalTransactions
                                ? formatNumberWithNotation(Number(finalTotalTransactions))
                                : formatNumberWithNotation(0)}
                        </div>
                        <div className={s.meta}>
                            Governance Votes:{" "}
                            <strong>
                                {totalGovernanceVotes > 0
                                    ? formatTokenAmount(
                                        totalGovernanceVotes.toString(),
                                        18,
                                        2,
                                    )
                                    : formatNumberWithNotation(0)}
                            </strong>
                        </div>
                    </div>
                    <div className={s.chart}>
                        <Chart data={dataGovernance} gradientId="txGradient" prefix="" />
                    </div>
                </div>
            </Card>
        </div>
    )
}