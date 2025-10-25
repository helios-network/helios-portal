import { WagmiAdapter } from "@reown/appkit-adapter-wagmi"
import {
  mainnet,
  sepolia,
  polygonAmoy,
  bscTestnet,
  avalancheFuji,
  AppKitNetwork,
  bsc,
  arbitrum,
  base,
  optimism,
  polygon
} from "@reown/appkit/networks"
import { cookieStorage, createStorage } from "@wagmi/core"
import { defineChain } from "viem"
import { HELIOS_NETWORK_ID, RPC_URL_DEFAULT } from "./app"
import { getRpcUrl } from "./rpc"
import { env } from "@/env"

export const projectId = env.NEXT_PUBLIC_PROJECT_ID

if (!projectId) {
  throw new Error("Project ID is not defined")
}

// Define the custom Helios chain
export const heliosChain = defineChain({
  id: HELIOS_NETWORK_ID,
  name: "Helios",
  network: "helios",
  nativeCurrency: {
    decimals: 18,
    name: "HELIOS",
    symbol: "HELIOS"
  },
  rpcUrls: {
    default: {
      http: [typeof window !== "undefined" ? getRpcUrl() : RPC_URL_DEFAULT]
    },
    public: {
      http: [typeof window !== "undefined" ? getRpcUrl() : RPC_URL_DEFAULT]
    }
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
// export const networks = [heliosChain, mainnet, sepolia, polygonAmoy]

export const toAppKitNetwork = (chain: any): AppKitNetwork => ({
  id: chain.id,
  name: chain.name,
  chainNamespace: "eip155",
  caipNetworkId: `eip155:${chain.id}`,
  nativeCurrency: { ...chain.nativeCurrency },
  rpcUrls: { ...chain.rpcUrls },
  blockExplorers: { ...chain.blockExplorers }
})

export const networks: AppKitNetwork[] = [
  toAppKitNetwork(heliosChain),
  toAppKitNetwork(mainnet),
  toAppKitNetwork(bsc),
  toAppKitNetwork(arbitrum),
  toAppKitNetwork(base),
  toAppKitNetwork(optimism),
  toAppKitNetwork(polygon),
  toAppKitNetwork(sepolia),
  toAppKitNetwork(polygonAmoy),
  toAppKitNetwork(bscTestnet),
  toAppKitNetwork(avalancheFuji)
]

export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage
  }),
  ssr: true,
  projectId,
  networks
})

export const config = wagmiAdapter.wagmiConfig
