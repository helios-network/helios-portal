export interface CommissionRates {
  rate: string;
  max_rate: string;
  max_change_rate: string;
}

export interface Commission {
  commission_rates: CommissionRates;
  update_time: string;
}

export interface ValidatorDescription {
  moniker: string;
}

export interface Validator {
  apr: string;
  commission: Commission;
  description: ValidatorDescription;
  jailed: boolean;
  minSelfDelegation: string;
  moniker: string;
  shares: string;
  status: number;
  unbondingHeight: number;
  unbondingIds: string[] | null;
  unbondingOnHoldRefCount: number;
  unbondingTime: string;
  validatorAddress: string;
}
