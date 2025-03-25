import { getAllTokens } from "../config/tokens"
import { generateRandomTransactions } from "../lib/faker"
import { TokenWithAmount } from "../types/Tokens"
import { Transaction } from "../types/Transactions"
import { create } from "zustand"

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
  .filter((token) => specificTokenIds.includes(token.id))
  .map((token) => {
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
  .sort((a, b) => b.priceUsd - a.priceUsd)

export const useUserStore = create<UserStore>((set, get) => ({
  address: "0xd8da6bf26964af9d7eed9e03e53415d37aa96045",
  logged: false,
  setLogged: (logged: boolean) => set({ logged }),
  tokens: fakeTokens,
  totalPriceUsd: fakeTokens.reduce((acc, token) => acc + token.priceUsd, 0),
  history: generateRandomTransactions(10)
}))
