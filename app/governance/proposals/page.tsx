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
  const [pageSize] = useState(10)
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

  // Load proposals with pagination - fetch all pages up to current page
  const { data: allLoadedProposals = [], isLoading: isInitialLoading, error: initialError } = useQuery({
    queryKey: ["allProposals", currentPage],
    queryFn: async () => {
      console.log("Fetching proposals up to page:", currentPage);

      // Fetch all pages from 1 to currentPage
      const promises = []
      for (let page = 1; page <= currentPage; page++) {
        promises.push(getProposalsByPageAndSize(toHex(page), toHex(pageSize)))
      }

      const results = await Promise.all(promises)
      // Flatten all results into a single array
      const allProposals = results.flat()
      console.log("Total proposals loaded:", allProposals.length);
      return allProposals
    },
    staleTime: 30000,
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData // Keep previous data while loading
  })

  console.log("All Loaded Proposals:", allLoadedProposals?.length);

  // Check if we can load more
  const canLoadMore = allLoadedProposals.length < (totalProposals || 0)

  // Combined loading and error states
  const isLoading = isInitialLoading && currentPage === 1
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
      if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(2)}M`
      if (num >= 1_000) return `${(num / 1_000).toFixed(2)}K`
      return `${num.toFixed(2)}`
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

  // Use all loaded proposals for display
  const proposals = allProposals

  console.log("Debug State:", {
    proposalsLength: proposals.length,
    isLoading,
    allLoadedProposalsLength: allLoadedProposals.length,
    isInitialLoading,
    currentPage
  });

  // Handle load more - simply increment the page
  const handleLoadMore = () => {
    console.log("Load more clicked:", {
      canLoadMore,
      currentPage,
      allLoadedProposalsLength: allLoadedProposals.length,
      totalProposals,
      isInitialLoading
    });

    if (canLoadMore && !isInitialLoading) {
      console.log("Incrementing page from", currentPage, "to", currentPage + 1);
      setCurrentPage(prev => prev + 1)
    } else {
      console.log("Load more blocked - canLoadMore:", canLoadMore, "isLoading:", isInitialLoading);
    }
  }

  const handleCreateProposal = () => {
    setIsCreateLoading(true)
    setTimeout(() => {
      setIsCreateLoading(false)
      setShowModal(true)
    }, 200)
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
            {proposals.length === 0 && !isLoading ? (
              // Empty state when no proposals exist
              <div className={styles["empty-state"]}>
                <h3>No proposals found</h3>
                <p>
                  There are currently no proposals to display.{" "}
                  {isConnected && "Create the first proposal to get started!"}
                </p>
              </div>
            ) : proposals.length === 0 && isLoading ? (
              // Loading state when waiting for initial load to complete
              <div className={styles.loader}>
                <p>Loading proposals...</p>
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
                  disabled={isInitialLoading}
                >
                  {isInitialLoading ? "Loading..." : "Load more"}
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
