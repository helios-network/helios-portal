"use client"

import { createContext, useContext, ReactNode } from "react"
import { useVotingHistory, type VotedProposal } from "@/hooks/useVotingHistory"

export type { VotedProposal }

type VotingHistoryContextType = {
    votingHistory: VotedProposal[]
    refreshHistory: () => void
    clearHistory: () => void
    addVote: (vote: VotedProposal) => void
}

const VotingHistoryContext = createContext<VotingHistoryContextType | undefined>(
    undefined
)

export const VotingHistoryProvider = ({ children }: { children: ReactNode }) => {
    const votingHistoryHook = useVotingHistory()

    return (
        <VotingHistoryContext.Provider value={votingHistoryHook}>
            {children}
        </VotingHistoryContext.Provider>
    )
}

export const useVotingHistoryContext = () => {
    const context = useContext(VotingHistoryContext)
    if (context === undefined) {
        throw new Error(
            "useVotingHistoryContext must be used within a VotingHistoryProvider"
        )
    }
    return context
}