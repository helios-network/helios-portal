"use client"

import { DelegationInfo } from "../../(components)/delegation-info"
import { useProposalDelegations } from "@/hooks/useProposalDelegations"

export function DelegationWrapper() {
  const { delegations, isLoading, error, isConnected } =
    useProposalDelegations()

  // Only show delegation info if wallet is connected
  if (!isConnected) {
    return null
  }

  return (
    <DelegationInfo
      delegations={delegations}
      isLoading={isLoading}
      error={error}
    />
  )
}
