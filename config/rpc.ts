"use client"

import { useAppStore } from "@/stores/app"

// Default RPC URL as fallback
const DEFAULT_RPC_URL = "http://localhost:8545"

// Function to get the current RPC URL based on debug mode
export const getRpcUrl = () => {
  // This is a client-side only function
  if (typeof window === "undefined") {
    return DEFAULT_RPC_URL
  }

  try {
    // First try to get settings from localStorage to ensure persistence across refreshes
    const storeData = JSON.parse(
      localStorage.getItem("helios-app-store") || "{}"
    )

    // Get debug mode and RPC URL from localStorage first
    const storedDebugMode = storeData.state?.debugMode
    const storedRpcUrl = storeData.state?.rpcUrl

    // If we have stored values, use them
    if (storedDebugMode !== undefined && storedRpcUrl !== undefined) {
      return storedDebugMode ? storedRpcUrl : DEFAULT_RPC_URL
    }

    // Fallback to the current state from the store
    const store = useAppStore.getState()
    const debugMode = store.debugMode
    const customRpcUrl = store.rpcUrl || DEFAULT_RPC_URL

    // Only use custom RPC URL if in debug mode
    return debugMode ? customRpcUrl : DEFAULT_RPC_URL
  } catch (e) {
    console.error("Error getting RPC URL:", e)
    // Fallback to default if any error occurs
    return DEFAULT_RPC_URL
  }
}

// React hook to get the RPC URL
export const useRpcUrl = () => {
  const { debugMode, rpcUrl, hasHydrated } = useAppStore()

  // If the store hasn't hydrated yet, try to get values from localStorage
  if (!hasHydrated && typeof window !== "undefined") {
    try {
      const storeData = JSON.parse(
        localStorage.getItem("helios-app-store") || "{}"
      )
      const storedDebugMode = storeData.state?.debugMode
      const storedRpcUrl = storeData.state?.rpcUrl

      if (storedDebugMode !== undefined && storedRpcUrl !== undefined) {
        return storedDebugMode ? storedRpcUrl : DEFAULT_RPC_URL
      }
    } catch (e) {
      console.error("Error reading from localStorage:", e)
    }
  }

  // Only use custom RPC URL if in debug mode
  const currentRpcUrl = debugMode ? rpcUrl : DEFAULT_RPC_URL

  return currentRpcUrl
}
