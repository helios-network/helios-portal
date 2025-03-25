export interface DelegationAsset {
  amount: string;
  symbol: string;
}

export interface DelegationReward {
  denom: string;
  amount: string;
}

export interface Delegation {
  assets: DelegationAsset[];
  rewards: DelegationReward[];
  shares: string;
  validator_address: string;
}
