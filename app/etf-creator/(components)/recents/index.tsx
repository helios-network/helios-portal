"use client"

import { Card } from "@/components/card"
import { Heading } from "@/components/heading"
import { Icon } from "@/components/icon"
import { Button } from "@/components/button"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"
import {
    useRecentETFsContext
} from "@/context/RecentETFsContext"
import s from "./recents.module.scss"

export const ETFCreatorRecents = () => {
    const { recentETFs, clearETFs } = useRecentETFsContext()

    const handleCopyAddress = (address: string) => {
        navigator.clipboard.writeText(address)
        toast.success("Address copied to clipboard")
    }

    const handleViewTransaction = (txHash: string) => {
        window.open(`https://explorer.helioschainlabs.org/tx/${txHash}`, "_blank")
    }

    const handleViewBasket = (address: string) => {
        window.open(
            `https://explorer.helioschainlabs.org/address/${address}`,
            "_blank"
        )
    }

    const clearRecents = () => {
        clearETFs()
        toast.success("Recent ETF baskets cleared")
    }

    if (recentETFs.length === 0) {
        return (
            <Card className={s.recents}>
                <Heading
                    icon="hugeicons:clock-01"
                    title="Recent ETF Baskets"
                    description="Your recently created ETF baskets will appear here"
                />

                <div className={s.empty}>
                    <Icon icon="hugeicons:package" className={s.emptyIcon} />
                    <p className={s.emptyText}>No ETF baskets created yet</p>
                    <p className={s.emptySubtext}>
                        Create your first ETF basket to see it here
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
                    title="Recent ETF Baskets"
                    description={`${recentETFs.length} basket${recentETFs.length !== 1 ? "s" : ""
                        } created`}
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
                {recentETFs.map((etf, index) => (
                    <div key={`${etf.address}-${index}`} className={s.etf}>
                        <div className={s.etfInfo}>
                            <div className={s.etfIcon}>
                                <Icon icon="hugeicons:package" />
                            </div>

                            <div className={s.etfDetails}>
                                <div className={s.etfName}>
                                    <span className={s.name}>{etf.name}</span>
                                    <span className={s.symbol}>({etf.symbol})</span>
                                </div>
                                <div className={s.etfMeta}>
                                    <span className={s.tokens}>
                                        {etf.tokens.length} token{etf.tokens.length !== 1 ? "s" : ""}
                                    </span>
                                    <span className={s.time}>
                                        {formatDistanceToNow(new Date(etf.timestamp), {
                                            addSuffix: true
                                        })}
                                    </span>
                                </div>
                                <div className={s.tokensList}>
                                    {etf.tokens.map((token, idx) => (
                                        <span key={idx} className={s.tokenBadge}>
                                            {token.symbol} {token.percentage}%
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className={s.etfActions}>
                            <Button
                                variant="secondary"
                                size="xsmall"
                                onClick={() => handleCopyAddress(etf.address)}
                                iconLeft="hugeicons:copy-01"
                                title="Copy address"
                            />
                            <Button
                                variant="secondary"
                                size="xsmall"
                                onClick={() => handleViewBasket(etf.address)}
                                iconLeft="hugeicons:view"
                                title="View basket"
                            />
                            <Button
                                variant="secondary"
                                size="xsmall"
                                onClick={() => handleViewTransaction(etf.txHash)}
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