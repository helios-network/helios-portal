export const PROPOSAL_CONTRACT_ADDRESS =
  "0x0000000000000000000000000000000000000805"
export const STAKING_CONTRACT_ADDRESS =
  "0x0000000000000000000000000000000000000800"
export const PRECOMPILE_CONTRACT_ADDRESS =
  "0x0000000000000000000000000000000000000806"

export const DELEGATE_CONTRACT_ADDRESS =
  "0x0000000000000000000000000000000000000800"
export const REWARDS_CONTRACT_ADDRESS =
  "0x0000000000000000000000000000000000000801"

export const BRIDGE_CONTRACT_ADDRESS =
  "0x0000000000000000000000000000000000000900"

export const BRIDGE_HYPERION_ADDRESS =
  "0xA2512e1f33020d34915124218EdbEC20901755b2"

export const erc20Abi = [
  {
    constant: true,
    inputs: [],
    name: "name",
    outputs: [
      {
        name: "",
        type: "string"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        name: "_spender",
        type: "address"
      },
      {
        name: "_value",
        type: "uint256"
      }
    ],
    name: "approve",
    outputs: [
      {
        name: "",
        type: "bool"
      }
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "totalSupply",
    outputs: [
      {
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        name: "_from",
        type: "address"
      },
      {
        name: "_to",
        type: "address"
      },
      {
        name: "_value",
        type: "uint256"
      }
    ],
    name: "transferFrom",
    outputs: [
      {
        name: "",
        type: "bool"
      }
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "decimals",
    outputs: [
      {
        name: "",
        type: "uint8"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      {
        name: "_owner",
        type: "address"
      }
    ],
    name: "balanceOf",
    outputs: [
      {
        name: "balance",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "symbol",
    outputs: [
      {
        name: "",
        type: "string"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        name: "_to",
        type: "address"
      },
      {
        name: "_value",
        type: "uint256"
      }
    ],
    name: "transfer",
    outputs: [
      {
        name: "",
        type: "bool"
      }
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      {
        name: "_owner",
        type: "address"
      },
      {
        name: "_spender",
        type: "address"
      }
    ],
    name: "allowance",
    outputs: [
      {
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    payable: true,
    stateMutability: "payable",
    type: "fallback"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: "owner",
        type: "address"
      },
      {
        indexed: true,
        name: "spender",
        type: "address"
      },
      {
        indexed: false,
        name: "value",
        type: "uint256"
      }
    ],
    name: "Approval",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: "from",
        type: "address"
      },
      {
        indexed: true,
        name: "to",
        type: "address"
      },
      {
        indexed: false,
        name: "value",
        type: "uint256"
      }
    ],
    name: "Transfer",
    type: "event"
  }
]

export const precompileAbi = [
  {
    inputs: [
      { internalType: "string", name: "name", type: "string" },
      { internalType: "string", name: "symbol", type: "string" },
      { internalType: "string", name: "denom", type: "string" },
      { internalType: "uint256", name: "totalSupply", type: "uint256" },
      { internalType: "uint8", name: "decimals", type: "uint8" },
      { internalType: "string", name: "logoBase64", type: "string" }
    ],
    name: "createErc20",
    outputs: [
      { internalType: "address", name: "tokenAddress", type: "address" }
    ],
    stateMutability: "nonpayable",
    type: "function"
  }
]
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
]

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
]

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
]
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
]
export const claimAllRewardsAbi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "delegatorAddress",
        type: "address"
      },
      {
        internalType: "uint32",
        name: "maxRetrieve",
        type: "uint32"
      }
    ],
    name: "claimRewards",
    outputs: [
      {
        internalType: "bool",
        name: "success",
        type: "bool"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  }
]
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
]
export const bridgeSendToChainAbi = [
  // Hyperion
  {
    inputs: [
      {
        internalType: "uint64",
        name: "hyperionId",
        type: "uint64"
      },
      {
        internalType: "string",
        name: "contractSourceHash",
        type: "string"
      },
      {
        internalType: "string",
        name: "bridgeCounterpartyAddress",
        type: "string"
      },
      {
        internalType: "uint64",
        name: "bridgeChainId",
        type: "uint64"
      },
      {
        internalType: "uint64",
        name: "bridgeContractStartHeight",
        type: "uint64"
      }
    ],
    name: "addCounterpartyChainParams",
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
        name: "orchestratorAddress",
        type: "address"
      },
      {
        internalType: "uint64",
        name: "hyperionId",
        type: "uint64"
      }
    ],
    name: "setOrchestratorAddresses",
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
        internalType: "uint64",
        name: "chainId",
        type: "uint64"
      },
      {
        internalType: "string",
        name: "destAddress",
        type: "string"
      },
      {
        internalType: "address",
        name: "contractAddress",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "bridgeFee",
        type: "uint256"
      }
    ],
    name: "sendToChain",
    outputs: [
      {
        internalType: "bool",
        name: "success",
        type: "bool"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  }
]

export const bridgeSendToHeliosAbi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "string",
        name: "_cosmosDenom",
        type: "string"
      },
      {
        indexed: true,
        internalType: "address",
        name: "_tokenContract",
        type: "address"
      },
      {
        indexed: false,
        internalType: "string",
        name: "_name",
        type: "string"
      },
      {
        indexed: false,
        internalType: "string",
        name: "_symbol",
        type: "string"
      },
      {
        indexed: false,
        internalType: "uint8",
        name: "_decimals",
        type: "uint8"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "_eventNonce",
        type: "uint256"
      }
    ],
    name: "ERC20DeployedEvent",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address"
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address"
      }
    ],
    name: "OwnershipTransferred",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "account",
        type: "address"
      }
    ],
    name: "Paused",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "_tokenContract",
        type: "address"
      },
      {
        indexed: true,
        internalType: "address",
        name: "_sender",
        type: "address"
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "_destination",
        type: "bytes32"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "_amount",
        type: "uint256"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "_eventNonce",
        type: "uint256"
      },
      {
        indexed: false,
        internalType: "string",
        name: "_data",
        type: "string"
      }
    ],
    name: "SendToHeliosEvent",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "_batchNonce",
        type: "uint256"
      },
      {
        indexed: true,
        internalType: "address",
        name: "_token",
        type: "address"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "_eventNonce",
        type: "uint256"
      }
    ],
    name: "TransactionBatchExecutedEvent",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "account",
        type: "address"
      }
    ],
    name: "Unpaused",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "_newValsetNonce",
        type: "uint256"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "_eventNonce",
        type: "uint256"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "_rewardAmount",
        type: "uint256"
      },
      {
        indexed: false,
        internalType: "address",
        name: "_rewardToken",
        type: "address"
      },
      {
        indexed: false,
        internalType: "address[]",
        name: "_validators",
        type: "address[]"
      },
      {
        indexed: false,
        internalType: "uint256[]",
        name: "_powers",
        type: "uint256[]"
      }
    ],
    name: "ValsetUpdatedEvent",
    type: "event"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_contractAddress",
        type: "address"
      },
      {
        internalType: "string",
        name: "_methodName",
        type: "string"
      },
      {
        internalType: "bytes",
        name: "_args",
        type: "bytes"
      }
    ],
    name: "callData",
    outputs: [
      {
        internalType: "bytes",
        name: "data",
        type: "bytes"
      },
      {
        internalType: "bytes",
        name: "err",
        type: "bytes"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "_cosmosDenom",
        type: "string"
      },
      {
        internalType: "string",
        name: "_name",
        type: "string"
      },
      {
        internalType: "string",
        name: "_symbol",
        type: "string"
      },
      {
        internalType: "uint8",
        name: "_decimals",
        type: "uint8"
      }
    ],
    name: "deployERC20",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "",
        type: "string"
      },
      {
        internalType: "string",
        name: "_name",
        type: "string"
      },
      {
        internalType: "string",
        name: "_symbol",
        type: "string"
      },
      {
        internalType: "uint8",
        name: "_decimals",
        type: "uint8"
      },
      {
        internalType: "uint256",
        name: "supply",
        type: "uint256"
      }
    ],
    name: "deployERC20WithSupply",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "emergencyPause",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "emergencyUnpause",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "getOwnershipExpiryTimestamp",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "_hyperionId",
        type: "bytes32"
      },
      {
        internalType: "uint256",
        name: "_powerThreshold",
        type: "uint256"
      },
      {
        internalType: "address[]",
        name: "_validators",
        type: "address[]"
      },
      {
        internalType: "uint256[]",
        name: "_powers",
        type: "uint256[]"
      }
    ],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address"
      }
    ],
    name: "isHeliosNativeToken",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "isOwnershipExpired",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_erc20Address",
        type: "address"
      }
    ],
    name: "lastBatchNonce",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "paused",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "renounceOwnershipAfterExpiry",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_tokenContract",
        type: "address"
      },
      {
        internalType: "bytes32",
        name: "_destination",
        type: "bytes32"
      },
      {
        internalType: "uint256",
        name: "_amount",
        type: "uint256"
      },
      {
        internalType: "string",
        name: "_data",
        type: "string"
      }
    ],
    name: "sendToHelios",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "state_hyperionId",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32"
      }
    ],
    name: "state_invalidationMapping",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address"
      }
    ],
    name: "state_lastBatchNonces",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "state_lastEventHeight",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "state_lastEventNonce",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "state_lastValsetCheckpoint",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "state_lastValsetHeight",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "state_lastValsetNonce",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "state_powerThreshold",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "address[]",
            name: "validators",
            type: "address[]"
          },
          {
            internalType: "uint256[]",
            name: "powers",
            type: "uint256[]"
          },
          {
            internalType: "uint256",
            name: "valsetNonce",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "rewardAmount",
            type: "uint256"
          },
          {
            internalType: "address",
            name: "rewardToken",
            type: "address"
          }
        ],
        internalType: "struct ValsetArgs",
        name: "_currentValset",
        type: "tuple"
      },
      {
        internalType: "uint8[]",
        name: "_v",
        type: "uint8[]"
      },
      {
        internalType: "bytes32[]",
        name: "_r",
        type: "bytes32[]"
      },
      {
        internalType: "bytes32[]",
        name: "_s",
        type: "bytes32[]"
      },
      {
        internalType: "uint256[]",
        name: "_amounts",
        type: "uint256[]"
      },
      {
        internalType: "address[]",
        name: "_destinations",
        type: "address[]"
      },
      {
        internalType: "uint256[]",
        name: "_fees",
        type: "uint256[]"
      },
      {
        internalType: "uint256",
        name: "_batchNonce",
        type: "uint256"
      },
      {
        internalType: "address",
        name: "_tokenContract",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "_batchTimeout",
        type: "uint256"
      }
    ],
    name: "submitBatch",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address"
      }
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "address[]",
            name: "validators",
            type: "address[]"
          },
          {
            internalType: "uint256[]",
            name: "powers",
            type: "uint256[]"
          },
          {
            internalType: "uint256",
            name: "valsetNonce",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "rewardAmount",
            type: "uint256"
          },
          {
            internalType: "address",
            name: "rewardToken",
            type: "address"
          }
        ],
        internalType: "struct ValsetArgs",
        name: "_newValset",
        type: "tuple"
      },
      {
        components: [
          {
            internalType: "address[]",
            name: "validators",
            type: "address[]"
          },
          {
            internalType: "uint256[]",
            name: "powers",
            type: "uint256[]"
          },
          {
            internalType: "uint256",
            name: "valsetNonce",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "rewardAmount",
            type: "uint256"
          },
          {
            internalType: "address",
            name: "rewardToken",
            type: "address"
          }
        ],
        internalType: "struct ValsetArgs",
        name: "_currentValset",
        type: "tuple"
      },
      {
        internalType: "uint8[]",
        name: "_v",
        type: "uint8[]"
      },
      {
        internalType: "bytes32[]",
        name: "_r",
        type: "bytes32[]"
      },
      {
        internalType: "bytes32[]",
        name: "_s",
        type: "bytes32[]"
      }
    ],
    name: "updateValset",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  }
]

export const bridgeCancelSentToChainAbi = [
  {
    inputs: [
      {
        internalType: "uint64",
        name: "chainId",
        type: "uint64"
      }, 
      {
        internalType: "uint64",
        name: "transactionId",
        type: "uint64"
      }
    ],
    name: "cancelSendToChain",
    outputs: [
      {
        internalType: "bool",
        name: "success",
        type: "bool"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  }
]

export const wrapperAbi = [
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "src", type: "address" },
      { indexed: true, internalType: "address", name: "guy", type: "address" },
      { indexed: false, internalType: "uint256", name: "wad", type: "uint256" }
    ],
    name: "Approval",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "dst", type: "address" },
      { indexed: false, internalType: "uint256", name: "wad", type: "uint256" }
    ],
    name: "Deposit",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "src", type: "address" },
      { indexed: true, internalType: "address", name: "dst", type: "address" },
      { indexed: false, internalType: "uint256", name: "wad", type: "uint256" }
    ],
    name: "Transfer",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "src", type: "address" },
      { indexed: false, internalType: "uint256", name: "wad", type: "uint256" }
    ],
    name: "Withdrawal",
    type: "event"
  },
  {
    inputs: [
      { internalType: "address", name: "", type: "address" },
      { internalType: "address", name: "", type: "address" }
    ],
    name: "allowance",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      { internalType: "address", name: "guy", type: "address" },
      { internalType: "uint256", name: "wad", type: "uint256" }
    ],
    name: "approve",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "balanceOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "deposit",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [],
    name: "name",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      { internalType: "address", name: "dst", type: "address" },
      { internalType: "uint256", name: "wad", type: "uint256" }
    ],
    name: "transfer",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { internalType: "address", name: "src", type: "address" },
      { internalType: "address", name: "dst", type: "address" },
      { internalType: "uint256", name: "wad", type: "uint256" }
    ],
    name: "transferFrom",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ internalType: "uint256", name: "wad", type: "uint256" }],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  { stateMutability: "payable", type: "receive" }
]
