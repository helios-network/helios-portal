import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAccount, useSwitchChain } from "wagmi"
import {
  REWARDS_CONTRACT_ADDRESS,
  claimAllRewardsAbi,
  withdrawDelegatorRewardsAbi
} from "@/constant/helios-contracts"
import { Feedback } from "@/types/feedback"
import { useState } from "react"
import { useWeb3Provider } from "@/hooks/useWeb3Provider"
import { getErrorMessage } from "@/utils/string"
import { HELIOS_NETWORK_ID } from "@/config/app"

export const useRewards = () => {
  const queryClient = useQueryClient()
  const { chainId, address } = useAccount()
  const { switchChain } = useSwitchChain()
  const web3Provider = useWeb3Provider()
  const [feedback, setFeedback] = useState<Feedback>({
    status: "primary",
    message: ""
  })

  const qWithdrawRewards = useMutation({
    mutationFn: async () => {
      if (!web3Provider || !address) throw new Error("No wallet connected")

      if (chainId !== HELIOS_NETWORK_ID) {
        switchChain({ chainId: HELIOS_NETWORK_ID })
      }

      try {
        setFeedback({
          status: "primary",
          message: "Transaction in progress..."
        })

        const contract = new web3Provider.eth.Contract(
          claimAllRewardsAbi,
          REWARDS_CONTRACT_ADDRESS
        )

        // Simulate the transaction
        await contract.methods.claimRewards(address, 10).call({ from: address })

        setFeedback({
          status: "primary",
          message: "Estimating gas..."
        })

        // Estimate gas
        const gasEstimate = await contract.methods
          .claimRewards(address, 10)
          .estimateGas({ from: address })

        // Add 20% buffer to gas estimation
        const gasLimit = (gasEstimate * 120n) / 100n

        // Send actual transaction
        const tx = await contract.methods
          .claimRewards(address, 10)
          .send({ from: address, gas: gasLimit.toString() })

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

        await queryClient.refetchQueries({ queryKey: ["delegations", address] })
        await queryClient.refetchQueries({ queryKey: ["whitelistedAssets"] })

        setFeedback({
          status: "success",
          message: `Transaction confirmed in block ${receipt.blockNumber}`
        })
        return receipt
      } catch (error: any) {
        console.error(error)
        setFeedback({
          status: "danger",
          message: getErrorMessage(error) || "Error during rewards withdrawal"
        })
        throw error
      }
    }
  })

  const qWithdrawDelegatorRewards = useMutation({
    mutationFn: async (validatorAddress: string) => {
      if (!web3Provider) throw new Error("No wallet connected")

      if (chainId !== HELIOS_NETWORK_ID) {
        switchChain({ chainId: HELIOS_NETWORK_ID })
      }

      try {
        setFeedback({
          status: "primary",
          message: "Transaction in progress..."
        })

        const contract = new web3Provider.eth.Contract(
          withdrawDelegatorRewardsAbi,
          REWARDS_CONTRACT_ADDRESS
        )

        // Simulate the transaction
        await contract.methods
          .withdrawDelegatorRewards(address, validatorAddress)
          .call({ from: address })

        setFeedback({
          status: "primary",
          message: "Estimating gas..."
        })

        // Estimate gas
        const gasEstimate = await contract.methods
          .withdrawDelegatorRewards(address, validatorAddress)
          .estimateGas({ from: address })

        // Add 20% buffer to gas estimation
        const gasLimit = (gasEstimate * 120n) / 100n

        const tx = await contract.methods
          .withdrawDelegatorRewards(address, validatorAddress)
          .send({ from: address, gas: gasLimit.toString() })

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

        await queryClient.refetchQueries({ queryKey: ["delegations", address] })

        setFeedback({
          status: "success",
          message: `Transaction confirmed in block ${receipt.blockNumber}`
        })
        return receipt
      } catch (error: any) {
        setFeedback({
          status: "danger",
          message: getErrorMessage(error) || "Error during rewards withdrawal"
        })
        throw error
      }
    }
  })

  return {
    isLoading:
      qWithdrawRewards.isPending ||
      qWithdrawDelegatorRewards.isPending ||
      !web3Provider,
    claimRewards: qWithdrawRewards.mutateAsync,
    claimValidatorRewards: qWithdrawDelegatorRewards.mutateAsync,
    feedback
  }
}
