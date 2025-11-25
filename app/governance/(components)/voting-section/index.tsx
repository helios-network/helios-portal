"use client"

import { Badge } from "@/components/badge"
import { Blocks } from "@/components/blocks"
import { Button } from "@/components/button"
import { Icon } from "@/components/icon"
import { Link } from "@/components/link"
import { Modal } from "@/components/modal"
import { Message } from "@/components/message"
import { useVote } from "@/hooks/useVote"
import { useUserVote, getVoteOptionName, getVoteOptionColor } from "@/hooks/useUserVote"
import { useProposalDelegations } from "@/hooks/useProposalDelegations"
import { formatNumber, formatTokenAmount } from "@/lib/utils/number"
import clsx from "clsx"
import { useEffect, useState, useMemo } from "react"
import { toast } from "sonner"
import { useAccount } from "wagmi"
import { useAppKit } from "@reown/appkit/react"
import { useVotingHistoryContext } from "@/context/VotingHistoryContext"
import { ethers } from "ethers"
import styles from "./voting-section.module.scss"
import moment from "moment"

interface Deposit {
  denom: string
  amount: string
}

interface VotingSectionProps {
  proposalId: number
  status: string
  votingEndTime: Date
  description?: string
  proposer?: string
  proposerAddress?: string
  submittedDate?: Date
  participation?: string
  title?: string
  totalDeposit?: Deposit[]
  details?: any[]
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

// Helper function to format deposit amounts
const formatDepositAmount = (amount: string, decimals: number = 18): string => {
  try {
    const bn = BigInt(amount)
    const divisor = BigInt(10 ** decimals)
    const formatted = Number(bn) / Number(divisor)
    return formatTokenAmount(formatted)
  } catch {
    return amount
  }
}

// Helper function to format field names (camelCase to Title Case)
const formatFieldName = (field: string): string => {
  return field
    .replace(/^@/, '')
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())
    .trim()
}

// Helper function to format field values
const formatFieldValue = (value: any): string | React.ReactNode => {
  if (typeof value === 'string') {
    // Remove leading slash if present
    const cleaned = value.startsWith('/') ? value.substring(1) : value
    return cleaned
  }
  if (typeof value === 'number') {
    return value.toLocaleString('en-US')
  }
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No'
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]'
    if (typeof value[0] === 'object') {
      return value.length + ' item(s)'
    }
    return value.join(', ')
  }
  if (typeof value === 'object' && value !== null) {
    return '[object Object]'
  }
  return String(value)
}

const formatDate = (date: Date): string => {
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  })
}

export function VotingSection({
  proposalId,
  status,
  votingEndTime,
  title,
  description = "Lorem ipsum dolor sit amet consectetur adipisicing elit. Est, velit, labore dolore alias sequi nam ullam saepe facere iusto quas voluptatem et doloribus aliquam tempore.",
  proposer = "Helios Guardian",
  proposerAddress,
  submittedDate = new Date("Apr 17, 2025"),
  participation = "45.67%",
  totalDeposit,
  details
}: VotingSectionProps) {
  const { address, isConnected } = useAccount()
  const { open: openLoginModal } = useAppKit()
  const { vote, feedback, resetFeedback, isLoading } = useVote()
  const { addVote } = useVotingHistoryContext()
  const { data: userVote, refetch: refetchUserVote } = useUserVote(proposalId)
  const { delegations } = useProposalDelegations()
  const [selectedVote, setSelectedVote] = useState<VoteOption | null>(null)
  const [voteMetadata, setVoteMetadata] = useState("")
  const [hasVoted, setHasVoted] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showJsonView, setShowJsonView] = useState(false)

  // Calculate voting power from delegations
  const votingPower = useMemo(() => {
    if (!delegations || delegations.length === 0) {
      return 0
    }

    // Total voting power from shares
    return delegations.reduce((sum, d) => {
      return sum + parseFloat(ethers.formatUnits(d.shares, 18))
    }, 0)
  }, [delegations])

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

      // Refetch user vote to update the display
      await refetchUserVote()

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
    status === "VOTING_PERIOD" && moment().isBefore(votingEndTime)

  const getStatusInfo = () => {
    if (status === "DEPOSIT_PERIOD") {
      return {
        message: "Voting has not started yet",
        variant: "warning" as const,
        icon: "hugeicons:clock-03",
        title: "Pending"
      }
    }
    if (status === "VOTING_PERIOD" && moment().isAfter(votingEndTime)) {
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

          {/* Total Deposit Section */}
          {totalDeposit && totalDeposit.length > 0 && (
            <div className={styles.info}>
              <h3>Total Deposit</h3>
              <div className={styles.depositList}>
                {totalDeposit.map((deposit, index) => (
                  <div key={index} className={styles.depositItem}>
                    <span className={styles.depositAmount}>
                      {formatDepositAmount(deposit.amount)}
                    </span>
                    <span className={styles.depositDenom}>HLS</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Proposal Details Section */}
          {details && details.length > 0 && (
            <div className={styles.info}>
              <div className={styles.detailsHeaderTop}>
                <h3>Proposal Details</h3>
                <Button
                  onClick={() => setShowJsonView(!showJsonView)}
                  className={styles.toggleButton}
                  size="xsmall"
                  iconLeft={showJsonView ? "hugeicons:file-01" : "hugeicons:code"}
                >
                  {showJsonView ? "Show Details" : "Show JSON"}
                </Button>
              </div>

              {showJsonView ? (
                <div className={styles.jsonView}>
                  <div className={styles.jsonHeader}>
                    <span className={styles.jsonLabel}>Raw JSON Format</span>
                  </div>
                  <pre className={styles.jsonCode}>{JSON.stringify(details, null, 2).replace(/^\[\n\s*/, '').replace(/\n\s*\]$/, '')}</pre>
                </div>
              ) : (
                <div className={styles.detailsList}>
                  {details.map((detail, index) => (
                    <div key={index} className={styles.detailItem}>
                      {detail['@type'] && (
                        <div className={styles.detailType}>
                          <span className={styles.detailTypeLabel}>Type:</span>
                          <span className={styles.detailTypeValue}>{detail['@type']}</span>
                        </div>
                      )}
                      {detail.title && (
                        <div className={styles.detailType}>
                          <span className={styles.detailTypeLabel}>Title:</span>
                          <span className={styles.detailTypeValue}>{detail['title']}</span>
                        </div>
                      )}
                      {detail.description && (
                        <div className={styles.detailType}>
                          <span className={styles.detailTypeLabel}>Description:</span>
                          <span className={styles.detailTypeValue}>{detail.description}</span>
                        </div>
                      )}
                      {detail.msg && Object.keys(detail.msg).length > 0 && (
                        <div className={styles.detailDenoms}>
                          <table className={styles.detailTable}>
                            <tbody>
                              {Object.entries(detail.msg).map(([key, value]) => (
                                <tr key={key} className={styles.tableRow}>
                                  <td className={styles.tableKey}>
                                    {formatFieldName(key)}
                                  </td>
                                  <td className={styles.tableValue}>
                                    {formatFieldValue(value)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {!detail.msg && Object.keys(detail).length > 0 && (
                        <div className={styles.detailDenoms}>
                          <table className={styles.detailTable}>
                            <tbody>
                              {Object.entries(detail).map(([key, value]) => {
                                if (key === 'messages' && Array.isArray(value)) {
                                  return (
                                    <tr key={key} className={styles.tableRow}>
                                      <td className={styles.tableKey}>
                                        {formatFieldName(key)}
                                      </td>
                                      <td className={styles.tableValue}>
                                        <div className={styles.nestedObject}>
                                          {value.map((msg, msgIndex) => (
                                            <table key={msgIndex} className={styles.nestedTable}>
                                              <tbody>
                                                {Object.entries(msg).map(([msgKey, msgValue]) => (
                                                  <tr key={msgKey} className={styles.nestedTableRow}>
                                                    <td className={styles.nestedTableKey}>
                                                      {formatFieldName(msgKey)}
                                                    </td>
                                                    <td className={styles.nestedTableValue}>
                                                      {typeof msgValue === 'object' && msgValue !== null ? (
                                                        <details className={styles.expandable}>
                                                          <summary>{Array.isArray(msgValue) ? 'Array' : 'Object'}</summary>
                                                          <pre className={styles.expandedContent}>{JSON.stringify(msgValue, null, 2)}</pre>
                                                        </details>
                                                      ) : (
                                                        formatFieldValue(msgValue)
                                                      )}
                                                    </td>
                                                  </tr>
                                                ))}
                                              </tbody>
                                            </table>
                                          ))}
                                        </div>
                                      </td>
                                    </tr>
                                  )
                                }
                                return (
                                  <tr key={key} className={styles.tableRow}>
                                    <td className={styles.tableKey}>
                                      {formatFieldName(key)}
                                    </td>
                                    <td className={styles.tableValue}>
                                      {formatFieldValue(value)}
                                    </td>
                                  </tr>
                                )
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}

                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

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
              <p>{formatDate(submittedDate)}</p>
            </div>
            <div className={styles.info}>
              <h3>Voting Ends On</h3>
              <p>{formatDate(votingEndTime)}</p>
            </div>

          </div>

          {/* User Vote Status */}
          {isConnected && userVote && userVote.options && userVote.options.length > 0 && (
            <div className={styles.userVoteStatus}>
              <div className={styles.voteStatusHeader}>
                <Icon
                  icon="hugeicons:check-circle"
                  width={20}
                  height={20}
                  className={styles.voteStatusIcon}
                />
                <h3>Your Current Voting Status</h3>
              </div>

              <Blocks
                items={userVote.options.map((option) => {
                  const optionName = getVoteOptionName(option.option)
                  const weightPercent = (parseFloat(option.weight) * 100).toFixed(2)
                  const voteColor = getVoteOptionColor(option.option)

                  return {
                    title: optionName,
                    value: (
                      <div className={styles.voteValueWrapper}>
                        <span
                          className={styles.voteOptionDot}
                          style={{ backgroundColor: voteColor }}
                        />
                        <span>{weightPercent}%</span>
                      </div>
                    ),
                    bottom: `Weight: ${option.weight}`,
                    color: option.option === 1 ? "success" : option.option === 3 ? "danger" : "primary"
                  }
                })}
                className={styles.voteBlocks}
              />

              {userVote.metadata && (
                <div className={styles.voteMetadataDisplay}>
                  <div className={styles.metadataHeader}>
                    <Icon icon="hugeicons:message-01" width={16} height={16} />
                    <span className={styles.voteMetadataLabel}>Your Comment</span>
                  </div>
                  <p className={styles.voteMetadataText}>{userVote.metadata}</p>
                </div>
              )}
            </div>
          )}

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
              {(hasVoted || userVote) ? "Change my vote" : "Cast Vote"}
            </Button>
          )}

          <Modal
            open={showModal}
            onClose={() => setShowModal(false)}
            title={(hasVoted || userVote) ? "Change my vote" : "Cast your vote"}
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
              <span>Your Voting Power:</span> <strong>{formatNumber(votingPower, 2)} votes</strong>
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
