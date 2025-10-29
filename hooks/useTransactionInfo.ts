import { getLastTransactions } from "@/helpers/rpc-calls"
import { secondsToMilliseconds, toHex } from "@/utils/number"
import { useQuery } from "@tanstack/react-query"
import { useTokenRegistry } from "./useTokenRegistry"
import { HELIOS_NETWORK_ID } from "@/config/app"
import { TransactionLight } from "@/types/transaction"
import { TokenExtended } from "@/types/token"

export const useTransactionInfo = (size = 3) => {
  const { getTokenByAddress } = useTokenRegistry()

  const qTransactions = useQuery({
    queryKey: ["transactions", size],
    queryFn: () => getLastTransactions(toHex(size)),
    refetchInterval: secondsToMilliseconds(60)
  })

  const enrichedTransactions = useQuery({
    queryKey: ["enrichedTransactions", qTransactions.data],
    enabled: !!qTransactions.data,
    queryFn: async () => {
      return Promise.all(
        qTransactions.data!.map(async (tx) => {

          if (tx.ParsedInfo.type === "UNKNOWN") {
            tx.ParsedInfo.type = "TRANSFER"
          }

          const tokenAddress: string = tx.ParsedInfo?.contractAddress && tx.ParsedInfo.contractAddress !== "0x0000000000000000000000000000000000000000"
            ? tx.ParsedInfo.contractAddress
            : "0xD4949664cD82660AaE99bEdc034a0deA8A0bd517";
          const token = await getTokenByAddress(
              tokenAddress,
              HELIOS_NETWORK_ID,
              { updateBalance: false }
            )
          return {
            type: tx.ParsedInfo.type || "TRANSFER",
            token,
            amount: tx.ParsedInfo.amount || "0",
            hash: tx.RawTransaction.hash
          } as TransactionLight
        })
      )
    }
  })

  return {
    transactions: enrichedTransactions.data || [],
    isLoading: qTransactions.isLoading || enrichedTransactions.isLoading,
    error: qTransactions.error || enrichedTransactions.error
  }
}
