export interface ProposalAsset {
  denom: string;
  contract_address: string;
  chain_id: string;
}

export interface ProposalDetail {
  assets: ProposalAsset[];
  type: string;
}

export interface TallyResult {
  yes_count: string;
  abstain_count: string;
  no_count: string;
  no_with_veto_count: string;
}

export interface Deposit {
  denom: string;
  amount: string;
}

export interface VotingOption {
  option: number;
  weight: string;
}

export interface Proposal {
  details: ProposalDetail[];
  finalTallyResult: TallyResult;
  id: number;
  metadata: string;
  minDeposit: Deposit[];
  options: VotingOption[];
  proposer: string;
  status: string;
  statusCode: number;
  submitTime: string;
  summary: string;
  title: string;
  totalDeposit: Deposit[];
  votingEndTime: string;
  votingStartTime: string;
}
