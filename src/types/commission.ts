export interface CommissionRates {
  rate: string;
  max_rate: string;
  max_change_rate: string;
}

export interface Commission {
  commission_rates: CommissionRates;
  update_time: string;
}
