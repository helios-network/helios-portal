"use client"

import { useState } from "react"

export type DeployedToken = {
  address: string
  name: string
  symbol: string
  denom: string
  totalSupply: string
  decimals: number
  logoBase64: string
  txHash: string
  timestamp: number
}

export const useRecentTokens = () => {
  const getStoredTokens = (): DeployedToken[] => {
    if (typeof window === "undefined") return []

    try {
      const stored = localStorage.getItem("deployedTokens")
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error("Failed to parse stored tokens:", error)
      return []
    }
  }

  const [recentTokens, setRecentTokens] =
    useState<DeployedToken[]>(getStoredTokens)

  const refreshTokens = () => {
    setRecentTokens(getStoredTokens())
  }

  const clearTokens = () => {
    localStorage.removeItem("deployedTokens")
    setRecentTokens([])
  }

  const addToken = (token: DeployedToken) => {
    const current = getStoredTokens()
    const updated = [token, ...current].slice(0, 10) // Keep only last 10
    localStorage.setItem("deployedTokens", JSON.stringify(updated))
    setRecentTokens(updated)
  }

  return {
    recentTokens,
    refreshTokens,
    clearTokens,
    addToken
  }
}
