import { useQuery } from "@tanstack/react-query"
import {
  getDelegation,
  getValidatorWithHisAssetsAndCommission,
  getValidatorWithHisDelegationAndCommission,
  getTokensDetails
} from "@/helpers/rpc-calls"
import { fetchCGTokenData } from "@/utils/price"
import { ethers } from "ethers"
import { TokenExtended } from "@/types/token"
import { HELIOS_NETWORK_ID, APP_COLOR_DEFAULT } from "@/config/app"
import { TOKEN_COLORS } from "@/config/constants"
import { useAccount } from "wagmi"

export const useValidatorDetail = (address: string) => {
  const { address: userAddress } = useAccount()

  const qValidatorDetail = useQuery({
    queryKey: ["validatorDetail", address],
    queryFn: () => getValidatorWithHisDelegationAndCommission(address),
    enabled: !!address
  })

  const qValidatorAssets = useQuery({
    queryKey: ["validatorAssets", address],
    queryFn: () => getValidatorWithHisAssetsAndCommission(address),
    enabled: !!address
  })

  const qDelegationDetail = useQuery({
    queryKey: ["delegationDetail", userAddress, address],
    queryFn: () => getDelegation(userAddress!, address),
    enabled: !!address && !!userAddress
  })

  const enrichedAssetsQuery = useQuery({
    queryKey: ["enrichedValidatorAssets", address, qValidatorAssets.data],
    enabled: !!qValidatorAssets.data?.assets?.length,
    queryFn: async (): Promise<TokenExtended[]> => {
      const assets = qValidatorAssets.data!.assets
      const tokenAddresses = assets.map(a => a.contractAddress)

      // Batch fetch all token metadata in single RPC call
      const tokenDetails = await getTokensDetails(tokenAddresses)
      if (!tokenDetails || tokenDetails.length === 0) return []

      const symbols = tokenDetails.map(t => t?.metadata?.symbol?.toLowerCase()).filter(Boolean)
      const cgData = await fetchCGTokenData(symbols)

      const results = assets.map((asset, idx) => {
        const metadata = tokenDetails[idx]
        if (!metadata) return null

        const symbol = metadata.metadata.symbol.toLowerCase()
        const cgToken = cgData[symbol]
        const unitPrice = cgToken?.price || 0

        const amount = parseFloat(
          ethers.formatUnits(asset.baseAmount, metadata.metadata.decimals)
        )

        return {
          display: {
            name: metadata.metadata.name,
            description: "",
            logo: cgToken?.logo || "",
            symbol,
            symbolIcon: symbol === "hls" ? "helios" : `token:${symbol}`,
            color: TOKEN_COLORS[symbol as keyof typeof TOKEN_COLORS] || APP_COLOR_DEFAULT
          },
          price: { usd: unitPrice },
          balance: {
            amount,
            totalPrice: amount * unitPrice
          },
          functionnal: {
            address: asset.contractAddress,
            chainId: HELIOS_NETWORK_ID,
            denom: metadata.metadata.base,
            decimals: metadata.metadata.decimals
          },
          stats: {
            holdersCount: metadata.holdersCount,
            totalSupply: metadata.total_supply
          }
        } as TokenExtended
      })

      return results.filter((token): token is TokenExtended => token !== null)
    }
  })

  return {
    validator: qValidatorDetail.data?.validator,
    delegation: {
      ...qValidatorDetail.data?.delegation,
      assets: enrichedAssetsQuery.data || []
    },
    commission: qValidatorDetail.data?.commission,
    userHasDelegated: !!qDelegationDetail.data,
    isLoading: qValidatorDetail.isLoading || enrichedAssetsQuery.isLoading,
    error: qValidatorDetail.error || enrichedAssetsQuery.error
  }
}
