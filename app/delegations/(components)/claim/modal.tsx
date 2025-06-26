"use client"

import { Button } from "@/components/button"
import { Icon } from "@/components/icon"
import { Modal } from "@/components/modal"
import clsx from "clsx"
import { toast } from "sonner"
import s from "./claim.module.scss"
import { formatNumber } from "@/lib/utils/number"
import { useRewards } from "@/hooks/useRewards"
import { Message } from "@/components/message"

interface ModalClaimProps {
  title: string
  open: boolean
  setOpen: (open: boolean) => void
  rewards: number
  rewardsPrice: number
  validatorAddress?: string
}

export const ModalClaim = ({
  title,
  open,
  setOpen,
  rewards,
  rewardsPrice,
  validatorAddress
}: ModalClaimProps) => {
  const { claimRewards, claimValidatorRewards, feedback, isLoading } =
    useRewards()

  const classes = clsx(s.claim, rewards > 0 && s.claimAvailable)

  const handleClaim = async () => {
    try {
      const claimPromise = validatorAddress
        ? claimValidatorRewards(validatorAddress)
        : claimRewards()

      await toast.promise(claimPromise, {
        loading: "Processing your claim...",
        success: (data) => {
          setTimeout(() => {
            setOpen(false)
          }, 3000)

          return `Successfully claimed ${formatNumber(rewards)} HLS!`
        },
        error: (err) => err.message || "An unknown error occurred."
      })
    } catch (error) {
      console.error("Claim failed:", error)
    }
  }

  return (
    <Modal
      title={title}
      onClose={() => setOpen(false)}
      open={open}
      className={s.modal}
      responsiveBottom
    >
      <div className={classes}>
        <h3>Available Rewards</h3>
        <div className={s.available}>
          {formatNumber(rewards)} <Icon icon="helios" />
        </div>
        <div className={s.price}>≈${formatNumber(rewardsPrice)}</div>
      </div>
      <Button
        icon={isLoading ? "svg-spinners:6-dots-rotate" : "helios"}
        variant={rewards > 0 ? "success" : "primary"}
        onClick={handleClaim}
        disabled={rewards <= 0 || isLoading}
      >
        {isLoading ? "Claiming..." : "Claim Rewards"}
      </Button>
      {feedback && feedback.message !== "" && (
        <Message title="Rewards feedback" variant={feedback.status}>
          {feedback.message}
        </Message>
      )}
    </Modal>
  )
}