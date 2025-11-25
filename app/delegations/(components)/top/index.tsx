import { Blocks } from "@/components/blocks"
import { Card } from "@/components/card"
import { Heading } from "@/components/heading"
import { Claim } from "../claim"
import s from "./top.module.scss"
import { useDelegationInfo } from "@/hooks/useDelegationInfo"
import { formatBigNumber, formatTokenAmount } from "@/lib/utils/number"

export const Top = () => {
  const { totalDelegatedUSD, validatorsCount, averageApr } = useDelegationInfo()
  const blocks = [
    {
      title: "Total Staked Value",
      value: `$${formatBigNumber(totalDelegatedUSD)}`,
      bottom:
        validatorsCount > 1
          ? `Across ${validatorsCount} validators`
          : `Across ${validatorsCount} validator`
    },
    {
      title: "Average APY",
      value: `${formatTokenAmount(averageApr)}%`,
      bottom: "Weighted average",
      color: "success"
    }
    // {
    //   title: "Unbonding Value",
    //   value: "$2,500",
    //   bottom: "Across 2 validators",
    //   color: "warning"
    // }
  ]

  return (
    <div className={s.content}>
      <Card auto>
        <Heading icon="hugeicons:laurel-wreath-01" title="My Delegations" />
        <div className={s.content}>
          <Blocks items={blocks} className={s.blocks} />
          {/* <Blocks items={blocks} className={s.blocks} vertical /> */}
          {/* <Claim /> */}
        </div>
      </Card>

      <Card auto>
        <Heading icon="helios" title="My Rewards" />
        <div className={s.content}>
          {/* <Blocks items={blocks} className={s.blocks} /> */}
          {/* <Blocks items={blocks} className={s.blocks} vertical /> */}
          <Claim />
        </div>
      </Card>
    </div>
  )
}
