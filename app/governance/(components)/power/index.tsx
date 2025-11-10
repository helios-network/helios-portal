"use client"

import { Blocks } from "@/components/blocks"
import { Button } from "@/components/button"
import { Card } from "@/components/card"
import { Heading } from "@/components/heading"
import { Icon } from "@/components/icon"
import { truncateAddress } from "@/lib/utils"
import { toast } from "sonner"
import s from "./power.module.scss"
import { useProposalDelegations } from "@/hooks/useProposalDelegations"
import { useWhitelistedAssets } from "@/hooks/useWhitelistedAssets"
import { useAccount } from "wagmi"
import { ethers } from "ethers"
import { useMemo } from "react"

const formatNumber = (num: number, maxFraction = 2) =>
  Number.isFinite(num)
    ? num.toLocaleString(undefined, {
      maximumFractionDigits: maxFraction
    })
    : "0"

export const Power = () => {
  const { address, isConnected } = useAccount()
  const { delegations, isLoading, error } = useProposalDelegations()
  const { assets, isLoading: assetsLoading } = useWhitelistedAssets()

  // Derived figures
  const { votingPower, stakedHls, delegatedPower, networkSharePct } = useMemo(() => {
    if (!delegations || delegations.length === 0) {
      return { votingPower: 0, stakedHls: 0, delegatedPower: 0, networkSharePct: 0 }
    }

    // Total voting power from shares
    const votingPowerVal = delegations.reduce((sum, d) => {
      return sum + parseFloat(ethers.formatUnits(d.shares, 18))
    }, 0)

    // Sum HLS (ahelios) amount across delegations (token amount)
    const stakedHlsVal = delegations.reduce((sum, d) => {
      const aheliosAssets = d.assets.filter((a) => a.denom === "ahelios")
      const subtotal = aheliosAssets.reduce((s, a) => s + parseFloat(ethers.formatUnits(a.amount, 18)), 0)
      return sum + subtotal
    }, 0)

    // Delegated power approximation: votingPower - direct HLS stake
    const delegatedPowerVal = Math.max(votingPowerVal - stakedHlsVal, 0)

    // Approximate network share: user voting power over total shares from whitelisted assets (if available)
    let networkTotalShares = 0
    if (assets && assets.length > 0) {
      networkTotalShares = assets.reduce((sum, a) => {
        const v = a.totalShares ? parseFloat(ethers.formatUnits(a.totalShares, 18)) : 0
        return sum + v
      }, 0)
    }

    const pct = networkTotalShares > 0 ? (votingPowerVal / networkTotalShares) * 100 : 0

    return {
      votingPower: votingPowerVal,
      stakedHls: stakedHlsVal,
      delegatedPower: delegatedPowerVal,
      networkSharePct: pct
    }
  }, [delegations, assets])

  const blocks = [
    {
      title: "Voting Power",
      value: `${formatNumber(votingPower)} votes`,
      bottom:
        assets.length > 0 && (networkSharePct || 0) > 0
          ? `${formatNumber(networkSharePct, 2)}% of total voting power`
          : undefined,
      color: "primary" as const
    },
    {
      title: "Staked HLS",
      value: `${formatNumber(stakedHls)} HLS`,
      bottom: "Direct voting power"
    },
    {
      title: "Delegated Power",
      value: `${formatNumber(delegatedPower)} votes`,
      bottom: "From validator delegations",
      color: "success" as const
    }
  ]

  // const list = [
  //   { label: "Proposals", value: "—" },
  //   { label: "Votes Cast", value: "—" }
  // ]

  const handleCopy = () => {
    if (!address) return
    navigator.clipboard.writeText(address)
    toast.success("Address copied to clipboard")
  }

  // Loading / Error / Disconnected states
  if (!isConnected) return null

  return (
    <Card className={s.power} auto>
      <Heading icon="hugeicons:renewable-energy" title="Your Governance Power" />

      {isLoading || assetsLoading ? (
        <p className={s.description}>Loading your governance power…</p>
      ) : error ? (
        <p className={s.description}>Failed to load governance power.</p>
      ) : (
        <p className={s.description}>
          Participate in on-chain governance by voting on proposals and submitting new proposals.
        </p>
      )}

      <Blocks items={blocks} />

      <div className={s.wallet}>
        <div className={s.icon}>
          <Icon icon="hugeicons:wallet-01" />
        </div>
        <div className={s.left}>
          <div className={s.title}>Connected Wallet</div>
          <div className={s.address}>
            <span>{truncateAddress(address || "0x", 6, 6)}</span>
            <Button
              variant="secondary"
              icon="hugeicons:copy-01"
              border
              className={s.copy}
              onClick={handleCopy}
            />
          </div>
        </div>
        {/* <ul className={s.right}>
          {list.map((item, index) => (
            <li key={index}>
              <div className={s.label}>{item.label}</div>
              <div className={s.value}>{item.value}</div>
            </li>
          ))}
        </ul> */}
      </div>
    </Card>
  )
}
