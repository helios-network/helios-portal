import { create } from "zustand"

interface AppStore {
  nav: boolean
  setNav: (nav: boolean) => void
}

export const useAppStore = create<AppStore>((set, get) => ({
  nav: false,
  setNav: (nav) => set({ nav })
}))
