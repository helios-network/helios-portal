"use client"

import { useState } from "react"

export type VotedProposal = {
    proposalId: number
    proposalTitle: string
    vote: "yes" | "no" | "abstain" | "veto"
    voteOption: number // 1=YES, 2=ABSTAIN, 3=NO, 4=NO_WITH_VETO
    timestamp: number
    status: "active" | "passed" | "rejected"
    txHash?: string
    metadata?: string
}

export const useVotingHistory = () => {
    const getStoredVotes = (): VotedProposal[] => {
        if (typeof window === "undefined") return []

        try {
            const stored = localStorage.getItem("votingHistory")
            return stored ? JSON.parse(stored) : []
        } catch (error) {
            console.error("Failed to parse stored voting history:", error)
            return []
        }
    }

    const [votingHistory, setVotingHistory] =
        useState<VotedProposal[]>(getStoredVotes)

    const refreshHistory = () => {
        setVotingHistory(getStoredVotes())
    }

    const clearHistory = () => {
        localStorage.removeItem("votingHistory")
        setVotingHistory([])
    }

    const addVote = (vote: VotedProposal) => {
        const current = getStoredVotes()
        // Check if vote already exists for this proposal, update it
        const existingIndex = current.findIndex(
            (v) => v.proposalId === vote.proposalId
        )

        let updated: VotedProposal[]
        if (existingIndex >= 0) {
            // Update existing vote
            updated = [...current]
            updated[existingIndex] = vote
        } else {
            // Add new vote at the beginning
            updated = [vote, ...current].slice(0, 50) // Keep only last 50
        }

        localStorage.setItem("votingHistory", JSON.stringify(updated))
        setVotingHistory(updated)
    }

    return {
        votingHistory,
        refreshHistory,
        clearHistory,
        addVote
    }
}