import { useQuery } from "@tanstack/react-query"
import { getValidatorsByPageAndSizeWithHisAssetsAndCommissionAndDelegation } from "@/helpers/rpc-calls"
import { getTokenDetailsInBatch } from "./useTokenEnrichmentBatch"
import { fetchCGTokenData } from "@/utils/price"
import { ethers } from "ethers"
import { TokenExtended } from "@/types/token"
import { TOKEN_COLORS } from "@/config/constants"
import { APP_COLOR_DEFAULT, HELIOS_NETWORK_ID } from "@/config/app"
import { toHex } from "@/utils/number"

interface ValidatorDetailResult {
    enrichedAssets?: TokenExtended[]
    commission?: any
}

const enrichValidatorAssets = async (
    validatorsData: any[]
): Promise<Record<string, ValidatorDetailResult>> => {
    // Collect all unique token addresses from all validators
    const allTokenAddresses = new Set<string>()

    validatorsData.forEach(data => {
        data.assets?.forEach((asset: any) => {
            allTokenAddresses.add(asset.contractAddress)
        })
    })

    if (allTokenAddresses.size === 0) {
        // No assets to enrich
        const resultData: Record<string, ValidatorDetailResult> = {}
        validatorsData.forEach(data => {
            resultData[data.validator.validatorAddress] = {
                enrichedAssets: [],
                commission: data.commission
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

    validatorsData.forEach(data => {
        const enrichedAssets: TokenExtended[] = []

        data.assets?.forEach((asset: any) => {
            const metadata = batchMetadata[asset.contractAddress]
            if (!metadata) return

            const symbol = metadata.metadata.symbol.toLowerCase()
            const cgToken = cgData[symbol]
            const unitPrice = cgToken?.price || 0

            const amount = parseFloat(
                ethers.formatUnits(asset.baseAmount || 0, metadata.metadata.decimals)
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

        enrichedData[data.validator.validatorAddress] = {
            enrichedAssets: enrichedAssets.filter(t => t !== null),
            commission: data.commission
        }
    })

    return enrichedData
}

/**
 * Hook to fetch validators with their enriched asset data
 * Uses the optimized eth_getValidatorsByPageAndSizeWithHisAssetsAndCommissionAndDelegation RPC method
 * Single RPC call replaces multiple batch requests
 * 
 * Performance: Single unified RPC call vs. N×2 batch calls
 */
export const useValidatorsWithEnrichedData = (page = 1, size = 100) => {
    const VALIDATOR_STALE_TIME = 5 * 60 * 1000 // 5 minutes
    const VALIDATOR_REFETCH_INTERVAL = 10 * 60 * 1000 // 10 minutes

    return useQuery({
        queryKey: ["validatorsEnrichedData", page, size],
        queryFn: async () => {
            const validatorsData = await getValidatorsByPageAndSizeWithHisAssetsAndCommissionAndDelegation(
                toHex(page),
                toHex(size)
            )

            if (!validatorsData || validatorsData.length === 0) {
                return {}
            }

            // Enrich assets with token metadata and price data
            const enrichedData = await enrichValidatorAssets(validatorsData)
            return enrichedData
        },
        enabled: !!page && !!size,
        staleTime: VALIDATOR_STALE_TIME,
        refetchInterval: VALIDATOR_REFETCH_INTERVAL
    })
}