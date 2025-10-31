import { useQuery } from "@tanstack/react-query"
import { batchRequest } from "@/helpers/batchRequest"
import { Token, TokenMetadataResponse } from "@/types/token"
import { secondsToMilliseconds } from "@/utils/number"

const TOKEN_METADATA_STALE_TIME = secondsToMilliseconds(60)
const TOKEN_METADATA_REFETCH_INTERVAL = secondsToMilliseconds(300)
const MAX_TOKENS_PER_BATCH = 50 // Safe limit for batch size

/**
 * Batch fetch token metadata for multiple token addresses
 * Automatically chunks into multiple batches if needed
 */
export const getTokenDetailsInBatch = async (
    tokenAddresses: string[]
): Promise<Record<string, TokenMetadataResponse>> => {
    if (tokenAddresses.length === 0) return {}

    const result: Record<string, TokenMetadataResponse> = {}

    // Split into chunks to avoid overwhelming the RPC
    for (let i = 0; i < tokenAddresses.length; i += MAX_TOKENS_PER_BATCH) {
        const chunk = tokenAddresses.slice(i, i + MAX_TOKENS_PER_BATCH)

        // Build batch requests for this chunk
        const requests = chunk.map((address) => ({
            method: "eth_getTokenDetails",
            params: [address],
        }))

        // Execute batch request
        const batchResults = await batchRequest<TokenMetadataResponse[]>(requests)

        // Map results back to addresses
        chunk.forEach((address, idx) => {
            if (batchResults && batchResults[idx]) {
                result[address] = batchResults[idx]
            }
        })
    }

    return result
}

/**
 * React Query hook for batched token enrichment
 * Caches results and supports refetch configuration
 */
export const useTokenEnrichmentBatch = (
    tokenAddresses: string[] = [],
    options?: {
        enabled?: boolean
        staleTime?: number
        refetchInterval?: number
    }
) => {
    const {
        enabled = true,
        staleTime = TOKEN_METADATA_STALE_TIME,
        refetchInterval = TOKEN_METADATA_REFETCH_INTERVAL,
    } = options || {}

    return useQuery({
        queryKey: ["tokenEnrichmentBatch", tokenAddresses.sort().join(",")],
        queryFn: () => getTokenDetailsInBatch(tokenAddresses),
        enabled: enabled && tokenAddresses.length > 0,
        staleTime,
        refetchInterval,
        retry: 1, // Retry once for token metadata
    })
}

/**
 * Batch enrich tokens with metadata
 * Combines tokens array with fetched metadata
 */
export const enrichTokensWithMetadata = (
    tokens: Token[],
    metadata: Record<string, TokenMetadataResponse>
): (Token & { enriched?: TokenMetadataResponse })[] => {
    return tokens.map((token) => ({
        ...token,
        enriched: metadata[token.address],
    }))
}

/**
 * Safe version - returns null instead of throwing on error
 */
export const getTokenDetailsInBatchSafe = async (
    tokenAddresses: string[]
): Promise<Record<string, TokenMetadataResponse> | null> => {
    try {
        return await getTokenDetailsInBatch(tokenAddresses)
    } catch (error) {
        console.error("Token enrichment batch failed:", error)
        return null
    }
}