import { Feedback } from "@/types/feedback"
import { getErrorMessage } from "@/utils/string"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { useAccount } from "wagmi"
import { useWeb3Provider } from "./useWeb3Provider"
import { TransactionReceipt } from "viem"

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

        // Call first to check if transaction will succeed
        const resultOfSimulation = await contract.methods
          .hyperionProposal(title, description, msg, initialDepositAmount)
          .call({
            from: address,
            value: initialDepositAmount
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
          .hyperionProposal(title, description, msg, initialDepositAmount)
          .estimateGas({
            from: address,
            value: initialDepositAmount,
          })
        setFeedback({
          status: "primary",
          message: "Sending cross-chain transaction..."
        })
        // add 20% to the gas estimation to be safe
        const gasLimit = (gasEstimate * 120n) / 100n

        // send the transaction
        const receipt = await new Promise<TransactionReceipt>((resolve, reject) => {
          web3Provider.eth.sendTransaction({
            from: address,
            to: GOVERNANCE_CONTRACT_ADDRESS,
            data: contract.methods.hyperionProposal(title, description, msg, initialDepositAmount).encodeABI(),
            value: initialDepositAmount,
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
