import { useQuery } from "@tanstack/react-query"
import { getValidatorsByPageAndSize } from "@/helpers/rpc-calls"
import { toHex } from "@/utils/number"

export const useValidators = (page = 1, size = 100) => {
  // Validator list data is semi-static - doesn't change frequently
  // Stale time: 5 minutes - reasonable cache duration
  // Refetch interval: 10 minutes - prevents unnecessary background refetches
  const VALIDATOR_STALE_TIME = 5 * 60 * 1000 // 5 minutes
  const VALIDATOR_REFETCH_INTERVAL = 10 * 60 * 1000 // 10 minutes

  const qValidators = useQuery({
    queryKey: ["validators", page, size],
    queryFn: async () => {
      const validators = await getValidatorsByPageAndSize(toHex(page), toHex(size))

      if (!validators) return []

      // Sort validators: jailed last and exclude helios-node (default moniker Remove after testnet)
      return validators
        .filter((v) => v.moniker !== "helios-node")
        .sort((a, b) => {
          // Among non-active, jailed last
          if (a.jailed && !b.jailed) return 1
          if (!a.jailed && b.jailed) return -1
          return 0
        })
    },
    enabled: !!page && !!size,
    staleTime: VALIDATOR_STALE_TIME,
    refetchInterval: VALIDATOR_REFETCH_INTERVAL
  })

  return {
    validators: qValidators.data || [],
    isLoading: qValidators.isLoading,
    error: qValidators.error
  }
}
