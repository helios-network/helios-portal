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
    refetchInterval: secondsToMilliseconds(30)
  })

  const qBlockData = useQuery({
    queryKey: ["blockData", qBlockNumber.data],
    queryFn: () => getBlockByNumber(qBlockNumber.data ?? "latest"),
    enabled: enableBlocks && !!qBlockNumber.data
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
    retry: false
  })

  const qGasPrice = useQuery({
    queryKey: ["gasPrice"],
    queryFn: getGasPrice,
    enabled: enableGas
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
