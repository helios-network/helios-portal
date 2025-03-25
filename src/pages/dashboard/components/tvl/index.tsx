import { Card } from "../../../../shared-components/card"
import { Heading } from "../../../../shared-components/heading"
import { Symbol } from "../../../../shared-components/symbol"
import { generateRandomTvl } from "../../../../lib/faker"
import {
  formatBigNumber,
  formatCurrency,
  formatNumber
} from "../../../../lib/utils/number"
import s from "./tvl.module.scss"

export const TVL = () => {
  const tvl = generateRandomTvl()
  const total = tvl.reduce((acc, item) => acc + item.amountLocked, 0)
  const sortedTvl = [...tvl].sort((a, b) => b.amountLocked - a.amountLocked)
  const maxAmount = Math.max(...sortedTvl.map((item) => item.amountLocked), 0)

  return (
    <Card className={s.tvl}>
      <Heading
        icon="hugeicons:locked"
        title="Total Value Locked"
        className={s.heading}
        rightClassName={s.headingRight}
      >
        <div className={s.right}>
          <div className={s.total}>{formatCurrency(total)}</div>
          <div className={s.holder}>{formatNumber(15800)} Holders</div>
        </div>
      </Heading>
      <div className={s.list}>
        {sortedTvl.map((item) => (
          <div className={s.item} key={item.token.id}>
            <div className={s.bar}>
              <div
                style={
                  {
                    "--color": item.token.color,
                    height: `${(item.amountLocked / maxAmount) * 100}%`
                  } as React.CSSProperties
                }
              >
                <div className={s.hover}>
                  <strong>{item.token.name}</strong>
                  <span>{formatCurrency(item.amountLocked)}</span>
                </div>
              </div>
            </div>
            <Symbol
              icon={item.token.symbolIcon}
              color={item.token.color}
              className={s.symbol}
            />
            <div className={s.name}>{item.token.symbol}</div>
            <div className={s.price}>${formatBigNumber(item.amountLocked)}</div>
          </div>
        ))}
      </div>
    </Card>
  )
}
