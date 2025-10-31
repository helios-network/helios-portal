import { useQuery } from "@tanstack/react-query"
import { getValidatorDetailsAndAssetsBatch, getDelegation } from "@/helpers/rpc-calls"
import { Validator } from "@/types/validator"
import { getTokenDetailsInBatch } from "./useTokenEnrichmentBatch"
import { fetchCGTokenData } from "@/utils/price"
import { ethers } from "ethers"
import { TokenExtended } from "@/types/token"
import { TOKEN_COLORS } from "@/config/constants"
import { APP_COLOR_DEFAULT, HELIOS_NETWORK_ID } from "@/config/app"
import { useAccount } from "wagmi"

interface ValidatorDetailResult {
    delegation?: any
    assets?: any
    enrichedAssets?: TokenExtended[]
    commission?: any
    userHasDelegated: boolean
}

const enrichValidatorAssets = async (
    validatorData: Record<string, { delegation?: any; assets?: any }>,
    userAddress?: string,
    validatorAddresses?: string[]
): Promise<Record<string, ValidatorDetailResult>> => {
    // Collect all unique token addresses from all validators
    const allTokenAddresses = new Set<string>()

    Object.values(validatorData).forEach(data => {
        data.assets?.assets?.forEach((asset: any) => {
            allTokenAddresses.add(asset.contractAddress)
        })
    })

    // Fetch user delegation data for all validators in parallel
    const userDelegationPromises = validatorAddresses?.map(validatorAddr =>
        userAddress ? getDelegation(userAddress, validatorAddr).catch(() => null) : Promise.resolve(null)
    ) || []
    const userDelegations = await Promise.all(userDelegationPromises)
    const userDelegationMap = new Map(
        (validatorAddresses || []).map((addr, idx) => [addr, userDelegations[idx]])
    )

    if (allTokenAddresses.size === 0) {
        // No assets to enrich, return with delegation info
        const resultData: Record<string, ValidatorDetailResult> = {}
        Object.entries(validatorData).forEach(([validatorAddr, data]) => {
            resultData[validatorAddr] = {
                delegation: data.delegation,
                assets: data.assets,
                enrichedAssets: [],
                commission: data.assets?.commission || data.delegation?.commission,
                userHasDelegated: !!userDelegationMap.get(validatorAddr)
            }
        })
        return resultData
    }

    // Batch fetch metadata for all unique tokens
    const tokenAddressesArray = Array.from(allTokenAddresses)
    const batchMetadata = await getTokenDetailsInBatch(tokenAddressesArray)

    // Fetch price data for all symbols at once
    const symbols = Object.values(batchMetadata)
        .map((m: any) => m.metadata.symbol.toLowerCase())
    const cgData = await fetchCGTokenData(symbols)

    // Enrich each validator's assets
    const enrichedData: Record<string, ValidatorDetailResult> = {}

    Object.entries(validatorData).forEach(([validatorAddr, data]) => {
        const enrichedAssets: TokenExtended[] = []

        data.assets?.assets?.forEach((asset: any) => {
            const metadata = batchMetadata[asset.contractAddress]
            if (!metadata) return

            const symbol = metadata.metadata.symbol.toLowerCase()
            const cgToken = cgData[symbol]
            const unitPrice = cgToken?.price || 0

            const amount = parseFloat(
                ethers.formatUnits(asset.baseAmount, metadata.metadata.decimals)
            )

            enrichedAssets.push({
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
            } as TokenExtended)
        })

        enrichedData[validatorAddr] = {
            delegation: data.delegation,
            assets: data.assets,
            enrichedAssets: enrichedAssets.filter(t => t !== null),
            commission: data.assets?.commission || data.delegation?.commission,
            userHasDelegated: !!userDelegationMap.get(validatorAddr)
        }
    })

    return enrichedData
}

export const useValidatorsBatchDetails = (validators: Validator[]) => {
    const validatorAddresses = validators.map(v => v.validatorAddress)
    const { address: userAddress } = useAccount()

    return useQuery({
        queryKey: ["validatorsBatchDetails", validatorAddresses, userAddress],
        queryFn: async () => {
            const rawData = await getValidatorDetailsAndAssetsBatch(validatorAddresses)
            return enrichValidatorAssets(rawData, userAddress, validatorAddresses)
        },
        enabled: !!validators.length,
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchInterval: 10 * 60 * 1000 // 10 minutes
    })
}