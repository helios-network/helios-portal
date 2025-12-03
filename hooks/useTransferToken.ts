import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAccount, useChainId } from "wagmi"
import { erc20Abi } from "@/constant/helios-contracts"
import { useState } from "react"
import { useWeb3Provider } from "./useWeb3Provider"
import { ethers, TransactionReceipt } from "ethers"
import { getErrorMessage } from "@/utils/string"
import { Feedback } from "@/types/feedback"
import { HELIOS_NETWORK_ID } from "@/config/app"

export const useTransferToken = () => {
  const { address } = useAccount()
  const chainId = useChainId()
  const web3Provider = useWeb3Provider()
  const queryClient = useQueryClient()
  const [feedback, setFeedback] = useState<Feedback>({
    status: "primary",
    message: ""
  })

  const resetFeedback = () => {
    setFeedback({ status: "primary", message: "" })
  }

  const transferMutation = useMutation({
    mutationFn: async ({
      tokenAddress,
      to,
      amount,
      decimals
    }: {
      tokenAddress: string
      to: string
      amount: string
      decimals: number
    }) => {
      if (!web3Provider || !address) throw new Error("No wallet connected")

      console.log("chainId", chainId)
      console.log("tokenAddress", tokenAddress)
      console.log("to", to)
      console.log("amount", amount)
      console.log("decimals", decimals)

      // Check if we're on the correct network (Helios - 42000)
      if (chainId !== HELIOS_NETWORK_ID) {
        throw new Error(
          `Please switch to Helios network (Chain ID: ${HELIOS_NETWORK_ID}). Current chain ID: ${chainId}`
        )
      }

      try {
        const transferAmount = ethers.parseUnits(amount, decimals)

        setFeedback({ status: "primary", message: "Preparing transfer..." })

        const contract = new web3Provider.eth.Contract(erc20Abi as any, tokenAddress)

        // Call first to check if transaction will succeed (like useVote and useCreateProposal)
        try {
          await contract.methods.transfer(to, transferAmount.toString()).call({
            from: address
          })
        } catch (callError) {
          // If call fails, the transaction will likely fail too
          console.warn("Transaction simulation failed:", callError)
          throw callError
        }

        setFeedback({
          status: "primary",
          message: "Sending transaction..."
        })

        // Send the transaction using contract.methods.send() (like useVote and useCreateProposal)
        // This lets Web3.js handle gas estimation automatically
        const tx = await contract.methods
          .transfer(to, transferAmount.toString())
          .send({
            from: address
          })

        console.log("Transfer tx hash:", tx.transactionHash)

        setFeedback({
          status: "primary",
          message: "Transaction sent, waiting for confirmation..."
        })

        // Wait for transaction receipt (like useVote and useCreateProposal)
        const receipt = await web3Provider.eth.getTransactionReceipt(
          tx.transactionHash
        )

        console.log("Transaction confirmed in block:", receipt.blockNumber)

        setFeedback({
          status: "success",
          message: `Transfer successful! Transaction confirmed in block #${receipt.blockNumber}`
        })

        return receipt
      } catch (error: any) {
        console.log("Transfer error:", error)
        setFeedback({
          status: "danger",
          message: getErrorMessage(error) || "Error during token transfer"
        })
        throw error
      }
    }
  })

  const transfer = async (
    tokenAddress: string,
    to: string,
    amount: string,
    decimals: number
  ) => {
    await transferMutation.mutateAsync({
      tokenAddress,
      to,
      amount,
      decimals
    })

    // Refresh portfolio and transactions
    await queryClient.refetchQueries({ queryKey: ["portfolio", address] })
    await queryClient.refetchQueries({ queryKey: ["accountLastTxs", address] })
  }

  return {
    transfer,
    feedback,
    resetFeedback,
    isLoading: transferMutation.isPending
  }
}

