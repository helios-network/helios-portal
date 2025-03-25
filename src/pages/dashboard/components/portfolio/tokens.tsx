"use client"

import { Button } from "../../../../shared-components/button"
import { Icon } from "../../../../shared-components/icon"
import { Symbol } from "../../../../shared-components/symbol"
import { APP_COLOR_SECONDARY } from "../../../../config/app"
import { formatCurrency } from "../../../../lib/utils/number"
import s from "./portfolio.module.scss"
import { usePortfolioInfo } from "../../../../hooks/usePortfolioInfo"

interface LineProps {
  name?: string
  symbol?: string
  symbolIcon: React.ReactNode
  price: number
  amount?: string
}

const Line = ({ name, symbol, symbolIcon, price, amount }: LineProps) => {
  // const percent = (price / totalPriceUsd) * 100
  const amountFixed = amount ? parseFloat(amount).toFixed(4) : 0

  return (
    <li>
      {symbolIcon}
      <div className={s.info}>
        <div className={s.top}>{symbol}</div>
        <div className={s.bottom}>{name}</div>
      </div>
      <div className={s.right}>
        {amountFixed && <div className={s.top}>{amountFixed}</div>}
        <div className={s.bottom}>{formatCurrency(price)}</div>
        {/* <div className={s.bottom}>{percent.toFixed(2)}%</div> */}
      </div>
    </li>
  )
}

export const PortfolioTokens = () => {
  const { portfolio: tokens } = usePortfolioInfo()
  const totalOtherTokens = tokens
    .slice(3)
    .reduce((total, token) => total + (token.priceUSD || 0), 0)

  if (tokens.length === 0) {
    return (
      <div className={s.empty}>
        <Icon icon="hugeicons:sad-02" className={s.sad} />
        <p>No tokens in your portfolio</p>
        <Button icon="hugeicons:download-03">Add tokens</Button>
      </div>
    )
  }

  return (
    <ul className={s.tokens}>
      {tokens.slice(0, 3).map((token) => (
        <Line
          key={token.symbol}
          symbolIcon={<Symbol icon={token.symbolIcon} color={token.color} />}
          symbol={token.symbol}
          amount={token.amount}
          name={token.name}
          price={token.priceUSD || 0}
        />
      ))}
      {tokens.length > 3 && (
        <Line
          symbolIcon={
            <Symbol icon="mdi:star-four-points" color={APP_COLOR_SECONDARY} />
          }
          symbol="Other"
          price={totalOtherTokens}
        />
      )}
    </ul>
  )
}
