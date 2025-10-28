import { useQuery } from "@tanstack/react-query"
import {
  getActiveValidatorCount,
  getValidatorsByPageAndSize
} from "@/helpers/rpc-calls"
import { toHex } from "@/utils/number"
import { secondsToMilliseconds } from "@/utils/number"
import { Validator } from "@/types/validator"

enum NetworkSecurity {
  LOW = "Low",
  MEDIUM = "Good",
  HIGH = "High",
  VERY_HIGH = "Very high"
}

export const useValidatorInfo = () => {
  const page = 1
  const size = 100

  // Validator data is semi-static and doesn't need frequent updates
  // Stale time: 5 minutes - provides reasonable cache before refresh
  // Refetch interval: 10 minutes - prevents aggressive background refetching
  const VALIDATOR_STALE_TIME = 5 * 60 * 1000 // 5 minutes
  const VALIDATOR_REFETCH_INTERVAL = 10 * 60 * 1000 // 10 minutes

  const qValidators = useQuery({
    queryKey: ["validators", page, size],
    queryFn: () => getValidatorsByPageAndSize(toHex(page), toHex(size)),
    enabled: !!page && !!size,
    staleTime: VALIDATOR_STALE_TIME,
    refetchInterval: VALIDATOR_REFETCH_INTERVAL
  })

  const qActiveValidatorCount = useQuery({
    queryKey: ["activeValidatorCount"],
    queryFn: () => getActiveValidatorCount(),
    staleTime: VALIDATOR_STALE_TIME,
    refetchInterval: VALIDATOR_REFETCH_INTERVAL
  })

  const getAverageApr = (validators: Validator[]): number => {
    if (validators.length === 0) return 0

    const total = validators.reduce((sum, validator) => {
      const rate = parseFloat(validator.apr)
      return sum + rate
    }, 0)

    return total / validators.length
  }

  const getNetworkSecurity = (activeValidators: number) => {
    if (activeValidators <= 2) return NetworkSecurity.LOW
    if (activeValidators <= 5) return NetworkSecurity.MEDIUM
    if (activeValidators <= 7) return NetworkSecurity.HIGH
    return NetworkSecurity.VERY_HIGH
  }

  const activeValidators = qActiveValidatorCount.data || 0
  const avgApr = getAverageApr(qValidators.data || [])
  const networkSecurity = getNetworkSecurity(activeValidators)

  return {
    validators: qValidators.data || [],
    activeValidators,
    maxValidators: size,
    avgApr,
    networkSecurity,
    isLoading: qValidators.isLoading,
    error: qValidators.error
  }
}
