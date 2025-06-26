"use client"

import { Button } from "@/components/button"
import { TableCell, TableRow } from "@/components/table"
import { ValidatorRow } from "@/types/faker"
import { lazy, Suspense, useState, memo, useCallback } from "react"
import { ModalClaim } from "../claim/modal"
import s from "./active.module.scss"
import { useChainId, useSwitchChain } from "wagmi"
import { HELIOS_NETWORK_ID, HELIOS_TOKEN_ADDRESS } from "@/config/app"
import Image from "next/image"
import { Symbol } from "@/components/symbol"
import { TokenExtended } from "@/types/token"

const ModalStake = lazy(
  () => import("./stake").then((module) => ({ default: module.ModalStake }))
)
const ModalUnstake = lazy(
  () => import("./unstake").then((module) => ({ default: module.ModalUnstake }))
)

export const Row = memo(
  ({
    address,
    name,
    commission,
    assets,
    rewards,
    rewardsPrice,
    apy
  }: ValidatorRow) => {
    const [openRewards, setOpenRewards] = useState(false)
    const [openStake, setOpenStake] = useState(false)
    const [openUnstake, setOpenUnstake] = useState(false)
    const chainId = useChainId()
    const { switchChain } = useSwitchChain()

    // Wrap handlers in useCallback
    const handleOpenStake = useCallback(() => {
      if (chainId !== HELIOS_NETWORK_ID) {
        switchChain({ chainId: HELIOS_NETWORK_ID })
      }
      setOpenStake(true)
    }, [chainId, switchChain])

    const handleOpenUnstake = useCallback(() => {
      if (chainId !== HELIOS_NETWORK_ID) {
        switchChain({ chainId: HELIOS_NETWORK_ID })
      }
      setOpenUnstake(true)
    }, [chainId, switchChain])

    const handleOpenRewards = useCallback(() => {
      if (chainId !== HELIOS_NETWORK_ID) {
        switchChain({ chainId: HELIOS_NETWORK_ID })
      }
      setOpenRewards(true)
    }, [chainId, switchChain])

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
            {assets.map((asset: TokenExtended, index: number) => (
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
                </div>
                <div className={s.amount}>{asset.balance.amount}</div>
              </li>
            ))}
          </ul>
        </TableCell>
        <TableCell className={s.apy}>
          <strong>{apy.toFixed(2)}%</strong>
        </TableCell>
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
            <Suspense fallback={null}>
              {openStake && (
                <ModalStake
                  title={`Stake on ${name}`}
                  minDelegation={"0"}
                  hasAlreadyDelegated={true}
                  validatorAddress={address}
                  open={openStake}
                  setOpen={setOpenStake}
                />
              )}
            </Suspense>
            <Button
              icon="hugeicons:minus-sign-circle"
              variant="warning"
              size="xsmall"
              border
              onClick={handleOpenUnstake}
            />
            <Suspense fallback={null}>
              {openUnstake && (
                <ModalUnstake
                  title={`Unstake from ${name}`}
                  validatorAddress={address}
                  delegatedAssets={assets}
                  open={openUnstake}
                  setOpen={setOpenUnstake}
                />
              )}
            </Suspense>
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
)

// Add a display name for easier debugging in React DevTools
Row.displayName = "DelegationRow"