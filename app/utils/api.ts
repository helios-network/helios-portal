export const fetchProposals = async (page: number, pageSize: number) => {
  const response = await fetch("http://testnet1.helioschainlabs.org:8545/", {
    method: "POST",
    headers: {
      accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      id: 1,
      jsonrpc: "2.0",
      method: "eth_getProposalsByPageAndSize",
      params: [`0x${page.toString(16)}`, `0x${pageSize.toString(16)}`]
    })
  })

  const data = await response.json()
  return data.result
}
