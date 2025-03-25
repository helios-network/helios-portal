import { useMutation } from "@tanstack/react-query"
import { useAccount } from "wagmi"
import {
  DELEGATE_CONTRACT_ADDRESS,
  delegateAbi
} from "../constant/helios-contracts" // Remplace avec l'ABI du contrat de délégation et de désengagement
import { Feedback } from "../types/feedback"
import { useState } from "react"
import { useWeb3Provider } from "./useWeb3Provider"
import { ethers } from "ethers"
import { getErrorMessage } from "../utils/string"

export const useDelegate = () => {
  const { address } = useAccount()
  const web3Provider = useWeb3Provider()
  const [feedback, setFeedback] = useState<Feedback>({
    status: "idle",
    message: ""
  })

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

        setFeedback({ status: "loading", message: "Delegation in progress..." })

        const contract = new web3Provider.eth.Contract(
          delegateAbi,
          DELEGATE_CONTRACT_ADDRESS
        )

        await contract.methods
          .delegate(address, validatorAddress, delegateAmount, symbol)
          .call({
            from: address,
            gas: "500000"
          })

        const tx = await contract.methods
          .delegate(address, validatorAddress, delegateAmount, symbol)
          .send({
            from: address,
            gas: "500000"
          })

        setFeedback({
          status: "loading",
          message: `Transaction sent (hash: ${tx.transactionHash}), waiting for confirmation...`
        })

        const receipt = await web3Provider.eth.getTransactionReceipt(
          tx.transactionHash
        )

        setFeedback({
          status: "success",
          message: `Delegation successful, confirmed in block ${receipt.blockNumber}`
        })

        return receipt
      } catch (error: any) {
        setFeedback({
          status: "error",
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
          status: "loading",
          message: "Undelegation in progress..."
        })

        const contract = new web3Provider.eth.Contract(
          delegateAbi,
          DELEGATE_CONTRACT_ADDRESS
        )

        await contract.methods
          .undelegate(address, validatorAddress, undelegateAmount, symbol)
          .call({
            from: address,
            gas: "500000"
          })

        const tx = await contract.methods
          .undelegate(address, validatorAddress, undelegateAmount, symbol)
          .send({
            from: address,
            gas: "500000"
          })

        setFeedback({
          status: "loading",
          message: `Transaction sent (hash: ${tx.transactionHash}), waiting for confirmation...`
        })

        const receipt = await web3Provider.eth.getTransactionReceipt(
          tx.transactionHash
        )

        setFeedback({
          status: "success",
          message: `Undelegation successful, confirmed in block ${receipt.blockNumber}`
        })

        return receipt
      } catch (error: any) {
        setFeedback({
          status: "error",
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
  }

  const undelegate = async (
    validatorAddress: string,
    amount: string,
    symbol: string,
    decimals: number
  ) => {
    await undelegateMutation.mutate({
      validatorAddress,
      amount,
      symbol,
      decimals
    })
  }

  return {
    delegate,
    undelegate,
    feedback,
    isLoading: delegateMutation.isPending || undelegateMutation.isPending
  }
}
