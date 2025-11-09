import { CHAIN_COLORS } from "./constants"
import { heliosChain } from "./wagmi"
import { EXPLORER_URL, HELIOS_NETWORK_ID, RPC_URL_DEFAULT } from "./app"
import { getRpcUrl } from "./rpc"

export interface ChainConfig {
  id: string
  chainId: number
  name: string
  color: string
  iconName: string
  rpcUrl: string
  explorerUrl: string
  token?: string
  wrappedToken?: string
  wrapperContract?: string
  decimals?: number
}

export const CHAIN_CONFIG: Record<number, ChainConfig> = {
  [HELIOS_NETWORK_ID]: {
    id: "helios",
    chainId: heliosChain.id,
    name: "Helios",
    color: CHAIN_COLORS.helios,
    iconName: "helios",
    rpcUrl: typeof window !== "undefined" ? getRpcUrl() : RPC_URL_DEFAULT,
    explorerUrl: EXPLORER_URL
  },
  1: {
    id: "ethereum",
    chainId: 1,
    name: "Ethereum",
    color: CHAIN_COLORS.ethereum,
    iconName: "token:ethereum",
    rpcUrl: "https://ethereum-rpc.publicnode.com",
    explorerUrl: "https://etherscan.io",
    wrapperContract: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    decimals: 18,
    token: "ETH",
    wrappedToken: "WETH"
  },
  56: {
    id: "bsc",
    chainId: 56,
    name: "BSC Mainnet",
    color: CHAIN_COLORS.bsc,
    iconName: "token:binance-smart-chain",
    rpcUrl: "https://bsc-rpc.publicnode.com",
    explorerUrl: "https://bscscan.com",
    wrapperContract: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
    decimals: 18,
    token: "BNB",
    wrappedToken: "WBNB"
  },
  11155111: {
    id: "sepolia",
    chainId: 11155111,
    name: "Sepolia",
    color: CHAIN_COLORS.ethereum,
    iconName: "token:ethereum",
    rpcUrl: "https://ethereum-sepolia-rpc.publicnode.com",
    explorerUrl: "https://sepolia.etherscan.io",
    wrapperContract: "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9",
    decimals: 18,
    token: "ETH",
    wrappedToken: "WETH"
  },
  80002: {
    id: "polygon-amoy",
    chainId: 80002,
    name: "Polygon Amoy",
    color: CHAIN_COLORS.polygon,
    iconName: "token:polygon",
    rpcUrl: "https://rpc-amoy.polygon.technology",
    explorerUrl: "https://amoy.polygonscan.com",
    wrapperContract: "0xa5733b3a8e62a8faf43b0376d5faf46e89b3033e",
    decimals: 18,
    token: "POL",
    wrappedToken: "WPOL"
  },
  97: {
    id: "bsc-testnet",
    chainId: 97,
    name: "BSC Testnet",
    color: CHAIN_COLORS.bsc,
    iconName: "token:binance-smart-chain",
    rpcUrl: "https://bsc-testnet-rpc.publicnode.com",
    explorerUrl: "https://testnet.bscscan.com",
    wrapperContract: "0xc689bf5a007f44410676109f8aa8e3562da1c9ba",
    decimals: 18,
    token: "tBNB",
    wrappedToken: "WtBNB"
  },
  43113: {
    id: "avalanche-fuji",
    chainId: 43113,
    name: "Avalanche Fuji",
    color: CHAIN_COLORS.avalanche,
    iconName: "token:avax",
    rpcUrl: "https://avalanche-fuji-c-chain-rpc.publicnode.com",
    explorerUrl: "https://testnet.snowtrace.io",
    wrapperContract: "0xd00ae08403B9bbb9124bB305C09058E32C39A48c",
    decimals: 18,
    token: "AVAX",
    wrappedToken: "WAVAX"
  },
  42161: {
    id: "arbitrum",
    chainId: 42161,
    name: "Arbitrum",
    color: CHAIN_COLORS.arbitrum,
    iconName: "token:arbitrum",
    rpcUrl: "https://arbitrum-one-rpc.publicnode.com",
    explorerUrl: "https://arbiscan.io",
    wrapperContract: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
    decimals: 18,
    token: "ETH",
    wrappedToken: "WETH"
  },
  8453: {
    id: "base",
    chainId: 8453,
    name: "Base",
    color: CHAIN_COLORS.base,
    iconName: "token:base",
    rpcUrl: "https://base-rpc.publicnode.com",
    explorerUrl: "https://basescan.org",
    wrapperContract: "0x4200000000000000000000000000000000000006",
    decimals: 18,
    token: "BASE",
    wrappedToken: "WBASE"
  },
  10: {
    id: "optimism",
    chainId: 10,
    name: "Optimism",
    color: CHAIN_COLORS.optimism,
    iconName: "token:optimism",
    rpcUrl: "https://optimism-rpc.publicnode.com",
    explorerUrl: "https://optimistic.etherscan.io",
    wrapperContract: "0x4200000000000000000000000000000000000006",
    decimals: 18,
    token: "ETH",
    wrappedToken: "WETH"
  },
  137: {
    id: "polygon",
    chainId: 137,
    name: "Polygon",
    color: CHAIN_COLORS.polygon,
    iconName: "token:polygon",
    rpcUrl: "https://polygon-bor-rpc.publicnode.com",
    explorerUrl: "https://polygonscan.com",
    wrapperContract: "0x0000000000000000000000000000000000001010",
    decimals: 18,
    token: "POL",
    wrappedToken: "WPOL"
  }
}

export const getChainConfig = (chainId: number): ChainConfig | undefined => {
  return CHAIN_CONFIG[chainId]
}

export const isWrappableChain = (chainId: number): boolean => {
  return !!CHAIN_CONFIG[chainId]?.wrapperContract
}

export const getChainName = (chainId: number): string => {
  return CHAIN_CONFIG[chainId]?.name || `Chain ${chainId}`
}