import { Card } from "@/components/card"
import { Heading } from "@/components/heading"
import { Symbol } from "@/components/symbol"
import s from "./staking.module.scss"
import { useValidatorDetail } from "@/hooks/useValidatorDetail"
import { useParams } from "next/navigation"
import { useAssetsInfo } from "@/hooks/useAssetsInfo"
import clsx from "clsx"
import Image from "next/image"
import { useMemo } from "react"

export const Staking = () => {
  const params = useParams()
  const validatorId = params.id as string
  const { validator } = useValidatorDetail(validatorId)
  const { assets } = useAssetsInfo()

  const minDelegation = useMemo(
    () => (validator ? parseFloat(validator.minSelfDelegation) : 0),
    [validator]
  )

  const minStakeAssets = useMemo(
    () =>
      assets
        .map(
          (asset) =>
            (minDelegation / asset.baseWeight).toFixed(2) +
            " " +
            asset.enriched.display.symbol.toUpperCase()
        )
        .join(" / "),
    [assets, minDelegation]
  )

  const details = useMemo(
    () => [
      {
        label: "Minimum Stake",
        value: minDelegation === 0 ? "None" : minStakeAssets
      },
      {
        label: "Commission Rate",
        value: validator
          ? parseFloat(validator.commission.commission_rates.rate) + "%"
          : "0%"
      },
      {
        label: "Commission Max Rate",
        value: validator
          ? parseFloat(validator.commission.commission_rates.max_rate) + "%"
          : "0%"
      }
    ],
    [minDelegation, minStakeAssets, validator]
  )

  if (!validator) return null

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
            </li>
          ))}
        </ul>
      </div>
    </Card>
  )
}