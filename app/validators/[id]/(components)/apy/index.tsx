// import { Blocks } from "@/components/blocks"
import { Card } from "@/components/card"
import { Heading } from "@/components/heading"
// import { Message } from "@/components/message"
// import { Progress } from "@/components/progress"
import { RechartsPie, RechartsPieLegend } from "@/components/recharts/pie"
// import { TOKEN_COLORS } from "@/config/constants"
import s from "./apy.module.scss"
import { useParams } from "next/navigation"
import { useValidatorDetail } from "@/hooks/useValidatorDetail"
import { ethers } from "ethers"
import { Symbol } from "@/components/symbol"
import { TOKEN_COLORS } from "@/config/constants"
import { EnrichedAsset } from "@/types/validator"

export const Apy = () => {
  const params = useParams()
  const validatorId = params.id as string
  const { validator, delegation } = useValidatorDetail(validatorId)

  if (!validator || !delegation?.assets?.length) return <></>

  // const blocks = [
  //   {
  //     title: "Base APY",
  //     value: "8.5%",
  //     bottom: "Without Helios Boost"
  //   },
  //   {
  //     title: "Current APY",
  //     value: "12.75%",
  //     bottom: "Without current Helios Ratio",
  //     color: "primary"
  //   },
  //   {
  //     title: "Maximum APY",
  //     value: "12.75%",
  //     bottom: "Without optimal Helios Ratio"
  //   }
  // ]
  const tokens = delegation.assets
  const totalDelegated = tokens.reduce(
    (acc, token) => acc + token.balance.totalPrice,
    0
  )

  const data = tokens.map((token) => ({
    name: token.display.symbol.toUpperCase(),
    value: token.balance.amount,
    price: token.balance.totalPrice,
    percentage: (token.balance.totalPrice / totalDelegated) * 100,
    color: token.display.color
  }))

  // const data = [
  //   {
  //     name: "HLS",
  //     value: 1000000,
  //     percentage: 40,
  //     color: TOKEN_COLORS.hls
  //   },
  //   { name: "ETH", value: 750000, percentage: 30, color: TOKEN_COLORS.eth },
  //   { name: "USDT", value: 500000, percentage: 20, color: TOKEN_COLORS.usdt },
  //   { name: "BNB", value: 250000, percentage: 10, color: TOKEN_COLORS.bnb }
  // ]

  const formattedBoost = parseFloat(
    ethers.formatEther(validator.totalBoost.split(".")[0])
  ).toFixed(6)

  return (
    <Card auto>
      <Heading icon="hugeicons:shield-energy" title="APY Breakdown & Boost" />
      {/* <Blocks items={blocks} /> */}
      {/* <div className={s.status}>
        <h3>Helios Collateral Status</h3>
        <ul>
          <li>
            <span>Helios Collateral</span>
            <Progress className={s.progress} value={55} max={100} />
            <span>55%</span>
          </li>
          <li>
            <span>Helios Collateral</span>
            <Progress
              className={s.progress}
              value={35}
              max={100}
              data-color="primary"
            />
            <span>35%</span>
          </li>
        </ul>
        <Message
          icon="hugeicons:information-circle"
          title="How HELIOS Ratio Affects Your Rewards"
        >
          Validators must maintain a minimum ratio of HELIOS tokens relative to
          other staked assets to maximize APY. When the HELIOS ratio falls below
          the required threshold, the APY boost is reduced proportionally.
        </Message>
      </div> */}
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
