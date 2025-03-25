import { RPC_URL } from "../constant/urls";

async function request<T>(method: string, params: any[]): Promise<T | null> {
  const response = await fetch(RPC_URL, {
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
  });

  if (!response.ok) {
    throw new Error(`${method} call failed.`);
  }

  const data = await response.json();

  if (data.error) {
    throw new Error(data.error.message);
  }

  return data.result ?? null;
}

export { request };
