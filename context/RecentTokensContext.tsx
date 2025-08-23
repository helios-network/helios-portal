"use client"

import { createContext, useContext, ReactNode } from "react"
import { useRecentTokens, type DeployedToken } from "@/hooks/useRecentTokens"

export type { DeployedToken }

type RecentTokensContextType = {
  recentTokens: DeployedToken[]
  refreshTokens: () => void
  clearTokens: () => void
  addToken: (token: DeployedToken) => void
}

const RecentTokensContext = createContext<RecentTokensContextType | undefined>(
  undefined
)

export const RecentTokensProvider = ({ children }: { children: ReactNode }) => {
  const recentTokensHook = useRecentTokens()

  return (
    <RecentTokensContext.Provider value={recentTokensHook}>
      {children}
    </RecentTokensContext.Provider>
  )
}

export const useRecentTokensContext = () => {
  const context = useContext(RecentTokensContext)
  if (context === undefined) {
    throw new Error(
      "useRecentTokensContext must be used within a RecentTokensProvider"
    )
  }
  return context
}
