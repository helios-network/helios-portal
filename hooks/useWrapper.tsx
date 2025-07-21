import { useState } from "react"
import { useAccount, useChainId } from "wagmi"
import { ethers } from "ethers"
import { useWeb3Provider } from "./useWeb3Provider"
import { getErrorMessage } from "@/utils/string"
import { Feedback } from "@/types/feedback"
import { wrapperAbi } from "@/constant/helios-contracts"
import { CHAIN_CONFIG, isWrappableChain } from "@/config/chain-config"
import { useQuery } from "@tanstack/react-query"
import { secondsToMilliseconds } from "@/utils/number"
import { TransactionReceipt } from "viem"

export const useWrapper = (options?: {
  enableNativeBalance?: boolean
  enableWrappedBalance?: boolean
}) => {
  const { address } = useAccount()
  const chainId = useChainId()
  const web3Provider = useWeb3Provider()
  const [feedback, setFeedback] = useState<Feedback>({
    status: "primary",
    message: ""
  })
  const chainConfig = CHAIN_CONFIG[chainId]
  const WRAPPER_CONTRACT_ADDRESS = chainConfig?.wrapperContract
  const decimals = chainConfig?.decimals || 18
  const isWrappable = isWrappableChain(chainId)

  const { enableNativeBalance = true, enableWrappedBalance = true } =
    options || {}

  const { data: balance = "0" } = useQuery({
    queryKey: ["nativeBalance", address, chainId],
    queryFn: async () => {
      if (!web3Provider || !address) return "0"
      const balance = await web3Provider.eth.getBalance(address)
      return ethers.formatUnits(balance, decimals)
    },
    enabled: enableNativeBalance && !!web3Provider && !!address && !!chainId,
    refetchInterval: secondsToMilliseconds(60)
  })

  const { data: wrappedBalance = "0" } = useQuery({
    queryKey: ["wrappedBalance", address, chainId, WRAPPER_CONTRACT_ADDRESS],
    queryFn: async () => {
      if (!web3Provider || !address || !WRAPPER_CONTRACT_ADDRESS) return "0"
      const contract = new web3Provider.eth.Contract(
        wrapperAbi,
        WRAPPER_CONTRACT_ADDRESS
      )
      const balance = (await contract.methods
        .balanceOf(address)
        .call()) as string
      return ethers.formatUnits(balance, decimals)
    },
    enabled:
      enableWrappedBalance &&
      !!web3Provider &&
      !!address &&
      !!chainId &&
      !!WRAPPER_CONTRACT_ADDRESS,
    refetchInterval: secondsToMilliseconds(60)
  })

  const resetFeedback = () => {
    setFeedback({ status: "primary", message: "" })
  }

  const wrap = async (amount: string) => {
    if (!web3Provider) throw new Error("No wallet connected")
    try {
      const wrapAmount = ethers.parseUnits(amount, decimals)

      const contract = new web3Provider.eth.Contract(
        wrapperAbi,
        WRAPPER_CONTRACT_ADDRESS
      )

      setFeedback({
        status: "primary",
        message: "Simulating wrap transaction..."
      })

      // simulate the transaction
      const resultOfSimulation = await contract.methods.deposit().call({
        from: address,
        value: wrapAmount.toString()
      })

      if (!resultOfSimulation) {
        throw new Error("Error during simulation, please try again later")
      }

      setFeedback({
        status: "primary",
        message: "Estimating gas..."
      })

      // estimate the gas
      const gasEstimate = await contract.methods.deposit().estimateGas({
        from: address,
        value: wrapAmount.toString()
      })

      // add 20% to the gas estimation to be safe
      const gasLimit = (gasEstimate * 120n) / 100n

      setFeedback({
        status: "primary",
        message: "Sending wrap transaction..."
      })

      // send the transaction
      const receipt = await new Promise<TransactionReceipt>(
        (resolve, reject) => {
          web3Provider.eth
            .sendTransaction({
              from: address,
              to: WRAPPER_CONTRACT_ADDRESS,
              data: contract.methods.deposit().encodeABI(),
              value: wrapAmount.toString(),
              gas: gasLimit.toString()
            })
            .then((tx) => {
              resolve(tx as any)
            })
            .catch((error) => {
              console.log("error", error)
              reject(error)
            })
        }
      )

      setFeedback({
        status: "success",
        message: (
          <>
            Successfully wrapped{" "}
            <b>
              {amount} {chainConfig?.wrappedToken}
            </b>{" "}
            !<br />
            Wrapped token address: <code>{WRAPPER_CONTRACT_ADDRESS}</code>
          </>
        )
      })

      return receipt
    } catch (error: any) {
      setFeedback({
        status: "danger",
        message: getErrorMessage(error) || "Error during wrap"
      })
      throw error
    }
  }

  const unwrap = async (amount: string) => {
    if (!web3Provider) throw new Error("No wallet connected")
    try {
      const unwrapAmount = ethers.parseUnits(amount, decimals)

      const contract = new web3Provider.eth.Contract(
        wrapperAbi,
        WRAPPER_CONTRACT_ADDRESS
      )

            setFeedback({
        status: "primary",
        message: "Simulating unwrap transaction..."
      })

              // simulate the transaction
        const resultOfSimulation = await contract.methods
          .withdraw(unwrapAmount)
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
          .withdraw(unwrapAmount)
          .estimateGas({
            from: address
          })

        // add 20% to the gas estimation to be safe
        const gasLimit = (gasEstimate * 120n) / 100n

        setFeedback({
          status: "primary",
          message: "Sending unwrap transaction..."
        })

        // send the transaction
        const receipt = await new Promise<TransactionReceipt>((resolve, reject) => {
          web3Provider.eth.sendTransaction({
            from: address,
            to: WRAPPER_CONTRACT_ADDRESS,
            data: contract.methods.withdraw(unwrapAmount).encodeABI(),
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
            Successfully unwrapped{" "}
            <b>
              {amount} {chainConfig?.token}
            </b>{" "}
            !<br />
            Transaction hash: <code>{receipt.transactionHash}</code>
          </>
        )
      })

      return receipt
    } catch (error: any) {
      setFeedback({
        status: "danger",
        message: getErrorMessage(error) || "Error during unwrap"
      })
      throw error
    }
  }

  return {
    isWrappable,
    wrap,
    unwrap,
    feedback,
    resetFeedback,
    balance,
    wrappedBalance
  }
}
