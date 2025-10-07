"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

export type TokenInBasket = {
    address: string
    symbol: string
    percentage: number
}

export type DeployedETF = {
    name: string
    symbol: string
    tokens: TokenInBasket[]
    address: string
    txHash: string
    timestamp: number
}

type RecentETFsContextType = {
    recentETFs: DeployedETF[]
    addETF: (etf: DeployedETF) => void
    clearETFs: () => void
}

const RecentETFsContext = createContext<RecentETFsContextType | undefined>(
    undefined
)

const STORAGE_KEY = "helios_recent_etfs"
const MAX_RECENT_ETFS = 10

export const RecentETFsProvider: React.FC<{ children: React.ReactNode }> = ({
    children
}) => {
    const [recentETFs, setRecentETFs] = useState<DeployedETF[]>([])
    const [isLoaded, setIsLoaded] = useState(false)

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY)
            if (stored) {
                const parsed = JSON.parse(stored)
                setRecentETFs(parsed)
            }
        } catch (error) {
            console.error("Failed to load recent ETFs from localStorage:", error)
        } finally {
            setIsLoaded(true)
        }
    }, [])

    // Save to localStorage whenever recentETFs changes
    useEffect(() => {
        if (isLoaded) {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(recentETFs))
            } catch (error) {
                console.error("Failed to save recent ETFs to localStorage:", error)
            }
        }
    }, [recentETFs, isLoaded])

    const addETF = (etf: DeployedETF) => {
        setRecentETFs((prev) => {
            const updated = [etf, ...prev]
            return updated.slice(0, MAX_RECENT_ETFS)
        })
    }

    const clearETFs = () => {
        setRecentETFs([])
    }

    return (
        <RecentETFsContext.Provider value={{ recentETFs, addETF, clearETFs }}>
            {children}
        </RecentETFsContext.Provider>
    )
}

export const useRecentETFsContext = () => {
    const context = useContext(RecentETFsContext)
    if (context === undefined) {
        throw new Error(
            "useRecentETFsContext must be used within a RecentETFsProvider"
        )
    }
    return context
}