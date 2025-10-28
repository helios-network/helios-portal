import { useQuery } from "@tanstack/react-query"
import { getProposalsByPageAndSize, getProposalTotalCount } from "@/helpers/rpc-calls"
import { toHex, secondsToMilliseconds } from "@/utils/number"

export interface UseProposalInfoOptions {
  enabled?: boolean
}

export const useProposalInfo = (page = 1, size = 1, options: UseProposalInfoOptions = {}) => {
  const { enabled = true } = options

  const qProposals = useQuery({
    queryKey: ["proposals", page, size],
    queryFn: () => getProposalsByPageAndSize(toHex(page), toHex(size)),
    enabled: enabled && !!page && !!size,
    staleTime: secondsToMilliseconds(60), // Proposals change rarely
    refetchInterval: secondsToMilliseconds(120) // Check every 2 minutes
  })

  const qProposalTotalCount = useQuery({
    queryKey: ["proposalTotalCount"],
    queryFn: () => getProposalTotalCount(),
    enabled: enabled,
    staleTime: secondsToMilliseconds(60), // Added staleTime to prevent refetch
    refetchInterval: secondsToMilliseconds(120) // Added interval
  })

  const lastProposal =
    qProposals.data && qProposals.data.length > 0 ? qProposals.data[0] : null

  return {
    lastProposal,
    isLoading: qProposals.isLoading,
    error: qProposals.error,
    totalProposals: qProposalTotalCount.data || 0
  }
}
