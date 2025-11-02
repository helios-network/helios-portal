export interface ChainMetadata {
  chainId: number
  contractAddress: string
  isOriginated: boolean
}

export interface DenomUnit {
  denom: string
  exponent?: number
}

export interface TokenMetadata {
  description: string
  denomUnits: DenomUnit[]
  base: string
  display: string
  name: string
  symbol: string
  decimals: number
  logo: string
  contract_address: string
  chainsMetadatas: ChainMetadata[]
}

export interface TokenDenom {
  metadata: TokenMetadata
  holdersCount: number
  total_supply: string
}

export interface HyperionHistoricalFee {
  denom: string
  amount: string
}

export interface HyperionHistoricalFees {
  historical_fees: HyperionHistoricalFee[]
  low: HyperionHistoricalFee
  high: HyperionHistoricalFee
  average: HyperionHistoricalFee
}
