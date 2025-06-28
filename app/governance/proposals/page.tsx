"use client"

import BackSection from "@/components/back"
import { Heading } from "@/components/heading"
import { useRouter } from "next/navigation"
import React, { useCallback, useEffect, useRef, useState } from "react"
import { useAccount } from "wagmi"
import { ModalProposal } from "../(components)/proposal/modal"
import { fetchProposals } from "../../utils/api"
import styles from "./page.module.scss"

interface Proposal {
  id: string
  title: string
  author: string
  status: string
  type: string
  waitingFor: string
  nextStep: string
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
}

const MyProposalCard: React.FC<{ proposal: Proposal }> = ({ proposal }) => (
  <div className={styles.card}>
    <div className={styles.cardHeader}>
      <div>
        <h2 className={styles.proposalTitle}>
          {proposal.title || "Untitled proposal"}
        </h2>
        <p className={styles.proposalAuthor}>By {proposal.author}</p>
      </div>
      <span className={styles.badge}>Draft</span>
    </div>

    <div className={styles.cardMeta}>
      <div className={styles.metaItem}>
        <div className={styles.metaLabel}>Type</div>
        <div className={styles.metaValue}>{proposal.type || "General"}</div>
      </div>
      <div className={styles.metaItem}>
        <div className={styles.metaLabel}>Status</div>
        <div className={styles.metaValue}>
          {proposal.waitingFor || "Awaiting submission"}
        </div>
      </div>
    </div>

    <div className={styles.progressSection}>
      <div className={styles.progressLabel}>Next start step</div>
      <div className={styles.progressBar}>
        <div className={styles.filled} />
      </div>
      <div className={styles.progressSteps}>
        <span className={styles.currentStep}>
          {proposal.nextStep || "Submit Draft"}
        </span>
        <span className={styles.upcomingStep}>Vote</span>
      </div>
    </div>

    <div className={styles.cardFooter}>
      <button className={styles.buttonOutline}>Edit Draft</button>
    </div>
  </div>
)

const MyProposals: React.FC = () => {
  const myProposal: Proposal = {
    id: "1",
    title: "WBTC Treasury Proposal",
    author: "0x80C72ec57e33DDF9fdEf9103F284394626a280D",
    status: "Draft",
    type: "[Type pending]",
    waitingFor: "Submitting draft",
    nextStep: "Submit Draft"
  }

  return (
    <div className={styles.myProposalsSection}>
      <Heading
        icon="material-symbols:note-add-outline"
        title="My Proposals"
        className={styles.sectionTitle}
      />
      <MyProposalCard proposal={myProposal} />
    </div>
  )
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
}

const AllProposals: React.FC = () => {
  const router = useRouter()
  const [proposals, setProposals] = useState<ProposalData[]>([])
  const [loading, setLoading] = useState(false)
  const pageRef = useRef(1)
  const loaderRef = useRef<HTMLDivElement | null>(null)
  const { isConnected } = useAccount()
  const [isLoading, setIsLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [hasLoadedInitial, setHasLoadedInitial] = useState(false) // Track if we've made the first load attempt
  // Add this ref at the top of your component
  const loadingRef = useRef(false)

  const handleCreateProposal = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      setShowModal(true)
    }, 1000)
  }
  const manualProposalCounter = useRef(1) // Counter for manual proposals

  // Function to create manual proposals
  const createManualProposals = (count: number): ProposalData[] => {
    const proposals: ProposalData[] = []

    for (let i = 0; i < count; i++) {
      const proposalId = `manual-${manualProposalCounter.current}`
      const currentDate = new Date()
      const endDate = new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days from now

      // Generate some random-ish vote data for demonstration
      const baseVotes = 1000000 + Math.floor(Math.random() * 10000000)
      const yesVotes = Math.floor(baseVotes * (0.6 + Math.random() * 0.3)) // 60-90% yes
      const noVotes = Math.floor(baseVotes * (0.05 + Math.random() * 0.15)) // 5-20% no
      const abstainVotes = Math.floor(baseVotes * (0.02 + Math.random() * 0.08)) // 2-10% abstain
      const noWithVetoVotes = Math.floor(
        baseVotes * (0.01 + Math.random() * 0.04)
      ) // 1-5% no with veto

      const total = yesVotes + noVotes + abstainVotes + noWithVetoVotes
      const voteForPercent = Math.round((yesVotes / total) * 100)
      const voteAgainstPercent = Math.round((noVotes / total) * 100)
      const voteAbstainPercent = Math.round((abstainVotes / total) * 100)
      const voteNoWithVetoPercent = Math.round((noWithVetoVotes / total) * 100)

      const sampleTitles = [
        "Proposal to Increase Staking Rewards",
        "Community Fund Allocation for Development",
        "Protocol Upgrade to Version 2.0",
        "Treasury Management Strategy Update",
        "Governance Parameter Adjustment",
        "Integration with New DeFi Protocol",
        "Security Audit Funding Proposal",
        "Community Incentive Program Launch",
        "Validator Commission Rate Adjustment",
        "Cross-chain Bridge Implementation",
        "NFT Marketplace Integration",
        "Oracle Price Feed Update"
      ]

      const sampleProposers = [
        "0x1234...5678",
        "0xabcd...ef01",
        "0x9876...5432",
        "community.eth",
        "governance.dao",
        "0xfed...cba9",
        "validator.eth",
        "0x2468...ace0"
      ]

      const randomTitle =
        sampleTitles[Math.floor(Math.random() * sampleTitles.length)]
      const randomProposer =
        sampleProposers[Math.floor(Math.random() * sampleProposers.length)]
      const randomStatus = Math.random() > 0.7 ? "REJECTED" : "PASSED" // 70% chance of passing

      proposals.push({
        id: proposalId,
        meta: `By ${randomProposer}`,
        status: `Ends ${endDate.toLocaleString()}`,
        votes: `${yesVotes.toLocaleString()} For – ${noVotes.toLocaleString()} Against – ${abstainVotes.toLocaleString()} Abstain – ${noWithVetoVotes.toLocaleString()} No w/ Veto`,
        title: randomTitle,
        result: randomStatus,
        resultClass:
          randomStatus === "PASSED" ? styles.executed : styles.defeated,
        voteFor: `${voteForPercent}%`,
        voteAgainst: `${voteAgainstPercent}%`,
        voteAbstain: `${voteAbstainPercent}%`,
        voteNoWithVeto: `${voteNoWithVetoPercent}%`
      })

      manualProposalCounter.current += 1
    }

    return proposals
  }

  const loadMoreProposals = async () => {
    // Prevent multiple simultaneous calls
    if (loading) return
    if (loadingRef.current) return

    loadingRef.current = true

    setLoading(true)
    console.log("Fetched proposals:", pageRef.current)

    try {
      const rawData = await fetchProposals(pageRef.current, 10)

      setHasLoadedInitial(true) // Mark that we've attempted the first load

      if (!rawData || rawData.length === 0) {
        console.log("No more proposals to load")
        // Add a manual proposal immediately when API data is exhausted
        const newManualProposal = createManualProposals(3)
        setProposals((prev) => [...prev, ...newManualProposal])
        setLoading(false) // Make sure to set loading to false
        return
      }

      const newProposals: ProposalData[] = rawData.map((item: any) => {
        const yes = BigInt(item.finalTallyResult?.yes_count || "0")
        const no = BigInt(item.finalTallyResult?.no_count || "0")
        const abstain = BigInt(item.finalTallyResult?.abstain_count || "0")
        const noWithVeto = BigInt(
          item.finalTallyResult?.no_with_veto_count || "0"
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
          status: `Ends ${new Date(item.votingEndTime).toLocaleString()}`,
          votes: `${yesFormatted} For – ${noFormatted} Against – ${abstainFormatted} Abstain – ${noWithVetoFormatted} No w/ Veto`,
          title: item.title,
          result: item.status,
          resultClass:
            item.status === "PASSED" ? styles.executed : styles.defeated,
          voteFor: `${voteForPercent}%`,
          voteAgainst: `${voteAgainstPercent}%`,
          voteAbstain: `${voteAbstainPercent}%`,
          voteNoWithVeto: `${voteNoWithVetoPercent}%`
        }
      })

      setProposals((prev) => [...prev, ...newProposals])
      pageRef.current += 1
    } catch (error) {
      console.error("Failed to fetch proposals", error)
    } finally {
      loadingRef.current = false
      setLoading(false)
    }
  }

  // Use useCallback to memoize the function and prevent unnecessary re-renders
  const loadMoreProposalsCallback = useCallback(loadMoreProposals, [loading])

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !loading) {
          loadMoreProposalsCallback()
        }
      },
      {
        threshold: 0.1, // Changed from 1 to 0.1 for better triggering
        rootMargin: "20px" // Add some margin to trigger earlier
      }
    )

    const current = loaderRef.current
    if (current) observer.observe(current)

    return () => {
      if (current) observer.unobserve(current)
    }
  }, [loadMoreProposalsCallback, loading]) // Add dependencies

  // Initial load effect
  useEffect(() => {
    if (!hasLoadedInitial && !loading) {
      loadMoreProposals()
    }
  }, []) // This runs once on mount

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
                        <span className={styles["proposer-label"]}>
                          Proposal by
                        </span>
                        <div className={styles["proposer-badge"]}>
                          {proposal.meta.replace("By ", "")}
                        </div>
                      </div>
                      <h3 className={styles["proposal-title"]}>
                        {proposal.title}
                      </h3>
                    </div>
                    <div className={styles["proposal-status"]}>
                      <div className={styles["end-date"]}>
                        {proposal.status}
                      </div>
                      <div
                        className={`${styles["status-badge"]} ${proposal.resultClass}`}
                      >
                        {proposal.result}
                      </div>
                    </div>
                  </div>

                  <div className={styles["vote-section"]}>
                    <div className={styles["vote-bar"]}>
                      <div
                        className={styles["vote-for"]}
                        style={{ width: proposal.voteFor }}
                      />
                      <div
                        className={styles["vote-abstain"]}
                        style={{ width: proposal.voteAbstain }}
                      />
                      <div
                        className={styles["vote-against"]}
                        style={{ width: proposal.voteAgainst }}
                      />
                      <div
                        className={styles["vote-no-veto"]}
                        style={{ width: proposal.voteNoWithVeto }}
                      />
                    </div>

                    <div className={styles["vote-details"]}>
                      <div className={styles["vote-stats"]}>
                        <span className={styles["vote-for-text"]}>
                          For: {formatVoteCount(proposal.voteFor)} (
                          {proposal.voteFor})
                        </span>
                        <span className={styles["vote-abstain-text"]}>
                          Abstain: {formatVoteCount(proposal.voteAbstain)} (
                          {proposal.voteAbstain})
                        </span>
                        <span className={styles["vote-against-text"]}>
                          Against: {formatVoteCount(proposal.voteAgainst)} (
                          {proposal.voteAgainst})
                        </span>
                        {proposal.voteNoWithVeto !== "0.0%" && (
                          <span className={styles["vote-no-veto-text"]}>
                            No w/ Veto:{" "}
                            {formatVoteCount(proposal.voteNoWithVeto)} (
                            {proposal.voteNoWithVeto})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={loaderRef} className={`${styles.loader}`}>
            {loading && proposals.length > 0 && (
              <p>Loading more proposals...</p>
            )}
          </div>
        </div>
      </div>
      {/* {showModal && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowModal(false)}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalLeft}>
              <div className={styles.padding1}>
                <p>Title *</p>
                <div className={styles.textInput}>
                  <input type="text" className={styles.customPadding}></input>
                </div>
                <p>Description *</p>
                <div className={styles.textArea}>
                  <textarea
                    className={styles.customPadding}
                    rows={13}
                  ></textarea>
                </div>
              </div>

              <div className={styles.line} />

              <div className={styles.padding1}>
                <p
                  className={`${styles.proposalTransactions} ${styles.fontBlack}`}
                >
                  Proposed transactions
                </p>
                <p className={`${styles.proposalTransactions} ${styles.mt1}`}>
                  Proposed transactions will execute after a proposal passes and
                  then gets executed.
                </p>
                <div className={styles.buttonRow}>
                  <button className={styles.primaryButton}>
                    Transfer from the treasury
                  </button>
                  <button className={styles.primaryButton}>
                    Create a custom transaction
                  </button>
                </div>
              </div>

              <div className={styles.line} />

              <div className={styles.padding1}>
                <div className={styles.createDraftBut}>
                  <div className={styles.customPadding}>Create Draft</div>
                </div>
              </div>
            </div>
            <div className={styles.modalRight}>
              <div className={styles.proposalChecklist}>
                <p className={styles.checklistTitle}>
                  <strong>Proposal checklist</strong>
                </p>
                <p>
                  <strong>1. Create your proposal</strong>
                </p>
                <p>
                  Get started by drafting your proposal directly in the
                  governance interface.
                </p>

                <p>
                  <strong>2. Request sponsorship (if threshold not met)</strong>
                </p>
                <p>
                  If you don&apos;t meet the required voting power threshold,
                  you can request sponsorship from existing delegates. This
                  allows your proposal to gain visibility and the necessary
                  backing from the community.
                </p>

                <p>
                  <strong>3. Submit as waiting for sponsorship</strong>
                </p>
                <p>
                  If you don&apos;t have the voting power to post the proposal
                  yourself, you can request a delegate with enough voting power
                  to sponsor it. The delegate you choose can review your
                  proposal and choose to sponsor it if they support it, pushing
                  it onchain for voting. One note - you should coordinate with
                  sponsor delegates so they know you&apos;re looking for
                  sponsorship!
                </p>

                <p>
                  <strong>4. Submit onchain (If threshold met)</strong>
                </p>
                <p>
                  If you meet the voting power threshold, you can bypass the
                  sponsorship phase and submit it onchain directly. This
                  fast-tracks your proposal to the voting stage, giving the
                  community the opportunity to decide on its implementation.
                </p>
              </div>
            </div>
          </div>
        </div>
      )} */}
      <ModalProposal open={showModal} onClose={() => setShowModal(false)} />
    </>
  )
}

// Helper function to format vote counts (you'll need to add this to your component)
const formatVoteCount = (percentage: string): string => {
  // Extract the numeric value from percentage and convert to vote count
  // This is a placeholder - you'll need to implement based on your actual vote data
  const percent = parseFloat(percentage.replace("%", ""))
  // You'll need to calculate actual vote counts based on your data structure
  return `${(percent * 100).toFixed(2)}M` // Placeholder calculation
}

const ProposalDashboard: React.FC = () => {
  const { isConnected } = useAccount()

  return (
    <div className={styles.dashboard}>
      <BackSection />
      {isConnected && <MyProposals />}
      <AllProposals />
    </div>
  )
}

export default ProposalDashboard
