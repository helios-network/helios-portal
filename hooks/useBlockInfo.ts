import {
  getBlockByNumber,
  getLatestBlockNumber,
  getGasPrice
} from "@/helpers/rpc-calls"
import { formatCurrency } from "@/lib/utils/number"
import {
  fromHex,
  toHex,
  fromWeiToEther,
  secondsToMilliseconds
} from "@/utils/number"
import { fetchCGTokenData } from "@/utils/price"
import { useQuery } from "@tanstack/react-query"
import { useEffect, useRef, useState } from "react"
import { useAppStore } from "@/stores/app"

// Cache configuration constants
const BLOCK_NUMBER_STALE_TIME = secondsToMilliseconds(10)
const BLOCK_NUMBER_REFETCH_INTERVAL = secondsToMilliseconds(30)
const BLOCK_DATA_STALE_TIME = secondsToMilliseconds(15)
const BLOCK_DATA_REFETCH_INTERVAL = secondsToMilliseconds(60)
const HELIOS_PRICE_STALE_TIME = secondsToMilliseconds(60)
const HELIOS_PRICE_REFETCH_INTERVAL = secondsToMilliseconds(300)
const GAS_PRICE_STALE_TIME = secondsToMilliseconds(5)
const GAS_PRICE_REFETCH_INTERVAL = secondsToMilliseconds(30)

export const useBlockInfo = (options?: {
  forceEnable?: boolean
  includeGas?: boolean
}) => {
  const { debugMode } = useAppStore()
  const enableBlocks = options?.forceEnable ?? debugMode
  const enableGas = options?.includeGas ?? debugMode

  const qBlockNumber = useQuery({
    queryKey: ["blockNumber"],
    queryFn: getLatestBlockNumber,
    enabled: enableBlocks,
    staleTime: BLOCK_NUMBER_STALE_TIME,
    refetchInterval: BLOCK_NUMBER_REFETCH_INTERVAL
  })

  const qBlockData = useQuery({
    queryKey: ["blockData", qBlockNumber.data],
    queryFn: () => getBlockByNumber(qBlockNumber.data ?? "latest"),
    enabled: enableBlocks && !!qBlockNumber.data,
    staleTime: BLOCK_DATA_STALE_TIME,
    refetchInterval: BLOCK_DATA_REFETCH_INTERVAL
  })

  const qPreviousBlockData = useQuery({
    queryKey: [
      "blockData",
      qBlockNumber.data ? fromHex(qBlockNumber.data) - 1 : null
    ],
    queryFn: () =>
      getBlockByNumber(
        qBlockNumber.data ? toHex(fromHex(qBlockNumber.data) - 1) : "latest"
      ),
    enabled: enableBlocks && !!qBlockNumber.data,
    staleTime: BLOCK_DATA_STALE_TIME,
    refetchInterval: false
  })

  const [blockTime, setBlockTime] = useState(0)

  useEffect(() => {
    if (qBlockData.data?.timestamp && qPreviousBlockData.data?.timestamp) {
      const currentTs = parseInt(qBlockData.data.timestamp)
      const prevTs = parseInt(qPreviousBlockData.data.timestamp)
      if (!Number.isNaN(currentTs) && !Number.isNaN(prevTs)) {
        setBlockTime(currentTs - prevTs)
      }
    }
  }, [qBlockData.data?.timestamp, qPreviousBlockData.data?.timestamp])

  const qHeliosPrice = useQuery({
    queryKey: ["tokenData", ["hls"]],
    queryFn: () => fetchCGTokenData(["hls"]),
    retry: false,
    staleTime: HELIOS_PRICE_STALE_TIME,
    refetchInterval: HELIOS_PRICE_REFETCH_INTERVAL
  })

  const qGasPrice = useQuery({
    queryKey: ["gasPrice"],
    queryFn: getGasPrice,
    enabled: enableGas,
    staleTime: GAS_PRICE_STALE_TIME,
    refetchInterval: GAS_PRICE_REFETCH_INTERVAL
  })

  const gasPriceInETH = qGasPrice.data ? fromWeiToEther(qGasPrice.data) : "0"
  const heliosPrice = qHeliosPrice.data?.["helios"]?.price ?? 0
  const gasPriceInUSD = parseFloat(gasPriceInETH) * heliosPrice

  return {
    lastBlockNumber: qBlockNumber.data ? fromHex(qBlockNumber.data) : 0,
    blockTime,
    lastBlockTimestamp: qBlockData.data?.timestamp,
    gasPrice: gasPriceInETH,
    gasPriceUSD: formatCurrency(gasPriceInUSD),
    isLoading:
      qBlockNumber.isLoading ||
      qBlockData.isLoading ||
      qPreviousBlockData.isLoading ||
      qGasPrice.isLoading,
    error:
      qBlockNumber.error ||
      qBlockData.error ||
      qPreviousBlockData.error ||
      qGasPrice.error
  }
}
