"use client"

import clsx from "clsx"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import { RechartsTooltip } from "../tooltip"
import s from "./pie.module.scss"
import { formatNumber } from "@/lib/utils/number"

interface RechartsPieProps {
  data: {
    name: string
    value?: number
    price: number
    color: string
    percentage: number
    displayPercentage?: number
  }[]
  className?: string
}

export const RechartsPie = ({ data, className }: RechartsPieProps) => {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <RechartsTooltip>
          <strong>{data.name}</strong>
          {data.value !== undefined && <span>Votes: {formatNumber(data.value)}</span>}
          <span>{data.percentage.toFixed(2)}%</span>
        </RechartsTooltip>
      )
    }
    return null
  }

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" aspect={1.5}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius="75%"
            outerRadius="100%"
            paddingAngle={0}
            dataKey="price"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

interface RechartsPieLegendProps {
  data: {
    name: string
    value?: number
    price: number
    color: string
    percentage: number
    displayPercentage?: number
  }[]
  className?: string
}

export const RechartsPieLegend = ({
  data,
  className
}: RechartsPieLegendProps) => {
  return (
    <div className={clsx(s.legend, className)}>
      {data.map((item, index) => (
        <div key={index} className={s.item}>
          <div className={s.dot} style={{ backgroundColor: item.color }} />
          <span className={s.name}>{item.name}</span>
          <span className={s.value}>{item.value}</span>
          <span className={s.percentage}>
            {item.value !== undefined ? formatNumber(item.value) : '0'} votes ({item.percentage.toFixed(2)}%)
          </span>
        </div>
      ))}
    </div>
  )
}
