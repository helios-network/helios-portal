"use client"

import { Button } from "../../../../shared-components/button"
import { Icon } from "../../../../shared-components/icon"
import { Symbol } from "../../../../shared-components/symbol"
import { APP_COLOR_SECONDARY } from "../../../../config/app"
import { formatCurrency } from "../../../../lib/utils/number"
import { useUserStore } from "../../../../stores/user"
import s from "./portfolio.module.scss"
import { TokenWithAmount } from "../../../../types/Tokens"

interface LineProps {
  name?: string
  symbol?: string
  symbolIcon: React.ReactNode
  price: number
}

const Line = ({ name, symbol, symbolIcon, price }: LineProps) => {
  const { totalPriceUsd } = useUserStore()
  const percent = (price / totalPriceUsd) * 100

  return (
    <li>
      {symbolIcon}
      <div className={s.info}>
        <div className={s.top}>{symbol}</div>
        <div className={s.bottom}>{name}</div>
      </div>
      <div className={s.right}>
        <div className={s.top}>{formatCurrency(price)}</div>
        <div className={s.bottom}>{percent.toFixed(2)}%</div>
      </div>
    </li>
  )
}

export const PortfolioTokens = () => {
  const { tokens } = useUserStore()
  const totalOtherTokens = tokens
    .slice(3)
    .reduce((total: number, token: TokenWithAmount) => total + (token.priceUsd || 0), 0)

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
      {tokens.slice(0, 3).map((token: TokenWithAmount) => (
        <Line
          key={token.id}
          symbolIcon={<Symbol icon={token.symbolIcon} color={token.color} />}
          symbol={token.symbol}
          name={token.name}
          price={token.priceUsd || 0}
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
