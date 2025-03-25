import { useMutation, useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { REWARDS_CONTRACT_ADDRESS, withdrawDelegatorRewardsAbi } from "../constant/helios-contracts";
import { Feedback } from "../types/feedback";
import { useState } from "react";
import { useWeb3Provider } from "./useWeb3Provider";
import { getErrorMessage } from "../utils/string";

async function fetchRewards(address: string) {
  // @TODO
  return { pendingRewards: "0.5", currency: "HELIOS" };
}

export const useRewards = () => {
  const { address } = useAccount();
  const web3Provider = useWeb3Provider();
  const [feedback, setFeedback] = useState<Feedback>({ status: "idle", message: "" });

  const qRewards = useQuery({
    queryKey: ["rewards", address],
    queryFn: () => fetchRewards(address!),
    enabled: !!address
  });

  const mutation = useMutation({
    mutationFn: async (validatorAddress: string) => {
      if (!web3Provider) throw new Error("No wallet connected");

      try {
        setFeedback({ status: "loading", message: "Transaction in progress..." });

        const contract = new web3Provider.eth.Contract(
          withdrawDelegatorRewardsAbi,
          REWARDS_CONTRACT_ADDRESS
        );

        await contract.methods
          .withdrawDelegatorRewards(address, validatorAddress)
          .call({ from: address, gas: "500000" });

        const tx = await contract.methods
          .withdrawDelegatorRewards(address, validatorAddress)
          .send({ from: address, gas: "500000" });

        setFeedback({
          status: "loading",
          message: `Transaction sent (hash: ${tx.transactionHash}), waiting for confirmation...`
        });

        const receipt = await web3Provider.eth.getTransactionReceipt(tx.transactionHash);

        setFeedback({
          status: "success",
          message: `Transaction confirmed in block ${receipt.blockNumber}`
        });
        return receipt;
      } catch (error: any) {
        setFeedback({
          status: "error",
          message: getErrorMessage(error) || "Error during rewards withdrawal"
        });
        throw error;
      }
    }
  });

  return {
    rewards: qRewards.data,
    isLoading: qRewards.isLoading || mutation.isPending || !web3Provider,
    claimRewards: mutation.mutate,
    feedback
  };
};
