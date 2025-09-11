import { useAppStore } from "@/stores/app"
import { getGasPrice } from "@/helpers/rpc-calls"
import { calculateAdjustedGasPrice } from "@/utils/gas"
import { useQuery } from "@tanstack/react-query"

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
    refetchInterval: 30000 // Refetch every 30 seconds
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
