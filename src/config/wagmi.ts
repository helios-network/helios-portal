import { WagmiAdapter } from "@reown/appkit-adapter-wagmi"
import { mainnet } from "@reown/appkit/networks"
import { cookieStorage, createStorage } from "@wagmi/core"
import { defineChain } from "viem"
import { RPC_URL } from "../constant/urls"

export const projectId = import.meta.env.VITE_PROJECT_ID

if (!projectId) {
  throw new Error("Project ID is not defined")
}

// Define the custom Helios chain
export const heliosChain = defineChain({
  id: 4242,
  name: "Helios",
  network: "helios",
  nativeCurrency: {
    decimals: 18,
    name: "HELIOS",
    symbol: "HELIOS"
  },
  rpcUrls: {
    default: { http: [RPC_URL] },
    public: { http: [RPC_URL] }
  },
  blockExplorers: {
    default: {
      name: "Helios Explorer",
      url: "https://explorer.helioschainlabs.org/"
    }
  }
})

// // Convert the Helios chain to AppKitNetwork format
// const heliosAppKitNetwork = {
//   id: heliosChain.id,
//   name: heliosChain.name,
//   chainNamespace: "eip155",
//   caipNetworkId: `eip155:${heliosChain.id}`,
//   nativeCurrency: heliosChain.nativeCurrency,
//   rpcUrls: heliosChain.rpcUrls,
//   blockExplorers: heliosChain.blockExplorers
// };

// Use only the Helios chain in the networks array
export const networks = [heliosChain, mainnet]

export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage
  }),
  ssr: true,
  projectId,
  networks
})

export const config = wagmiAdapter.wagmiConfig
