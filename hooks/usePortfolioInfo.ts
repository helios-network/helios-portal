import { useQuery } from "@tanstack/react-query"
import { useAccount } from "wagmi"
import { getTokensBalance } from "@/helpers/rpc-calls"
import { toHex, secondsToMilliseconds } from "@/utils/number"
import { useTokenRegistry } from "./useTokenRegistry"
import { TokenExtended } from "@/types/token"
import { ethers } from "ethers"
import { HELIOS_NETWORK_ID } from "@/config/app"

export const usePortfolioInfo = () => {
  const { address } = useAccount()
  const { getTokenByAddress } = useTokenRegistry()

  const qTokenBalances = useQuery({
    queryKey: ["tokensBalance", address],
    queryFn: () => getTokensBalance(address!, toHex(1), toHex(10)),
    enabled: !!address,
    refetchInterval: secondsToMilliseconds(30)
  })

  const enrichedTokensQuery = useQuery({
    queryKey: ["enrichedPortfolio", address, qTokenBalances.dataUpdatedAt],
    enabled: !!qTokenBalances.data,
    refetchOnWindowFocus: false,
    queryFn: async (): Promise<TokenExtended[]> => {
      const results = await Promise.all(
        qTokenBalances.data!.Balances.map(async (token) => {
          const enriched = await getTokenByAddress(
            token.address,
            HELIOS_NETWORK_ID,
            { updateBalance: true }
          )
          if (!enriched) return null

          const amount = parseFloat(
            ethers.formatUnits(token.balance, enriched.functionnal.decimals)
          )

          return {
            ...enriched,
            display: {
              ...enriched.display,
              symbolIcon:
                enriched.display.symbolIcon ||
                `token:${enriched.display.symbol.toLowerCase()}`
            },
            balance: {
              amount,
              totalPrice: amount * enriched.price.usd
            }
          }
        })
      )

      return results.filter((token): token is TokenExtended => token !== null)
    }
  })

  const totalUSD =
    enrichedTokensQuery.data?.reduce(
      (sum, token) => sum + token.balance.totalPrice,
      0
    ) || 0

  return {
    totalUSD,
    portfolio: enrichedTokensQuery.data || [],
    isLoading: qTokenBalances.isLoading || enrichedTokensQuery.isLoading,
    error: qTokenBalances.error || enrichedTokensQuery.error
  }
}
