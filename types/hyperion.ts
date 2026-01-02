export interface HyperionChain {
  hyperionContractAddress: string
  chainId: number
  name: string
  chainType: string
  logo: string
  hyperionId: number
  paused: boolean
  averageCounterpartyBlockTime?: number
  latestObservedBlockHeight?: number
  latestObservedBlockTime?: number
}

export interface HyperionBridgeTx {
  hyperionId: number
  id: number
  height: number
  sender: string
  destAddress: string
  receivedToken: {
    contract?: string
    amount: string
  }
  sentToken: {
    contract?: string
    amount: string
  }
  receivedFee: {
    amount: string
  }
  sentFee: {
    amount: string
  }
  status: "BRIDGED" | string
  direction: "IN" | "OUT" | string
  chainId: number
  proof: {
    orchestrators: string
    hashs: string
  }
  txHash: string
  index?: number
}
