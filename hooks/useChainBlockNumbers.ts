import { useQueries } from "@tanstack/react-query"
import { createPublicClient, http, Chain } from "viem"
import { getChainConfig } from "@/config/chain-config"
import { secondsToMilliseconds } from "@/utils/number"
import { useChains } from "./useChains"
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

const BLOCK_NUMBER_STALE_TIME = secondsToMilliseconds(15)
const BLOCK_NUMBER_REFETCH_INTERVAL = secondsToMilliseconds(30)

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

export const useChainBlockNumbers = () => {
  const { chains } = useChains()

  const queries = useQueries({
    queries: (chains || []).map((chain) => {
      const chainConfig = getChainConfig(chain.chainId)
      const rpcUrl = chainConfig?.rpcUrl
      const viemChain = chainMap[chain.chainId]

      return {
        queryKey: ["chainBlockNumber", chain.chainId],
        queryFn: async (): Promise<number | null> => {
          if (!rpcUrl || !viemChain) return null

          try {
            const client = createPublicClient({
              chain: viemChain,
              transport: http(rpcUrl)
            })

            const blockNumber = await client.getBlockNumber()
            return Number(blockNumber)
          } catch (error) {
            console.error(`Error fetching block for chain ${chain.chainId}:`, error)
            return null
          }
        },
        enabled: !!rpcUrl && !!viemChain,
        staleTime: BLOCK_NUMBER_STALE_TIME,
        refetchInterval: BLOCK_NUMBER_REFETCH_INTERVAL,
        retry: 1,
        retryDelay: 1000
      }
    })
  })

  const blockNumbers: Record<number, number> = {}
  queries.forEach((query, index) => {
    if (query.data !== undefined && query.data !== null) {
      const chainId = chains?.[index]?.chainId
      if (chainId) {
        blockNumbers[chainId] = query.data
      }
    }
  })

  return {
    blockNumbers,
    isLoading: queries.some((q) => q.isLoading),
    errors: queries.filter((q) => q.error).map((q, i) => ({
      chainId: chains?.[i]?.chainId,
      error: q.error
    }))
  }
}

