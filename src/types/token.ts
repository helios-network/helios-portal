export interface TokenBalance {
  id: string
  name: string
  address: string
  symbol: string
  balance: string
}

export interface Token {
  address: string
  enabled: boolean
  owner: number
  symbol: string
}

export interface CGToken {
  name: string
  amount: string
  symbol: string
  symbolIcon: string
  priceUSD: number
  valueUSD: number
  percentage: number
  color: string
}
