"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { useAccount } from "wagmi"
import { useWeb3Provider } from "./useWeb3Provider"
import { ethers, TransactionReceipt } from "ethers"
import { parseUnits } from "viem"
import { toast } from "sonner"
import {
  PRECOMPILE_CONTRACT_ADDRESS,
  precompileAbi
} from "@/constant/helios-contracts"
import { HELIOS_NETWORK_ID } from "@/config/app"
import { getErrorMessage } from "@/utils/string"
import { Feedback } from "@/types/feedback"

export type TokenParams = {
  name: string
  symbol: string
  denom: string
  totalSupply: string
  decimals: string
  logoBase64?: string
}

export type DeployedToken = {
  address: string
  name: string
  symbol: string
  denom: string
  totalSupply: string
  decimals: number
  logoBase64: string
  txHash: string
  timestamp: number
}

export const useCreateToken = () => {
  const { address } = useAccount()
  const web3Provider = useWeb3Provider()
  const queryClient = useQueryClient()
  const [feedback, setFeedback] = useState<Feedback>({
    status: "primary",
    message: ""
  })
  const [deployedToken, setDeployedToken] = useState<DeployedToken | null>(null)

  const resetFeedback = () => {
    setFeedback({ status: "primary", message: "" })
  }

  const validateTokenParams = (params: TokenParams): boolean => {
    // Check name
    if (!params.name.trim()) {
      toast.error("Token name is required")
      return false
    }

    // Check symbol
    if (!params.symbol.trim()) {
      toast.error("Token symbol is required")
      return false
    }

    // Validate symbol format (alphanumeric only)
    const symbolRegex = /^[a-zA-Z0-9]+$/
    if (!symbolRegex.test(params.symbol.trim())) {
      toast.error("Token symbol must contain only letters and numbers")
      return false
    }

    // Check denomination
    if (!params.denom.trim()) {
      toast.error("Token denomination is required")
      return false
    }

    // Validate denom format (lowercase letters, numbers, and underscores only)
    const denomRegex = /^[a-z0-9_]+$/
    if (!denomRegex.test(params.denom.trim())) {
      toast.error(
        "Denomination must contain only lowercase letters, numbers, and underscores"
      )
      return false
    }

    // Check total supply
    if (
      !params.totalSupply.trim() ||
      isNaN(Number(params.totalSupply)) ||
      Number(params.totalSupply) <= 0
    ) {
      toast.error("Total supply must be a valid number greater than 0")
      return false
    }

    // Check if total supply is too large
    try {
      parseUnits(params.totalSupply, parseInt(params.decimals) || 18)
    } catch {
      toast.error("Total supply value is too large or invalid")
      return false
    }

    // Check decimals
    if (
      !params.decimals.trim() ||
      isNaN(Number(params.decimals)) ||
      Number(params.decimals) < 0 ||
      Number(params.decimals) > 18 ||
      !Number.isInteger(Number(params.decimals))
    ) {
      toast.error("Decimals must be an integer between 0 and 18")
      return false
    }

    // Check logo size if present
    if (params.logoBase64 && params.logoBase64.length > 100000) {
      toast.error("Logo image is too large. Please use a smaller image")
      return false
    }

    return true
  }

  const extractTokenAddressFromReceipt = (
    receipt: TransactionReceipt
  ): string => {
    try {
      // Look for the log that contains the contract address
      // The precompile adds a log with the contract address in the data field
      const createLog = receipt.logs.find(
        (log: any) =>
          log.address.toLowerCase() ===
          PRECOMPILE_CONTRACT_ADDRESS.toLowerCase()
      )

      if (createLog && createLog.data && createLog.data !== "0x") {
        // The contract address is stored in the data field as bytes (32 bytes padded)
        // Extract the last 20 bytes (40 hex characters) for the address
        let addressHex = createLog.data.slice(-40)

        // Ensure it's a valid address format
        if (addressHex.length === 40 && addressHex.match(/^[a-fA-F0-9]{40}$/)) {
          return `0x${addressHex}`
        }

        // If data is exactly 66 chars (0x + 64 hex), it's 32 bytes padded
        if (createLog.data.length === 66) {
          addressHex = createLog.data.slice(-40)
          if (addressHex.match(/^[a-fA-F0-9]{40}$/)) {
            return `0x${addressHex}`
          }
        }
      }

      // Fallback: look for any ERC20-related logs that might contain the address
      for (const log of receipt.logs) {
        // Check if this could be a Transfer event from the newly created token
        // Transfer events have 3 topics: event signature, from, to
        if (
          log.topics.length === 3 &&
          log.address.match(/^0x[a-fA-F0-9]{40}$/)
        ) {
          // Check if the 'from' address is the zero address (mint operation)
          const fromAddress = log.topics[1]
          if (
            fromAddress ===
            "0x0000000000000000000000000000000000000000000000000000000000000000"
          ) {
            // This is likely a mint operation from the newly created token
            return log.address
          }
        }
      }

      console.error("Could not find contract address in transaction receipt")
      return ""
    } catch (error) {
      console.error("Failed to extract token address from receipt:", error)
      return ""
    }
  }

  const createTokenMutation = useMutation({
    mutationFn: async (params: TokenParams) => {
      if (!web3Provider) throw new Error("No wallet connected")

      try {
        // Ensure decimals is a valid number between 0 and 18
        const decimals = Math.min(
          Math.max(parseInt(params.decimals) || 18, 0),
          18
        )

        // Format total supply with the correct number of decimals
        const totalSupplyWei = parseUnits(params.totalSupply, decimals)

        // Trim the logo if it's too large (optional)
        const logoBase64 = params.logoBase64 || ""

        console.log("Deployment parameters:", {
          name: params.name,
          symbol: params.symbol,
          denom: params.denom,
          totalSupply: totalSupplyWei.toString(),
          decimals: decimals,
          logoBase64Length: logoBase64.length
        })

        setFeedback({
          status: "primary",
          message: "Token deployment in progress..."
        })

        // Create web3 contract instance
        const contract = new web3Provider.eth.Contract(
          precompileAbi,
          PRECOMPILE_CONTRACT_ADDRESS
        )

        // Prepare contract method call once to avoid redundant encoding
        const contractMethod = contract.methods.createErc20(
          params.name.trim(),
          params.symbol.trim(),
          params.denom.trim(),
          totalSupplyWei.toString(),
          decimals,
          logoBase64
        )

        // Simulate the transaction first to check if it will succeed
        let resultOfSimulation
        try {
          resultOfSimulation = await contractMethod.call({
            from: address
          })
        } catch (error: any) {
          if (error.message?.includes("circuit breaker")) {
            throw new Error(
              "Network is currently overloaded. Please try again in a few moments."
            )
          }
          throw error
        }

        if (!resultOfSimulation) {
          throw new Error("Error during simulation, please try again later")
        }

        setFeedback({
          status: "primary",
          message: "Estimating gas..."
        })

        // Estimate the gas
        let gasEstimate
        try {
          gasEstimate = await contractMethod.estimateGas({
            from: address
          })
        } catch (error: any) {
          if (error.message?.includes("circuit breaker")) {
            throw new Error(
              "Network is currently overloaded. Please try again in a few moments."
            )
          }
          throw error
        }

        setFeedback({
          status: "primary",
          message: `Sending transaction...`
        })

        // Add 20% to the gas estimation to be safe
        const gasLimit = (gasEstimate * 120n) / 100n

        // Encode ABI once
        const encodedData = contractMethod.encodeABI()

        setFeedback({
          status: "primary",
          message: `Sending token deployment transaction...`
        })

        // Show toast before wallet confirmation
        toast.info("Preparing transaction for wallet confirmation...")

        // Send the transaction using the cleaner pattern
        const receipt = await new Promise<TransactionReceipt>(
          (resolve, reject) => {
            web3Provider.eth
              .sendTransaction({
                from: address,
                to: PRECOMPILE_CONTRACT_ADDRESS,
                data: encodedData,
                gas: gasLimit.toString()
              })
              .then((tx) => {
                console.log("Token deployment tx hash:", tx.transactionHash)

                // Show toast when transaction is submitted to network
                toast.info(
                  "Transaction submitted to network, waiting for confirmation..."
                )

                // Show toast with transaction hash
                toast.info(
                  `Transaction hash: ${tx.transactionHash.slice(0, 10)}...`,
                  { duration: 5000 }
                )

                resolve(tx as any)
              })
              .catch((error) => {
                console.log("Token deployment error:", error)
                // Check if user cancelled the transaction
                if (
                  error.code === 4001 ||
                  error.message?.includes("User rejected")
                ) {
                  reject(new Error("Transaction cancelled by user"))
                } else {
                  reject(error)
                }
              })
          }
        )

        // Extract the contract address from the receipt
        const contractAddress = extractTokenAddressFromReceipt(receipt)

        if (!contractAddress) {
          throw new Error(
            "Could not extract contract address from transaction receipt"
          )
        }

        const deployedTokenData: DeployedToken = {
          address: contractAddress,
          name: params.name,
          symbol: params.symbol,
          denom: params.denom,
          totalSupply: params.totalSupply,
          decimals: parseInt(params.decimals),
          logoBase64: params.logoBase64 || "",
          txHash: (receipt as any).transactionHash || (receipt as any).hash,
          timestamp: Date.now()
        }

        setDeployedToken(deployedTokenData)

        return { receipt, deployedToken: deployedTokenData }
      } catch (error: any) {
        setFeedback({
          status: "danger",
          message: getErrorMessage(error) || "Error during token deployment"
        })
        throw error
      }
    },
    onError: (error: any) => {
      console.error("Token deployment mutation error:", error)
      setFeedback({
        status: "danger",
        message: getErrorMessage(error) || "Error during token deployment"
      })
    }
  })

  const createToken = async (params: TokenParams) => {
    if (!validateTokenParams(params)) return null

    try {
      const result = await createTokenMutation.mutateAsync(params)

      setFeedback({
        status: "success",
        message: `Token deployed successfully!`
      })

      toast.success("Token deployed successfully!")

      // Refetch relevant queries if needed
      await queryClient.refetchQueries({
        queryKey: ["accountLastTxs", address]
      })

      return result
    } catch (error) {
      // Error is already handled in the mutation, but we should still throw it
      // so the UI component can handle it properly
      console.error("Token deployment failed:", error)
      throw error // Re-throw the error instead of returning null
    }
  }

  const reset = () => {
    setDeployedToken(null)
    resetFeedback()
    createTokenMutation.reset()
  }

  return {
    createToken,
    reset,
    feedback,
    resetFeedback,
    deployedToken,
    isLoading: createTokenMutation.isPending,
    isSuccess: createTokenMutation.isSuccess,
    error: createTokenMutation.error
  }
}
