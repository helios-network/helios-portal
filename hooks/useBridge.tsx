import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useAccount, useChainId } from "wagmi"
import { getErrorMessage } from "@/utils/string"
import { useWeb3Provider } from "./useWeb3Provider"
import { ethers } from "ethers"
import {
  BRIDGE_CONTRACT_ADDRESS,
  bridgeSendToChainAbi,
  bridgeSendToHeliosAbi,
  bridgeCancelSentToChainAbi,
  erc20Abi
} from "@/constant/helios-contracts"
import {
  getAllHyperionTransferTxs,
  getHyperionAccountTransferTxsByPageAndSize,
  getTokensByChainIdAndPageAndSize,
  getHyperionContractIsPaused,
  getHyperionHistoricalFees
} from "@/helpers/rpc-calls"
import { toHex, TransactionReceipt } from "viem"
import { secondsToMilliseconds } from "date-fns"
import { getChainConfig } from "@/config/chain-config"
import { getBestGasPrice } from "@/lib/utils/gas"
import { useTokenRegistry } from "./useTokenRegistry"
import { TransactionLight } from "@/types/transaction"
import { Feedback } from "@/types/feedback"
import { HELIOS_NETWORK_ID, HELIOS_TOKEN_ADDRESS } from "@/config/app"
import { useChains } from "./useChains"

export const useBridge = () => {
  const { address } = useAccount()
  const web3Provider = useWeb3Provider()
  const { chains } = useChains()
  const chainId = useChainId()
  const queryClient = useQueryClient()
  const { getTokenByAddress } = useTokenRegistry()

  // const [txHashInProgress, setTxHashInProgress] = useState("")

  const enrichHyperionTransaction = async (
    tx: any
  ): Promise<TransactionLight> => {
    const contractAddress =
      tx.direction === "IN" ? tx.receivedToken.contract : tx.sentToken.contract
    const token = contractAddress
      ? await getTokenByAddress(contractAddress, HELIOS_NETWORK_ID)
      : null

    return {
      type: tx.direction === "IN" ? "BRIDGE_IN" : "BRIDGE_OUT",
      token,
      amount:
        tx.direction === "IN" ? tx.receivedToken.amount : tx.sentToken.amount,
      hash: tx?.proof?.hashs,
      status:
        tx.status === "BRIDGED"
          ? "completed"
          : tx.status === "FAILED"
          ? "failed"
          : "pending",
      chainId: tx.chainId,
      chainName: chains.find((chain) => chain.chainId === tx.chainId)?.name,
      chainLogo: chains.find((chain) => chain.chainId === tx.chainId)?.logo,
      timeout: tx.timeout,
      status_bridge_tx: tx.status,
      fees: tx.direction === "OUT" ? ethers.formatEther(tx.receivedFee.amount) : "0",
      transactionId: tx.id,
    }
  }

  const qAllHyperionTxs = useQuery({
    queryKey: ["allHyperionTxs"],
    queryFn: async () => {
      const res = await getAllHyperionTransferTxs()
      if (res) return res.slice(0, 5)
      return []
    }
  })

  const enrichedAllHyperionTxs = useQuery({
    queryKey: ["enrichedHyperionTxs", qAllHyperionTxs.data],
    enabled: !!qAllHyperionTxs.data,
    queryFn: async () =>
      Promise.all(qAllHyperionTxs.data!.map(enrichHyperionTransaction))
  })

  const qAccountHyperionTxs = useQuery({
    queryKey: ["hyperionBridgeTxs"],
    queryFn: () =>
      getHyperionAccountTransferTxsByPageAndSize(address!, toHex(1), toHex(10)),
    enabled: !!address,
    refetchInterval: secondsToMilliseconds(60)
  })

  const enrichedAccountHyperionTxs = useQuery({
    queryKey: ["enrichedHyperionTxs", qAccountHyperionTxs.data],
    enabled: !!qAccountHyperionTxs.data,
    queryFn: async () =>
      Promise.all(qAccountHyperionTxs.data!.map(enrichHyperionTransaction))
  })

  const [feedback, setFeedback] = useState<Feedback>({
    status: "primary",
    message: ""
  })
  const resetFeedback = () => {
    setFeedback({
      status: "primary",
      message: ""
    })
    // setTxHashInProgress("")
  }

  const loadTokensByChain = async (chainId: number) => {
    return queryClient.fetchQuery({
      queryKey: ["tokensByChain", chainId],
      queryFn: () =>
        getTokensByChainIdAndPageAndSize(chainId, toHex(1), toHex(10))
    })
  }

  const getFeesByChain = async (chainId: number) => {
    return queryClient.fetchQuery({
      queryKey: ["hyperionHistoricalFees", chainId],
      queryFn: () =>
        getHyperionHistoricalFees(chainId)
    })
  }

  const contractIsPaused = async (fromChainId: number, toChainId: number): Promise<boolean> => {
    if (fromChainId == 42000) {
      const paused = chains.find(
        (chain) => chain.chainId === toChainId
      )?.paused
      console.log("paused from helios network - ", paused)
      return paused || false
    } else {
      const chainConfig = getChainConfig(fromChainId)
      if (chainConfig == undefined) {
        throw new Error("Chain configuration not found for chain " + fromChainId)
      }
      const chainContractAddress = chains.find(
        (chain) => chain.chainId === fromChainId
      )?.hyperionContractAddress
      if (!chainContractAddress) {
        throw new Error("Chain contract address not found for chain " + fromChainId)
      }
      const paused = await getHyperionContractIsPaused(chainConfig.rpcUrl, chainContractAddress) || false
      return paused
    }
  }

  // 🟡 sendToChain
  const sendToChain = async (
    chainId: number,
    receiverAddress: string,
    tokenAddress: string,
    readableAmount: string,
    readableFees: string,
    decimals: number
  ) => {
    const amount = ethers.parseUnits(readableAmount, decimals)
    // const fees = ethers.parseUnits(readableFees, decimals)
    const fees = ethers.parseEther(readableFees)
    return sendToChainMutation.mutateAsync({
      chainId,
      receiverAddress,
      tokenAddress,
      amount,
      fees
    })
  }
  const sendToChainMutation = useMutation({
    mutationFn: async ({
      chainId,
      receiverAddress,
      tokenAddress,
      amount,
      fees
    }: {
      chainId: number
      receiverAddress: string
      tokenAddress: string
      amount: bigint
      fees: bigint
    }) => {
      if (!web3Provider || !address) throw new Error("No wallet connected")

      try {
        const tokenContract = new web3Provider.eth.Contract(
          erc20Abi as any,
          tokenAddress
        )

        const bestGasPrice = await getBestGasPrice(web3Provider)
        const currentAllowanceStr: string = await tokenContract.methods
          .allowance(address, BRIDGE_CONTRACT_ADDRESS)
          .call()
        const currentAllowance = BigInt(currentAllowanceStr)
        // const totalAmount = amount + fees
        const totalAmount =
          tokenAddress === HELIOS_TOKEN_ADDRESS ? amount + fees : amount

        if (currentAllowance < totalAmount) {
          setFeedback({
            status: "primary",
            message: "Approving token..."
          })
          const approveTx = await tokenContract.methods
            .approve(BRIDGE_CONTRACT_ADDRESS, totalAmount.toString())
            .send({
              from: address,
              gas: "1500000", // approve gas limit
              gasPrice: bestGasPrice.toString()
            })

          const chainConfig = getChainConfig(chainId)
          const explorerLink = chainConfig
            ? `${chainConfig.explorerUrl}/tx/${approveTx.transactionHash}`
            : approveTx.transactionHash

          setFeedback({
            status: "primary",
            message: (
              <>
                Tokens approved. Tx:{" "}
                <a href={explorerLink} target="_blank">
                  <strong>{approveTx.transactionHash}</strong>
                </a>
                .
              </>
            )
          })
        } else {
          setFeedback({
            status: "primary",
            message: "Token already approved for sufficient amount."
          })
        }

        const contract = new web3Provider.eth.Contract(
          bridgeSendToChainAbi,
          BRIDGE_CONTRACT_ADDRESS
        )

        setFeedback({
          status: "primary",
          message: "Simulating cross-chain transaction..."
        })

        // simulate the transaction
        const resultOfSimulation = await contract.methods
          .sendToChain(chainId, receiverAddress, tokenAddress, amount.toString(), fees.toString())
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
          .sendToChain(chainId, receiverAddress, tokenAddress, amount.toString(), fees.toString())
          .estimateGas({
            from: address
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
            to: BRIDGE_CONTRACT_ADDRESS,
            data: contract.methods.sendToChain(chainId, receiverAddress, tokenAddress, amount.toString(), fees.toString()).encodeABI(),
            gas: gasLimit.toString()
          }).then((tx) => {
            resolve(tx as any)
          }).catch((error) => {
            console.log("error", error)
            reject(error)
          })
        })

        setFeedback({
          status: "primary",
          message: `Transaction sent (hash: ${receipt.transactionHash}), waiting for confirmation...`
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

        return receipt
      } catch (error: unknown) {
        console.log("error catched", error)
        setFeedback({
          status: "danger",
          message: getErrorMessage(error) || "Error during sendToChain"
        })
        throw error
      }
    }
  })

  // 🟢 sendToHelios
  const sendToHelios = async (
    fromChainId: number,
    receiverAddress: string,
    tokenAddress: string,
    readableAmount: string,
    readableFees: string,
    decimals: number
  ) => {
    const amount = ethers.parseUnits(readableAmount, decimals)
    // const fees = ethers.parseUnits(readableFees, decimals)
    // const amountWithFees = amount + fees

    return sendToHeliosMutation.mutateAsync({
      fromChainId,
      receiverAddress,
      tokenAddress,
      amountWithFees: amount
    })
  }

  const sendToHeliosMutation = useMutation({
    mutationFn: async ({
      fromChainId,
      receiverAddress,
      tokenAddress,
      amountWithFees
    }: {
      fromChainId: number
      receiverAddress: string
      tokenAddress: string
      amountWithFees: bigint
    }) => {
      if (!web3Provider || !address) throw new Error("No wallet connected")

      try {
        const tokenContract = new web3Provider.eth.Contract(
          erc20Abi as any,
          tokenAddress
        )
        const chainContractAddress = chains.find(
          (chain) => chain.chainId === chainId
        )?.hyperionContractAddress
        if (!chainContractAddress) return

        const bestGasPrice = await getBestGasPrice(web3Provider)
        const currentAllowanceStr: string = await tokenContract.methods
          .allowance(address, chainContractAddress)
          .call()
        const currentAllowance = BigInt(currentAllowanceStr)

        if (currentAllowance < amountWithFees) {
          setFeedback({
            status: "primary",
            message: "Approving token..."
          })
          const approveTx = await tokenContract.methods
            .approve(chainContractAddress, amountWithFees.toString())
            .send({
              from: address,
              gas: "1500000", // approve gas limit
              gasPrice: bestGasPrice.toString()
            })

          const chainConfig = getChainConfig(fromChainId)
          const explorerLink = chainConfig
            ? `${chainConfig.explorerUrl}/tx/${approveTx.transactionHash}`
            : approveTx.transactionHash

          setFeedback({
            status: "primary",
            message: (
              <>
                Tokens approved. Tx:{" "}
                <a
                  href={explorerLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <strong>{approveTx.transactionHash}</strong>
                </a>
              </>
            )
          })
        } else {
          setFeedback({
            status: "primary",
            message: "Token already approved for sufficient amount."
          })
        }

        const destinationBytes32 = ethers.zeroPadValue(receiverAddress, 32)

        const hyperionContract = new web3Provider.eth.Contract(
          bridgeSendToHeliosAbi,
          chainContractAddress
        )

        // simulate the transaction
        const resultOfSimulation = await hyperionContract.methods
          .sendToHelios(
            tokenAddress,
            destinationBytes32,
            amountWithFees.toString(),
            ""
          )
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
        const gasEstimate = await hyperionContract.methods
          .sendToHelios(tokenAddress, destinationBytes32, amountWithFees.toString(), "")
          .estimateGas({
            from: address
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
            to: chainContractAddress,
            data: hyperionContract.methods.sendToHelios(tokenAddress, destinationBytes32, amountWithFees.toString(), "").encodeABI(),
            gas: gasLimit.toString()
          }).then((tx) => {
            resolve(tx as any)
          }).catch((error) => {
            reject(error)
          })
        })

        setFeedback({
          status: "success",
          message: (
            <>
              Tokens sent to Helios in block{" "}
              <strong>#{receipt.blockNumber}</strong>. It will be available in a
              few minutes.
            </>
          )
        })

        return receipt
      } catch (error: unknown) {
        setFeedback({
          status: "danger",
          message: getErrorMessage(error) || "Error during sendToHelios"
        })
        throw error
      }
    }
  })

  // cancelSendToChain
  const cancelSendToChain = async (
    chainId: number,
    transactionId: number
  ) => {
    return cancelSendToChainMutation.mutateAsync({
      chainId,
      transactionId
    })
  }

  const cancelSendToChainMutation = useMutation({
    mutationFn: async ({
      chainId,
      transactionId
    }: {
      chainId: number
      transactionId: number
    }) => {
      if (!web3Provider || !address) throw new Error("No wallet connected")

      try {
        const hyperionContract = new web3Provider.eth.Contract(
          bridgeCancelSentToChainAbi,
          BRIDGE_CONTRACT_ADDRESS
        )

        // simulate the transaction
        const resultOfSimulation = await hyperionContract.methods.cancelSendToChain(chainId, transactionId).call({
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
        const gasEstimate = await hyperionContract.methods.cancelSendToChain(chainId, transactionId).estimateGas({
          from: address
        })
        setFeedback({
          status: "primary",
          message: "Sending cancelSendToChain transaction..."
        })
        // add 20% to the gas estimation to be safe
        const gasLimit = (gasEstimate * 120n) / 100n

        const receipt = await new Promise<TransactionReceipt>((resolve, reject) => {
          web3Provider.eth.sendTransaction({
            from: address,
            to: BRIDGE_CONTRACT_ADDRESS,
            data: hyperionContract.methods.cancelSendToChain(chainId, transactionId).encodeABI(),
            gas: gasLimit.toString()
          }).then((tx) => {
            resolve(tx as any)
          }).catch((error) => {
            reject(error)
          })
        })

        setFeedback({
          status: "success",
          message: (
            <>
              Transaction cancelled in block{" "}
              <strong>#{receipt.blockNumber}</strong>.
            </>
          )
        })

        return receipt
      } catch (error: unknown) {
        setFeedback({
          status: "danger",
          message: getErrorMessage(error) || "Error during cancelSendToChain"
        })
        throw error
      }
    }
  })



  return {
    lastBridgeTxs: enrichedAllHyperionTxs.data || [],
    lastAccountBridgeTxs: enrichedAccountHyperionTxs.data || [],
    sendToChain,
    loadTokensByChain,
    getFeesByChain,
    sendToHelios,
    cancelSendToChain,
    feedback,
    resetFeedback,
    contractIsPaused,
    isLoading: sendToChainMutation.isPending || sendToHeliosMutation.isPending
  }
}
