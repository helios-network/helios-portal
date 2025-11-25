import { Card } from "@/components/card"
import { formatTokenAmount } from "@/lib/utils/number"
import s from "./weights.module.scss"
import { useAssetsInfo } from "@/hooks/useAssetsInfo"

export const Weights = () => {
  const { assets } = useAssetsInfo()

  return (
    <Card className={s.weights}>
      <div className={s.top}>
        <span className={s.title}>
          <strong>Network Weights</strong>
        </span>
      </div>

      <div className={s.bars}>
        {assets.map((token) => (
          <div
            className={s.bar}
            key={"validators-" + token.contractAddress}
            style={
              {
                "--width": `${token.networkPercentageSecurisation}`,
                "--color": token.enriched.display.color
              } as React.CSSProperties
            }
          >
            <div className={s.popover}>
              <span>{token.enriched.display.symbol.toUpperCase()}</span>
              <strong>
                {formatTokenAmount(parseFloat(token.networkPercentageSecurisation))}%
              </strong>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
