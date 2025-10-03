"use client"

import { Badge } from "@/components/badge"
import { Button } from "@/components/button"
import { Icon } from "@/components/icon"
import { Link } from "@/components/link"
import { Modal } from "@/components/modal"
import { Message } from "@/components/message"
import { useVote } from "@/hooks/useVote"
import clsx from "clsx"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { useAccount } from "wagmi"
import { useAppKit } from "@reown/appkit/react"
import { useVotingHistoryContext } from "@/context/VotingHistoryContext"
import styles from "./voting-section.module.scss"

interface VotingSectionProps {
  proposalId: number
  status: string
  votingEndTime: string
  description?: string
  proposer?: string
  proposerAddress?: string
  submittedDate?: string
  participation?: string
  title?: string
}

// Vote options enum matching your smart contract
enum VoteOption {
  YES = 1,
  ABSTAIN = 2,
  NO = 3,
  NO_WITH_VOTE = 4
}

// Status configuration for badges
const STATUS_CONFIG = {
  EXECUTED: {
    variant: "success" as const,
    icon: "hugeicons:check-circle",
    label: "Executed"
  },
  REJECTED: {
    variant: "danger" as const,
    icon: "hugeicons:close-circle",
    label: "Rejected"
  },
  VOTING_PERIOD: {
    variant: "primary" as const,
    icon: "hugeicons:clock-03",
    label: "Active"
  },
  DEPOSIT_PERIOD: {
    variant: "warning" as const,
    icon: "hugeicons:clock-03",
    label: "Pending"
  },
  PASSED: {
    variant: "success" as const,
    icon: "hugeicons:check-circle",
    label: "Passed"
  },
  FAILED: {
    variant: "danger" as const,
    icon: "hugeicons:close-circle",
    label: "Failed"
  }
} as const

const voteOptions = [
  {
    name: "yes",
    value: VoteOption.YES,
    icon: "hugeicons:thumbs-up",
    color: "#10b981",
    description: "Vote in favor of this proposal."
  },
  {
    name: "no",
    value: VoteOption.NO,
    icon: "hugeicons:thumbs-down",
    color: "#ef4444",
    description: "Vote against this proposal."
  },
  {
    name: "abstain",
    value: VoteOption.ABSTAIN,
    icon: "hugeicons:pause",
    color: "#828db3",
    description: "Formally abstain from voting."
  },
  {
    name: "veto",
    value: VoteOption.NO_WITH_VOTE,
    icon: "hugeicons:information-circle",
    color: "#f97315",
    description: "Strong opposition that can block the proposal."
  }
]

export function VotingSection({
  proposalId,
  status,
  votingEndTime,
  title,
  description = "Lorem ipsum dolor sit amet consectetur adipisicing elit. Est, velit, labore dolore alias sequi nam ullam saepe facere iusto quas voluptatem et doloribus aliquam tempore.",
  proposer = "Helios Guardian",
  proposerAddress,
  submittedDate = "Apr 17, 2025",
  participation = "45.67%"
}: VotingSectionProps) {
  const { address, isConnected } = useAccount()
  const { open: openLoginModal } = useAppKit()
  const { vote, feedback, resetFeedback, isLoading } = useVote()
  const { addVote } = useVotingHistoryContext()
  const [selectedVote, setSelectedVote] = useState<VoteOption | null>(null)
  const [voteMetadata, setVoteMetadata] = useState("")
  const [hasVoted, setHasVoted] = useState(false)
  const [showModal, setShowModal] = useState(false)

  const submitVote = async () => {
    if (!address || selectedVote === null) return

    try {
      await vote(proposalId, selectedVote, voteMetadata)

      // Map vote option to vote name
      const voteNameMap: Record<VoteOption, "yes" | "no" | "abstain" | "veto"> = {
        [VoteOption.YES]: "yes",
        [VoteOption.NO]: "no",
        [VoteOption.ABSTAIN]: "abstain",
        [VoteOption.NO_WITH_VOTE]: "veto"
      }

      // Determine status based on current proposal status
      let proposalStatus: "active" | "passed" | "rejected" = "active"
      if (status === "PASSED") proposalStatus = "passed"
      else if (status === "REJECTED" || status === "FAILED") proposalStatus = "rejected"
      else if (status === "VOTING_PERIOD") proposalStatus = "active"

      // Add vote to history
      addVote({
        proposalId,
        proposalTitle: title || `Proposal #${proposalId}`,
        vote: voteNameMap[selectedVote],
        voteOption: selectedVote,
        timestamp: Date.now(),
        status: proposalStatus,
        metadata: voteMetadata || undefined
      })

      setShowModal(false)
    } catch (error) {
      console.error("Error submitting vote:", error)
    }
  }

  // Handle toast notifications based on feedback status
  useEffect(() => {
    if (!feedback.message) return

    const handleToast = async () => {
      if (feedback.status === "primary" && isLoading) {
        toast.loading(feedback.message, { id: "vote-status" })
      } else if (feedback.status === "success") {
        toast.success(feedback.message, { id: "vote-status" })
        // Mark as voted but allow voting again
        setHasVoted(true)
        setVoteMetadata("")
        // Reset hasVoted after showing confirmation briefly
        setTimeout(() => setHasVoted(false), 3000)
      } else if (feedback.status === "danger") {
        toast.error(feedback.message, { id: "vote-status" })
      }

      // Reset feedback after handling
      setTimeout(() => resetFeedback(), 100)
    }

    handleToast()
  }, [feedback, isLoading, resetFeedback])

  const canVote =
    status === "VOTING_PERIOD" && new Date() < new Date(votingEndTime)

  const getStatusInfo = () => {
    if (status === "DEPOSIT_PERIOD") {
      return {
        message: "Voting has not started yet",
        variant: "warning" as const,
        icon: "hugeicons:clock-03",
        title: "Pending"
      }
    }
    if (status === "VOTING_PERIOD" && new Date() >= new Date(votingEndTime)) {
      return {
        message: "The voting period for this proposal has ended",
        variant: "warning" as const,
        icon: "hugeicons:clock-03",
        title: "Voting Ended"
      }
    }
    if (status === "EXECUTED") {
      return {
        message: "This proposal has been successfully executed",
        variant: "success" as const,
        icon: "hugeicons:check-circle",
        title: "Executed"
      }
    }
    if (status === "REJECTED") {
      return {
        message: "This proposal was rejected by the community",
        variant: "danger" as const,
        icon: "hugeicons:close-circle",
        title: "Rejected"
      }
    }
    return null
  }

  const statusInfo = getStatusInfo()

  const getStatusConfig = () => {
    return STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || {
      variant: "secondary" as const,
      icon: "hugeicons:information-circle",
      label: status.replace('_', ' ')
    }
  }

  return (
    <div className={styles.votingSection}>
      {/* Proposal Info Line */}
      <div className={styles.proposalInfo}>
        <div className={styles.titleSection}>
          <div className={styles.proposalTitle}>
            {title || "Untitled Proposal"}
          </div>
          <div className={styles.proposalId}>
            #{proposalId}
          </div>
        </div>
        <Badge
          status={getStatusConfig().variant}
          icon={getStatusConfig().icon}
          className={styles.statusBadge}
        >
          {getStatusConfig().label}
        </Badge>
      </div>

      <div className={styles.content}>
        <div className={styles.left}>
          <div className={clsx(styles.info, styles.max)}>
            <h3>Description</h3>
            <p>{description}</p>
          </div>

          <div className={styles.metadataGrid}>
            <div className={styles.info}>
              <h3>Proposer</h3>
              <p>
                {proposerAddress ? (
                  <Link href={`https://explorer.helioschainlabs.org/address/${proposerAddress}`} className={styles.proposerLink}>
                    <span>{proposerAddress}</span>
                    <Icon icon="hugeicons:link-circle-02" />
                  </Link>
                ) : (
                  proposer
                )}
              </p>
            </div>
            <div className={styles.info}>
              <h3>Participation</h3>
              <p>{participation}</p>
            </div>
            <div className={styles.info}>
              <h3>Submitted On</h3>
              <p>{submittedDate}</p>
            </div>
            <div className={styles.info}>
              <h3>Voting Ends On</h3>
              <p>{votingEndTime}</p>
            </div>

          </div>

          {hasVoted && (
            <div className={styles.voteConfirmation}>
              <Icon
                icon="mdi:check-circle"
                width={18}
                height={18}
                className={styles.confirmationIcon}
              />
              <span>Your vote has been successfully submitted!</span>
            </div>
          )}

          {!isConnected && canVote && (
            <div className={styles.walletPrompt}>
              <Icon
                icon="hugeicons:wallet-01"
                width={48}
                height={48}
                className={styles.walletIcon}
              />
              <h4 className={styles.promptTitle}>
                Connect Your Wallet
              </h4>
              <p className={styles.promptText}>
                To participate in governance voting, please connect your wallet.
              </p>
              <Button
                iconRight="hugeicons:wallet-01"
                onClick={() => openLoginModal()}
                className={styles.connectButton}
              >
                Connect Wallet
              </Button>
            </div>
          )}

          {canVote && isConnected && (
            <Button
              icon="hugeicons:add-to-list"
              onClick={() => setShowModal(true)}
              className={styles.voteButton}
            >
              {hasVoted ? "Change my vote" : "Cast Vote"}
            </Button>
          )}

          <Modal
            open={showModal}
            onClose={() => setShowModal(false)}
            title={hasVoted ? "Change my vote" : "Cast your vote"}
            className={styles.modal}
            responsiveBottom
          >
            <p>
              {title || `Proposal #${proposalId}`}
              <small>Voting ends {new Date(votingEndTime).toLocaleDateString()}</small>
            </p>

            <ul className={styles.voting}>
              {voteOptions.map((voteOption) => (
                <li
                  key={voteOption.name}
                  className={clsx(selectedVote === voteOption.value && styles.active)}
                  style={
                    { "--color": voteOption.color } as React.CSSProperties
                  }
                  onClick={() => setSelectedVote(voteOption.value)}
                >
                  <Icon icon={voteOption.icon} />
                  <div className={styles.votingContent}>
                    <strong>{voteOption.name}</strong>
                    <span>{voteOption.description}</span>
                  </div>
                </li>
              ))}
            </ul>

            <div className={styles.power}>
              <span>Your Voting Power:</span> <strong>12,500 votes</strong>
            </div>

            <div className={styles.metadataSection}>
              <label
                htmlFor="voteMetadata"
                className={styles.metadataLabel}
              >
                Vote Comment (Optional):
              </label>
              <textarea
                id="voteMetadata"
                className={styles.metadataInput}
                value={voteMetadata}
                onChange={(e) => setVoteMetadata(e.target.value)}
                placeholder="Add a comment about your vote..."
                rows={3}
                disabled={isLoading}
              />
            </div>

            <div className={styles.group}>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button
                className={styles.confirm}
                onClick={submitVote}
                icon="hugeicons:add-to-list"
                disabled={selectedVote === null || isLoading}
              >
                {isLoading ? "Submitting..." : "Submit Vote"}
              </Button>
            </div>
          </Modal>
        </div>
      </div>
      {statusInfo && (
        <Message
          variant={statusInfo.variant}
          icon={statusInfo.icon}
          title={statusInfo.title}
          className={styles.statusMessage}
        >
          {statusInfo.message}
        </Message>
      )}
    </div>
  )
}
