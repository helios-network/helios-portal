import { Badge } from "@/components/badge"
import { Button } from "@/components/button"
import { Icon } from "@/components/icon"
import { formatBigNumber } from "@/lib/utils/number"
import s from "./item.module.scss"
import { StatItem } from "./stat"
import { useValidatorDetail } from "@/hooks/useValidatorDetail"
import { useState } from "react"
import { ModalStake } from "@/app/delegations/(components)/active/stake"
import { useAccount, useChainId, useSwitchChain } from "wagmi"
import { HELIOS_NETWORK_ID } from "@/config/app"
import Link from "next/link"
import HELIOS_NODE_MONIKERS from "@/config/helios-node-monikers"
import { ValidatorWithAssetsCommissionAndDelegation } from "@/types/validator"

export const Item = (validatorWithAssetsAndCommissionAndDelegation: ValidatorWithAssetsCommissionAndDelegation) => {
  // const [favorite, setFavorite] = useState(false)

  // const handleFavorite = () => {
  //   setFavorite(!favorite)
  //   if (favorite) {
  //     toast.success(`Validator "${name}" added to favorites.`)
  //   } else {
  //     toast.success(`Validator "${name}" removed from favorites.`)
  //   }
  // }
  const [openStake, setOpenStake] = useState(false)
  const chainId = useChainId()
  const { isConnected } = useAccount()
  const { switchChain } = useSwitchChain()
  const { delegation, userHasDelegated } = useValidatorDetail(validatorWithAssetsAndCommissionAndDelegation.validator.validatorAddress, validatorWithAssetsAndCommissionAndDelegation)

  const isActive = validatorWithAssetsAndCommissionAndDelegation.validator.status === 3
  const enableDelegation = validatorWithAssetsAndCommissionAndDelegation.validator.delegationAuthorization && isConnected
  const formattedApr = parseFloat(validatorWithAssetsAndCommissionAndDelegation.validator.apr).toFixed(2) + "%"
  const formattedCommission =
    parseFloat(validatorWithAssetsAndCommissionAndDelegation.validator.commission.commission_rates.rate) * 100 + "%"
  const formattedBoost =
    Math.min((parseFloat(validatorWithAssetsAndCommissionAndDelegation.validator.boostPercentage) * 15) / 100, 15) + "%"
  const tokens = delegation.assets

  const totalDelegated = tokens.reduce(
    (acc, token) => acc + token.balance.totalPrice,
    0
  )

  const ratioOptimal =
    (tokens.find((token) => token.display.symbol === "hls")?.balance
      .totalPrice || 0) >= totalDelegated

  const handleOpenStake = (e: any) => {
    e.preventDefault()
    e.stopPropagation()
    if (chainId !== HELIOS_NETWORK_ID) {
      switchChain({ chainId: HELIOS_NETWORK_ID })
    }

    setOpenStake(true)
  }

  const isHeliosNode = HELIOS_NODE_MONIKERS.includes(validatorWithAssetsAndCommissionAndDelegation.validator.moniker)

  return (
    <>
      <Link href={"/validators/" + validatorWithAssetsAndCommissionAndDelegation.validator.validatorAddress} className={s.item}>
        {/* <Button
        variant="secondary"
        border
        icon={
          favorite
            ? "material-symbols-light:kid-star"
            : "material-symbols-light:kid-star-outline"
        }
        onClick={handleFavorite}
        className={s.favorite}
        size="xsmall"
      /> */}
        <div className={s.top}>
          <div className={s.image}>
            <Icon icon="hugeicons:flowchart-01" />
          </div>
          <div className={s.heading}>
            {isActive && <Badge status="success">Active</Badge>}
            {isActive && isHeliosNode && <span className={s.spacing}>&nbsp;</span>}
            {isHeliosNode && <Badge status="primary">Official Node</Badge>}
            <h3>{validatorWithAssetsAndCommissionAndDelegation.validator.moniker}</h3>
            {/* {description.details && <h4>{description.details}</h4>} */}
          </div>
        </div>
        <div className={s.stats}>
          <StatItem
            label="APY"
            value={formattedApr}
            color="apy"
            icon="hugeicons:shield-energy"
          />
          <StatItem
            label="Commission"
            value={formattedCommission}
            color="commission"
            icon="hugeicons:clock-01"
          />
          <StatItem
            label="Min Delegation"
            value={`${validatorWithAssetsAndCommissionAndDelegation.validator.minDelegation} HLS`}
            color="reputation"
            icon="hugeicons:balance-scale"
          />
          <StatItem
            label="Boost Share"
            value={formattedBoost}
            color="uptime"
            icon="hugeicons:rocket-01"
          />
        </div>
        {tokens.length > 0 && (
          <>
            <div className={s.total}>
              <span>Total Delegated</span>
              <strong>${formatBigNumber(totalDelegated)}</strong>
            </div>
            <div className={s.bars}>
              {tokens.map((token) => (
                <div
                  className={s.bar}
                  key={"validators-" + token.functionnal.address}
                  style={
                    {
                      "--width": `${
                        (token.balance.totalPrice / totalDelegated) * 100
                      }%`,
                      "--color": token.display.color
                    } as React.CSSProperties
                  }
                >
                  <div className={s.popover}>
                    <span>{token.display.symbol.toUpperCase()}</span>
                    <strong>
                      ${formatBigNumber(token.balance.totalPrice)}
                    </strong>
                  </div>
                </div>
              ))}
            </div>
            <div
              className={s.message}
              data-color={ratioOptimal ? "success" : "primary"}
            >
              <Icon icon="hugeicons:checkmark-circle-03" />
              {ratioOptimal ? "Optimal Helios Ratio" : "Good Helios Ratio"}
            </div>
          </>
        )}

        <div className={s.buttons}>
          <Button
            className={s.stake}
            border
            onClick={handleOpenStake}
            disabled={!enableDelegation || !isHeliosNode}
          >
            Stake Now
          </Button>

          <Button variant="secondary" border icon="hugeicons:link-square-02" />
        </div>
      </Link>
      <ModalStake
        title={`Stake on ${validatorWithAssetsAndCommissionAndDelegation.validator.moniker}`}
        validatorAddress={validatorWithAssetsAndCommissionAndDelegation.validator.validatorAddress}
        minDelegation={validatorWithAssetsAndCommissionAndDelegation.validator.minDelegation}
        hasAlreadyDelegated={userHasDelegated}
        open={openStake}
        setOpen={setOpenStake}
      />
    </>
  )
}
