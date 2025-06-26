import { Card } from "@/components/card"
import { Heading } from "@/components/heading"
import { RechartsPie, RechartsPieLegend } from "@/components/recharts/pie"
import s from "./apy.module.scss"
import { useParams } from "next/navigation"
import { useValidatorDetail } from "@/hooks/useValidatorDetail"
import { ethers } from "ethers"
import { Symbol } from "@/components/symbol"
import { TOKEN_COLORS } from "@/config/constants"
import { useMemo } from "react"

export const Apy = () => {
  const params = useParams()
  const validatorId = params.id as string
  const { validator, delegation } = useValidatorDetail(validatorId)

  const tokens = useMemo(() => delegation.assets || [], [delegation.assets])

  const totalDelegated = useMemo(
    () => tokens.reduce((acc, token) => acc + token.balance.totalPrice, 0),
    [tokens]
  )

  const data = useMemo(
    () =>
      tokens.map((token) => ({
        name: token.display.symbol.toUpperCase(),
        value: token.balance.amount,
        price: token.balance.totalPrice,
        percentage:
          totalDelegated > 0
            ? (token.balance.totalPrice / totalDelegated) * 100
            : 0,
        color: token.display.color
      })),
    [tokens, totalDelegated]
  )

  const formattedBoost = useMemo(() => {
    if (!validator?.totalBoost) return "0.000000"
    const boostValue = validator.totalBoost.split(".")[0]
    return parseFloat(ethers.formatEther(boostValue)).toFixed(6)
  }, [validator?.totalBoost])

  if (!validator) return null

  return (
    <Card auto>
      <Heading icon="hugeicons:shield-energy" title="APY Breakdown & Boost" />
      <div className={s.chart}>
        <h3>Asset Distribution & Delegation Breakdown</h3>
        <RechartsPie data={data} className={s.pie} />
        <RechartsPieLegend data={data} />
      </div>
      <div className={s.block}>
        <h3>Boost Details</h3>
        <ul className={s.details}>
          <li>
            <span className={s.label}>Total Boost</span>
            <span className={s.value}>
              <Symbol icon={"helios"} color={TOKEN_COLORS["hls"]} />
              {formattedBoost} HLS
            </span>
          </li>
        </ul>
      </div>
    </Card>
  )
}