import { Token } from "../types/Tokens"
import { getChain } from "./chains"
import { type ChainId, TOKEN_COLORS, type TokenId } from "./constants"

const tokenData: Array<Omit<Token, "chain">> = [
  {
    id: "hls",
    name: "Helios",
    chainId: "helios",
    color: TOKEN_COLORS.hls,
    symbol: "HLS",
    symbolIcon: "helios",
    decimals: 18,
    pricePerToken: 0.05
  },
  {
    id: "eth",
    name: "Ethereum",
    chainId: "ethereum",
    color: TOKEN_COLORS.eth,
    symbol: "ETH",
    symbolIcon: "token:ethereum",
    decimals: 18,
    pricePerToken: 3500
  },
  {
    id: "usdt",
    name: "Tether",
    chainId: "ethereum",
    color: TOKEN_COLORS.usdt,
    symbol: "USDT",
    symbolIcon: "token:usdt",
    decimals: 6,
    pricePerToken: 1,
    isStablecoin: true
  },
  {
    id: "usdc",
    name: "USD Coin",
    chainId: "ethereum",
    color: TOKEN_COLORS.usdc,
    symbol: "USDC",
    symbolIcon: "token:usdc",
    decimals: 6,
    pricePerToken: 1,
    isStablecoin: true
  },
  {
    id: "dai",
    name: "Dai",
    chainId: "ethereum",
    color: TOKEN_COLORS.dai,
    symbol: "DAI",
    symbolIcon: "token:dai",
    decimals: 18,
    pricePerToken: 1,
    isStablecoin: true
  },
  {
    id: "link",
    name: "Chainlink",
    chainId: "ethereum",
    color: TOKEN_COLORS.link,
    symbol: "LINK",
    symbolIcon: "token:chainlink",
    decimals: 18,
    pricePerToken: 15
  },
  {
    id: "uni",
    name: "Uniswap",
    chainId: "ethereum",
    color: TOKEN_COLORS.uni,
    symbol: "UNI",
    symbolIcon: "token:uniswap",
    decimals: 18,
    pricePerToken: 8
  },
  {
    id: "aave",
    name: "Aave",
    chainId: "ethereum",
    color: TOKEN_COLORS.aave,
    symbol: "AAVE",
    symbolIcon: "token:aave",
    decimals: 18,
    pricePerToken: 90
  },
  {
    id: "matic",
    name: "Polygon",
    chainId: "polygon",
    color: TOKEN_COLORS.matic,
    symbol: "MATIC",
    symbolIcon: "token:polygon",
    decimals: 18,
    pricePerToken: 0.6
  },
  {
    id: "bnb",
    name: "BNB",
    chainId: "bsc",
    color: TOKEN_COLORS.bnb,
    symbol: "BNB",
    symbolIcon: "token:bnb",
    decimals: 18,
    pricePerToken: 580
  },
  {
    id: "avax",
    name: "Avalanche",
    chainId: "avalanche",
    color: TOKEN_COLORS.avax,
    symbol: "AVAX",
    symbolIcon: "token:avax",
    decimals: 18,
    pricePerToken: 30
  },
  {
    id: "sol",
    name: "Solana",
    chainId: "solana",
    color: TOKEN_COLORS.sol,
    symbol: "SOL",
    symbolIcon: "token:solana",
    decimals: 9,
    pricePerToken: 140
  },
  {
    id: "arb",
    name: "Arbitrum",
    chainId: "arbitrum",
    color: TOKEN_COLORS.arb,
    symbol: "ARB",
    symbolIcon: "token:arbitrum",
    decimals: 18,
    pricePerToken: 1.2
  }
]

export const TOKENS = new Map<TokenId, Token>(
  tokenData.map((token) => [
    token.id,
    {
      ...token,
      chain: getChain(token.chainId)
    }
  ])
)

export function getToken(id: string): Token | undefined {
  return TOKENS.get(id as TokenId)
}

export function getAllTokens(): Token[] {
  return Array.from(TOKENS.values())
}

export function getTokensByChain(chainId: ChainId): Token[] {
  return Array.from(TOKENS.values()).filter(
    (token) => token.chainId === chainId
  )
}

export function getStablecoins(): Token[] {
  return Array.from(TOKENS.values()).filter(
    (token) => token.isStablecoin === true
  )
}

export function searchTokens(query: string): Token[] {
  const normalizedQuery = query.toLowerCase().trim()

  return Array.from(TOKENS.values()).filter(
    (token) =>
      token.name.toLowerCase().includes(normalizedQuery) ||
      token.symbol.toLowerCase().includes(normalizedQuery)
  )
}
