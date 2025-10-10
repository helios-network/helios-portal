import { useQuery } from "@tanstack/react-query"
import { useAccount } from "wagmi"
import { useWeb3Provider } from "./useWeb3Provider"

const getVoteAbi = [
    {
        inputs: [
            {
                internalType: "uint64",
                name: "proposalId",
                type: "uint64"
            },
            {
                internalType: "address",
                name: "voter",
                type: "address"
            }
        ],
        name: "getVote",
        outputs: [
            {
                components: [
                    {
                        internalType: "uint64",
                        name: "proposalId",
                        type: "uint64"
                    },
                    {
                        internalType: "address",
                        name: "voter",
                        type: "address"
                    },
                    {
                        components: [
                            {
                                internalType: "enum VoteOption",
                                name: "option",
                                type: "uint8"
                            },
                            {
                                internalType: "string",
                                name: "weight",
                                type: "string"
                            }
                        ],
                        internalType: "struct WeightedVoteOption[]",
                        name: "options",
                        type: "tuple[]"
                    },
                    {
                        internalType: "string",
                        name: "metadata",
                        type: "string"
                    }
                ],
                internalType: "struct Vote",
                name: "",
                type: "tuple"
            }
        ],
        stateMutability: "view",
        type: "function"
    }
] as const

const GOV_PRECOMPILE_ADDRESS = "0x0000000000000000000000000000000000000805"

export interface WeightedVoteOption {
    option: number
    weight: string
}

export interface UserVote {
    proposalId: string
    voter: string
    options: WeightedVoteOption[]
    metadata: string
}

export const useUserVote = (proposalId: number) => {
    const { address } = useAccount()
    const web3Provider = useWeb3Provider()

    const fetchUserVote = async (): Promise<UserVote | null> => {
        if (!web3Provider || !address) {
            return null
        }

        try {
            const contract = new web3Provider.eth.Contract(
                getVoteAbi as any,
                GOV_PRECOMPILE_ADDRESS
            )

            const vote = await contract.methods.getVote(proposalId, address).call() as any

            // Check if vote exists and has options
            if (!vote || !vote.options || vote.options.length === 0) {
                return null
            }

            return {
                proposalId: vote.proposalId.toString(),
                voter: vote.voter,
                options: vote.options.map((opt: any) => ({
                    option: Number(opt.option),
                    weight: opt.weight
                })),
                metadata: vote.metadata || ""
            }
        } catch (error: any) {
            // If voter not found, return null instead of throwing
            if (
                error.message?.includes("not found") ||
                error.message?.includes("voter not found") ||
                error.message?.includes("execution reverted")
            ) {
                return null
            }
            console.error("Error fetching user vote:", error)
            return null
        }
    }

    return useQuery({
        queryKey: ["userVote", proposalId, address],
        queryFn: fetchUserVote,
        enabled: !!web3Provider && !!address && !!proposalId,
        retry: false, // Don't retry if vote not found
        staleTime: 30000 // Cache for 30 seconds
    })
}

// Helper function to get vote option name
export const getVoteOptionName = (option: number): string => {
    switch (option) {
        case 1:
            return "Yes"
        case 2:
            return "Abstain"
        case 3:
            return "No"
        case 4:
            return "No with Veto"
        default:
            return "Unknown"
    }
}

// Helper function to get vote option color
export const getVoteOptionColor = (option: number): string => {
    switch (option) {
        case 1: // Yes
            return "#10b981"
        case 2: // Abstain
            return "#828db3"
        case 3: // No
            return "#ef4444"
        case 4: // No with Veto
            return "#f97315"
        default:
            return "#828db3"
    }
}