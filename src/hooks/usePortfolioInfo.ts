import { useQuery } from "@tanstack/react-query"
import { useAccount } from "wagmi"
import { getTokensBalance } from "../helpers/rpc-calls"
import { fromWeiToEther } from "../utils/number"
import { fetchCGTokenData } from "../utils/price"
import { CGToken } from "../types/token"
import { TOKEN_COLORS } from "../config/constants"
import { APP_COLOR_SECONDARY } from "../config/app"

export const usePortfolioInfo = () => {
  const { address } = useAccount()

  const qTokenBalances = useQuery({
    queryKey: ["tokensBalance", address],
    queryFn: () => getTokensBalance(address!),
    enabled: !!address
  })

  const qTokenData = useQuery({
    queryKey: [
      "tokenData",
      qTokenBalances.data?.map((t) => t.symbol.toLowerCase())
    ],
    queryFn: () =>
      fetchCGTokenData(
        qTokenBalances.data?.map((t) => t.symbol.toLowerCase()) || []
      ),
    enabled: !!qTokenBalances.data
  })

  let totalUSD = 0
  let portfolio: CGToken[] = []

  if (qTokenBalances.data && qTokenData.data) {
    portfolio = qTokenBalances.data.map((token) => {
      const symbol = token.symbol.toLowerCase() as keyof typeof TOKEN_COLORS
      const amount = fromWeiToEther(token.balance)
      const priceUSD = qTokenData.data[symbol]?.price || 0
      const valueUSD = parseFloat(amount) * priceUSD

      if (symbol === "ahelios") {
        return {
          name: "Helios",
          symbol: "HELIOS",
          symbolIcon: "helios",
          amount,
          valueUSD,
          priceUSD,
          percentage: 0,
          color: TOKEN_COLORS[symbol] || APP_COLOR_SECONDARY
        }
      }

      return {
        name: token.name,
        symbol: symbol.toUpperCase(),
        symbolIcon: "token:" + token.id,
        amount,
        valueUSD,
        priceUSD,
        percentage: 0,
        color: TOKEN_COLORS[symbol] || APP_COLOR_SECONDARY
      }
    })

    totalUSD = portfolio.reduce((sum, asset) => sum + asset.valueUSD, 0)

    portfolio = portfolio.map((asset) => ({
      ...asset,
      percentage: totalUSD ? (asset.valueUSD / totalUSD) * 100 : 0
    }))
  }

  return {
    totalUSD,
    portfolio,
    isLoading: qTokenBalances.isLoading || qTokenData.isLoading,
    error: qTokenBalances.error || qTokenData.error
  }
}
