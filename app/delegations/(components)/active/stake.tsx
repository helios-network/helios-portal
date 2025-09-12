"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/button"
import { Input } from "@/components/input/input"
import { Select } from "@/components/input/select"
import { Modal } from "@/components/modal"
import { ChangeEvent, useState } from "react"
import { toast } from "sonner"
import s from "./active.module.scss"
import { useAssetsInfo } from "@/hooks/useAssetsInfo"
import { useDelegate } from "@/hooks/useDelegate"
import { Message } from "@/components/message"
import { HELIOS_TOKEN_ADDRESS } from "@/config/app"
import { ethers } from "ethers"
import { getErrorMessage } from "@/utils/string"

interface ModalStakeProps {
  title: string
  validatorAddress: string
  minDelegation: string
  hasAlreadyDelegated: boolean
  open: boolean
  setOpen: (open: boolean) => void
}

export const ModalStake = ({
  title,
  validatorAddress,
  minDelegation,
  hasAlreadyDelegated,
  open,
  setOpen
}: ModalStakeProps) => {
  const router = useRouter()
  const [amount, setAmount] = useState("0")
  const [selectedAsset, setSelectedAsset] = useState("")
  const { assets } = useAssetsInfo({ updateBalance: open })
  const { delegate, isLoading, feedback, resetFeedback } = useDelegate()
  const formattedMinDelegation = parseFloat(ethers.formatEther(minDelegation))

  const enrichedAsset = assets?.find(
    (asset) => asset.enriched.functionnal.address === selectedAsset
  )
  const assetIsHLS =
    enrichedAsset?.enriched.functionnal.address === HELIOS_TOKEN_ADDRESS

  const handleStake = async () => {
    if (!enrichedAsset) {
      toast.error("Please select an asset")
      return
    }

    const toastId = toast.loading("Sending delegation transaction...")
    try {
      await delegate(
        validatorAddress,
        amount,
        enrichedAsset.enriched.functionnal.denom,
        enrichedAsset.enriched.functionnal.decimals
      )

      toast.success("Delegation successful!", {
        id: toastId
      })
      setOpen(false)
      resetFeedback()

      router.push("/delegations")
    } catch (err: any) {
      toast.error(getErrorMessage(err) || "Error during delegation", {
        id: toastId
      })
    }
  }

  const handleAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    const normalizedValue = inputValue.replace(",", ".")

    if (!/^[0-9.,]*$/.test(normalizedValue)) return

    if (normalizedValue === "0." || normalizedValue === "0,") {
      setAmount("0.")
      return
    }

    const cleaned = normalizedValue.replace(/^0+(?=\d)/, "")

    setAmount(cleaned === "" ? "0" : cleaned)
  }

  const amountNb = parseFloat(amount)
  const isDisabled =
    isLoading ||
    !selectedAsset ||
    amountNb <= 0 ||
    (enrichedAsset && amountNb > enrichedAsset.enriched.balance.amount) ||
    (!hasAlreadyDelegated && parseFloat(amount) < formattedMinDelegation)

  return (
    <Modal
      title={title}
      onClose={() => setOpen(false)}
      open={open}
      className={s.modal}
      responsiveBottom
    >
      <Select
        value={selectedAsset}
        onChange={(evt) => {
          setSelectedAsset(evt.target.value)
          setAmount("0")
        }}
        placeholder="Please select an asset"
        options={
          assets?.map((asset) => ({
            value: asset.enriched.functionnal.address,
            label: asset.enriched.display.name
          })) || []
        }
        label="Choose an asset"
      />

      {assetIsHLS && (
        <Message
          title="About HLS for boosting purpose"
          variant="warning"
          nobreak
        >
          {`You will need to unstake all other assets to withdraw them, it's a way to secure the network and validators as they also take the risk of accepting your assets.`}
          <br />
          <br />
          <b>{`Delegating HLS will only boost the rewards of other tokens, it will not gain rewards by itself.`}</b>
        </Message>
      )}

      {enrichedAsset &&
        ((formattedMinDelegation > 0 && !hasAlreadyDelegated && assetIsHLS) ||
          formattedMinDelegation === 0) && (
          <Input
            icon={enrichedAsset.enriched.display.symbolIcon}
            label="Amount"
            type="text"
            value={amount}
            onChange={handleAmountChange}
            balance={enrichedAsset.enriched.balance.amount}
            showMaxButton
            onMaxClick={() =>
              setAmount(enrichedAsset.enriched.balance.amount.toString())
            }
          />
        )}

      {formattedMinDelegation > 0 && !hasAlreadyDelegated && (
        <Message
          title="Minimum delegation"
          variant="warning"
        >{`The minimum delegation is ${formattedMinDelegation} HLS`}</Message>
      )}
      <div className={s.group}>
        <Button
          variant="secondary"
          onClick={() => setOpen(false)}
          className={s.cancel}
        >
          Cancel
        </Button>
        <Button
          icon="hugeicons:add-circle"
          className={s.confirm}
          onClick={handleStake}
          disabled={isDisabled}
        >
          Confirm Stake
        </Button>
      </div>

      {feedback && feedback.message !== "" && (
        <Message title="Staking feedback" variant={feedback.status}>
          {feedback.message}
        </Message>
      )}
    </Modal>
  )
}
