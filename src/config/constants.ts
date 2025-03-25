export const TRUNCATE_START = 5
export const TRUNCATE_END = 4

export const CHAIN_COLORS = {
  ethereum: "#627EEA",
  polygon: "#8248E5",
  helios: "#002dcb",
  bsc: "#F0B90B",
  avalanche: "#E84142",
  solana: "#14F195",
  arbitrum: "#28A0F0"
} as const

export const TOKEN_COLORS = {
  hls: "#002dcb",
  eth: "#627EEA",
  usdt: "#26A17B",
  usdc: "#2775CA",
  bnb: "#F0B90B",
  matic: "#8248E5",
  avax: "#E84142",
  sol: "#14F195",
  arb: "#28A0F0",
  link: "#2A5ADA",
  dai: "#F5AC37",
  aave: "#B6509E",
  uni: "#FF007A"
} as const

export type ChainId = keyof typeof CHAIN_COLORS
export type TokenId = keyof typeof TOKEN_COLORS
