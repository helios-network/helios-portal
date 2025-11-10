import { useQuery } from "@tanstack/react-query"
import {
  getDelegation,
  getValidatorWithHisAssetsAndCommission,
  getValidatorWithHisDelegationAndCommission
} from "@/helpers/rpc-calls"
import { ethers } from "ethers"
import { TokenExtended } from "@/types/token"
import { HELIOS_NETWORK_ID } from "@/config/app"
import { useAccount } from "wagmi"
import { ValidatorWithAssetsCommissionAndDelegation } from "@/types/validator"
import { useTokenRegistry } from "@/hooks/useTokenRegistry"

export const useValidatorDetail = (address: string, validatorWithAssetsAndCommissionAndDelegation?: ValidatorWithAssetsCommissionAndDelegation) => {
  const { address: userAddress } = useAccount()
  const { getTokenByAddress } = useTokenRegistry()

  const qValidatorDetail = useQuery({
    queryKey: ["validatorDetail", address],
    queryFn: () => getValidatorWithHisDelegationAndCommission(address),
    enabled: !!address && !validatorWithAssetsAndCommissionAndDelegation
  })

  const qValidatorAssets = useQuery({
    queryKey: ["validatorAssets", address],
    queryFn: () => getValidatorWithHisAssetsAndCommission(address),
    enabled: !!address && !validatorWithAssetsAndCommissionAndDelegation
  })

  const qDelegationDetail = useQuery({
    queryKey: ["delegationDetail", userAddress, address],
    queryFn: () => getDelegation(userAddress!, address),
    enabled: !!address && !!userAddress && !validatorWithAssetsAndCommissionAndDelegation
  })
  const hasPreEnrichedAssets = !!validatorWithAssetsAndCommissionAndDelegation?.delegation?.assets?.length

  return {
    validator: validatorWithAssetsAndCommissionAndDelegation?.validator || qValidatorDetail.data?.validator,
    delegation: validatorWithAssetsAndCommissionAndDelegation?.delegation || qValidatorDetail.data?.delegation,
    commission: validatorWithAssetsAndCommissionAndDelegation?.commission || qValidatorDetail.data?.commission,
    userHasDelegated: !!qDelegationDetail.data,
    isLoading: qValidatorDetail.isLoading || qValidatorAssets.isLoading || qDelegationDetail.isLoading,
    error: qValidatorDetail.error || qValidatorAssets.error || qDelegationDetail.error
  }
}
