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
import { useState } from "react"
import { ModalStake } from "@/app/delegations/(components)/active/stake"
import { Message } from "@/components/message"
import { EnrichedAsset } from "@/types/validator"

export const Top = () => {
  const { isConnected } = useAccount()
  const params = useParams()
  const validatorId = params.id as string
  const { validator, delegation, userHasDelegated } =
    useValidatorDetail(validatorId)
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()
  const [openStake, setOpenStake] = useState(false)

  if (!validator || !delegation?.assets?.length) return <></>

  // const socials = [
  //   {
  //     icon: "hugeicons:globe-02",
  //     url: "http://helioschain.network/"
  //   },
  //   {
  //     icon: "hugeicons:mail-02",
  //     url: "mailto:contact@helioschain.network"
  //   },
  //   {
  //     icon: "hugeicons:new-twitter",
  //     url: "https://x.com/heliosguardian"
  //   },
  //   {
  //     icon: "hugeicons:telegram",
  //     url: "https://t.me/heliosguardian"
  //   }
  // ]

  const isActive = validator.status === 3
  const enableDelegation = validator.delegationAuthorization
  const formattedApr = parseFloat(validator.apr).toFixed(2) + "%"
  const formattedCommission =
    parseFloat(validator.commission.commission_rates.rate) * 100 + "%"

  const formattedBoost =
    Math.min((parseFloat(validator.boostPercentage) * 15) / 100, 15) + "%"
  const tokens = delegation.assets
  const minDelegation = validator.minDelegation

  const totalDelegated = tokens.reduce(
    (acc: number, token: EnrichedAsset) => acc + (parseFloat(token.amount) * token.price),
    0
  )

  const ratioOptimal =
    (tokens.find((token: EnrichedAsset) => token.denom === "hls")?.price || 0) >= totalDelegated

  const handleOpenStake = () => {
    if (chainId !== HELIOS_NETWORK_ID) {
      switchChain({ chainId: HELIOS_NETWORK_ID })
    }

    setOpenStake(true)
  }

  const explorerLink = EXPLORER_URL + "/address/" + validator.validatorAddress

  const heliosNodesMonikers = [
    "helios-peer",
    "helios-unity",
    "helios-inter",
    "helios-hedge",
    "helios-supra"
  ]

  const isHeliosNode = heliosNodesMonikers.includes(validator.moniker)

  return (
    <Grid className={s.top}>
      <Area area="a">
        <Card className={s.infos}>
          <Heading
            title={validator.moniker}
            isActive={isActive}
            // verified
            description={
              <>
                <div className={s.bottom}>
                  <a href={explorerLink} target="_blank">
                    {validator.validatorAddress}
                    <Icon icon="hugeicons:link-circle-02" />
                  </a>
                  {/* <time>Join April 10, 2025</time> */}
                </div>
              </>
            }
          >
            <Button
              icon="hugeicons:download-03"
              onClick={() => handleOpenStake()}
              disabled={!enableDelegation || !isConnected || !isHeliosNode}
            >
              Stake now
            </Button>
            <ModalStake
              title={`Stake on ${validator.moniker}`}
              validatorAddress={validator.validatorAddress}
              minDelegation={minDelegation}
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
          {/* <div className={s.description}>
            <p>
              Helios Guardian is a professional validator service with 99.98%
              uptime and a strong focus on security and reliability. We operate
              enterprise-grade infrastructure with multiple redundancies and
              24/7 monitoring.
            </p>
          </div> */}
          {/* <div className={s.plus}>
            <ul className={s.socials}>
              {socials.map(({ url, icon }, index) => (
                <li key={index}>
                  <Button
                    href={url}
                    icon={icon}
                    size="xsmall"
                    variant="secondary"
                    border
                  />
                </li>
              ))}
            </ul>
            <p>Located in Frankfurt, Germany</p>
          </div> */}
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
