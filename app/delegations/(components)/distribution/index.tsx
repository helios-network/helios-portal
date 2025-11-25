import { Card } from "@/components/card"
import { Heading } from "@/components/heading"
import { RechartsPie, RechartsPieLegend } from "@/components/recharts/pie"
import { TOKEN_COLORS } from "@/config/constants"
import s from "./distribution.module.scss"
import { useDelegationInfo } from "@/hooks/useDelegationInfo"
import { Empty } from "@/app/validators/(components)/list/empty"

const tokenColorKeys = Object.keys(TOKEN_COLORS)
const getValidatorColorByIndex = (index: number) => {
  const key = tokenColorKeys[index % tokenColorKeys.length]
  return TOKEN_COLORS[key as keyof typeof TOKEN_COLORS]
}

export const Distribution = () => {
  const { delegationsByValidator, totalDelegatedUSD } = useDelegationInfo()

  const data = delegationsByValidator.map((validator, i) => {
    return {
      name: validator.moniker,
      value: validator.totalUSD,
      price: validator.totalUSD,
      percentage: (validator.totalUSD / totalDelegatedUSD) * 100,
      color: getValidatorColorByIndex(i)
    }
  })

  return (
    <Card className={s.distribution} auto>
      <Heading icon="hugeicons:chart-ring" title="Delegation Distribution" />
      <div className={s.chart}>
        <h3>Delegation Distribution</h3>
        {data.length === 0 ? (
          <Empty icon="hugeicons:sad-02" title="No delegation found" />
        ) : (
          <>
            <RechartsPie data={data} className={s.pie} />
            <RechartsPieLegend data={data} className={s.legend} />
          </>
        )}
      </div>
    </Card>
  )
}
