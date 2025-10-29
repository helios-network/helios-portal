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
          if (tx.ParsedInfo?.type === "UNKNOWN") {
            tx.ParsedInfo.type = "TRANSFER"
          }
          const token = tx.ParsedInfo.contractAddress
            ? await getTokenByAddress(
                tx.ParsedInfo.contractAddress,
                HELIOS_NETWORK_ID,
                { updateBalance: false }
              )
            : null

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
