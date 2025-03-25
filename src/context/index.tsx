"use client"

import { heliosChain, projectId, wagmiAdapter } from "../config/wagmi"
import { mainnet } from "@reown/appkit/networks"
import { createAppKit, SIWXMessage, SIWXSession } from "@reown/appkit/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useEffect, type ReactNode } from "react"
import { cookieToInitialState, type Config } from "wagmi"
import { createConfig, http, WagmiProvider } from 'wagmi'

const queryClient = new QueryClient()

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

// Create a function to handle session storage
const SESSION_STORAGE_KEY = "helios_portal_session"

const saveSession = (session: SIWXSession): void => {
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))
}

const getSession = (): SIWXSession | null => {
  const sessionData = localStorage.getItem(SESSION_STORAGE_KEY)
  return sessionData ? JSON.parse(sessionData) : null
}

const clearSession = (): void => {
  localStorage.removeItem(SESSION_STORAGE_KEY)
}

// Update your modal configuration
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const modal = createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [heliosChain, mainnet],
  defaultNetwork: heliosChain,
  metadata: metadata,
  features: {
    analytics: false // Optional - defaults to your Cloud configuration
  },
  siwx: {
    createMessage: async (input): Promise<SIWXMessage> => {
      const message: SIWXMessage = {
        accountAddress: input.accountAddress,
        chainId: input.chainId,
        domain: "Helios Portal",
        uri: "https://portal.helios.network",
        version: "1",
        nonce: "nonce",
        statement: "Sign in to access your account.",
        issuedAt: new Date().toISOString(),
        toString: function (): string {
          return `
            ${this.domain} wants you to sign in with your account:
            ${this.accountAddress}

            URI: ${this.uri}
            Version: ${this.version}
            Chain ID: ${this.chainId}
            Nonce: ${this.nonce}
            Issued At: ${this.issuedAt}
          `.trim()
        }
      }
      return message
    },
    addSession: async (session: SIWXSession): Promise<void> => {
      console.log("Adding session:", session)
      saveSession(session)
    },
    revokeSession: async (chainId: string, address: string): Promise<void> => {
      console.log(`Revoking session for ${address} on chain ${chainId}`)
      clearSession()
    },
    setSessions: async (sessions: SIWXSession[]): Promise<void> => {
      console.log("Setting sessions:", sessions)
      if (sessions.length > 0) {
        saveSession(sessions[0]) // Assuming we're only dealing with one session
      } else {
        clearSession()
      }
    },
    getSessions: async (
      chainId: string,
      address: string
    ): Promise<SIWXSession[]> => {
      console.log(`Getting sessions for ${address} on chain ${chainId}`)
      const session = getSession()
      return session ? [session] : []
    }
  }
})

type ContextProviderProps = {
  children: ReactNode
  cookies: string | null
}

// Créer la configuration Wagmi
const config = createConfig({
  chains: [mainnet],
  transports: {
    [mainnet.id]: http()
  }
})

function ContextProvider({ children, cookies }: ContextProviderProps) {
  const initialState = cookieToInitialState(
    wagmiAdapter.wagmiConfig as Config,
    cookies
  )

  useEffect(() => {
    // Check for existing session on component mount
    const checkSession = async (): Promise<void> => {
      const session = getSession()
      if (session) {
        // If a session exists, you might want to validate it here
        // For example, you could check if it's expired and clear it if necessary
        // If it's valid, you can use it to skip the sign message process
        console.log("Existing session found:", session)
      }
    }

    checkSession()
  }, [])

  return (
    <WagmiProvider config={config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default ContextProvider
