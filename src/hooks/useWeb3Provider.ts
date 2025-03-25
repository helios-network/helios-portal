import { useWalletClient } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import Web3 from "web3";

export const useWeb3Provider = () => {
  const { data: walletClient } = useWalletClient();

  const fetchWeb3Provider = async () => {
    if (!walletClient) {
      throw new Error("No wallet client available");
    }

    try {
      const web3 = new Web3(walletClient.transport);
      return web3;
    } catch (error: any) {
      throw new Error("Error getting Web3 provider: " + error.message);
    }
  };

  const qWeb3 = useQuery({
    queryKey: ["web3Provider", walletClient],
    queryFn: fetchWeb3Provider,
    enabled: !!walletClient
  });

  return qWeb3.data;
};
