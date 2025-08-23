"use client"

import { Card } from "@/components/card"
import { Heading } from "@/components/heading"
import { Icon } from "@/components/icon"
import { Button } from "@/components/button"
import Image from "next/image"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"
import {
  useRecentTokensContext,
  type DeployedToken
} from "@/context/RecentTokensContext"
import s from "./recents.module.scss"

export const TokenDeployerRecents = () => {
  const { recentTokens, clearTokens } = useRecentTokensContext()

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address)
    toast.success("Address copied to clipboard")
  }

  const handleAddToWallet = async (token: DeployedToken) => {
    if (!window.ethereum) {
      toast.error("MetaMask not detected")
      return
    }

    try {
      await (window.ethereum.request as any)({
        method: "wallet_watchAsset",
        params: {
          type: "ERC20",
          options: {
            address: token.address,
            symbol: token.symbol,
            decimals: token.decimals,
            image: token.logoBase64
              ? `data:image/png;base64,${token.logoBase64}`
              : undefined
          }
        }
      })
      toast.success("Token added to wallet!")
    } catch {
      toast.error("Failed to add token to wallet")
    }
  }

  const handleViewTransaction = (txHash: string) => {
    // Open transaction in block explorer
    window.open(`https://explorer.helioschainlabs.org/tx/${txHash}`, "_blank")
  }

  const clearRecents = () => {
    clearTokens()
    toast.success("Recent tokens cleared")
  }

  if (recentTokens.length === 0) {
    return (
      <Card className={s.recents}>
        <Heading
          icon="hugeicons:clock-01"
          title="Recent Deployments"
          description="Your recently deployed tokens will appear here"
        />

        <div className={s.empty}>
          <Icon icon="hugeicons:coins-01" className={s.emptyIcon} />
          <p className={s.emptyText}>No tokens deployed yet</p>
          <p className={s.emptySubtext}>
            Deploy your first HRC20 token to see it here
          </p>
        </div>
      </Card>
    )
  }

  return (
    <Card className={s.recents}>
      <div className={s.header}>
        <Heading
          icon="hugeicons:clock-01"
          title="Recent Deployments"
          description={`${recentTokens.length} token${
            recentTokens.length !== 1 ? "s" : ""
          } deployed`}
        />
        <Button
          variant="secondary"
          size="xsmall"
          onClick={clearRecents}
          iconLeft="hugeicons:delete-02"
        >
          Clear
        </Button>
      </div>

      <div className={s.list}>
        {recentTokens.map((token, index) => (
          <div key={`${token.address}-${index}`} className={s.token}>
            <div className={s.tokenInfo}>
              <div className={s.tokenIcon}>
                {token.logoBase64 ? (
                  <Image
                    src={`data:image/png;base64,${token.logoBase64}`}
                    alt={token.name}
                    width={32}
                    height={32}
                    className={s.logo}
                  />
                ) : (
                  <Icon icon="hugeicons:coins-01" />
                )}
              </div>

              <div className={s.tokenDetails}>
                <div className={s.tokenName}>
                  <span className={s.name}>{token.name}</span>
                  <span className={s.symbol}>({token.symbol})</span>
                </div>
                <div className={s.tokenMeta}>
                  <span className={s.supply}>
                    {Number(token.totalSupply).toLocaleString()} {token.symbol}
                  </span>
                  <span className={s.time}>
                    {formatDistanceToNow(new Date(token.timestamp), {
                      addSuffix: true
                    })}
                  </span>
                </div>
              </div>
            </div>

            <div className={s.tokenActions}>
              <Button
                variant="secondary"
                size="xsmall"
                onClick={() => handleCopyAddress(token.address)}
                iconLeft="hugeicons:copy-01"
                title="Copy address"
              />
              <Button
                variant="secondary"
                size="xsmall"
                onClick={() => handleAddToWallet(token)}
                iconLeft="hugeicons:wallet-01"
                title="Add to wallet"
              />
              <Button
                variant="secondary"
                size="xsmall"
                onClick={() => handleViewTransaction(token.txHash)}
                iconLeft="hugeicons:search-02"
                title="View transaction"
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
