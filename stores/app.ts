import { create } from "zustand"
import { persist } from "zustand/middleware"

// Gas price multiplier options
export type GasPriceOption = "low" | "average" | "fast"

export const GAS_PRICE_MULTIPLIERS = {
  low: 0.8, // 80% of the network gas price
  average: 1.0, // 100% of the network gas price
  fast: 1.5 // 150% of the network gas price
}

interface AppStore {
  nav: boolean
  setNav: (nav: boolean) => void
  debugMode: boolean
  setDebugMode: (debugMode: boolean) => void
  hasHydrated: boolean
  setHasHydrated: (hasHydrated: boolean) => void
  rpcUrl: string
  setRpcUrl: (rpcUrl: string) => void
  gasPriceOption: GasPriceOption
  setGasPriceOption: (option: GasPriceOption) => void
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      nav: false,
      setNav: (nav) => set({ nav }),
      debugMode: false,
      setDebugMode: (debugMode) => set({ debugMode }),
      hasHydrated: false,
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
      rpcUrl: "http://localhost:8545",
      setRpcUrl: (rpcUrl) => set({ rpcUrl }),
      gasPriceOption: "average" as GasPriceOption,
      setGasPriceOption: (gasPriceOption) => set({ gasPriceOption })
    }),
    {
      name: "helios-app-store",
      partialize: (state) => ({
        rpcUrl: state.rpcUrl,
        debugMode: state.debugMode,
        gasPriceOption: state.gasPriceOption
      }), // <-- persist rpcUrl, debugMode, and gasPriceOption
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      }
    }
  )
)
