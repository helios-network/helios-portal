import { RPC_URL_DEFAULT } from "@/config/app"
import { getRpcUrl } from "@/config/rpc"

async function requestWithRpcUrl<T>(rpcUrl: string, method: string, params: any[]): Promise<T | null> { 
  const response = await fetch(rpcUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method,
      params,
      id: 1
    })
  })

  if (!response.ok) {
    throw new Error(`${method} call failed.`)
  }

  const data = await response.json()

  if (data.error) {
    throw new Error(data.error.message)
  }

  return data.result ?? null
}

async function request<T>(method: string, params: any[]): Promise<T | null> {
  // Get the dynamic RPC URL based on debug mode
  const rpcUrl = typeof window !== "undefined" ? getRpcUrl() : RPC_URL_DEFAULT

  return requestWithRpcUrl(rpcUrl, method, params)
}

export { request, requestWithRpcUrl }
