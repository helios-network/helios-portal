import { toast } from "sonner"
import { TokenExtended } from "@/types/token"

/**
 * Add a token to the user's wallet (MetaMask)
 * @param token - The token to add to the wallet
 */
export const addTokenToWallet = async (token: TokenExtended) => {
  if (!window.ethereum) {
    toast.error("MetaMask not detected")
    return false
  }

  try {
    await (window.ethereum.request as any)({
      method: "wallet_watchAsset",
      params: {
        type: "ERC20",
        options: {
          address: token.functionnal.address,
          symbol: token.display.symbol,
          decimals: token.functionnal.decimals,
          image: token.display.logo || undefined
        }
      }
    })
    toast.success(`${token.display.symbol} added to wallet!`)
    return true
  } catch (error: any) {
    toast.error(`Failed to add ${token.display.symbol} to wallet: ${error.message}`)
    return false
  }
}
