import { TokenExtended } from "./token"

export interface Access {
  address: string
  storageKeys: string[]
}

export interface Transaction {
  blockHash: string
  blockNumber: string
  from: string
  gas: string
  gasPrice: string
  maxFeePerGas: string
  maxPriorityFeePerGas: string
  hash: string
  input: string
  nonce: string
  to: string
  transactionIndex: string
  value: string
  type: string
  accessList: Access[]
  chainId: string
  v: string
  r: string
  s: string
}

export interface TransactionLast {
  RawTransaction: {
    blockHash: string
    blockNumber: string
    from: string
    gas: string
    gasPrice: string
    maxFeePerGas: string
    maxPriorityFeePerGas: string
    hash: string
    input: string
    nonce: string
    to: string
    transactionIndex: string
    value: string
    type: string
    accessList: any[]
    chainId: string
    v: string
    r: string
    s: string
  }
  ParsedInfo: {
    amount?: string
    denom?: string
    contractAddress?: string
    type: TransactionLastType
  }
}

export type TransactionLastType =
  | "BRIDGE_OUT"
  | "BRIDGE_IN"
  | "GOV_VOTE"
  | "STAKE_IN"
  | "STAKE_OUT"
  | "DEPOSIT"
  | "WITHDRAW"
  | "UNKNOWN"
  | "CREATE_CRON"
  | "TRANSFER"
  | "CREATE_ERC20"

export type TransactionLight = {
  type: TransactionLastType
  token: TokenExtended | null
  amount: string
  hash: string
  status?: string
  chainId?: number
  chainLogo?: string
  chainName?: string
  timeout?: number
  status_bridge_tx?: string
  fees?: string
  transactionId?: number
}
