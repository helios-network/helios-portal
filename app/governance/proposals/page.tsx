"use client"

import BackSection from "@/components/back"
import { Heading } from "@/components/heading"
import { useRouter } from "next/navigation"
import React, { useState } from "react"
import { useAccount } from "wagmi"
import { ModalProposal } from "../(components)/proposal/modal"
import { VotingHistory } from "./(components)/voting-history"
import { Statistics } from "../(components)/statistics"
import { VotingHistoryProvider } from "@/context/VotingHistoryContext"
import styles from "./page.module.scss"
import { useQuery } from "@tanstack/react-query"
import { getProposalTotalCount, getProposalsByPageAndSizeWithFilter } from "@/helpers/rpc-calls"
import { toHex } from "@/utils/number"
import { Badge } from "@/components/badge"
import { STATUS_CONFIG } from "@/config/vote"
import { Button } from "@/components/button"
import { Input } from "@/components/input/input"
import { formatTokenAmount } from "@/lib/utils/number"

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

const HELIOS_ORG_ADDRESS = "0x72a9b3509b19d9dbc2e0df71c4a6451e8a3dd705"

// Status code mapping
const STATUS_CODE_MAP: Record<string, string> = {
  active: "2",
  passed: "3",
  rejected: "4"
}

const AllProposals: React.FC = () => {
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const { isConnected } = useAccount()
  const [isCreateLoading, setIsCreateLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [status, setStatus] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [proposerFilter, setProposerFilter] = useState<string>("all") // "all" or "helios"
  const [filterKey, setFilterKey] = useState(0) // Track filter changes to force data reset

  // Handler to reset page when status filter changes
  const handleStatusChange = (newStatus: string) => {
    if (newStatus !== status) {
      setStatus(newStatus)
      setCurrentPage(1)
      setFilterKey(prev => prev + 1)
    }
  }

  // Handler to reset page when proposer filter changes
  const handleProposerFilterChange = (newFilter: string) => {
    if (newFilter !== proposerFilter) {
      setProposerFilter(newFilter)
      setCurrentPage(1)
      setFilterKey(prev => prev + 1)
    }
  }

  // Build filter string based on current filters
  const buildFilterString = (): string => {
    const filters: string[] = []

    // Add status filter (only if not "all")
    if (status !== "all" && STATUS_CODE_MAP[status]) {
      filters.push(`status=${STATUS_CODE_MAP[status]}`)
    }

    // Add proposer filter for Helios org
    if (proposerFilter === "helios") {
      filters.push(`proposer=${HELIOS_ORG_ADDRESS}`)
    }

    return filters.length > 0 ? filters.join("&&") : ""
  }

  // Get total proposals count - updates when filters change
  const { data: totalProposals = 0 } = useQuery({
    queryKey: ["proposalTotalCount", filterKey, status, proposerFilter],
    queryFn: async () => {
      const filterString = buildFilterString()

      // If no filters, get all proposals count
      if (!filterString) {
        return getProposalTotalCount()
      }

      // For filtered results, fetch first page with large size to get approximate total
      // Or use a dedicated filtered count API if available
      const firstPage = await getProposalsByPageAndSizeWithFilter(toHex(1), toHex(1000), filterString)
      return firstPage?.length ?? 0
    },
    staleTime: 30000, // 30 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    refetchOnWindowFocus: false
  })

  // Load proposals with pagination - fetch all pages up to current page
  const { data: allLoadedProposals = [], isLoading: isInitialLoading, error: initialError, isFetching } = useQuery({
    queryKey: ["allProposals", filterKey, currentPage, status, proposerFilter],
    queryFn: async () => {

      const filterString = buildFilterString()
      // Fetch all pages from 1 to currentPage
      const promises = []
      for (let page = 1; page <= currentPage; page++) {
        promises.push(getProposalsByPageAndSizeWithFilter(toHex(page), toHex(pageSize), filterString))
      }

      const results = await Promise.all(promises)
      // Flatten all results into a single array
      const allProposals = results.flat()
      return allProposals
    },
    staleTime: 30000,
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    refetchOnWindowFocus: false
  })

  // Check if we can load more
  const canLoadMore = allLoadedProposals.length < (totalProposals || 0)

  // Combined loading and error states
  const isLoading = isInitialLoading
  const error = initialError

  // Transform all loaded proposals data
  const allProposals: ProposalData[] = (allLoadedProposals || []).map((item: any) => {
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
      if (num >= 1_000_000) return `${formatTokenAmount(num / 1_000_000)}M`
      if (num >= 1_000) return `${formatTokenAmount(num / 1_000)}K`
      return formatTokenAmount(num)
    }

    const totalVotesFormatted = k(total)

    const proposer: string = item.proposer || ""
    const isHeliosOrg =
      proposer.toLowerCase() === "0x3ddB715dB3E32140b731aF55a7780C94019e5075".toLowerCase()

    return {
      id: item.id.toString(),
      meta: `By ${proposer}`,
      proposer,
      isHeliosOrg,
      status: `Ends: ${new Date(item.votingEndTime).toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "2-digit"
      })}`,
      submitDate: new Date(item.submitTime).toLocaleDateString(undefined, {
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

  // Filter proposals by search query
  const proposals = searchQuery.trim()
    ? allProposals.filter(p =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.meta.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.includes(searchQuery)
    )
    : allProposals

  // Handle load more - simply increment the page
  const handleLoadMore = () => {
    if (canLoadMore && !isFetching) {
      setCurrentPage(prev => prev + 1)
    }
  }

  const handleCreateProposal = () => {
    setIsCreateLoading(true)
    setTimeout(() => {
      setIsCreateLoading(false)
      setShowModal(true)
    }, 200)
  }



  // Show loading state ONLY on very first load when we have no data
  if (isLoading) {
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

  // Show error state if there's an error and no data available
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
      <div className={styles.gridContainer}>
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

          {/* Filters Section */}
          <div className={styles.filtersContainer}>
            <div className={styles.buttonGroup}>
              <Button
                size="small"
                variant={status !== "all" ? "secondary" : undefined}
                onClick={() => handleStatusChange("all")}
              >
                All
              </Button>
              <Button
                size="small"
                variant={status !== "active" ? "secondary" : undefined}
                onClick={() => handleStatusChange("active")}
              >
                Active
              </Button>
              <Button
                size="small"
                variant={status !== "passed" ? "secondary" : undefined}
                onClick={() => handleStatusChange("passed")}
              >
                Passed
              </Button>
              <Button
                size="small"
                variant={status !== "rejected" ? "secondary" : undefined}
                onClick={() => handleStatusChange("rejected")}
              >
                Rejected
              </Button>
            </div>
            <div className={styles.inputGroup}>
              <div className={styles.proposerButtons}>
                <Button
                  size="small"
                  variant={proposerFilter !== "all" ? "secondary" : undefined}
                  onClick={() => handleProposerFilterChange("all")}
                >
                  All Proposals
                </Button>
                <Button
                  size="small"
                  variant={proposerFilter !== "helios" ? "secondary" : undefined}
                  onClick={() => handleProposerFilterChange("helios")}
                >
                  Helios Proposals
                </Button>
              </div>
              <Input
                icon="hugeicons:search-01"
                placeholder="Search a proposals..."
                className={styles.search}
                value={searchQuery}
                onChange={(e: any) => setSearchQuery(e.target.value || "")}
              />
            </div>
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

          {proposals.length > 0 && (
            <div className={styles.tableHeader}>
              <div>Proposal</div>
              <div>Votes</div>
              <div>Total votes</div>
            </div>
          )}

          <div className={styles["proposal-list"]}>
            {proposals.length === 0 ? (
              // Empty state when no proposals exist
              <div className={styles["empty-state"]}>
                <h3>No proposals found</h3>
                <p>
                  There are currently no proposals to display.{" "}
                  {isConnected && "Create the first proposal to get started!"}
                </p>
              </div>
            ) : (
              // Show proposals when they exist - use index as key to avoid duplicates
              proposals.map((proposal, index) => (
                <div
                  key={`proposal-${index}-${proposal.id}`}
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
                      {/* <div className={styles.totalAddresses}>{proposal.totalAddresses || 0} addresses</div> */}
                    </div>
                  </div>
                </div>
              ))
            )}

            {/* Loading indicator for page changes */}
            {isInitialLoading && proposals.length > 0 && (
              <div className={styles.loader}>
                <p>Loading more proposals...</p>
              </div>
            )}

            {/* Load More Button - inside the proposal list */}
            {canLoadMore && (
              <div className={styles["load-more-container"]}>
                <button
                  className={styles["load-more-btn"]}
                  onClick={handleLoadMore}
                  disabled={isFetching}
                >
                  {isFetching ? "Loading..." : "Load more"}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className={styles.historyColumn}>
          <Statistics totalProposals={totalProposals} />
          <VotingHistory />
        </div>
      </div>
      <ModalProposal open={showModal} onClose={() => setShowModal(false)} />
    </>
  )
}

const ProposalDashboard: React.FC = () => {
  return (
    <VotingHistoryProvider>
      <div className={styles.dashboard}>
        <BackSection isVisible={false} />
        <AllProposals />
      </div>
    </VotingHistoryProvider>
  )
}

export default ProposalDashboard
