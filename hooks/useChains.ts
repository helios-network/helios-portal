import { useQuery } from "@tanstack/react-query"
import { getHyperionChains } from "@/helpers/rpc-calls"

export const useChains = () => {
  const qHyperionChains = useQuery({
    queryKey: ["hyperionChains"],
    queryFn: getHyperionChains
  })

  const disabledChains = [56]

  const filteredChains = (qHyperionChains.data || []).filter((chain) => !disabledChains.includes(chain.hyperionId))

  return {
    chains: filteredChains,
    heliosChainIndex: filteredChains.findIndex(
      (chain) => chain.hyperionId === 0
    ),
    isLoading: qHyperionChains.isLoading
  }
}
