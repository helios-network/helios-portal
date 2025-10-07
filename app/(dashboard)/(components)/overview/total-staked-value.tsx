"use client"

import { Area, AreaChart, ResponsiveContainer, Tooltip } from "recharts"
import { useHomeData } from "@/hooks/useHomeData"
import { useWhitelistedAssets } from "@/hooks/useWhitelistedAssets"
import {
    formatNumberWithNotation
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

export function TotalStakedValue() {
    const {
        chainStats: homeDataChainStats,
        tvlChartData,
    } = useHomeData({
        refreshInterval: 30000,
    })

    const { assets } = useWhitelistedAssets()

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

    // Sort assets by network percentage (highest first) and take top 3
    const topAssets = [...assets]
        .filter(asset => asset.networkPercentageSecurisation && parseFloat(asset.networkPercentageSecurisation) > 0)
        .sort((a, b) => parseFloat(b.networkPercentageSecurisation) - parseFloat(a.networkPercentageSecurisation))
        .slice(0, 3)

    return (
        <Card className={s.card}>
            <Heading
                icon="hugeicons:coins-dollar"
                title="Total Value Locked (TVL)"
            />
            <div className={s.content}>
                <div className={s.stats}>
                    <div className={s.value}>
                        $
                        {finalChainStats?.tvlValue
                            ? formatNumberWithNotation(Number(finalChainStats.tvlValue))
                            : formatNumberWithNotation(0)}
                    </div>

                    {/* Network Weights - Show percentage of each asset securing the network */}
                    {topAssets.length > 0 && (
                        <div className={s.networkWeights}>
                            <div className={s.networkWeightsTitle}>Network Secured By:</div>
                            {topAssets.map((asset) => (
                                <div key={asset.denom} className={s.assetWeight}>
                                    <span className={s.assetSymbol}>{asset.symbol}</span>
                                    <span className={s.assetPercentage}>
                                        {parseFloat(asset.networkPercentageSecurisation).toFixed(2)}%
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className={s.chart}>
                    <Chart data={dataTotal} gradientId="tvlGradient" prefix="$" />
                </div>
            </div>
        </Card>
    )
}