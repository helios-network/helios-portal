import { useQuery } from "@tanstack/react-query"
import {
  getDelegation,
  getValidatorDetailAndAssetsBatch
} from "@/helpers/rpc-calls"
import { ethers } from "ethers"
import { TokenExtended } from "@/types/token"
import { HELIOS_NETWORK_ID } from "@/config/app"
import { useAccount } from "wagmi"
import { getTokenDetailsInBatch } from "./useTokenEnrichmentBatch"
import { fetchCGTokenData } from "@/utils/price"
import { TOKEN_COLORS } from "@/config/constants"
import { APP_COLOR_DEFAULT } from "@/config/app"

interface CachedValidatorDetails {
  delegation?: any
  assets?: any
  enrichedAssets?: TokenExtended[]
}

export const useValidatorDetail = (
  address: string,
  cachedDetails?: CachedValidatorDetails
) => {
  const { address: userAddress } = useAccount()
  const qValidatorDetailAndAssets = useQuery({
    queryKey: ["validatorDetailAndAssets", address],
    queryFn: () => getValidatorDetailAndAssetsBatch(address),
    enabled: !!address && (!cachedDetails?.delegation || !cachedDetails?.assets),
    initialData: cachedDetails?.delegation && cachedDetails?.assets
      ? [cachedDetails.delegation, cachedDetails.assets]
      : undefined
  })

  const qDelegationDetail = useQuery({
    queryKey: ["delegationDetail", userAddress, address],
    queryFn: () => getDelegation(userAddress!, address),
    enabled: !!address && !!userAddress
  })
  const hasPreEnrichedAssets = !!cachedDetails?.enrichedAssets

  const enrichedAssetsQuery = useQuery({
    queryKey: ["enrichedValidatorAssets", address, qValidatorDetailAndAssets.data?.[1]],
    enabled: !!qValidatorDetailAndAssets.data?.[1]?.assets?.length && !hasPreEnrichedAssets,
    queryFn: async (): Promise<TokenExtended[]> => {
      const assets = qValidatorDetailAndAssets.data![1].assets
      const tokenAddresses = assets.map((asset: any) => asset.contractAddress)

      // Batch fetch metadata for all tokens at once
      const batchMetadata = await getTokenDetailsInBatch(tokenAddresses)

      // Fetch price data for all symbols at once
      const symbols = Object.values(batchMetadata)
        .map((m: any) => m.metadata.symbol.toLowerCase())
      const cgData = await fetchCGTokenData(symbols)

      // Map assets to enriched tokens
      const results = assets.map((asset: any) => {
        const metadata = batchMetadata[asset.contractAddress]
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

      return results.filter((token: any): token is TokenExtended => token !== null)
    }
  })

  const assets = hasPreEnrichedAssets
    ? cachedDetails!.enrichedAssets
    : enrichedAssetsQuery.data || []

  return {
    validator: qValidatorDetailAndAssets.data?.[0]?.validator,
    delegation: {
      ...qValidatorDetailAndAssets.data?.[0]?.delegation,
      assets
    },
    commission: qValidatorDetailAndAssets.data?.[0]?.commission,
    userHasDelegated: !!qDelegationDetail.data,
    isLoading: hasPreEnrichedAssets ? qValidatorDetailAndAssets.isLoading : (qValidatorDetailAndAssets.isLoading || enrichedAssetsQuery.isLoading),
    error: qValidatorDetailAndAssets.error || enrichedAssetsQuery.error
  }
}
