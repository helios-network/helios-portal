import {
  getBlockByNumber,
  getLatestBlockNumber,
  getGasPrice
} from "@/helpers/rpc-calls"
import { formatCurrency } from "@/lib/utils/number"
import { fromHex, fromWeiToEther, secondsToMilliseconds } from "@/utils/number"
import { fetchCGTokenData } from "@/utils/price"
import { useQuery } from "@tanstack/react-query"
import { useEffect, useRef, useState } from "react"

export const useBlockInfo = () => {
  const qBlockNumber = useQuery({
    queryKey: ["blockNumber"],
    queryFn: getLatestBlockNumber,
    refetchInterval: secondsToMilliseconds(30)
  })

  const qBlockData = useQuery({
    queryKey: ["blockData", qBlockNumber.data],
    queryFn: () => getBlockByNumber(qBlockNumber.data ?? "latest"),
    enabled: !!qBlockNumber.data
  })

  const prevTsRef = useRef<number | null>(null)
  const [blockTime, setBlockTime] = useState(0)

  useEffect(() => {
    if (qBlockData.data?.timestamp) {
      const currentTs = parseInt(qBlockData.data.timestamp)
      if (prevTsRef.current !== null) {
        setBlockTime(currentTs - prevTsRef.current)
      }
      prevTsRef.current = currentTs
    }
  }, [qBlockData.data?.timestamp])

  const qHeliosPrice = useQuery({
    queryKey: ["tokenData", ["hls"]],
    queryFn: () => fetchCGTokenData(["hls"]),
    retry: false
  })

  const qGasPrice = useQuery({
    queryKey: ["gasPrice"],
    queryFn: getGasPrice
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
      qBlockNumber.isLoading || qBlockData.isLoading || qGasPrice.isLoading,
    error: qBlockNumber.error || qBlockData.error || qGasPrice.error
  }
}
