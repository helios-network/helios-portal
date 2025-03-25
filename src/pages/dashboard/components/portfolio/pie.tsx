"use client"

import { APP_COLOR_SECONDARY } from "../../../../config/app"
import { formatCurrency } from "../../../../lib/utils/number"
import clsx from "clsx"
import { useMemo } from "react"
import s from "./portfolio.module.scss"
import { usePortfolioInfo } from "../../../../hooks/usePortfolioInfo"

interface PieProps {
  maxDegrees?: number
  startDegrees?: number
}

export const PortfolioPie = ({
  maxDegrees = 285,
  startDegrees = 130
}: PieProps) => {
  const { totalUSD, portfolio: tokens } = usePortfolioInfo()

  const conicGradient = useMemo(() => {
    if (tokens.length === 0) return ""

    const topTokens = tokens.slice(0, 3)
    const otherTokens = tokens.slice(3)
    const totalOtherTokens = otherTokens.reduce(
      (total, token) => total + (token.priceUSD || 0),
      0
    )

    let currentDegree = 0
    const segments = []

    for (const token of topTokens) {
      const percent = (token.priceUSD || 0) / totalUSD
      const degrees = percent * maxDegrees

      segments.push({
        color: token.color || APP_COLOR_SECONDARY,
        startDeg: currentDegree,
        endDeg: currentDegree + degrees
      })

      currentDegree += degrees
    }
    if (totalOtherTokens > 0) {
      const percent = totalOtherTokens / totalUSD
      const degrees = percent * maxDegrees

      segments.push({
        color: APP_COLOR_SECONDARY,
        startDeg: currentDegree,
        endDeg: currentDegree + degrees
      })

      currentDegree += degrees
    }

    const lastColor =
      segments.length > 0
        ? segments[segments.length - 1].color
        : APP_COLOR_SECONDARY

    let gradientString = `conic-gradient(from ${startDegrees}deg, `

    gradientString += segments
      .map((segment) => `${segment.color} ${segment.startDeg}deg`)
      .join(", ")

    if (currentDegree < maxDegrees) {
      gradientString += `, ${lastColor} ${currentDegree}deg ${maxDegrees}deg`
    }

    gradientString += `, ${lastColor} ${maxDegrees}deg 360deg`

    gradientString += ")"

    return gradientString
  }, [tokens, totalUSD, maxDegrees, startDegrees])

  return (
    <>
      <div className={s.topTotal}>
        <small>Total Amount</small>
        <strong>{formatCurrency(totalUSD)}</strong>
      </div>
      <div className={clsx(s.pie, tokens.length === 0 && s.empty)}>
        <svg viewBox="0 0 325 242" fill="none">
          <g clipPath="url(#gradient-clip)">
            <g transform="matrix(-0.000470674 0.119 -0.1605 -0.000638999 162.5 121)">
              <foreignObject
                x="-1030.66"
                y="-1030.66"
                width="2061.33"
                height="2061.33"
              >
                <div
                  className={s.gradient}
                  style={{
                    background: conicGradient || "var(--background-higher)"
                  }}
                />
              </foreignObject>
            </g>
          </g>
          <path d="M19.9421 240.711C20.335 241.441 21.2447 241.713 21.9741 241.321C22.7034 240.928 22.9762 240.018 22.5833 239.289L19.9421 240.711ZM302.417 239.289C302.024 240.018 302.297 240.928 303.026 241.321C303.755 241.713 304.665 241.441 305.058 240.711L302.417 239.289ZM3.5 163.311C3.5 75.0427 74.6938 3.5 162.5 3.5V0.5C73.0228 0.5 0.5 73.4002 0.5 163.311H3.5ZM162.5 3.5C250.306 3.5 321.5 75.0427 321.5 163.311H324.5C324.5 73.4002 251.977 0.5 162.5 0.5V3.5ZM22.5833 239.289C10.4118 216.693 3.5 190.816 3.5 163.311H0.5C0.5 191.324 7.54067 217.689 19.9421 240.711L22.5833 239.289ZM321.5 163.311C321.5 190.816 314.588 216.693 302.417 239.289L305.058 240.711C317.459 217.689 324.5 191.324 324.5 163.311H321.5Z" />
          <text
            x="162.5"
            y="150"
            textAnchor="middle"
            dominantBaseline="bottom"
            className={s.totalAmount}
            fontWeight="bold"
          >
            {formatCurrency(totalUSD, {
              currency: "USD",
              small: false,
              tspan: true
            })}
          </text>
          <text
            x="162.5"
            y="175"
            textAnchor="middle"
            dominantBaseline="middle"
            className={s.totalLabel}
          >
            Total Amount
          </text>
          <defs>
            <clipPath id="gradient-clip">
              <path d="M19.9421 240.711C20.335 241.441 21.2447 241.713 21.9741 241.321C22.7034 240.928 22.9762 240.018 22.5833 239.289L19.9421 240.711ZM302.417 239.289C302.024 240.018 302.297 240.928 303.026 241.321C303.755 241.713 304.665 241.441 305.058 240.711L302.417 239.289ZM3.5 163.311C3.5 75.0427 74.6938 3.5 162.5 3.5V0.5C73.0228 0.5 0.5 73.4002 0.5 163.311H3.5ZM162.5 3.5C250.306 3.5 321.5 75.0427 321.5 163.311H324.5C324.5 73.4002 251.977 0.5 162.5 0.5V3.5ZM22.5833 239.289C10.4118 216.693 3.5 190.816 3.5 163.311H0.5C0.5 191.324 7.54067 217.689 19.9421 240.711L22.5833 239.289ZM321.5 163.311C321.5 190.816 314.588 216.693 302.417 239.289L305.058 240.711C317.459 217.689 324.5 191.324 324.5 163.311H321.5Z" />
            </clipPath>
          </defs>
        </svg>
      </div>
    </>
  )
}
