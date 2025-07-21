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
import { TransactionReceipt } from "viem"

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
        const contract = new web3Provider.eth.Contract(
          claimAllRewardsAbi,
          REWARDS_CONTRACT_ADDRESS
        )

        setFeedback({
          status: "primary",
          message: "Simulating claim..."
        })

                // simulate the transaction
        const resultOfSimulation = await contract.methods.claimRewards(address, 10).call({ from: address })

        if (!resultOfSimulation) {
          throw new Error("Error during simulation, please try again later")
        }

        setFeedback({
          status: "primary",
          message: "Estimating gas..."
        })

        // estimate the gas
        const gasEstimate = await contract.methods
          .claimRewards(address, 10)
          .estimateGas({
            from: address
          })
        const gasLimit = (gasEstimate * 120n) / 100n


        setFeedback({
          status: "primary",
          message: "Sending transaction..."
        })

        const receipt = await new Promise<TransactionReceipt>((resolve, reject) => {
          web3Provider.eth.sendTransaction({
            from: address,
            to: REWARDS_CONTRACT_ADDRESS,
            data: contract.methods
          .claimRewards(address, 10).encodeABI(),
            gas: gasLimit.toString()
          }).then((tx) => {
            resolve(tx as any)
          }).catch((error) => {
            console.log("error", error)
            reject(error)
          })
        })

        await queryClient.refetchQueries({ queryKey: ["delegations", address] })
        await queryClient.refetchQueries({ queryKey: ["whitelistedAssets"] })

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
        const contract = new web3Provider.eth.Contract(
          withdrawDelegatorRewardsAbi,
          REWARDS_CONTRACT_ADDRESS
        )

        setFeedback({
          status: "primary",
          message: "Simulating claim..."
        })

        // simulate the transaction
        const resultOfSimulation = await contract.methods
          .withdrawDelegatorRewards(address, validatorAddress)
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
          .withdrawDelegatorRewards(address, validatorAddress)
          .estimateGas({
            from: address
          })
        const gasLimit = (gasEstimate * 120n) / 100n

        setFeedback({
          status: "primary",
          message: "Sending transaction..."
        })

        // send the transaction
        const receipt = await new Promise<TransactionReceipt>((resolve, reject) => {
          web3Provider.eth.sendTransaction({
            from: address,
            to: REWARDS_CONTRACT_ADDRESS,
            data: contract.methods.withdrawDelegatorRewards(address, validatorAddress).encodeABI(),
            gas: gasLimit.toString()
          }).then((tx) => {
            resolve(tx as any)
          }).catch((error) => {
            console.log("error", error)
            reject(error)
          })
        })

        await queryClient.refetchQueries({ queryKey: ["delegations", address] })

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
