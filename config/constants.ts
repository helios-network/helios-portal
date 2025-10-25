export const TRUNCATE_START = 5
export const TRUNCATE_END = 4

export const CHAIN_COLORS = {
  ethereum: "#627EEA",
  polygon: "#8248E5",
  helios: "#002dcb",
  bsc: "#F0B90B",
  avalanche: "#E84142",
  solana: "#14F195",
  arbitrum: "#28A0F0",
  base: "#1C1C1C",
  optimism: "#FF0420"
} as const

export const TOKEN_COLORS = {
  ahelios: "#002dcb",
  hls: "#002dcb",
  weth: "#627EEA",
  wusdt: "#26A17B",
  wusdc: "#2775CA",
  wbnb: "#F0B90B",
  wmatic: "#8248E5",
  wavax: "#E84142",
  wsol: "#14F195",
  warb: "#28A0F0",
  wlink: "#2A5ADA",
  wdai: "#F5AC37",
  waave: "#B6509E",
  wuni: "#FF007A",
  wpol: "#7D3EE2"
} as const

export type ChainId = keyof typeof CHAIN_COLORS
export type TokenId = keyof typeof TOKEN_COLORS
