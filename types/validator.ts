export interface CommissionRates {
  rate: string
  max_rate: string
  max_change_rate: string
}

export interface Commission {
  commission_rates: CommissionRates
  update_time: string
}

export interface EnrichedAsset {
  denom: string
  baseAmount: string
  amount: string
  weightedAmount: string
  price: number
  logo?: string
  color?: string
  contractAddress: string
}

export interface Delegation {
  validatorAddress: string
  shares: string
  assets: EnrichedAsset[]
  rewards: {
    denom: string
    amount: string
  }
}

export interface ValidatorDescription {
  moniker: string
  details?: string
  security_contract?: string
  website?: string
}

export interface Validator {
  apr: string
  commission: Commission
  description: ValidatorDescription
  jailed: boolean
  minDelegation: string
  minSelfDelegation: string
  moniker: string
  shares: string
  status: number
  unbondingHeight: number
  unbondingIds: string[] | null
  unbondingOnHoldRefCount: number
  unbondingTime: string
  validatorAddress: string
  delegationAuthorization: boolean
  totalBoost: string
  boostPercentage: string
}

export interface ValidatorWithDelegationCommission {
  validator: Validator
  delegation: Delegation
  commission: {
    denom: string
    amount: string
  }
}

export interface ValidatorWithAssetsCommissionAndDelegation {
  validator: Validator
  assets: {
    baseAmount: string
    denom: string
    weightedAmount: string
    contractAddress: string
  }[],
  delegation: Delegation
  commission: {
    denom: string
    amount: string
  }
}

export interface ValidatorWithAssetsCommission {
  validator: Validator
  assets: {
    baseAmount: string
    denom: string
    weightedAmount: string
    contractAddress: string
  }[]
  commission: {
    denom: string
    amount: string
  }
}
