import { getAllTokens } from "../config/tokens"
import { generateRandomTransactions } from "../lib/faker"
import { Token, TokenWithAmount } from "../types/Tokens"
import { create } from "zustand"
import { Transaction } from "../types/Transactions"

interface UserStore {
  logged: boolean
  setLogged: (logged: boolean) => void
  address: string | null
  tokens: TokenWithAmount[]
  totalPriceUsd: number
  history: Transaction[]
}

const specificTokenIds = ["eth", "hls", "usdt", "matic", "sol"]
const fakeTokens: TokenWithAmount[] = getAllTokens()
  .filter((token: Token) => specificTokenIds.includes(token.id))
  .map((token: Token) => {
    const amount =
      token.id === "eth"
        ? 2.4875
        : token.id === "hls"
        ? 350000
        : token.id === "usdt"
        ? 5000
        : token.id === "matic"
        ? 750.5
        : token.id === "sol"
        ? 12.35
        : 0

    return {
      ...token,
      amount,
      priceUsd: token.pricePerToken * amount
    }
  })
  .sort((a: TokenWithAmount, b: TokenWithAmount) => b.priceUsd - a.priceUsd)

export const useUserStore = create<UserStore>((set: any, get: any) => ({
  address: "0xd8da6bf26964af9d7eed9e03e53415d37aa96045",
  logged: false,
  setLogged: (logged: boolean) => set({ logged }),
  tokens: fakeTokens,
  totalPriceUsd: fakeTokens.reduce((acc: number, token: TokenWithAmount) => acc + token.priceUsd, 0),
  history: generateRandomTransactions(10)
}))
