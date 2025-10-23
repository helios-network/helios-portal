"use client"

import { Card } from "@/components/card"
import { Heading } from "@/components/heading"
import { Message } from "@/components/message"
import { Button } from "@/components/button"
import { toast } from "sonner"
import { useVotingHistoryContext } from "@/context/VotingHistoryContext"
import s from "./voting-history.module.scss"
import { VoteItem } from "./vote-item"

export const VotingHistory = () => {
    const { votingHistory, clearHistory } = useVotingHistoryContext()

    const handleClearHistory = () => {
        clearHistory()
        toast.success("Voting history cleared")
    }

    return (
        <Card className={s.history} auto>
            <div className={s.header}>
                <Heading icon="hugeicons:clock-04" title="Your Voting History" />
                {votingHistory.length > 0 && (
                    <Button
                        variant="secondary"
                        size="xsmall"
                        onClick={handleClearHistory}
                        iconLeft="hugeicons:delete-02"
                    >
                        Clear
                    </Button>
                )}
            </div>

            {votingHistory.length === 0 ? (
                <div className={s.empty}>
                    <p className={s.emptyText}>No voting history yet</p>
                    <p className={s.emptySubtext}>
                        Your votes on proposals will appear here
                    </p>
                </div>
            ) : (
                <div className={s.list}>
                    {votingHistory.map((item) => (
                        <VoteItem key={`${item.proposalId}-${item.timestamp}`} item={item} />
                    ))}
                </div>
            )}

            <Message
                title="Voting Power Delegation"
                icon="hugeicons:information-circle"
                variant="warning"
            >
                When you stake with a validator, your voting power is delegated to them
                by default. You can override this by voting directly on proposals, which
                will supersede your validator&apos;s vote.
            </Message>
        </Card>
    )
}