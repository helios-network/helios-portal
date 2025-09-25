"use client"

import BackSection from "@/components/back"
import { Heading } from "@/components/heading"
import { truncateAddress } from "@/lib/utils"
import { useRouter } from "next/navigation"
import React, { useState } from "react"
import { useAccount } from "wagmi"
import { ModalProposal } from "../(components)/proposal/modal"
import styles from "./page.module.scss"
import { useQuery } from "@tanstack/react-query"
import { getProposalsByPageAndSize, getProposalTotalCount } from "@/helpers/rpc-calls"
import { toHex } from "@/utils/number"
import { Badge } from "@/components/badge"
import { STATUS_CONFIG } from "@/config/vote"

interface ProposalData {
  id: string
  meta: string // "By <address>"
  proposer: string
  isHeliosOrg: boolean
  status: string
  submitDate: string
  votes: string
  title: string
  result: string
  resultClass: string
  voteFor: string
  voteAgainst: string
  voteAbstain: string
  voteNoWithVeto: string
  voteForPercent: string
  voteAgainstPercent: string
  voteAbstainPercent: string
  voteNoWithVetoPercent: string
  yesShort: string
  abstainShort: string
  noShort: string
  noWithVetoShort: string
  totalVotesFormatted: string
  totalAddresses: number
}

const AllProposals: React.FC = () => {
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(20)
  const { isConnected } = useAccount()
  const [isCreateLoading, setIsCreateLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)

  // Get total proposals count
  const { data: totalProposals = 0 } = useQuery({
    queryKey: ["proposalTotalCount"],
    queryFn: () => getProposalTotalCount(),
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false
  })

  // Get proposals for current page
  const { data: rawProposals = [], isLoading, error } = useQuery({
    queryKey: ["proposals", currentPage, pageSize],
    queryFn: () => getProposalsByPageAndSize(toHex(currentPage), toHex(pageSize)),
    enabled: !!currentPage && !!pageSize,
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false
  })

  // Calculate total pages
  const totalPages = Math.ceil((totalProposals || 0) / pageSize)
  const hasNextPage = currentPage < totalPages
  const hasPreviousPage = currentPage > 1

  // Transform raw proposals data
  const proposals: ProposalData[] = (rawProposals || []).map((item: any) => {
    const yes = BigInt(item.currentTallyResult?.yes_count || "0")
    const no = BigInt(item.currentTallyResult?.no_count || "0")
    const abstain = BigInt(item.currentTallyResult?.abstain_count || "0")
    const noWithVeto = BigInt(item.currentTallyResult?.no_with_veto_count || "0")

    const total = yes + no + abstain + noWithVeto
    const safeTotal = total === 0n ? 1n : total

    const voteForPercent = Number((yes * 100n) / safeTotal)
    const voteAgainstPercent = Number((no * 100n) / safeTotal)
    const voteAbstainPercent = Number((abstain * 100n) / safeTotal)
    const voteNoWithVetoPercent = Number((noWithVeto * 100n) / safeTotal)

    // Convert from smallest unit (assuming 18 decimals)
    const decimals = 18n
    const yesFormatted = (yes / 10n ** decimals).toString()
    const noFormatted = (no / 10n ** decimals).toString()
    const abstainFormatted = (abstain / 10n ** decimals).toString()
    const noWithVetoFormatted = (noWithVeto / 10n ** decimals).toString()

    // Short K/M display for right rail numbers
    const k = (n: bigint) => {
      const num = Number(n / 10n ** decimals)
      if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(2)}M`
      if (num >= 1_000) return `${(num / 1_000).toFixed(2)}K`
      return `${num.toFixed(2)}`
    }

    const totalVotesFormatted = k(total)

    const proposer: string = item.proposer || ""
    const isHeliosOrg =
      proposer.toLowerCase() === "0x69e073B013b209bb083d644CE05e706F17cfDE14".toLowerCase()

    return {
      id: item.id.toString(),
      meta: `By ${proposer}`,
      proposer,
      isHeliosOrg,
      status: `Ends: ${new Date(item.votingEndTime).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "2-digit"
      })}`,
      submitDate: new Date(item.submitTime).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "2-digit"
      }),
      votes: `${yesFormatted} For – ${noFormatted} Against – ${abstainFormatted} Abstain – ${noWithVetoFormatted} No with Vote`,
      title: item.title,
      result: item.status,
      resultClass:
        item.status === "PASSED"
          ? styles.executed
          : item.status === "REJECTED"
            ? styles.rejected
            : styles.voting_period,
      voteFor: `${yesFormatted}HLS`,
      voteAgainst: `${noFormatted}HLS`,
      voteAbstain: `${abstainFormatted}HLS`,
      voteNoWithVeto: `${noWithVetoFormatted}HLS`,
      voteForPercent: `${voteForPercent}%`,
      voteAgainstPercent: `${voteAgainstPercent}%`,
      voteAbstainPercent: `${voteAbstainPercent}%`,
      voteNoWithVetoPercent: `${voteNoWithVetoPercent}%`,
      yesShort: k(yes),
      abstainShort: k(abstain),
      noShort: k(no),
      noWithVetoShort: k(noWithVeto),
      totalVotesFormatted,
      totalAddresses: 0 // placeholder until backend integration
    }
  })

  const handleCreateProposal = () => {
    setIsCreateLoading(true)
    setTimeout(() => {
      setIsCreateLoading(false)
      setShowModal(true)
    }, 200)
  }

  // Handle page change
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage || isLoading) return
    setCurrentPage(page)
  }

  // Handle previous page
  const handlePrevious = () => {
    if (hasPreviousPage) {
      handlePageChange(currentPage - 1)
    }
  }

  // Handle next page
  const handleNext = () => {
    if (hasNextPage) {
      handlePageChange(currentPage + 1)
    }
  }

  // Pagination component
  const Pagination = () => {
    const getPageNumbers = () => {
      const pages = []
      const maxVisiblePages = 5

      let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

      // Adjust start if we're near the end
      if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1)
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i)
      }

      return pages
    }

    const pageNumbers = getPageNumbers()
    const showFirstPage = pageNumbers.length > 0 && pageNumbers[0] > 1
    const showLastPage = pageNumbers.length > 0 && pageNumbers[pageNumbers.length - 1] < totalPages
    const showFirstEllipsis = showFirstPage && pageNumbers[0] > 2
    const showLastEllipsis = showLastPage && pageNumbers[pageNumbers.length - 1] < totalPages - 1

    return (
      <div className={styles["pagination"]}>
        <button
          className={`${styles["pagination-btn"]} ${!hasPreviousPage ? styles.disabled : ""
            }`}
          onClick={handlePrevious}
          disabled={!hasPreviousPage || isLoading}
        >
          Previous
        </button>

        <div className={styles["page-numbers"]}>
          {showFirstPage && (
            <>
              <button
                className={styles["page-btn"]}
                onClick={() => handlePageChange(1)}
                disabled={isLoading}
              >
                1
              </button>
              {showFirstEllipsis && (
                <span className={styles["ellipsis"]}>...</span>
              )}
            </>
          )}

          {pageNumbers.map((page) => (
            <button
              key={page}
              className={`${styles["page-btn"]} ${page === currentPage ? styles.active : ""
                }`}
              onClick={() => handlePageChange(page)}
              disabled={isLoading}
            >
              {page}
            </button>
          ))}

          {showLastPage && (
            <>
              {showLastEllipsis && (
                <span className={styles["ellipsis"]}>...</span>
              )}
              <button
                className={styles["page-btn"]}
                onClick={() => handlePageChange(totalPages)}
                disabled={isLoading}
              >
                {totalPages}
              </button>
            </>
          )}
        </div>

        <button
          className={`${styles["pagination-btn"]} ${!hasNextPage ? styles.disabled : ""
            }`}
          onClick={handleNext}
          disabled={!hasNextPage || isLoading}
        >
          Next
        </button>
      </div>
    )
  }

  // Show loading state on initial load
  if (isLoading && proposals.length === 0) {
    return (
      <div className={styles["all-proposals"]}>
        <div className={styles.proposalContainer}>
          <Heading
            icon="material-symbols:library-books-outline"
            title="All Proposals"
            className={styles.sectionTitle}
          />
          {isConnected && (
            <button
              className={styles["create-proposal"]}
              onClick={handleCreateProposal}
              disabled={isCreateLoading}
            >
              {isCreateLoading ? (
                <>
                  <span className={styles.myloader}></span>Loading…
                </>
              ) : (
                "Create Proposal"
              )}
            </button>
          )}
        </div>
        <div className={styles["proposal-list"]}>
          <div className={styles.loader}>
            <p>Loading proposals...</p>
          </div>
        </div>
      </div>
    )
  }

  // Show error state if there's an error and no data loaded
  if (error && proposals.length === 0) {
    return (
      <div className={styles["all-proposals"]}>
        <div className={styles.proposalContainer}>
          <Heading
            icon="material-symbols:library-books-outline"
            title="All Proposals"
            className={styles.sectionTitle}
          />
          {isConnected && (
            <button
              className={styles["create-proposal"]}
              onClick={handleCreateProposal}
              disabled={isCreateLoading}
            >
              {isCreateLoading ? (
                <>
                  <span className={styles.myloader}></span>Loading…
                </>
              ) : (
                "Create Proposal"
              )}
            </button>
          )}
        </div>
        <div className={styles["proposal-list"]}>
          <div className={styles["error-state"]}>
            <h3>Failed to load proposals</h3>
            <p>{error.message}</p>
            <button
              className={styles["retry-button"]}
              onClick={() => window.location.reload()}
              disabled={isLoading}
            >
              {isLoading ? "Retrying..." : "Try Again"}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className={styles["all-proposals"]}>
        <div className={styles.proposalContainer}>
          <Heading
            icon="material-symbols:library-books-outline"
            title="All Proposals"
            className={styles.sectionTitle}
          />
          {isConnected && (
            <button
              className={styles["create-proposal"]}
              onClick={handleCreateProposal}
              disabled={isCreateLoading}
            >
              {isCreateLoading ? (
                <>
                  <span className={styles.myloader}></span>Loading…
                </>
              ) : (
                "Create Proposal"
              )}
            </button>
          )}
        </div>

        {/* Show error banner if there's an error but we have existing data */}
        {error && proposals.length > 0 && (
          <div className={styles["error-banner"]}>
            <p>{error.message}</p>
            <button
              className={styles["retry-button-small"]}
              onClick={() => window.location.reload()}
              disabled={isLoading}
            >
              Retry
            </button>
          </div>
        )}

        {/* Proposal count and pagination info */}
        {proposals.length > 0 && (
          <div className={styles["proposal-stats"]}>
            <div className={styles["stats-info"]}>
              <span className={styles["total-count"]}>
                {totalProposals} proposal{totalProposals !== 1 ? "s" : ""} total
              </span>
              <span className={styles["page-info"]}>
                Page {currentPage} of {totalPages}
              </span>
            </div>
          </div>
        )}

        {proposals.length > 0 && (
          <div className={styles.tableHeader}>
            <div>Proposal</div>
            <div>Votes</div>
            <div>Total votes</div>
          </div>
        )}

        <div className={styles["proposal-list"]}>
          {proposals.length === 0 && !isLoading ? (
            // Empty state when no proposals exist
            <div className={styles["empty-state"]}>
              <h3>No proposals found</h3>
              <p>
                There are currently no proposals to display.{" "}
                {isConnected && "Create the first proposal to get started!"}
              </p>
            </div>
          ) : (
            // Show proposals when they exist
            proposals.map((proposal) => (
              <div
                key={proposal.id}
                className={styles["proposal-card"]}
                onClick={() =>
                  router.push(`/governance/proposals/${proposal.id}`)
                }
              >
                <div className={styles["card-content"]}>
                  {/* Left: Proposal & meta */}
                  <div className={styles.leftCol}>
                    <h3 className={styles["proposal-title"]}>{proposal.title}</h3>
                    <div className={styles.metaRow}>
                      <Badge
                        status={
                          STATUS_CONFIG[
                            (proposal.result === "PASSED"
                              ? "passed"
                              : proposal.result === "REJECTED"
                                ? "rejected"
                                : "active") as "active" | "passed" | "rejected"
                          ].color
                        }
                        icon={
                          STATUS_CONFIG[
                            (proposal.result === "PASSED"
                              ? "passed"
                              : proposal.result === "REJECTED"
                                ? "rejected"
                                : "active") as "active" | "passed" | "rejected"
                          ].icon
                        }
                      >
                        {proposal.result === "PASSED"
                          ? "Passed"
                          : proposal.result === "REJECTED"
                            ? "Rejected"
                            : "Active"}
                      </Badge>
                      {proposal.isHeliosOrg && (
                        <Badge status="primary">Helios Organization</Badge>
                      )}
                      <span className={styles.endDateInline}>
                        {proposal.submitDate}
                      </span>
                    </div>
                    <div className={styles["proposer-info"]}>
                      {/* Hide proposer address entirely; only show org badge near status above */}
                      {/* Intentionally left blank to keep layout spacing consistent */}
                    </div>
                  </div>

                  {/* Center: Votes (centered) */}
                  <div className={styles.centerCol}>
                    <div className={styles.centerWrap}>
                      <div className={styles["vote-stats"]}>
                        <span
                          className={styles["vote-for-text"]}
                          title={`For (${proposal.voteForPercent})`}
                        >
                          <span>{proposal.yesShort}</span>
                          <span className={styles["dot"]} aria-hidden="true">•</span>
                        </span>
                        <span
                          className={styles["vote-abstain-text"]}
                          title={`Abstain (${proposal.voteAbstainPercent})`}
                        >
                          <span>{proposal.abstainShort}</span>
                          <span className={styles["dot"]} aria-hidden>•</span>
                        </span>
                        <span
                          className={styles["vote-against-text"]}
                          title={`Against (${proposal.voteAgainstPercent})`}
                        >
                          <span>{proposal.noShort}</span>
                          <span className={styles["dot"]} aria-hidden>•</span>
                        </span>
                        <span
                          className={styles["vote-no-veto-text"]}
                          title={`No with veto (${proposal.voteNoWithVetoPercent})`}
                        >
                          <span>{proposal.noWithVetoShort}</span>
                        </span>
                      </div>
                      <div className={styles["vote-bar"]}>
                        <div
                          className={styles["vote-for"]}
                          style={{ width: proposal.voteForPercent }}
                          title={`For (${proposal.voteForPercent})`}
                        />
                        <div
                          className={styles["vote-abstain"]}
                          style={{ width: proposal.voteAbstainPercent }}
                          title={`Abstain (${proposal.voteAbstainPercent})`}
                        />
                        <div
                          className={styles["vote-against"]}
                          style={{ width: proposal.voteAgainstPercent }}
                          title={`Against (${proposal.voteAgainstPercent})`}
                        />
                        <div
                          className={styles["vote-no-veto"]}
                          style={{ width: proposal.voteNoWithVetoPercent }}
                          title={`No with veto (${proposal.voteNoWithVetoPercent})`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right: Total */}
                  <div className={styles.rightCol}>
                    <div className={styles.totalNumber}>{proposal.totalVotesFormatted}</div>
                    <div className={styles.totalAddresses}>{proposal.totalAddresses || 0} addresses</div>
                  </div>
                </div>
              </div>
            ))
          )}

          {/* Loading indicator for page changes */}
          {isLoading && proposals.length > 0 && (
            <div className={styles.loader}>
              <p>Loading proposals...</p>
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {proposals.length > 0 && !isLoading && <Pagination />}
      </div>
      <ModalProposal open={showModal} onClose={() => setShowModal(false)} />
    </>
  )
}

const ProposalDashboard: React.FC = () => {
  return (
    <div className={styles.dashboard}>
      <BackSection isVisible={false} />
      <AllProposals />
    </div>
  )
}

export default ProposalDashboard
