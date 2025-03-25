import { Token } from "./Tokens"

export type TransactionStatus = "pending" | "completed" | "failed"

export type TransactionType =
  | "bridge-out"
  | "bridge-in"
  | "governance-vote"
  | "stake-in"
  | "stake-out"
  | "deposit"
  | "withdraw"

export interface Transaction {
  id: string
  type: TransactionType
  token: Token
  amount: number
  date: string
  status: TransactionStatus
}
