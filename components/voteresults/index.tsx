"use client"

import { Badge } from "@/components/badge"
import { Icon } from "@/components/icon"
// import { Progress } from "@/components/progress"
import { RechartsPie, RechartsPieLegend } from "@/components/recharts/pie"
import { truncateAddress } from "@/lib/utils"
import { useAccount } from "wagmi"
import s from "./VoteResults.module.scss"
import { Heading } from "@/components/heading"

export interface VoteResult {
  voter: string
  voteType: "voted for" | "voted against" | "abstain" | "veto"
  amount: string
}

interface VoteResultsProps {
  forVotes: string
  againstVotes: string
  abstainVotes?: string
  vetoVotes?: string
  status: "EXECUTED" | "DEFEATED" | "VOTING_PERIOD"
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
  abstainVotes = "0",
  vetoVotes = "0",
  status,
  endDate,
  voters
}: VoteResultsProps) {
  const forVotesNum = Number.parseFloat(forVotes)
  const againstVotesNum = Number.parseFloat(againstVotes)
  const abstainVotesNum = Number.parseFloat(abstainVotes)
  const vetoVotesNum = Number.parseFloat(vetoVotes)

  const totalVotes = forVotesNum + againstVotesNum + abstainVotesNum + vetoVotesNum

  // Calculate raw percentages
  const rawForPercentage = totalVotes === 0 ? 0 : (forVotesNum / totalVotes) * 100
  const rawAgainstPercentage = totalVotes === 0 ? 0 : (againstVotesNum / totalVotes) * 100
  const rawAbstainPercentage = totalVotes === 0 ? 0 : (abstainVotesNum / totalVotes) * 100
  const rawVetoPercentage = totalVotes === 0 ? 0 : (vetoVotesNum / totalVotes) * 100

  // Apply minimum 1% for pie chart display, but keep original percentages for legend
  const forPercentage = rawForPercentage === 0 ? 1 : rawForPercentage
  const againstPercentage = rawAgainstPercentage === 0 ? 1 : rawAgainstPercentage
  const abstainPercentage = rawAbstainPercentage === 0 ? 1 : rawAbstainPercentage
  const vetoPercentage = rawVetoPercentage === 0 ? 1 : rawVetoPercentage

  const { isConnected } = useAccount() // eslint-disable-line @typescript-eslint/no-unused-vars

  // Prepare data for pie chart
  const votes = [
    {
      name: "yes",
      icon: "hugeicons:thumbs-up",
      color: "#10b981",
      description: "Vote in favor of this proposal.",
      value: forVotesNum,
      price: forPercentage, // Use percentage for pie sizing
      percentage: rawForPercentage, // Use raw percentage for legend display
      displayPercentage: forPercentage // Use adjusted percentage for pie chart
    },
    {
      name: "no",
      icon: "hugeicons:thumbs-down",
      color: "#ef4444",
      description: "Vote against this proposal.",
      value: againstVotesNum,
      price: againstPercentage, // Use percentage for pie sizing
      percentage: rawAgainstPercentage, // Use raw percentage for legend display
      displayPercentage: againstPercentage // Use adjusted percentage for pie chart
    },
    {
      name: "abstain",
      icon: "hugeicons:pause",
      color: "#828db3",
      description: "Formally abstain from voting.",
      value: abstainVotesNum,
      price: abstainPercentage, // Use percentage for pie sizing
      percentage: rawAbstainPercentage, // Use raw percentage for legend display
      displayPercentage: abstainPercentage // Use adjusted percentage for pie chart
    },
    {
      name: "veto",
      icon: "hugeicons:information-circle",
      color: "#f97315",
      description: "Strong opposition that can block the proposal.",
      value: vetoVotesNum,
      price: vetoPercentage, // Use percentage for pie sizing
      percentage: rawVetoPercentage, // Use raw percentage for legend display
      displayPercentage: vetoPercentage // Use adjusted percentage for pie chart
    }
  ]

  // Calculate quorum progress
  // const quorumNum = Number.parseFloat(quorum.replace(/,/g, ''))
  // const quorumProgress = totalVotes > 0 ? Math.min((totalVotes / quorumNum) * 100, 100) : 0

  return (
    <div className={s.voteResults}>
      <Heading icon="hugeicons:chart-01" title="Proposal Votes" />

      <p className={s.description}>Community voting breakdown for this proposal.</p>
      <RechartsPie data={votes} className={s.pie} />
      <RechartsPieLegend data={votes} className={s.legend} />

      <div className={s.divider} />

      {/* <div className={s.progress} data-color="primary">
        <h3 className={s.progressTitle}>Quorum progress</h3>
        <Progress value={quorumProgress} max={100} />
        <div className={s.progressBottom}>
          <span>{quorumProgress.toFixed(1)}% of quorum</span>
          <span>{formatNumber(totalVotes.toString())} / {quorum}</span>
        </div>
      </div> */}

      <div className={s.meta}>
        <Badge
          className={s.statusBadge}
          status={
            status === "EXECUTED" ? "success" :
              status === "VOTING_PERIOD" ? "primary" :
                "danger"
          }
        >
          {status}
        </Badge>
        <span className={s.metaDivider}>·</span>
        <span className={s.endDate}>End {endDate}</span>
      </div>

      {voters.length > 0 && (
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
                  <span className={`${s.voteType} ${voter.voteType === "voted for" ? s.votedFor :
                    voter.voteType === "voted against" ? s.votedAgainst :
                      voter.voteType === "abstain" ? s.votedAbstain :
                        s.votedVeto
                    }`}>
                    <Icon
                      icon={
                        voter.voteType === "voted for" ? "mdi:thumb-up-outline" :
                          voter.voteType === "voted against" ? "mdi:thumb-down-outline" :
                            voter.voteType === "abstain" ? "mdi:pause" :
                              "mdi:information-outline"
                      }
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
      )}
    </div>
  )
}
