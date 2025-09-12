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
          message: `Transaction sent, waiting for confirmation...`
        })

        const gasEstimate = await contract.methods.delegate(address, validatorAddress, delegateAmount, symbol).estimateGas({
          from: address
        })

        const gasLimit = (gasEstimate * 120n) / 100n

        setFeedback({
          status: "primary",
          message: `Transaction sent, waiting for confirmation...`
        })

        // send the transaction
        const receipt = await new Promise<TransactionReceipt>((resolve, reject) => {
          web3Provider.eth.sendTransaction({
            from: address,
            to: DELEGATE_CONTRACT_ADDRESS,
            data: contract.methods.delegate(address, validatorAddress, delegateAmount, symbol).encodeABI(),
            gas: gasLimit.toString()
          }).then((tx) => {
            console.log("tx", tx.transactionHash)
            resolve(tx as any)
          }).catch((error) => {
            console.log("error", error)
            reject(error)
          })
        })

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
          message: `Transaction sent, waiting for confirmation...`
        })

        // send the transaction
        const receipt = await new Promise<TransactionReceipt>((resolve, reject) => {
          web3Provider.eth.sendTransaction({
            from: address,
            to: DELEGATE_CONTRACT_ADDRESS,
            data: contract.methods.undelegate(address, validatorAddress, undelegateAmount, symbol).encodeABI()
          }).then((tx) => {
            resolve(tx as any)
          }).catch((error) => {
            reject(error)
          })
        })

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
