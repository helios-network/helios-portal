import { Feedback } from "@/types/feedback"
import { getErrorMessage } from "@/utils/string"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { useAccount } from "wagmi"
import { useWeb3Provider } from "./useWeb3Provider"
import { TransactionReceipt } from "viem"

const voteAbi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "voter",
        type: "address"
      },
      {
        internalType: "uint64",
        name: "proposalId",
        type: "uint64"
      },
      {
        internalType: "enum VoteOption",
        name: "option",
        type: "uint8"
      },
      {
        internalType: "string",
        name: "metadata",
        type: "string"
      }
    ],
    name: "vote",
    outputs: [
      {
        internalType: "bool",
        name: "success",
        type: "bool"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  }
]

const GOVERNANCE_CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000805"

export const useVote = () => {
  const { address } = useAccount()
  const web3Provider = useWeb3Provider()
  const queryClient = useQueryClient()
  const [feedback, setFeedback] = useState<Feedback>({
    status: "primary",
    message: ""
  })

  const resetFeedback = () => {
    setFeedback({ status: "primary", message: "" })
  }

  const voteMutation = useMutation({
    mutationFn: async ({
      proposalId,
      option,
      metadata
    }: {
      proposalId: number
      option: number
      metadata: string
    }) => {
      if (!web3Provider) throw new Error("No wallet connected")

      try {
        console.log("Vote in progress...")
        setFeedback({
          status: "primary",
          message: "Vote transaction in progress..."
        })

        // Create web3 contract instance (following your delegate pattern)
        const contract = new web3Provider.eth.Contract(
          voteAbi,
          GOVERNANCE_CONTRACT_ADDRESS
        )

        setFeedback({
          status: "primary",
          message: "Simulating vote transaction..."
        })

        // simulate the transaction
        const resultOfSimulation = await contract.methods
          .vote(address, proposalId, option, metadata)
          .call({
            from: address
          })

        if (!resultOfSimulation) {
          throw new Error("Error during simulation, please try again later")
        }

        setFeedback({
          status: "primary",
          message: "Estimating gas..."
        })

        // estimate the gas
        const gasEstimate = await contract.methods
          .vote(address, proposalId, option, metadata)
          .estimateGas({
            from: address
          })

        // add 20% to the gas estimation to be safe
        const gasLimit = (gasEstimate * 120n) / 100n

        setFeedback({
          status: "primary",
          message: "Sending vote transaction..."
        })

        // send the transaction
        const receipt = await new Promise<TransactionReceipt>((resolve, reject) => {
          web3Provider.eth.sendTransaction({
            from: address,
            to: GOVERNANCE_CONTRACT_ADDRESS,
            data: contract.methods.vote(address, proposalId, option, metadata).encodeABI(),
            gas: gasLimit.toString()
          }).then((tx) => {
            resolve(tx as any)
          }).catch((error) => {
            console.log("error", error)
            reject(error)
          })
        })
        
        setFeedback({
          status: "success",
          message: (
            <>
              Transaction confirmed in block{" "}
              <strong>#{receipt.blockNumber}</strong>. It will be available in a
              few minutes.
            </>
          )
        })

        return receipt
      } catch (error: any) {
        console.error("Error during vote submission:", error)
        const errorMessage =
          getErrorMessage(error) || "Error during vote submission"
        setFeedback({
          status: "danger",
          message: errorMessage
        })
        throw error
      }
    },
    onError: (error: any) => {
      console.log(error.data.message)
      // Additional error handling to ensure feedback is set correctly
      console.error("Mutation error:", error)
      setFeedback({
        status: "danger",
        message: getErrorMessage(error) || "Error during vote submission"
      })
    }
  })

  const vote = async (
    proposalId: number,
    option: number,
    metadata: string = ""
  ) => {
    console.log("vote-option", proposalId, option, metadata)
    try {
      await voteMutation.mutateAsync({
        proposalId,
        option,
        metadata: metadata || `Vote on proposal ${proposalId}`
      })

      setFeedback({
        status: "success",
        message: `Vote submitted successfully! Refreshing data...`
      })
      console.log("Vote successfully submitted!")

      // Refetch relevant queries
      await queryClient.refetchQueries({ queryKey: ["proposals"] })
      await queryClient.refetchQueries({ queryKey: ["proposal", proposalId] })
      await queryClient.refetchQueries({ queryKey: ["userVotes", address] })
      await queryClient.refetchQueries({
        queryKey: ["accountLastTxs", address]
      })
    } catch (error) {
      // Error is already handled in the mutation, but we can add additional logic here if needed
      console.error("Vote submission failed:", error)
    }
  }

  return {
    vote,
    feedback,
    resetFeedback,
    isLoading: voteMutation.isPending
  }
}
