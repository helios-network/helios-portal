import { Badge } from "@/components/badge"
import { Icon } from "@/components/icon"
import { STATUS_CONFIG, VOTE_CONFIG } from "@/config/vote"
import { type VotedProposal } from "@/context/VotingHistoryContext"
import { formatDistanceToNow } from "date-fns"
import clsx from "clsx"
import s from "./voting-history.module.scss"
import { useRouter } from "next/navigation"

export const VoteItem = ({ item }: { item: VotedProposal }) => {
    const router = useRouter()
    const { color, icon } = STATUS_CONFIG[item.status]
    const { color: voteColor, icon: voteIcon } = VOTE_CONFIG[item.vote]

    const handleClick = () => {
        router.push(`/governance/proposals/${item.proposalId}`)
    }

    return (
        <div className={clsx(s.item, s[item.status])} onClick={handleClick}>
            <div className={s.top}>
                <Badge status={color} icon={icon}>
                    {item.status}
                </Badge>
                <div className={s.proposalId}>#{item.proposalId}</div>
                <time dateTime={new Date(item.timestamp).toISOString()} className={s.date}>
                    <Icon icon="hugeicons:clock-04" />
                    {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                </time>
                <div className={s.vote} data-color={voteColor}>
                    <Icon icon={voteIcon} />
                    Voted {item.vote}
                </div>
            </div>
            <h3 className={s.name}>{item.proposalTitle}</h3>
            {item.metadata && (
                <p className={s.metadata}>{item.metadata}</p>
            )}
        </div>
    )
}