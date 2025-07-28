"use client"

import BackSection from "@/components/back"
import { Heading } from "@/components/heading"
import { Icon } from "@/components/icon"
import { request } from "@/helpers/request"
import { truncateAddress } from "@/lib/utils"
import { useRouter } from "next/navigation"
import React, { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useAccount } from "wagmi"
import { ModalProposal } from "../(components)/proposal/modal"
import styles from "./page.module.scss"

// Fetch proposals count using the new API endpoint
const fetchProposalsCount = async (): Promise<number> => {
  try {
    const result = await request<string>("eth_getProposalsCount", [])
    // Convert hex string to number
    if (result === null) {
      throw new Error("Failed to fetch proposals count")
    }
    return parseInt(result, 16)
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error("Failed to fetch proposals count")
  }
}

// Updated fetchProposals function using the new request utility
const fetchProposals = async (page: number, pageSize: number) => {
  try {
    const result = await request<any[]>("eth_getProposalsByPageAndSize", [
      `0x${page.toString(16)}`,
      `0x${pageSize.toString(16)}`
    ])

    return result || []
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error("Failed to fetch proposals")
  }
}

interface ProposalData {
  id: string
  meta: string
  status: string
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
}

const AllProposals: React.FC = () => {
  const router = useRouter()
  const [proposals, setProposals] = useState<ProposalData[]>([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [totalPages, setTotalPages] = useState<number | null>(null) // null means unknown
  const [hasNextPage, setHasNextPage] = useState(true)
  const [totalProposals, setTotalProposals] = useState<number | null>(null) // null means unknown
  const { isConnected } = useAccount()
  const [isLoading, setIsLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [hasLoadedInitial, setHasLoadedInitial] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mountKey] = useState(() => Math.random()) // Unique key per component mount

  const handleCreateProposal = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      setShowModal(true)
    }, 200)
  }

  // Function to get total pages and proposals count using the new API
  const loadProposalsCountAndPages = async () => {
    try {
      const totalProposalCount = await fetchProposalsCount()
      const totalPages = Math.max(1, Math.ceil(totalProposalCount / pageSize))

      setTotalPages(totalPages)
      setTotalProposals(totalProposalCount)
      setHasNextPage(currentPage < totalPages)

      return { totalPages, totalProposalCount }
    } catch (error) {
      console.error("Error fetching proposals count:", error)
      // If there's an error, assume at least 1 page exists
      setTotalPages(1)
      setTotalProposals(0)
      setHasNextPage(false)
      return { totalPages: 1, totalProposalCount: 0 }
    }
  }

  const loadProposals = async (page: number) => {
    if (loading) return

    setLoading(true)
    setError(null)
    console.log("Fetching proposals for page:", page)

    try {
      const rawData = await fetchProposals(page, pageSize)

      setHasLoadedInitial(true)

      if (!rawData || rawData.length === 0) {
        // If we're on page 1 and get no results, show empty state
        if (page === 1) {
          setProposals([])
        }
        return
      }

      const newProposals: ProposalData[] = rawData.map((item: any) => {
        const yes = BigInt(item.currentTallyResult?.yes_count || "0")
        const no = BigInt(item.currentTallyResult?.no_count || "0")
        const abstain = BigInt(item.currentTallyResult?.abstain_count || "0")
        const noWithVeto = BigInt(
          item.currentTallyResult?.no_with_veto_count || "0"
        )

        const total = yes + no + abstain + noWithVeto || 1n
        const voteForPercent = Number((yes * 100n) / total)
        const voteAgainstPercent = Number((no * 100n) / total)
        const voteAbstainPercent = Number((abstain * 100n) / total)
        const voteNoWithVetoPercent = Number((noWithVeto * 100n) / total)

        // Convert from smallest unit (assuming 18 decimals like your original code)
        const yesFormatted = (yes / 10n ** 18n).toString()
        const noFormatted = (no / 10n ** 18n).toString()
        const abstainFormatted = (abstain / 10n ** 18n).toString()
        const noWithVetoFormatted = (noWithVeto / 10n ** 18n).toString()

        return {
          id: item.id.toString(),
          meta: `By ${item.proposer}`,
          status: `Ends: ${new Date(item.votingEndTime).toLocaleString(
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
          )}`,
          votes: `${yesFormatted} For – ${noFormatted} Against – ${abstainFormatted} Abstain – ${noWithVetoFormatted} No with Vote`,
          title: item.title,
          result: item.status,
          resultClass:
            item.status === "PASSED"
              ? styles.executed
              : item.status === "REJECTED"
              ? styles.rejected
              : styles.voting_period,
          voteFor: `${yesFormatted}shares`,
          voteAgainst: `${noFormatted}shares`,
          voteAbstain: `${abstainFormatted}shares`,
          voteNoWithVeto: `${noWithVetoFormatted}shares`,
          voteForPercent: `${voteForPercent}%`,
          voteAgainstPercent: `${voteAgainstPercent}%`,
          voteAbstainPercent: `${voteAbstainPercent}%`,
          voteNoWithVetoPercent: `${voteNoWithVetoPercent}%`
        }
      })

      setProposals(newProposals)

      // Update hasNextPage based on total pages if we know them
      if (totalPages !== null) {
        setHasNextPage(page < totalPages)
      }
    } catch (error: unknown) {
      console.error("Failed to fetch proposals", error)
      const message =
        error instanceof Error ? error.message : "Failed to load proposals"
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  // Handle page change
  const handlePageChange = (page: number) => {
    if (page < 1 || page === currentPage || loading) return
    setCurrentPage(page)
    loadProposals(page)
  }

  // Handle previous page
  const handlePrevious = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1)
    }
  }

  // Handle next page
  const handleNext = () => {
    if (hasNextPage) {
      handlePageChange(currentPage + 1)
    }
  }

  // Initial load effect using useQuery with unique mount key
  useQuery({
    queryKey: ["proposals", "initial-load", mountKey],
    queryFn: async () => {
      if (!hasLoadedInitial) {
        // Reset current page and load fresh data
        setCurrentPage(1)
        await loadProposalsCountAndPages()
        loadProposals(1)
      }
      return null
    },
    enabled: !hasLoadedInitial,
    refetchOnWindowFocus: false
  })

  // Pagination component
  const Pagination = () => {
    const getPageNumbers = () => {
      const pages = []
      const maxVisiblePages = 5

      if (totalPages === null) {
        // We don't know total pages yet, show conservative pagination
        pages.push(currentPage)

        if (currentPage > 1) {
          pages.unshift(currentPage - 1)
        }
      } else {
        // We know the total, show normal pagination
        let startPage = Math.max(
          1,
          currentPage - Math.floor(maxVisiblePages / 2)
        )
        const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

        // Adjust start if we're near the end
        if (endPage - startPage + 1 < maxVisiblePages) {
          startPage = Math.max(1, endPage - maxVisiblePages + 1)
        }

        for (let i = startPage; i <= endPage; i++) {
          pages.push(i)
        }
      }

      return pages
    }

    const pageNumbers = getPageNumbers()
    const showFirstPage =
      totalPages !== null && pageNumbers.length > 0 && pageNumbers[0] > 1
    const showLastPage =
      totalPages !== null &&
      pageNumbers.length > 0 &&
      pageNumbers[pageNumbers.length - 1] < totalPages
    const showFirstEllipsis = showFirstPage && pageNumbers[0] > 2
    const showLastEllipsis =
      showLastPage && pageNumbers[pageNumbers.length - 1] < totalPages - 1

    return (
      <div className={styles["pagination"]}>
        <button
          className={`${styles["pagination-btn"]} ${
            currentPage === 1 ? styles.disabled : ""
          }`}
          onClick={handlePrevious}
          disabled={currentPage === 1 || loading}
        >
          Previous
        </button>

        <div className={styles["page-numbers"]}>
          {showFirstPage && (
            <>
              <button
                className={styles["page-btn"]}
                onClick={() => handlePageChange(1)}
                disabled={loading}
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
              className={`${styles["page-btn"]} ${
                page === currentPage ? styles.active : ""
              }`}
              onClick={() => handlePageChange(page)}
              disabled={loading}
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
                disabled={loading}
              >
                {totalPages}
              </button>
            </>
          )}
        </div>

        <button
          className={`${styles["pagination-btn"]} ${
            !hasNextPage ? styles.disabled : ""
          }`}
          onClick={handleNext}
          disabled={!hasNextPage || loading}
        >
          Next
        </button>
      </div>
    )
  }

  // Show loading state on initial load
  if (!hasLoadedInitial && loading) {
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
              disabled={isLoading}
            >
              {isLoading ? (
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

  // Show error state if there's an error and no initial data loaded
  if (error && !hasLoadedInitial) {
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
              disabled={isLoading}
            >
              {isLoading ? (
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
            <p>{error}</p>
            <button
              className={styles["retry-button"]}
              onClick={() => loadProposals(currentPage)}
              disabled={loading}
            >
              {loading ? "Retrying..." : "Try Again"}
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
              disabled={isLoading}
            >
              {isLoading ? (
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
        {error && hasLoadedInitial && (
          <div className={styles["error-banner"]}>
            <p>{error}</p>
            <button
              className={styles["retry-button-small"]}
              onClick={() => loadProposals(currentPage)}
              disabled={loading}
            >
              Retry
            </button>
          </div>
        )}

        {/* Proposal count and pagination info */}
        {hasLoadedInitial &&
          !loading &&
          (proposals.length > 0 || totalProposals !== null) && (
            <div className={styles["proposal-stats"]}>
              <div className={styles["stats-info"]}>
                {totalProposals !== null ? (
                  <span className={styles["total-count"]}>
                    {totalProposals} proposal{totalProposals !== 1 ? "s" : ""}{" "}
                    total
                  </span>
                ) : (
                  <span className={styles["total-count"]}>
                    <span className={styles.myloader}></span>
                    Calculating total proposals...
                  </span>
                )}
                {totalPages !== null && (
                  <span className={styles["page-info"]}>
                    Page {currentPage} of {totalPages}
                  </span>
                )}
              </div>
            </div>
          )}

        <div className={styles["proposal-list"]}>
          {proposals.length === 0 && hasLoadedInitial && !loading ? (
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
                  <div className={styles["proposal-header"]}>
                    <div className={styles["proposal-info"]}>
                      <div className={styles["proposer-info"]}>
                        <Icon icon="material-symbols:person" />
                        <span className={styles["proposer-label"]}>
                          Proposal by
                        </span>
                        <a
                          href={`https://explorer.helioschainlabs.org/address/${proposal.meta.replace(
                            "By ",
                            ""
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.proposerLink_mobile}
                          title="View on Helios Explorer"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span>
                            {truncateAddress(proposal.meta.replace("By ", ""))}
                          </span>
                        </a>
                        <a
                          href={`https://explorer.helioschainlabs.org/address/${proposal.meta.replace(
                            "By ",
                            ""
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.proposerLink_full}
                          title="View on Helios Explorer"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span>{proposal.meta.replace("By ", "")}</span>
                        </a>
                      </div>
                      <h3 className={styles["proposal-title"]}>
                        {proposal.title}
                      </h3>
                    </div>
                    <div className={styles["proposal-status"]}>
                      <div className={styles["end-date"]}>
                        <Icon icon="material-symbols:event" />
                        &nbsp;
                        {proposal.status}
                      </div>
                      <div
                        className={`${styles["status-badge"]} ${proposal.resultClass}`}
                      >
                        <Icon
                          icon={
                            proposal.result === "PASSED"
                              ? "material-symbols:check-circle"
                              : proposal.result === "REJECTED"
                              ? "material-symbols:cancel"
                              : "material-symbols:how-to-vote"
                          }
                        />
                        &nbsp; {proposal.result}
                      </div>
                    </div>
                  </div>

                  <div className={styles["vote-section"]}>
                    <span>Voting Results</span>
                    <div className={styles.captionContainer}>
                      <span className={styles.captionVotes}>
                        Total votes cast
                      </span>
                    </div>
                    <div className={styles["vote-bar"]}>
                      <div
                        className={styles["vote-for"]}
                        style={{ width: proposal.voteForPercent }}
                      />
                      <div
                        className={styles["vote-abstain"]}
                        style={{ width: proposal.voteAbstainPercent }}
                      />
                      <div
                        className={styles["vote-against"]}
                        style={{ width: proposal.voteAgainstPercent }}
                      />
                      <div
                        className={styles["vote-no-veto"]}
                        style={{ width: proposal.voteNoWithVetoPercent }}
                      />
                    </div>

                    <div className={styles["vote-details"]}>
                      <div className={styles["vote-stats"]}>
                        <span className={styles["vote-for-text"]}>
                          <Icon icon="material-symbols:thumb-up" />
                          <span>
                            For: {proposal.voteFor} ({proposal.voteForPercent})
                          </span>
                        </span>
                        <span className={styles["vote-abstain-text"]}>
                          <Icon icon="material-symbols:panorama-fish-eye" />
                          <span>
                            Abstain: {proposal.voteAbstain} (
                            {proposal.voteAbstainPercent})
                          </span>
                        </span>
                        <span className={styles["vote-against-text"]}>
                          <Icon icon="material-symbols:thumb-down" />
                          <span>
                            Against: {proposal.voteAgainst} (
                            {proposal.voteAgainstPercent})
                          </span>
                        </span>
                        {proposal.voteNoWithVeto !== "0HLS" && (
                          <span className={styles["vote-no-veto-text"]}>
                            <Icon icon="material-symbols:do-not-disturb-on" />
                            <span>
                              No With Vote: {proposal.voteNoWithVeto} (
                              {proposal.voteNoWithVetoPercent})
                            </span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}

          {/* Loading indicator for page changes */}
          {loading && hasLoadedInitial && (
            <div className={styles.loader}>
              <p>Loading proposals...</p>
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {hasLoadedInitial && !loading && proposals.length > 0 && <Pagination />}
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
