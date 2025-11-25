import { Card } from "@/components/card"
import { Heading } from "@/components/heading"
import { Symbol } from "@/components/symbol"
import { formatTokenAmount } from "@/lib/utils/number"
// import { TOKENS } from "@/config/tokens"
// import { formatNumber } from "@/lib/utils/number"
import s from "./staking.module.scss"
import { useValidatorDetail } from "@/hooks/useValidatorDetail"
import { useParams } from "next/navigation"
import { useAssetsInfo } from "@/hooks/useAssetsInfo"
import clsx from "clsx"
import Image from "next/image"

export const Staking = () => {
  const params = useParams()
  const validatorId = params.id as string
  const { validator } = useValidatorDetail(validatorId)
  const { assets } = useAssetsInfo()

  if (!validator) return <></>

  const minDelegation = parseFloat(validator.minSelfDelegation)
  const minStakeAssets = assets
    .map(
      (asset) =>
        formatTokenAmount(minDelegation / asset.baseWeight) +
        " " +
        asset.enriched.display.symbol.toUpperCase()
    )
    .join(" / ")

  const details = [
    {
      label: "Minimum Stake",
      value: minDelegation === 0 ? "None" : minStakeAssets
    },
    // {
    //   label: "Unbonding Period",
    //   value: "14 days"
    // },
    {
      label: "Commission Rate",
      value: formatTokenAmount(parseFloat(validator.commission.commission_rates.rate)) + "%"
    },
    {
      label: "Commission Max Rate",
      value: formatTokenAmount(parseFloat(validator.commission.commission_rates.max_rate)) + "%"
    }
  ]

  // const assets = [
  //   {
  //     ...TOKENS.get("hls"),
  //     amount: 1000000
  //   },
  //   {
  //     ...TOKENS.get("eth"),
  //     amount: 5
  //   },
  //   {
  //     ...TOKENS.get("bnb"),
  //     amount: 10
  //   },
  //   {
  //     ...TOKENS.get("usdt"),
  //     amount: 500
  //   }
  // ]

  return (
    <Card auto>
      <Heading
        icon="hugeicons:information-circle"
        title="Staking Information"
      />
      <div className={s.block}>
        <h3>Staking Details</h3>
        <ul className={s.details}>
          {details.map((detail, index) => (
            <li key={index}>
              <span className={s.label}>{detail.label}</span>
              <span className={s.value}>{detail.value}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className={s.block}>
        <h3>Supported Assets</h3>
        <ul className={clsx(s.assets, s.temp)}>
          {assets.map((asset, index) => (
            <li key={index}>
              <div className={s.token}>
                {asset.enriched.display.logo !== "" ? (
                  <Image
                    src={asset.enriched.display.logo}
                    alt={asset.enriched.display.name}
                    width={32}
                    height={32}
                  />
                ) : (
                  <Symbol
                    icon={asset.enriched.display.symbolIcon as string}
                    color={asset.enriched.display.color}
                    className={s.icon}
                  />
                )}

                <div className={s.name}>
                  {asset.enriched.display.name}{" "}
                  <small>{asset.enriched.display.symbol}</small>
                </div>
              </div>
              {/* <div className={s.amount}>
                {formatNumber(asset.amount, 2)} <small>Available</small>
              </div> */}
            </li>
          ))}
        </ul>
      </div>
    </Card>
  )
}
