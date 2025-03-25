import { useQuery } from "@tanstack/react-query";
import { getValidatorsByPageAndSize } from "../helpers/rpc-calls";
import { toHex } from "../utils/number";

export const useValidatorInfos = () => {
  const page = 1;
  const size = 100;

  const qValidators = useQuery({
    queryKey: ["validators", page, size],
    queryFn: () => getValidatorsByPageAndSize(toHex(page), toHex(size)),
    enabled: !!page && !!size
  });

  return {
    activeValidators: qValidators.data?.length || 0,
    maxValidators: size,
    isLoading: qValidators.isLoading,
    error: qValidators.error
  };
};
