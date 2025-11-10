"use client"

import {
  heliosChain,
  projectId,
  toAppKitNetwork,
  wagmiAdapter,
  networksWagmiOfHelios
} from "@/config/wagmi"
import {
  mainnet,
  polygonAmoy,
  sepolia,
  bscTestnet,
  avalancheFuji
} from "@reown/appkit/networks"
import { createAppKit } from "@reown/appkit/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { type ReactNode } from "react"
import { cookieToInitialState, WagmiProvider, type Config } from "wagmi"

const queryClient = new QueryClient()
queryClient.setDefaultOptions({
  queries: {
    placeholderData: (prev: any) => prev,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000
  }
})

if (!projectId) {
  throw new Error("Project ID is not defined")
}

// Set up metadata
const metadata = {
  name: "Helios Portal",
  description: "Helios Portal",
  url: "https://portal.helioschain.network/", // origin must match your domain & subdomain
  icons: ["https://portal.helioschain.network/img/logo.png"]
}

// Session storage no longer needed as we've removed the signature requirement

// Update your modal configuration
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const modal = createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [
    toAppKitNetwork(heliosChain),
    ... networksWagmiOfHelios.filter((network) => network.id !== heliosChain.id)
  ],
  defaultNetwork: toAppKitNetwork(heliosChain),
  metadata: metadata,
  features: {
    analytics: false // Optional - defaults to your Cloud configuration
  },
  // Removed SIWX configuration to skip signature requirement
  // This makes the app fully decentralized without requiring signatures
})

type ContextProviderProps = {
  children: ReactNode
  cookies: string | null
}

function ContextProvider({ children, cookies }: ContextProviderProps) {
  const initialState = cookieToInitialState(
    wagmiAdapter.wagmiConfig as Config,
    cookies
  )

  // No need to check for sessions anymore as we've removed the signature requirement

  return (
    <WagmiProvider
      config={wagmiAdapter.wagmiConfig as Config}
      initialState={initialState}
    >
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}

export default ContextProvider
