import {
  getBlockByNumber,
  getLatestBlockNumber,
  getGasPrice
} from "../helpers/rpc-calls"
import { formatCurrency } from "../lib/utils/number"
import { fromHex, fromWeiToEther, secondsToMilliseconds } from "../utils/number"
import { fetchCGTokenData } from "../utils/price"
import { useQuery } from "@tanstack/react-query"

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

  const qPreviousBlockData = useQuery({
    queryKey: [
      "blockData",
      qBlockNumber.data ? parseInt(qBlockNumber.data) - 1 : 0
    ],
    queryFn: () =>
      getBlockByNumber(
        (qBlockNumber.data
          ? parseInt(qBlockNumber.data) - 1
          : "latest"
        ).toString()
      ),
    enabled: !!qBlockNumber.data,
    refetchInterval: false
  })

  const qHeliosPrice = useQuery({
    queryKey: ["tokenData", ["helios"]],
    queryFn: () => fetchCGTokenData(["helios"])
  })

  const qGasPrice = useQuery({
    queryKey: ["gasPrice"],
    queryFn: getGasPrice
  })

  let blockTime = 0
  if (qBlockData.data && qPreviousBlockData.data) {
    const currentBlockTimestamp = parseInt(qBlockData.data.timestamp)
    const previousBlockTimestamp = parseInt(qPreviousBlockData.data.timestamp)
    const timeDifference = currentBlockTimestamp - previousBlockTimestamp
    blockTime = timeDifference
  }

  const gasPriceInETH = qGasPrice.data ? fromWeiToEther(qGasPrice.data) : "0"
  const heliosPrice = qHeliosPrice.data?.["helios"]?.price ?? 0
  const gasPriceInUSD = parseFloat(gasPriceInETH) * heliosPrice

  return {
    lastBlockNumber: qBlockNumber.data ? fromHex(qBlockNumber.data) : 0,
    blockTime,
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
