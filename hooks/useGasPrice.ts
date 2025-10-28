import { useAppStore } from "@/stores/app"
import { getGasPrice } from "@/helpers/rpc-calls"
import { calculateAdjustedGasPrice } from "@/utils/gas"
import { useQuery } from "@tanstack/react-query"

// Cache configuration constants
const GAS_PRICE_STALE_TIME = 5000 // 5 seconds
const GAS_PRICE_REFETCH_INTERVAL = 30000 // 30 seconds

/**
 * Hook to get the adjusted gas price based on the user's selected gas price option
 * @returns The adjusted gas price and related information
 */
export function useGasPrice() {
  const { gasPriceOption, debugMode } = useAppStore()

  // Fetch the base gas price from the network
  const {
    data: baseGasPrice,
    isLoading,
    error
  } = useQuery({
    queryKey: ["gasPrice"],
    queryFn: getGasPrice,
    enabled: debugMode,
    staleTime: GAS_PRICE_STALE_TIME,
    refetchInterval: GAS_PRICE_REFETCH_INTERVAL
  })

  // Calculate the adjusted gas price based on the user's selected option
  // Only apply adjustments if in debug mode
  const adjustedGasPrice = baseGasPrice
    ? debugMode
      ? calculateAdjustedGasPrice(baseGasPrice, gasPriceOption)
      : BigInt(baseGasPrice)
    : BigInt("20000000000") // 20 Gwei as a fallback

  return {
    baseGasPrice,
    adjustedGasPrice,
    gasPriceOption,
    isLoading,
    error
  }
}
