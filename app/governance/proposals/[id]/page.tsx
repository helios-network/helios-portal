import BackSection from "@/components/back"
import { VoteResult, VoteResults } from "@/components/voteresults"
import { request } from "@/helpers/request"
import { notFound } from "next/navigation"
import { VotingSection } from "../../(components)/voting-section"
import { VotingHistoryProvider } from "@/context/VotingHistoryContext"
import styles from "./proposal.module.scss"
import { Power } from "../../(components)/power"
import { Heading } from "@/components/heading"

interface TallyResult {
  yes_count: string
  no_count: string
  abstain_count: string
  no_with_veto_count: string
}

interface Deposit {
  denom: string
  amount: string
}

interface ProposalDetail {
  denoms: string[]
  type: string
}

interface ProposalData {
  id: number
  proposer: string
  title: string
  summary: string
  status: string
  votingStartTime: string
  votingEndTime: string
  finalTallyResult: TallyResult
  currentTallyResult: TallyResult
  totalDeposit?: Deposit[]
  details?: ProposalDetail[]
}

async function fetchProposalDetail(id: string): Promise<ProposalData | null> {
  try {
    const result = await request<any>("eth_getProposal", [
      `0x${parseInt(id, 10).toString(16)}`
    ])

    if (!result) return null

    const {
      id: pid,
      proposer,
      title,
      summary,
      status,
      votingStartTime,
      votingEndTime,
      finalTallyResult,
      currentTallyResult,
      totalDeposit,
      details
    } = result

    return {
      id: pid,
      proposer,
      title,
      summary,
      status,
      votingStartTime,
      votingEndTime,
      finalTallyResult,
      currentTallyResult,
      totalDeposit,
      details
    }
  } catch (err) {
    console.error("Error fetching proposal:", err)
    return null
  }
}

const Voters: VoteResult[] = []

export default async function ProposalDetail({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const proposal = await fetchProposalDetail(id)
  if (!proposal) return notFound()

  const yesVotes = BigInt(proposal.currentTallyResult.yes_count || "0")
  const noVotes = BigInt(proposal.currentTallyResult.no_count || "0")
  const abstainVotes = BigInt(proposal.currentTallyResult.abstain_count || "0")
  const vetoVotes = BigInt(proposal.currentTallyResult.no_with_veto_count || "0")

  // Format votes for VoteResults component
  const forVotes = (Number(yesVotes) / 1e18).toFixed(2) // Assuming 18 decimals
  const againstVotes = (Number(noVotes) / 1e18).toFixed(2)
  const abstainVotesFormatted = (Number(abstainVotes) / 1e18).toFixed(2)
  const vetoVotesFormatted = (Number(vetoVotes) / 1e18).toFixed(2)
  // const quorum = "4,000,000" // Replace with actual quorum data

  return (
    <VotingHistoryProvider>
      <BackSection isVisible={true} />
      <div className={styles.container}>
        <div className={styles.powerSection}>
          <Power />
        </div>
        <div className={styles.layout}>
          {/* Left side - Proposal Details */}
          <div className={styles.rightPanel}>
            <div className={styles.card}>
              <div className={styles.header}>
                <Heading icon="hugeicons:file-01" title={"Proposal Detail"} />
              </div>

              <div className={styles.votingSectionWrapper}>
                <VotingSection
                  proposalId={proposal.id}
                  status={proposal.status}
                  votingEndTime={new Date(proposal.votingEndTime).toLocaleString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: false
                  })}
                  title={proposal.title}
                  description={proposal.summary}
                  proposer={proposal.proposer} // Show full address as proposer name
                  proposerAddress={proposal.proposer}
                  submittedDate={new Date(proposal.votingStartTime).toLocaleString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: false
                  })}
                  participation="45.67%" // You can calculate this from actual data
                  totalDeposit={proposal.totalDeposit}
                  details={proposal.details}
                />
              </div>
            </div>
          </div>
          {/* Right side - VoteResults Component */}
          <div className={styles.leftPanel}>
            <VoteResults
              forVotes={forVotes}
              againstVotes={againstVotes}
              abstainVotes={abstainVotesFormatted}
              vetoVotes={vetoVotesFormatted}
              status={proposal.status as "EXECUTED" | "DEFEATED"}
              endDate={new Date(proposal.votingEndTime).toLocaleDateString(
                "en-US",
                {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit"
                }
              )}
              voters={Voters}
            />
          </div>
        </div>
      </div>
    </VotingHistoryProvider>
  )
}
