import { Feedback } from "@/types/feedback"
import { getErrorMessage } from "@/utils/string"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { useAccount } from "wagmi"
import { useWeb3Provider } from "./useWeb3Provider"

const createProposalAbi = [
  {
    inputs: [
      {
        internalType: "string",
        name: "title",
        type: "string"
      },
      {
        internalType: "string",
        name: "description",
        type: "string"
      },
      {
        internalType: "string",
        name: "msg",
        type: "string"
      },
      {
        internalType: "uint256",
        name: "initialDepositAmount",
        type: "uint256"
      }
    ],
    name: "hyperionProposal",
    outputs: [
      {
        internalType: "uint64",
        name: "proposalId",
        type: "uint64"
      }
    ],
    stateMutability: "payable",
    type: "function"
  }
]

const GOVERNANCE_CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000805"

export const useCreateProposal = () => {
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

  const createProposalMutation = useMutation({
    mutationFn: async ({
      title,
      description,
      msg,
      initialDepositAmount
    }: {
      title: string
      description: string
      msg: string
      initialDepositAmount: string
    }) => {
      if (!web3Provider) throw new Error("No wallet connected")

      try {
        console.log("Proposal creation in progress...")
        setFeedback({
          status: "primary",
          message: "Creating proposal transaction..."
        })

        // Create web3 contract instance
        const contract = new web3Provider.eth.Contract(
          createProposalAbi,
          GOVERNANCE_CONTRACT_ADDRESS
        )

        // Simulate the transaction
        await contract.methods
          .hyperionProposal(title, description, msg, initialDepositAmount)
          .call({
            from: address,
            value: initialDepositAmount
          })

        setFeedback({
          status: "primary",
          message: "Estimating gas..."
        })

        // Estimate gas
        const gasEstimate = await contract.methods
          .hyperionProposal(title, description, msg, initialDepositAmount)
          .estimateGas({
            from: address,
            value: initialDepositAmount
          })

        // Add 20% buffer to gas estimation
        const gasLimit = (gasEstimate * 120n) / 100n

        // Send the transaction
        const tx = await contract.methods
          .hyperionProposal(title, description, msg, initialDepositAmount)
          .send({
            from: address,
            value: initialDepositAmount,
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

        // Extract proposal ID from transaction logs if available
        const proposalId = null
        if (receipt.logs && receipt.logs.length > 0) {
          // You might need to decode the logs to get the actual proposal ID
          // This depends on the event structure emitted by the contract
          console.log("Transaction logs:", receipt.logs)
        }

        return { receipt, proposalId }
      } catch (error: any) {
        console.error("Error during proposal creation:", error)
        const errorMessage =
          getErrorMessage(error) || "Error during proposal creation"
        setFeedback({
          status: "danger",
          message: errorMessage
        })
        throw error
      }
    },
    onError: (error: any) => {
      console.log(error.data?.message)
      // Additional error handling to ensure feedback is set correctly
      console.error("Mutation error:", error)
      setFeedback({
        status: "danger",
        message: getErrorMessage(error) || "Error during proposal creation"
      })
    }
  })

  const createProposal = async (
    title: string,
    description: string,
    msg: string,
    initialDepositAmount: string = "1000000000000000000" // Default 1 ETH in wei
  ) => {
    try {
      const result = await createProposalMutation.mutateAsync({
        title,
        description,
        msg,
        initialDepositAmount
      })

      setFeedback({
        status: "success",
        message: `Proposal created successfully! Refreshing data...`
      })
      console.log("Proposal successfully created!")

      // Refetch relevant queries
      await queryClient.refetchQueries({ queryKey: ["proposals"] })
      await queryClient.refetchQueries({
        queryKey: ["accountLastTxs", address]
      })

      return result
    } catch (error) {
      // Error is already handled in the mutation, but we can add additional logic here if needed
      console.error("Proposal creation failed:", error)
      throw error
    }
  }

  return {
    createProposal,
    feedback,
    resetFeedback,
    isLoading: createProposalMutation.isPending
  }
}
