import type { Chain } from "@/types/Chains"
import { CHAIN_COLORS, ChainId } from "./constants"
import { mainnet, bsc } from "@reown/appkit/networks"
import { heliosChain } from "./wagmi"

export const CHAINS: Chain[] = [
  {
    id: "ethereum",
    chainNb: mainnet.id,
    name: "Ethereum",
    color: CHAIN_COLORS.ethereum,
    iconName: "token:ethereum"
  },
  //   {
  //     id: "polygon",
  //     name: "Polygon",
  //     color: CHAIN_COLORS.polygon,
  //     iconName: "token:polygon"
  //   },
  {
    id: "helios",
    name: "Helios",
    chainNb: heliosChain.id,
    color: CHAIN_COLORS.helios,
    iconName: "helios"
  },
  {
    id: "bsc",
    name: "BSC Mainnet",
    chainNb: bsc.id,
    color: CHAIN_COLORS.bsc,
    iconName: "token:binance-smart-chain"
  },
  //   {
  //     id: "avalanche",
  //     name: "Avalanche",
  //     color: CHAIN_COLORS.avalanche,
  //     iconName: "token:avax"
  //   },
  //   {
  //     id: "solana",
  //     name: "Solana",
  //     color: CHAIN_COLORS.solana,
  //     iconName: "token:solana"
  //   },
  //   {
  //     id: "arbitrum",
  //     name: "Arbitrum",
  //     color: CHAIN_COLORS.arbitrum,
  //     iconName: "token:arbitrum"
  //   }
]

export function getChain(chainId: ChainId): Chain | undefined {
  return CHAINS.find((chain) => chain.id === chainId)
}
export function getChainByNumber(chainNb: number): Chain | undefined {
  return CHAINS.find((chain) => chain.chainNb === chainNb)
}
