import { Feedback } from "@/types/feedback"
import { getErrorMessage } from "@/utils/string"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { useAccount } from "wagmi"
import { useWeb3Provider } from "./useWeb3Provider"

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

        // Simulate the transaction
        await contract.methods
          .vote(address, proposalId, option, metadata)
          .call({
            from: address
          })

        setFeedback({
          status: "primary",
          message: "Estimating gas..."
        })

        // Estimate gas
        const gasEstimate = await contract.methods
          .vote(address, proposalId, option, metadata)
          .estimateGas({
            from: address
          })

        // Add 20% buffer to gas estimation
        const gasLimit = (gasEstimate * 120n) / 100n

        // Send the transaction
        const tx = await contract.methods
          .vote(address, proposalId, option, metadata)
          .send({
            from: address,
            gas: gasLimit.toString()
          })

        console.log("Transaction sent, hash:", tx.transactionHash)

        setFeedback({
          status: "primary",
          message: `Transaction sent (hash: ${tx.transactionHash}), waiting for confirmation...`
        })

        // Wait for transaction receipt with retry mechanism
        let receipt = null
        let retries = 0
        const maxRetries = 10

        while (!receipt && retries < maxRetries) {
          try {
            receipt = await web3Provider.eth.getTransactionReceipt(
              tx.transactionHash
            )
            if (!receipt) {
              // Wait before retrying
              await new Promise((resolve) => setTimeout(resolve, 2000))
              retries++
            }
          } catch (receiptError) {
            console.log(
              `Retry ${
                retries + 1
              }/${maxRetries} - waiting for transaction confirmation...`
            )
            await new Promise((resolve) => setTimeout(resolve, 2000))
            retries++
          }
        }

        if (!receipt) {
          throw new Error(
            "Transaction was sent but receipt could not be retrieved after multiple attempts"
          )
        }
        console.log("Transaction confirmed in block:", receipt.blockNumber)

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
