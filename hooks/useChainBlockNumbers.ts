import { useQuery } from "@tanstack/react-query"
import { createPublicClient, http, Chain } from "viem"
import { getChainConfig } from "@/config/chain-config"
import { secondsToMilliseconds } from "@/utils/number"
import {
  mainnet,
  sepolia,
  polygonAmoy,
  bscTestnet,
  avalancheFuji,
  bsc,
  arbitrum,
  base,
  optimism,
  polygon
} from "@reown/appkit/networks"
import { HELIOS_NETWORK_ID } from "@/config/app"
import { heliosChain } from "@/config/wagmi"

const BLOCK_NUMBER_STALE_TIME = secondsToMilliseconds(5)
const BLOCK_NUMBER_REFETCH_INTERVAL = secondsToMilliseconds(10)

const chainMap: Record<number, Chain> = {
  [HELIOS_NETWORK_ID]: heliosChain,
  1: mainnet,
  56: bsc,
  11155111: sepolia,
  80002: polygonAmoy,
  97: bscTestnet,
  43113: avalancheFuji,
  42161: arbitrum,
  8453: base,
  10: optimism,
  137: polygon
}

export const useChainBlockNumbers = (chainId?: number) => {
  const chainConfig = chainId ? getChainConfig(chainId) : undefined
  const rpcUrl = chainConfig?.rpcUrl
  const viemChain = chainId ? chainMap[chainId] : undefined

  const query = useQuery({
    queryKey: ["chainBlockNumber", chainId],
    queryFn: async (): Promise<number | null> => {
      if (!rpcUrl || !viemChain || !chainId) return null

      try {
        const client = createPublicClient({
          chain: viemChain,
          transport: http(rpcUrl)
        })

        const blockNumber = await client.getBlockNumber()
        return Number(blockNumber)
      } catch (error) {
        console.error(`Error fetching block for chain ${chainId}:`, error)
        return null
      }
    },
    enabled: !!chainId && !!rpcUrl && !!viemChain,
    staleTime: BLOCK_NUMBER_STALE_TIME
  })

  const blockNumbers: Record<number, number> = {}
  if (query.data !== undefined && query.data !== null && chainId) {
    blockNumbers[chainId] = query.data
  }

  return {
    blockNumbers,
    isLoading: query.isLoading,
    errors: query.error ? [{ chainId, error: query.error }] : []
  }
}

