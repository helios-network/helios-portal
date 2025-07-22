import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAccount } from "wagmi"
import {
  DELEGATE_CONTRACT_ADDRESS,
  delegateAbi
} from "@/constant/helios-contracts"
import { useState } from "react"
import { useWeb3Provider } from "./useWeb3Provider"
import { ethers, TransactionReceipt } from "ethers"
import { getErrorMessage } from "@/utils/string"
import { Feedback } from "@/types/feedback"

export const useDelegate = () => {
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

  const delegateMutation = useMutation({
    mutationFn: async ({
      validatorAddress,
      amount,
      symbol,
      decimals
    }: {
      validatorAddress: string
      amount: string
      symbol: string
      decimals: number
    }) => {
      if (!web3Provider) throw new Error("No wallet connected")
      try {
        const delegateAmount = ethers.parseUnits(amount, decimals)

        setFeedback({ status: "primary", message: "Delegation in progress..." })
        const contract = new web3Provider.eth.Contract(
          delegateAbi,
          DELEGATE_CONTRACT_ADDRESS
        )

        // simulate the transaction
        await contract.methods
          .delegate(address, validatorAddress, delegateAmount, symbol)
          .call({
            from: address
          })

        setFeedback({
          status: "primary",
          message: "Estimating gas..."
        })

        // estimate the gas
        const gasEstimate = await contract.methods
          .delegate(address, validatorAddress, delegateAmount, symbol)
          .estimateGas({
            from: address
          })

        // add 20% to the gas estimation to be safe
        const gasLimit = (gasEstimate * 120n) / 100n

        // send the transaction
        const tx = await contract.methods
          .delegate(address, validatorAddress, delegateAmount, symbol)
          .send({
            from: address,
            gas: gasLimit.toString()
          })

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

        return receipt
      } catch (error: any) {
        setFeedback({
          status: "danger",
          message: getErrorMessage(error) || "Error during delegation"
        })
        throw error
      }
    }
  })

  const undelegateMutation = useMutation({
    mutationFn: async ({
      validatorAddress,
      amount,
      symbol,
      decimals
    }: {
      validatorAddress: string
      amount: string
      symbol: string
      decimals: number
    }) => {
      if (!web3Provider) throw new Error("No wallet connected")
      try {
        const undelegateAmount = ethers.parseUnits(amount, decimals)

        setFeedback({
          status: "primary",
          message: "Undelegation in progress..."
        })

        const contract = new web3Provider.eth.Contract(
          delegateAbi,
          DELEGATE_CONTRACT_ADDRESS
        )

        // simulate the transaction
        await contract.methods
          .undelegate(address, validatorAddress, undelegateAmount, symbol)
          .call({
            from: address
          })

        setFeedback({
          status: "primary",
          message: "Estimating gas..."
        })

        // estimate the gas
        const gasEstimate = await contract.methods
          .undelegate(address, validatorAddress, undelegateAmount, symbol)
          .estimateGas({
            from: address
          })

        // add 20% to the gas estimation to be safe
        const gasLimit = (gasEstimate * 120n) / 100n

        // send the transaction
        const tx = await contract.methods
          .undelegate(address, validatorAddress, undelegateAmount, symbol)
          .send({
            from: address,
            gas: gasLimit.toString()
          })

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

        return receipt
      } catch (error: any) {
        setFeedback({
          status: "danger",
          message: getErrorMessage(error) || "Error during undelegation"
        })
        throw error
      }
    }
  })

  const delegate = async (
    validatorAddress: string,
    amount: string,
    symbol: string,
    decimals: number
  ) => {
    await delegateMutation.mutateAsync({
      validatorAddress,
      amount,
      symbol,
      decimals
    })

    setFeedback({
      status: "success",
      message: `Delegation successful ! Refreshing your delegations...`
    })

    await queryClient.refetchQueries({ queryKey: ["delegations", address] })
    await queryClient.refetchQueries({ queryKey: ["accountLastTxs", address] })
    await queryClient.refetchQueries({ queryKey: ["whitelistedAssets"] })
  }

  const undelegate = async (
    validatorAddress: string,
    amount: string,
    symbol: string,
    decimals: number
  ) => {
    await undelegateMutation.mutateAsync({
      validatorAddress,
      amount,
      symbol,
      decimals
    })

    setFeedback({
      status: "success",
      message: `Undelegation successful! Refreshing your delegations...`
    })

    await queryClient.refetchQueries({ queryKey: ["delegations", address] })
    await queryClient.refetchQueries({ queryKey: ["accountLastTxs", address] })
    await queryClient.refetchQueries({ queryKey: ["whitelistedAssets"] })
  }

  return {
    delegate,
    undelegate,
    feedback,
    resetFeedback,
    isLoading: delegateMutation.isPending || undelegateMutation.isPending
  }
}
