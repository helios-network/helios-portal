import { request } from "./request";
import { Token, TokenBalance } from "../types/token";
import { Block } from "../types/block";
import { Delegation } from "../types/delegation";
import { Proposal } from "../types/proposal";
import { Transaction } from "../types/transaction";
import { Validator } from "../types/validator";
import { WhitelistedAsset } from "../types/whitelistedAsset";

export const getTokenBalance = (address: string, tokenAddress: string, block: string = "latest") =>
  request<string>("eth_getTokenBalance", [address, tokenAddress, block]);

export const getTokensBalance = (address: string, block: string = "latest") =>
  request<TokenBalance[]>("eth_getTokensBalance", [address, block]);

export const getBlocksByPageAndSize = (page: number, size: number, includeTransactionFull = true) =>
  request<Block[]>("eth_getBlocksByPageAndSize", [page, size, includeTransactionFull]);

export const getCosmosAddress = (address: string) =>
  request<string>("eth_getCosmosAddress", [address]);

export const getCosmosValoperAddress = (address: string) =>
  request<string>("eth_getCosmosValoperAddress", [address]);

export const getDelegation = (delegatorAddress: string, validatorAddress: string) =>
  request<Delegation>("eth_getDelegation", [delegatorAddress, validatorAddress]);

export const getDelegations = (delegatorAddress: string) =>
  request<Delegation[]>("eth_getDelegations", [delegatorAddress]);

export const getProposal = (proposalId: string) =>
  request<Proposal>("eth_getProposal", [proposalId]);

export const getProposalsByPageAndSize = (page: string, size: string) =>
  request<Proposal[]>("eth_getProposalsByPageAndSize", [page, size]);

export const getTokensByPageAndSize = (page: string, size: string) =>
  request<Token[]>("eth_getTokensByPageAndSize", [page, size]);

export const getAccountTransactionsByPageAndSize = (address: string, page: string, size: string) =>
  request<Transaction[]>("eth_getAccountTransactionsByPageAndSize", [address, page, size]);

export const getTransactionsByPageAndSize = (page: string, size: string) =>
  request<Transaction[]>("eth_getTransactionsByPageAndSize", [page, size]);

export const getValidatorsByPageAndSize = (page: string, size: string) =>
  request<Validator[]>("eth_getValidatorsByPageAndSize", [page, size]);

export const getAllWhitelistedAssets = () =>
  request<WhitelistedAsset[]>("eth_getAllWhitelistedAssets", []);

export const getLatestBlockNumber = () => request<string>("eth_blockNumber", []);

export const getBlockByNumber = (blockNumber: string) =>
  request<Block>("eth_getBlockByNumber", [blockNumber, false]);

export const getGasPrice = () => request<string>("eth_gasPrice", []);
