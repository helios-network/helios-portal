"use client"

import { Card } from "@/components/card"
import { Heading } from "@/components/heading"
import { Symbol } from "@/components/symbol"
import {
  formatBigNumber,
  formatCurrency,
  formatNumber
} from "@/lib/utils/number"
import { formatNumberWithNotation } from "@/helpers/format"
import s from "./tvl.module.scss"
import { useAssetsInfo } from "@/hooks/useAssetsInfo"
import { useHomeData } from "@/hooks/useHomeData"
import { useWhitelistedAssets } from "@/hooks/useWhitelistedAssets"
import Image from "next/image"
import { HELIOS_TOKEN_ADDRESS } from "@/config/app"
import { Area, AreaChart, ResponsiveContainer, Tooltip } from "recharts"
import { RechartsTooltip } from "@/components/recharts/tooltip"

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
          {prefix}
          {formatNumberWithNotation(payload[0].value)}
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
            <stop
              offset="5%"
              stopColor="var(--color-blue-500)"
              stopOpacity={0.3}
            />
            <stop
              offset="95%"
              stopColor="var(--color-blue-500)"
              stopOpacity={0}
            />
          </linearGradient>
        </defs>
        <Tooltip
          content={<CustomTooltip prefix={prefix} />}
          cursor={{ stroke: "var(--color-blue-500)", strokeWidth: 1 }}
        />
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

export const TVL = () => {
  const { assets, totalHolders, totalTVL } = useAssetsInfo()
  const { chainStats, tvlChartData } = useHomeData({
    refreshInterval: 30000
  })
  const { assets: whitelistedAssets } = useWhitelistedAssets()

  const filteredAssets = assets.filter(
    (asset) =>
      asset.totalShares !== "0" &&
      asset.contractAddress !== HELIOS_TOKEN_ADDRESS
  )

  const dataTotal =
    tvlChartData.length > 0
      ? tvlChartData.map((item: any) => ({
        date: item.date,
        value: item.tvlValue
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
        { date: "Dec", value: 0 }
      ]

  // Sort assets by network percentage (highest first) and take top 3
  const topAssets = [...whitelistedAssets]
    .filter(
      (asset) =>
        asset.networkPercentageSecurisation &&
        parseFloat(asset.networkPercentageSecurisation) > 0
    )
    .sort(
      (a, b) =>
        parseFloat(b.networkPercentageSecurisation) -
        parseFloat(a.networkPercentageSecurisation)
    )
    .slice(0, 3)

  return (
    <Card className={s.tvl}>
      <Heading
        icon="hugeicons:coins-dollar"
        title="Total Value Locked (TVL)"
        className={s.heading}
        rightClassName={s.headingRight}
      />

      {/* TVL Overview with Chart */}
      <div className={s.overview}>
        <div className={s.overviewStats}>
          <div className={s.overviewValue}>
            $
            {chainStats?.tvlValue
              ? formatNumberWithNotation(Number(chainStats.tvlValue))
              : formatNumberWithNotation(0)}
          </div>
          <div className={s.overviewMeta}>
            {formatBigNumber(totalHolders, 0)} Holders
          </div>

          {/* Top Network Weights */}
          {topAssets.length > 0 && (
            <div className={s.topAssets}>
              <div className={s.topAssetsTitle}>Network Secured By:</div>
              {topAssets.map((asset) => (
                <div key={asset.denom} className={s.topAsset}>
                  <span className={s.topAssetSymbol}>{asset.symbol}</span>
                  <span className={s.topAssetPercentage}>
                    {parseFloat(asset.networkPercentageSecurisation).toFixed(2)}
                    %
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className={s.overviewChart}>
          <Chart data={dataTotal} gradientId="tvlGradient" prefix="$" />
        </div>
      </div>

      {/* Network Weights Bar */}
      <div className={s.weightsSection}>
        <div className={s.weightsTitle}>Network Weights</div>
        <div className={s.weightsBars}>
          {assets.map((token) => (
            <div
              className={s.weightsBar}
              key={"weights-" + token.contractAddress}
              style={
                {
                  "--width": `${token.networkPercentageSecurisation}`,
                  "--color": token.enriched.display.color
                } as React.CSSProperties
              }
            >
              <div className={s.weightsPopover}>
                <span>{token.enriched.display.symbol.toUpperCase()}</span>
                <strong>
                  {parseFloat(token.networkPercentageSecurisation).toFixed(2)}%
                </strong>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* TVL Asset Distribution Bar Chart */}
      <div className={s.list}>
        {filteredAssets.map((token) => (
          <div className={s.item} key={`tvl-${token.contractAddress}`}>
            <div className={s.bar}>
              <div
                style={
                  {
                    "--color": token.enriched.display.color,
                    height: `${(token.tvlUSD / totalTVL) * 100}%`
                  } as React.CSSProperties
                }
              >
                <div className={s.hover}>
                  <strong>{token.enriched.display.name}</strong>
                  {token.tvlUSD !== 0 && (
                    <span>{formatCurrency(token.tvlUSD)}</span>
                  )}
                </div>
              </div>
            </div>
            {token.enriched.display.logo !== "" && (
              <Image
                src={token.enriched.display.logo}
                alt={token.enriched.display.name}
                width={24}
                height={24}
                className={s.symbol}
              />
            )}
            {token.enriched.display.logo === "" && (
              <Symbol
                icon={token.enriched.display.symbolIcon}
                color={token.enriched.display.color}
                className={s.symbol}
              />
            )}

            <div className={s.name}>
              {token.enriched.display.symbol.toUpperCase()}
            </div>
            <div className={s.price}>
              {formatNumber(parseFloat(token.tokenAmount))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
