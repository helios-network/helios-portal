"use client"

import { useAccount } from "wagmi"
import s from "./VoteResults.module.scss"
import { Icon } from "@/components/icon"
import { Heading } from "@/components/heading"
import { Card } from "@/components/card"
import { Blocks } from "@/components/blocks"
import { Badge } from "@/components/badge"
import { truncateAddress } from "@/lib/utils"

export interface VoteResult {
  voter: string
  voteType: "voted for" | "voted against"
  amount: string
}

interface VoteResultsProps {
  forVotes: string
  againstVotes: string
  quorum: string
  status: "EXECUTED" | "DEFEATED"
  endDate: string
  voters: VoteResult[]
}

const formatNumber = (numStr: string, maxFraction = 2) => {
  const num = Number.parseFloat(numStr)
  return Number.isFinite(num)
    ? num.toLocaleString(undefined, { maximumFractionDigits: maxFraction })
    : "0"
}

export function VoteResults({
  forVotes,
  againstVotes,
  quorum, // eslint-disable-line @typescript-eslint/no-unused-vars
  status,
  endDate,
  voters
}: VoteResultsProps) {
  const totalVotes = Number.parseFloat(forVotes) + Number.parseFloat(againstVotes)
  const forPercentage = totalVotes === 0 ? 0 : (Number.parseFloat(forVotes) / totalVotes) * 100
  const againstPercentage = totalVotes === 0 ? 0 : (Number.parseFloat(againstVotes) / totalVotes) * 100
  const abstainPercentage = Math.max(0, 100 - forPercentage - againstPercentage)

  const { isConnected } = useAccount() // eslint-disable-line @typescript-eslint/no-unused-vars

  return (
    <Card className={s.voteResults} auto>
      <Heading icon="hugeicons:chart-01" title="Proposal Votes" />

      <p className={s.description}>Community voting breakdown for this proposal.</p>

      <Blocks
        items={[
          {
            title: "For",
            value: `${formatNumber(forVotes)} shares`,
            bottom: `${forPercentage.toFixed(1)}%`,
            color: "success"
          },
          {
            title: "Against",
            value: `${formatNumber(againstVotes)} shares`,
            bottom: `${againstPercentage.toFixed(1)}%`,
            color: "danger"
          }
        ]}
      />

      <div className={s.progressContainer}>
        <div className={s.progressBar}>
          <div className={s.forBar} style={{ width: `${forPercentage}%` }} />
          <div className={s.abstainBar} style={{ width: `${abstainPercentage}%` }} />
          <div className={s.againstBar} style={{ width: `${againstPercentage}%` }} />
        </div>
      </div>

      <div className={s.meta}>
        <Badge status={status === "EXECUTED" ? "success" : "danger"}>{status}</Badge>
        <span className={s.metaDivider}>·</span>
        <span className={s.endDate}>End {endDate}</span>
      </div>

      <div className={s.votersSection}>
        <div className={s.votersHeader}>
          <div className={s.votersTitle}>
            <Icon icon="mdi:account-multiple-outline" width={18} height={18} />
            Voters ({voters.length})
          </div>
        </div>

        <div className={s.votersList}>
          {voters.map((voter) => (
            <div key={voter.voter} className={s.voterItem}>
              <div className={s.voterInfo}>
                <div className={s.avatar}>
                  <Icon icon="mdi:account-circle-outline" width={24} height={24} />
                </div>
                <span className={s.voterAddress}>{truncateAddress(voter.voter, 6, 6)}</span>
                <span className={`${s.voteType} ${voter.voteType === "voted for" ? s.votedFor : s.votedAgainst}`}>
                  <Icon
                    icon={voter.voteType === "voted for" ? "mdi:thumb-up-outline" : "mdi:thumb-down-outline"}
                    width={14}
                    height={14}
                  />
                  {voter.voteType}
                </span>
              </div>
              <span className={s.voteAmount}>{formatNumber(voter.amount)} HLS</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
