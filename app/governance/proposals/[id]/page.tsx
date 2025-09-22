import BackSection from "@/components/back"
import { VoteResult, VoteResults } from "@/components/voteresults"
import { request } from "@/helpers/request"
import { truncateAddress } from "@/lib/utils"
import { notFound } from "next/navigation"
import { VotingSection } from "../../(components)/voting-section"
import { DelegationWrapper } from "./delegation-wrapper"
import { Icon } from "@/components/icon"
import { Link } from "@/components/link"
import styles from "./proposal.module.scss"
import { Power } from "../../(components)/power"
import { Heading } from "@/components/heading"

interface TallyResult {
  yes_count: string
  no_count: string
  abstain_count: string
  no_with_veto_count: string
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
      currentTallyResult
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
      currentTallyResult
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

  // Format votes for VoteResults component
  const forVotes = (Number(yesVotes) / 1e18).toFixed(2) // Assuming 18 decimals
  const againstVotes = (Number(noVotes) / 1e18).toFixed(2)
  const quorum = "4,000,000" // Replace with actual quorum data

  return (
    <>
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
                <Heading icon="hugeicons:file-01" title={proposal.title} />
                <span
                  className={
                    styles.statusBadge +
                    " " +
                    (styles[proposal.status.toLowerCase()] || "")
                  }
                >
                  <Icon
                    icon={
                      proposal.status === "EXECUTED"
                        ? "mdi:check-circle-outline"
                        : proposal.status === "REJECTED"
                          ? "mdi:close-circle-outline"
                          : "mdi:clock-outline"
                    }
                    width={18}
                    height={18}
                  />
                  {proposal.status}
                </span>
              </div>
              <div className={styles.metaGrid}>
                <div className={styles.metaItem}>
                  <Icon
                    icon="mdi:account-circle-outline"
                    width={18}
                    height={18}
                  />
                  <span className={styles.metaLabel}>Proposer:</span>
                  <Link
                    href={`https://explorer.helioschainlabs.org/address/${proposal.proposer}`}
                    className={styles.proposerLink}
                    title="View on Helios Explorer"
                  >
                    {truncateAddress(proposal.proposer)}
                  </Link>
                </div>
                <div className={styles.metaItem}>
                  <Icon icon="mdi:calendar-start" width={18} height={18} />
                  <span className={styles.metaLabel}>Start:</span>
                  <span className={styles.metaValue}>
                    {new Date(proposal.votingStartTime).toLocaleString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "numeric",
                        minute: "2-digit",
                        second: "2-digit",
                        hour12: true
                      }
                    )}
                  </span>
                </div>
                <div className={styles.metaItem}>
                  <Icon icon="mdi:calendar-end" width={18} height={18} />
                  <span className={styles.metaLabel}>End:</span>
                  <span className={styles.metaValue}>
                    {new Date(proposal.votingEndTime).toLocaleString("en-US", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "numeric",
                      minute: "2-digit",
                      second: "2-digit",
                      hour12: true
                    })}
                  </span>
                </div>
              </div>
              <div className={styles.votingSectionWrapper}>
                <VotingSection
                  proposalId={proposal.id}
                  status={proposal.status}
                  votingEndTime={proposal.votingEndTime}
                />
              </div>
              <div className={styles.summary}>
                <h2>
                  <Icon icon="mdi:note-text-outline" width={20} height={20} />{" "}
                  Summary
                </h2>
                <p>{proposal.summary}</p>
              </div>
            </div>
          </div>
          {/* Right side - VoteResults Component */}
          <div className={styles.leftPanel}>
            <VoteResults
              forVotes={forVotes}
              againstVotes={againstVotes}
              quorum={quorum}
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
    </>
  )
}
