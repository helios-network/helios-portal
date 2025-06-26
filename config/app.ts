import { env } from "@/env"

export const APP_NAME = "Helios Portal"

export const APP_COLOR_PRIMARY = "#002dcb"
export const APP_COLOR_SECONDARY = "rgba(255, 113, 11, 1)"
export const APP_COLOR_DEFAULT = "#ddd"
export const APP_THEME_COLOR = APP_COLOR_PRIMARY

export const APP_BASE_URL =
  env.NEXT_PUBLIC_NODE_ENV === "production"
    ? new URL(env.NEXT_PUBLIC_BASE_URL)
    : new URL("http://localhost:3000")

export const HELIOS_NETWORK_ID = 42000

export const RPC_URL = "https://testnet1.helioschainlabs.org"
export const RPC_URL_OLD = "https://helios.ethereum.rpc.sotatek.works"
export const CDN_URL = "http://testnet1.helioschainlabs.org:8547"
export const EXPLORER_URL = "https://explorer.helioschainlabs.org"

export const HELIOS_TOKEN_ADDRESS = "0xD4949664cD82660AaE99bEdc034a0deA8A0bd517"
