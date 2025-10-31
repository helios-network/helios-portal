import { useQuery } from "@tanstack/react-query"
import {
  getDelegation,
  getValidatorWithHisAssetsAndCommission,
  getValidatorWithHisDelegationAndCommission
} from "@/helpers/rpc-calls"
import { useTokenRegistry } from "@/hooks/useTokenRegistry"
import { ethers } from "ethers"
import { TokenExtended } from "@/types/token"
import { HELIOS_NETWORK_ID } from "@/config/app"
import { useAccount } from "wagmi"
import { ValidatorWithAssetsCommissionAndDelegation } from "@/types/validator"

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

  const enrichedAssetsQuery = useQuery({
    queryKey: ["enrichedValidatorAssets", address, qValidatorAssets.data],
    enabled: !!qValidatorAssets.data?.assets?.length || !!validatorWithAssetsAndCommissionAndDelegation?.assets?.length,
    queryFn: async (): Promise<TokenExtended[]> => {
      const assets = validatorWithAssetsAndCommissionAndDelegation?.assets || qValidatorAssets.data!.assets

      const results = await Promise.all(
        assets.map(async (asset) => {
          const enriched = await getTokenByAddress(
            asset.contractAddress,
            HELIOS_NETWORK_ID
          )
          if (!enriched) return null

          const amount = parseFloat(
            ethers.formatUnits(asset.baseAmount, enriched.functionnal.decimals)
          )

          return {
            ...enriched,
            display: {
              ...enriched.display,
              symbolIcon:
                enriched.display.symbolIcon ||
                `token:${enriched.display.symbol.toLowerCase()}`
            },
            balance: {
              amount,
              totalPrice: amount * enriched.price.usd
            }
          }
        })
      )

      return results.filter((token): token is TokenExtended => token !== null)
    }
  })

  return {
    validator: validatorWithAssetsAndCommissionAndDelegation?.validator || qValidatorDetail.data?.validator,
    delegation: {
      ...validatorWithAssetsAndCommissionAndDelegation?.delegation || qValidatorDetail.data?.delegation,
      assets: enrichedAssetsQuery.data || []
    },
    commission: validatorWithAssetsAndCommissionAndDelegation?.commission || qValidatorDetail.data?.commission,
    userHasDelegated: !!qDelegationDetail.data,
    isLoading: qValidatorDetail.isLoading || enrichedAssetsQuery.isLoading,
    error: qValidatorDetail.error || enrichedAssetsQuery.error
  }
}
