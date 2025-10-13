"use client"

import { Badge } from "@/components/badge"
import { Button } from "@/components/button"
import { Icon } from "@/components/icon"
import { Link } from "@/components/link"
import { Modal } from "@/components/modal"
import { Progress } from "@/components/progress"
import { RechartsPie, RechartsPieLegend } from "@/components/recharts/pie"
import { STATUS_CONFIG, VOTE_CONFIG } from "@/config/vote"
import { VoteProps, VoteVote } from "@/types/faker"
import { useProposalDelegations } from "@/hooks/useProposalDelegations"
import { formatNumber } from "@/lib/utils/number"
import clsx from "clsx"
import { useState, useMemo } from "react"
import { ethers } from "ethers"
import s from "./list.module.scss"

export const Vote = ({ item }: { item: VoteProps }) => {
  const { color, icon } = STATUS_CONFIG[item.status]
  const { color: voteColor, icon: voteIcon } = VOTE_CONFIG[item.vote]
  const [showContent, setShowContent] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [vote, setVote] = useState<VoteVote>(item.vote)
  const { delegations } = useProposalDelegations()

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
  const votes = [
    {
      name: "yes",
      icon: "hugeicons:thumbs-up",
      color: "#10b981",
      description: "Vote in favor of this proposal.",
      value: 7500000,
      price: 1,
      percentage: 78.9
    },
    {
      name: "no",
      icon: "hugeicons:thumbs-down",
      color: "#ef4444",
      description: "Vote against this proposal.",
      value: 1500000,
      price: 1,
      percentage: 15.8
    },
    {
      name: "abstain",
      icon: "hugeicons:pause",
      color: "#828db3",
      description: "Formally abstain from voting.",
      value: 500000,
      price: 1,
      percentage: 4.8
    },
    {
      name: "veto",
      icon: "hugeicons:information-circle",
      color: "#f97315",
      description: "Strong opposition that can block the proposal.",
      value: 5000,
      price: 1,
      percentage: 0.5
    }
  ]

  return (
    <div className={clsx(s.vote, showContent && s.showed)}>
      <div className={s.heading} onClick={() => setShowContent(!showContent)}>
        <div className={s.top}>
          <Badge status={color} icon={icon}>
            {item.status}
          </Badge>
          <div className={s.hip}>HIP-{item.hip}</div>
          <time dateTime={item.date} className={s.date}>
            <Icon icon="hugeicons:clock-04" />
            {item.date}
          </time>
          <div className={s.result} data-color={voteColor}>
            <Icon icon={voteIcon} />
            Voted {item.vote}
          </div>
        </div>
        <h3 className={s.name}>{item.name}</h3>
        <Button
          icon={
            showContent ? "hugeicons:arrow-up-01" : "hugeicons:arrow-down-01"
          }
          size="xsmall"
          variant="secondary"
          border
          className={s.expand}
        />
      </div>
      {showContent && (
        <div className={s.content}>
          <div className={s.left}>
            <div className={clsx(s.info, s.max)}>
              <h3>Description</h3>
              <p>
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Est,
                velit, labore dolore alias sequi nam ullam saepe facere iusto
                quas voluptatem et doloribus aliquam tempore.
              </p>
            </div>
            <div className={s.info}>
              <h3>Proposer</h3>
              <p>
                <Link href="/validators/details">
                  Helios Guardian <Icon icon="hugeicons:link-circle-02" />
                </Link>
              </p>
            </div>
            <div className={s.info}>
              <h3>Submitted On</h3>
              <p>Apr 17, 2025</p>
            </div>
            <div className={s.info}>
              <h3>Voting Ends On</h3>
              <p>Apr 24, 2025</p>
            </div>
            <div className={s.info}>
              <h3>Participation</h3>
              <p>45.67%</p>
            </div>
            <Button
              icon="hugeicons:add-to-list"
              onClick={() => setShowModal(true)}
            >
              Change my vote
            </Button>
            <Modal
              open={showModal}
              onClose={() => setShowModal(false)}
              title="Change my vote"
              className={s.modal}
              responsiveBottom
            >
              <p>
                HIP-23: Increase validator set to 150
                <small>Voting ends Jun 20, 2025</small>
              </p>
              <ul className={s.voting}>
                {votes.map((voteOption) => (
                  <li
                    key={voteOption.name}
                    className={clsx(vote === voteOption.name && s.active)}
                    style={
                      { "--color": voteOption.color } as React.CSSProperties
                    }
                    onClick={() => setVote(voteOption.name as VoteVote)}
                  >
                    <Icon icon={voteOption.icon} />
                    <div className={s.votingContent}>
                      <strong>{voteOption.name}</strong>
                      <span>{voteOption.description}</span>
                    </div>
                  </li>
                ))}
              </ul>
              <div className={s.power}>
                <span>Your Voting Power:</span> <strong>{formatNumber(votingPower, 2)} votes</strong>
              </div>
              <div className={s.group}>
                <Button variant="secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button
                  className={s.confirm}
                  onClick={() => setShowModal(false)}
                  icon="hugeicons:add-to-list"
                >
                  Submit Vote
                </Button>
              </div>
            </Modal>
          </div>
          <div className={s.right}>
            <h3>Voting Results</h3>
            <RechartsPie data={votes} className={s.pie} />
            <RechartsPieLegend data={votes} className={s.legend} />
            <div className={s.progress} data-color="primary">
              <h3 className={s.progressTitle}>Quorum progress</h3>
              <Progress value={93} max={100} />
              <div className={s.progressBottom}>
                <span>93% of quorum</span>
                <span>93000000 / 100000000</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
