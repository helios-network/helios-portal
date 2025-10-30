import { request, requestWithRpcUrl } from "./request"
import { batchRequest } from "./batchRequest"
import { Token, TokenMetadataResponse, TokensBalance } from "@/types/token"
import { Block } from "@/types/block"
import { Delegation } from "@/types/delegation"
import { Proposal } from "@/types/proposal"
import { Transaction, TransactionLast } from "@/types/transaction"
import { Validator, ValidatorWithAssetsCommission, ValidatorWithDelegationCommission } from "@/types/validator"
import { WhitelistedAsset } from "@/types/whitelistedAsset"
import { HyperionBridgeTx, HyperionChain } from "@/types/hyperion"
import { TokenDenom } from "@/types/denom"
import { toHex } from "viem"

export const getTokenBalance = (
  address: string,
  tokenAddress: string,
  block: string = "latest"
) => request<string>("eth_getTokenBalance", [address, tokenAddress, block])

export const getTokensBalance = (address: string, page: string, size: string) =>
  request<TokensBalance>("eth_getAccountTokensBalanceByPageAndSize", [
    address,
    page,
    size
  ])

export const getTokenDetail = (address: string) =>
  request<TokenMetadataResponse>("eth_getTokenDetails", [address])

export const getBlocksByPageAndSize = (
  page: number,
  size: number,
  includeTransactionFull = true
) =>
  request<Block[]>("eth_getBlocksByPageAndSize", [
    page,
    size,
    includeTransactionFull
  ])

export const getCosmosAddress = (address: string) =>
  request<string>("eth_getCosmosAddress", [address])

export const getCosmosValoperAddress = (address: string) =>
  request<string>("eth_getCosmosValoperAddress", [address])

export const getDelegation = (
  delegatorAddress: string,
  validatorAddress: string
) =>
  request<Delegation>("eth_getDelegation", [delegatorAddress, validatorAddress])

export const getDelegations = (delegatorAddress: string) =>
  request<Delegation[]>("eth_getDelegations", [delegatorAddress])

export const getProposal = (proposalId: string) =>
  request<Proposal>("eth_getProposal", [proposalId])

export const getProposalsByPageAndSize = (page: string, size: string) =>
  request<Proposal[]>("eth_getProposalsByPageAndSize", [page, size])

export const getProposalsByPageAndSizeWithFilter = (
  page: string,
  size: string,
  filter: string
) =>
  request<Proposal[]>("eth_getProposalsByPageAndSizeWithFilter", [page, size, filter])

export const getProposalTotalCount = () =>
  request<string>("eth_getProposalsCount", []).then((result) => {
    // convert hex string to number
    return Number(parseInt(result || "0", 16))
  })

export const getTokensByPageAndSize = (page: string, size: string) =>
  request<Token[]>("eth_getTokensByPageAndSize", [page, size])

export const getAccountTransactionsByPageAndSize = (
  address: string,
  page: string,
  size: string
) =>
  request<Transaction[]>("eth_getAccountTransactionsByPageAndSize", [
    address,
    page,
    size
  ])

export const getTransactionsByPageAndSize = (page: string, size: string) =>
  request<Transaction[]>("eth_getTransactionsByPageAndSize", [page, size])

export const getListTransactionsByPageAndSize = (page: string, size: string) =>
  request<Transaction[]>("eth_listTransactions", [page, size])

export const getValidatorsByPageAndSize = (page: string, size: string) =>
  request<Validator[]>("eth_getValidatorsByPageAndSize", [page, size])

export const getActiveValidatorCount = () =>
  request<number>("eth_getActiveValidatorCount", [])

export const getAllWhitelistedAssets = () =>
  request<WhitelistedAsset[]>("eth_getAllWhitelistedAssets", [])

export const getLatestBlockNumber = () => request<string>("eth_blockNumber", [])

export const getBlockByNumber = (blockNumber: string) =>
  request<Block>("eth_getBlockByNumber", [blockNumber, false])

export const getGasPrice = () => request<string>("eth_gasPrice", [])

export const getHyperionChains = () =>
  request<HyperionChain[]>("eth_getHyperionChains", [])

export const getTokensByChainIdAndPageAndSize = (
  chainId: number,
  page: string,
  size: string
) =>
  request<TokenDenom[]>("eth_getTokensByChainIdAndPageAndSize", [
    chainId,
    page,
    size
  ])

export const getHyperionAccountTransferTxsByPageAndSize = (
  address: string,
  page: string,
  size: string
) =>
  request<HyperionBridgeTx[]>(
    "eth_getHyperionAccountTransferTxsByPageAndSize",
    [address, page, size]
  )

export const getValidator = (address: string) =>
  request<Validator>("eth_getValidator", [address])

export const getValidatorWithHisDelegationAndCommission = (address: string) =>
  request<ValidatorWithDelegationCommission>(
    "eth_getValidatorWithHisDelegationAndCommission",
    [address]
  )

export const getValidatorWithHisAssetsAndCommission = (address: string) =>
  request<ValidatorWithAssetsCommission>(
    "eth_getValidatorWithHisAssetsAndCommission",
    [address]
  )

export const getLastTransactions = (size: string) =>
  request<TransactionLast[]>("eth_getLastTransactionsInfo", [size])

export const getAccountLastTransactions = (address: string) =>
  request<TransactionLast[]>("eth_getAccountLastTransactionsInfo", [address])

export const getAllHyperionTransferTxs = async () =>
  request<HyperionBridgeTx[]>("eth_getAllHyperionTransferTxs", [toHex(10)])

export const getHyperionContractIsPaused = async (rpcUrl: string, smartContractAddress: string): Promise<boolean> =>
  requestWithRpcUrl<string>(rpcUrl, "eth_call", [{
    "to": smartContractAddress,
    "data": "0x5c975abb"
  }, "latest"]).then((result) => {
    return result === "0x0000000000000000000000000000000000000000000000000000000000000001"
  })

// ============================================
// BATCH RPC CALLS - Optimized for reduced latency
// ============================================

/**
 * Batch: Get block number + gas price (core block info)
 * Reduces 2 separate calls to 1 batched HTTP request
 * Latency improvement: ~80-90%
 */
export const getBlockNumberAndGasPrice = () =>
  batchRequest<[string, string]>([
    { method: "eth_blockNumber", params: [] },
    { method: "eth_gasPrice", params: [] }
  ])

/**
 * Batch: Get block data + previous block data
 * Reduces 2 separate calls to 1 batched HTTP request
 */
export const getBlockAndPreviousBlock = (blockNumber: string) => {
  const previousBlock = "0x" + (parseInt(blockNumber, 16) - 1).toString(16)
  return batchRequest<[Block, Block]>([
    { method: "eth_getBlockByNumber", params: [blockNumber, false] },
    { method: "eth_getBlockByNumber", params: [previousBlock, false] }
  ])
}

/**
 * Batch: Get validators info (count + list)
 * Reduces 2 separate calls to 1 batched HTTP request
 */
export const getValidatorsInfoBatch = (page: string, size: string) =>
  batchRequest<[Validator[], number]>([
    { method: "eth_getValidatorsByPageAndSize", params: [page, size] },
    { method: "eth_getActiveValidatorCount", params: [] }
  ])

/**
 * Batch: Get home page core data
 * Combines: block number + gas price + last transactions
 * Reduces 3 separate calls to 1 batched HTTP request
 * Impact: ~200-300ms latency improvement on typical networks
 */
export const getHomePageCoreDataBatch = (txSize: string) =>
  batchRequest<[string, string, TransactionLast[]]>([
    { method: "eth_blockNumber", params: [] },
    { method: "eth_gasPrice", params: [] },
    { method: "eth_getLastTransactionsInfo", params: [txSize] }
  ])

/**
 * Batch: Get governance info (proposals + count)
 * Reduces 2 separate calls to 1 batched HTTP request
 */
export const getGovernanceInfoBatch = (page: string, size: string) =>
  batchRequest<[Proposal[], string]>([
    { method: "eth_getProposalsByPageAndSize", params: [page, size] },
    { method: "eth_getProposalsCount", params: [] }
  ])