"use client"

import { Card } from "@/components/card"
import { Progress } from "@/components/progress"
import { useAssetsInfo } from "@/hooks/useAssetsInfo"
import { useValidatorInfo } from "@/hooks/useValidatorInfo"
import { Stat } from "./stat"
import s from "./stats.module.scss"
import { formatBigNumber, formatTokenAmount } from "@/lib/utils/number"

export const Stats = () => {
  const { activeValidators, maxValidators, avgApr, networkSecurity } =
    useValidatorInfo()
  const { totalTVL } = useAssetsInfo()

  return (
    <Card className={s.stats} auto>
      <Stat
        title="Selected Validators"
        subtitle="from last epoch, max 100"
        icon="hugeicons:checkmark-square-01"
        bottom={
          <Progress
            value={activeValidators}
            max={maxValidators}
            className={s.progress}
          />
        }
      >
        <strong>{activeValidators} validators</strong>
      </Stat>
      <Stat title="Average APY" icon="hugeicons:percent-square">
        <strong>{formatTokenAmount(avgApr)}</strong>
        <span>%</span>
      </Stat>
      <Stat title="Total Staked Value" icon="hugeicons:stake">
        <span>$</span>
        <strong>{formatBigNumber(totalTVL)}</strong>
      </Stat>
      <Stat title="Network Security" icon="hugeicons:security-lock">
        <strong>{networkSecurity}</strong>
      </Stat>
    </Card>
  )
}
