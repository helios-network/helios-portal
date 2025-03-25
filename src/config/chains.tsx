import { Chain } from "../types/Chains"
import { CHAIN_COLORS, type ChainId } from "./constants"

export const CHAINS = new Map<ChainId, Chain>([
  [
    "ethereum",
    {
      id: "ethereum",
      name: "Ethereum",
      color: CHAIN_COLORS.ethereum,
      iconName: "token:ethereum"
    }
  ],
  [
    "polygon",
    {
      id: "polygon",
      name: "Polygon",
      color: CHAIN_COLORS.polygon,
      iconName: "token:polygon"
    }
  ],
  [
    "helios",
    {
      id: "helios",
      name: "Helios",
      color: CHAIN_COLORS.helios,
      iconName: "helios"
    }
  ],
  [
    "bsc",
    {
      id: "bsc",
      name: "BSC",
      color: CHAIN_COLORS.bsc,
      iconName: "token:binance-smart-chain"
    }
  ],
  [
    "avalanche",
    {
      id: "avalanche",
      name: "Avalanche",
      color: CHAIN_COLORS.avalanche,
      iconName: "token:avax"
    }
  ],
  [
    "solana",
    {
      id: "solana",
      name: "Solana",
      color: CHAIN_COLORS.solana,
      iconName: "token:solana"
    }
  ],
  [
    "arbitrum",
    {
      id: "arbitrum",
      name: "Arbitrum",
      color: CHAIN_COLORS.arbitrum,
      iconName: "token:arbitrum"
    }
  ]
])

export function getChain(id: string): Chain | undefined {
  return CHAINS.get(id as ChainId)
}

export function getAllChains(): Chain[] {
  return Array.from(CHAINS.values())
}
