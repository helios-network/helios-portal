import { useQuery } from "@tanstack/react-query"
import { useChainId, useAccount } from "wagmi"
import Web3 from "web3"
import { ethers } from "ethers"
import { erc20Abi } from "@/constant/helios-contracts"
import { getChainConfig } from "@/config/chain-config"
import { secondsToMilliseconds } from "@/utils/number"

export interface TokenInfo {
  name: string
  symbol: string
  decimals: number
  totalSupply: string
  balance: string
  readableBalance: number
}

export const fetchTokenBalance = async (
  tokenAddress: string,
  chainId: number,
  userAddress?: string
): Promise<{ balance: string; readableBalance: number }> => {
  const chainConfig = getChainConfig(chainId)
  if (!chainConfig)
    throw new Error(`Chain configuration not found for chain ${chainId}`)
  const rpcUrl = chainConfig.rpcUrl
  if (!rpcUrl) throw new Error(`Missing RPC URL for chain ${chainId}`)

  try {
    const web3 = new Web3(rpcUrl)

    if (!tokenAddress.startsWith("0x")) {
      throw new Error(
        "Address is not a contract : " + tokenAddress + " , " + chainId
      )
    }

    const contract = new web3.eth.Contract(erc20Abi, tokenAddress)

    const [decimals, balanceRaw] = await Promise.all([
      contract.methods.decimals().call() as Promise<string>,
      userAddress
        ? (contract.methods.balanceOf(userAddress).call() as Promise<string>)
        : Promise.resolve("0")
    ])

    const decimalsInt = parseInt(decimals)
    const readableBalance = parseFloat(
      ethers.formatUnits(balanceRaw.toString(), decimalsInt)
    )

    return {
      balance: balanceRaw.toString(),
      readableBalance
    }
  } catch (e) {
    console.error("Error fetching token info:", e, tokenAddress, chainId)
    throw new Error("Token not found")
  }
}

export const fetchTokenBalanceOnly = async (
  tokenAddress: string,
  chainId: number,
  userAddress: string,
  decimals: number
): Promise<{ balance: string; readableBalance: number }> => {
  const chainConfig = getChainConfig(chainId)
  if (!chainConfig)
    throw new Error(`Chain configuration not found for chain ${chainId}`)
  const rpcUrl = chainConfig.rpcUrl
  if (!rpcUrl) throw new Error(`Missing RPC URL for chain ${chainId}`)

  try {
    const web3 = new Web3(rpcUrl)

    if (!tokenAddress.startsWith("0x")) {
      throw new Error(
        "Address is not a contract : " + tokenAddress + " , " + chainId
      )
    }

    const contract = new web3.eth.Contract(erc20Abi, tokenAddress)
    const balanceRaw = (await contract.methods
      .balanceOf(userAddress)
      .call()) as string
    const readableBalance = parseFloat(ethers.formatUnits(balanceRaw, decimals))

    return {
      balance: balanceRaw.toString(),
      readableBalance
    }
  } catch (e) {
    console.error(
      "Error fetching token balance only:",
      e,
      tokenAddress,
      chainId
    )
    throw new Error("Token not found")
  }
}

export const fetchTokenInfo = async (
  tokenAddress: string,
  chainId: number,
  userAddress?: string
): Promise<TokenInfo> => {
  const chainConfig = getChainConfig(chainId)
  if (!chainConfig)
    throw new Error(`Chain configuration not found for chain ${chainId}`)
  const rpcUrl = chainConfig.rpcUrl
  if (!rpcUrl) throw new Error(`Missing RPC URL for chain ${chainId}`)

  try {
    const web3 = new Web3(rpcUrl)

    if (!tokenAddress.startsWith("0x")) {
      throw new Error(
        "Address is not a contract : " + tokenAddress + " , " + chainId
      )
    }

    const contract = new web3.eth.Contract(erc20Abi, tokenAddress)

    // request eth_getTokenDetails to get the token details result.metadata.symbol, result.metadata.name, result.metadata.decimals, result.totalSupply

    const [name, symbol, decimals, totalSupply, balanceRaw] = await Promise.all(
      [
        contract.methods.name().call() as Promise<string>,
        contract.methods.symbol().call() as Promise<string>,
        contract.methods.decimals().call() as Promise<string>,
        contract.methods.totalSupply().call() as Promise<string>,
        userAddress
          ? (contract.methods.balanceOf(userAddress).call() as Promise<string>)
          : Promise.resolve("0")
      ]
    )

    const decimalsInt = parseInt(decimals)
    const readableBalance = parseFloat(
      ethers.formatUnits(balanceRaw.toString(), decimalsInt)
    )

    return {
      name,
      symbol,
      decimals: decimalsInt,
      totalSupply: totalSupply.toString(),
      balance: balanceRaw.toString(),
      readableBalance
    }
  } catch (e) {
    console.error("Error fetching token info:", e, tokenAddress, chainId)
    throw new Error("Token not found")
  }
}

export const useTokenInfo = (tokenAddress: string | null) => {
  const chainId = useChainId()
  const { address } = useAccount()

  const query = useQuery({
    queryKey: ["tokenInfo", tokenAddress, chainId, address],
    queryFn: () => {
      if (!tokenAddress) throw new Error("No token address provided")
      return fetchTokenInfo(tokenAddress, chainId, address)
    },
    enabled: !!tokenAddress && !!chainId && !!address,
    retry: false,
    retryDelay: secondsToMilliseconds(3),
    staleTime: secondsToMilliseconds(30),
    refetchOnWindowFocus: false,
    refetchOnMount: false
  })

  const isNotFound = query.error?.message === "Token not found"

  return {
    ...query,
    isNotFound
  }
}
