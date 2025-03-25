export const PROPOSAL_CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000805";
export const STAKING_CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000800";
export const PRECOMPILE_CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000806";

export const DELEGATE_CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000800";
export const REWARDS_CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000801";

export const precompileAbi = [
  {
    inputs: [
      { internalType: "string", name: "name", type: "string" },
      { internalType: "string", name: "symbol", type: "string" },
      { internalType: "uint256", name: "totalSupply", type: "uint256" },
      { internalType: "uint8", name: "decimals", type: "uint8" }
    ],
    name: "createErc20",
    outputs: [{ internalType: "address", name: "tokenAddress", type: "address" }],
    stateMutability: "nonpayable",
    type: "function"
  }
];
export const proposalAbi = [
  {
    inputs: [
      { internalType: "string", name: "title", type: "string" },
      { internalType: "string", name: "description", type: "string" },
      {
        components: [
          { internalType: "string", name: "denom", type: "string" },
          { internalType: "string", name: "contractAddress", type: "string" },
          { internalType: "string", name: "chainId", type: "string" },
          { internalType: "uint32", name: "decimals", type: "uint32" },
          { internalType: "uint64", name: "baseWeight", type: "uint64" },
          { internalType: "string", name: "metadata", type: "string" }
        ],
        internalType: "struct Asset[]",
        name: "assets",
        type: "tuple[]"
      },
      {
        internalType: "uint256",
        name: "initialDepositAmount",
        type: "uint256"
      }
    ],
    name: "addNewAssetProposal",
    outputs: [{ internalType: "uint64", name: "proposalId", type: "uint64" }],
    stateMutability: "nonpayable",
    type: "function"
  }
];

export const voteAbi = [
  {
    inputs: [
      { internalType: "address", name: "voter", type: "address" },
      { internalType: "uint64", name: "proposalId", type: "uint64" },
      { internalType: "enum VoteOption", name: "option", type: "uint8" },
      { internalType: "string", name: "metadata", type: "string" }
    ],
    name: "vote",
    outputs: [{ internalType: "bool", name: "success", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function"
  }
];

export const stakingAbi = [
  {
    inputs: [
      { internalType: "address", name: "delegator", type: "address" },
      { internalType: "string", name: "validator", type: "string" },
      { internalType: "uint256", name: "amount", type: "uint256" },
      { internalType: "string", name: "denom", type: "string" }
    ],
    name: "delegate",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { internalType: "address", name: "delegator", type: "address" },
      { internalType: "string", name: "validator", type: "string" },
      { internalType: "uint256", name: "amount", type: "uint256" },
      { internalType: "string", name: "denom", type: "string" }
    ],
    name: "undelegate",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  }
];
export const delegateAbi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "delegatorAddress",
        type: "address"
      },
      {
        internalType: "address",
        name: "validatorAddress",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256"
      },
      {
        internalType: "string",
        name: "denom",
        type: "string"
      }
    ],
    name: "delegate",
    outputs: [
      {
        internalType: "bool",
        name: "success",
        type: "bool"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "delegatorAddress",
        type: "address"
      },
      {
        internalType: "address",
        name: "validatorAddress",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256"
      },
      {
        internalType: "string",
        name: "denom",
        type: "string"
      }
    ],
    name: "undelegate",
    outputs: [
      {
        internalType: "int64",
        name: "completionTime",
        type: "int64"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  }
];
export const withdrawDelegatorRewardsAbi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "delegatorAddress",
        type: "address"
      },
      {
        internalType: "address",
        name: "validatorAddress",
        type: "address"
      }
    ],
    name: "withdrawDelegatorRewards",
    outputs: [
      {
        components: [
          {
            internalType: "string",
            name: "denom",
            type: "string"
          },
          {
            internalType: "uint256",
            name: "amount",
            type: "uint256"
          }
        ],
        internalType: "struct Coin[]",
        name: "amount",
        type: "tuple[]"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  }
];
