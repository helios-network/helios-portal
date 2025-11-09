"use client"

import { Button } from "@/components/button"
// import { Icon } from "@/components/icon"
import { Symbol } from "@/components/symbol"
import { TableCell, TableRow } from "@/components/table"
import { ValidatorRow } from "@/types/faker"
import { useState } from "react"
// import { ModalClaim } from "../claim/modal"
import s from "./active.module.scss"
import { ModalStake } from "./stake"
import { ModalUnstake } from "./unstake"
import { useChainId, useSwitchChain } from "wagmi"
import { HELIOS_NETWORK_ID, HELIOS_TOKEN_ADDRESS } from "@/config/app"
import { ModalClaim } from "../claim/modal"
import Image from "next/image"
import { getChainName } from "@/config/chain-config"

export const Row = ({
  address,
  name,
  commission,
  assets,
  rewards,
  rewardsPrice,
  apy
}: // base
ValidatorRow) => {
  const [openRewards, setOpenRewards] = useState(false)
  const [openStake, setOpenStake] = useState(false)
  const [openUnstake, setOpenUnstake] = useState(false)
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()

  const handleOpenStake = () => {
    if (chainId !== HELIOS_NETWORK_ID) {
      switchChain({ chainId: HELIOS_NETWORK_ID })
    }

    setOpenStake(true)
  }
  const handleOpenUnstake = () => {
    if (chainId !== HELIOS_NETWORK_ID) {
      switchChain({ chainId: HELIOS_NETWORK_ID })
    }

    setOpenUnstake(true)
  }
  const handleOpenRewards = () => {
    if (chainId !== HELIOS_NETWORK_ID) {
      switchChain({ chainId: HELIOS_NETWORK_ID })
    }

    setOpenRewards(true)
  }

  return (
    <TableRow className={s.row}>
      <TableCell className={s.first}>
        <div className={s.flex}>
          <div className={s.illu}></div>
          <div>
            <strong>{name}</strong>
            <small>Commission: {commission}%</small>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <ul className={s.assets}>
          {assets.map((asset, index) => (
            <li key={index}>
              <div className={s.name}>
                {asset.display.logo !== "" ? (
                  <Image
                    src={asset.display.logo}
                    width={16}
                    height={16}
                    alt={asset.display.name}
                  />
                ) : (
                  <Symbol
                    icon={asset.display.symbolIcon}
                    color={asset.display.color}
                  />
                )}
                {asset.display.name}{" "}
                {asset.functionnal.address === HELIOS_TOKEN_ADDRESS
                  ? "Boost"
                  : ""}
                {asset.originBlockchain !== undefined && asset.originBlockchain !== "" && (
                  <sup className={s.originBlockchain}>
                    (Origin: {getChainName(parseInt(asset.originBlockchain))})
                  </sup>
                )}
              </div>
              <div className={s.amount}>{asset.balance.amount}</div>
            </li>
          ))}
        </ul>
      </TableCell>
      <TableCell className={s.apy}>
        <strong>{apy.toFixed(2)}%</strong>
        {/* <small>{base}%</small> */}
      </TableCell>
      {/* <TableCell>
        <strong className={s.rewards}>
          {rewardsAmount} <Icon icon="helios" />
        </strong>
        <small>${rewardsAmount * 100}</small>
      </TableCell>
      <TableCell>
        <time className={s.last}>
          <Icon icon="hugeicons:clock-02" /> 2 hours ago
        </time>
      </TableCell> */}
      <TableCell align="right">
        <div className={s.actions}>
          <Button
            icon="helios"
            variant="success"
            size="xsmall"
            border
            onClick={handleOpenRewards}
          />
          <ModalClaim
            title={`Claim ${name} Rewards`}
            open={openRewards}
            setOpen={setOpenRewards}
            rewards={rewards}
            rewardsPrice={rewardsPrice}
            validatorAddress={address}
          />
          <Button
            icon="hugeicons:add-circle"
            variant="primary"
            size="xsmall"
            border
            onClick={handleOpenStake}
          />
          <ModalStake
            title={`Stake on ${name}`}
            minDelegation={"0"}
            hasAlreadyDelegated={true}
            validatorAddress={address}
            open={openStake}
            setOpen={setOpenStake}
          />
          <Button
            icon="hugeicons:minus-sign-circle"
            variant="warning"
            size="xsmall"
            border
            onClick={handleOpenUnstake}
          />
          <ModalUnstake
            title={`Unstake from ${name}`}
            validatorAddress={address}
            delegatedAssets={assets}
            open={openUnstake}
            setOpen={setOpenUnstake}
          />
          <Button
            href={`/validators/${address}`}
            icon="hugeicons:link-circle-02"
            variant="secondary"
            size="xsmall"
            border
          />
        </div>
      </TableCell>
    </TableRow>
  )
}
