import { Button } from "@/components/button"
import { Card } from "@/components/card"
import { Area, Grid } from "@/components/grid"
import { Heading } from "@/components/heading"
import { Icon } from "@/components/icon"
import { formatBigNumber } from "@/lib/utils/number"
import { StatItem } from "../../../(components)/item/stat"
import s from "./top.module.scss"
import { useParams } from "next/navigation"
import { useValidatorDetail } from "@/hooks/useValidatorDetail"
import { useAccount, useChainId, useSwitchChain } from "wagmi"
import { EXPLORER_URL, HELIOS_NETWORK_ID } from "@/config/app"
import { useState, useMemo, useCallback } from "react"
import { ModalStake } from "@/app/delegations/(components)/active/stake"
import { Message } from "@/components/message"

export const Top = () => {
  const { isConnected } = useAccount()
  const params = useParams()
  const validatorId = params.id as string
  const { validator, delegation, userHasDelegated } =
    useValidatorDetail(validatorId)
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()
  const [openStake, setOpenStake] = useState(false)

  const isActive = useMemo(() => validator?.status === 3, [validator])
  const enableDelegation = useMemo(
    () => validator?.delegationAuthorization,
    [validator]
  )
  const formattedApr = useMemo(
    () => (validator ? parseFloat(validator.apr).toFixed(2) + "%" : "0%"),
    [validator]
  )
  const formattedCommission = useMemo(
    () =>
      validator
        ? parseFloat(validator.commission.commission_rates.rate) * 100 + "%"
        : "0%",
    [validator]
  )
  const formattedBoost = useMemo(
    () =>
      validator
        ? Math.min((parseFloat(validator.boostPercentage) * 15) / 100, 15) + "%"
        : "0%",
    [validator]
  )
  const tokens = useMemo(() => delegation?.assets || [], [delegation])
  const minDelegation = useMemo(
    () => validator?.minDelegation,
    [validator]
  )

  const totalDelegated = useMemo(
    () =>
      tokens.reduce((acc, token) => acc + token.balance.totalPrice, 0),
    [tokens]
  )

  const ratioOptimal = useMemo(
    () =>
      (tokens.find((token) => token.display.symbol === "hls")?.price.usd ||
        0) >= totalDelegated,
    [tokens, totalDelegated]
  )

  const explorerLink = useMemo(
    () =>
      validator
        ? EXPLORER_URL + "/address/" + validator.validatorAddress
        : "",
    [validator]
  )

  const handleOpenStake = useCallback(() => {
    if (chainId !== HELIOS_NETWORK_ID) {
      switchChain({ chainId: HELIOS_NETWORK_ID })
    }
    setOpenStake(true)
  }, [chainId, switchChain])

  if (!validator) return null

  return (
    <Grid className={s.top}>
      <Area area="a">
        <Card className={s.infos}>
          <Heading
            title={validator.moniker}
            isActive={isActive}
            description={
              <>
                <div className={s.bottom}>
                  <a href={explorerLink} target="_blank" rel="noopener noreferrer">
                    {validator.validatorAddress}
                    <Icon icon="hugeicons:link-circle-02" />
                  </a>
                </div>
              </>
            }
          >
            <Button
              icon="hugeicons:download-03"
              onClick={handleOpenStake}
              disabled={!enableDelegation || !isConnected}
            >
              Stake now
            </Button>
            <ModalStake
              title={`Stake on ${validator.moniker}`}
              validatorAddress={validator.validatorAddress}
              minDelegation={minDelegation || "0"}
              hasAlreadyDelegated={userHasDelegated}
              open={openStake}
              setOpen={setOpenStake}
            />
          </Heading>
          {enableDelegation ? (
            <Message title="Delegation enabled" variant="success">
              This validator is actively accepting delegations. You can safely
              stake your tokens.
            </Message>
          ) : (
            <Message title="Delegation disabled" variant="warning">
              This validator is not accepting new delegations at the moment.
              Please choose another validator to stake your tokens.
            </Message>
          )}
        </Card>
      </Area>
      <Area area="b">
        <Card className={s.stats}>
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
            value={`${minDelegation} HLS`}
            color="reputation"
            icon="hugeicons:balance-scale"
          />
          <StatItem
            label="Boost Share"
            value={formattedBoost}
            color="uptime"
            icon="hugeicons:rocket-01"
          />
          <div
            className={s.message}
            data-color={ratioOptimal ? "success" : "primary"}
          >
            <Icon icon="hugeicons:checkmark-circle-03" />
            {ratioOptimal ? "Optimal Helios Ratio" : "Good Helios Ratio"}
          </div>
          <div className={s.total}>
            <span>Total Delegated</span>
            <strong>${formatBigNumber(totalDelegated)}</strong>
          </div>
        </Card>
      </Area>
    </Grid>
  )
}