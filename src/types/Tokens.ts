import type { ChainId, TokenId } from "../config/constants"
import type { Chain } from "./Chains"

export interface Token {
  id: TokenId
  name: string
  chainId: ChainId
  chain: Chain | undefined
  color: string
  symbol: string
  symbolIcon: string
  decimals: number
  pricePerToken: number
  isStablecoin?: boolean
}

export interface TokenWithAmount extends Token {
  amount: number
  priceUsd: number
}
