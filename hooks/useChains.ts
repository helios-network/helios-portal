import { useQuery } from "@tanstack/react-query"
import { getHyperionChains } from "@/helpers/rpc-calls"

export const useChains = () => {
  const qHyperionChains = useQuery({
    queryKey: ["hyperionChains"],
    queryFn: getHyperionChains
  })

  return {
    chains: qHyperionChains.data || [],
    heliosChainIndex: (qHyperionChains.data || []).findIndex(
      (chain) => chain.hyperionId === 0
    ),
    isLoading: qHyperionChains.isLoading
  }
}
