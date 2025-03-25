import { useQuery } from "@tanstack/react-query";
import { getProposalsByPageAndSize } from "../helpers/rpc-calls";
import { toHex } from "../utils/number";

export const useProposalInfo = () => {
  const page = 1;
  const size = 1;

  const qProposals = useQuery({
    queryKey: ["proposals", page, size],
    queryFn: () => getProposalsByPageAndSize(toHex(page), toHex(size)),
    enabled: !!page && !!size
  });

  const lastProposal = qProposals.data && qProposals.data.length > 0 ? qProposals.data[0] : null;

  return {
    lastProposal,
    isLoading: qProposals.isLoading,
    error: qProposals.error
  };
};
