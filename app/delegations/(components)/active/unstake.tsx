"use client"

import { Button } from "@/components/button"
import { Input } from "@/components/input/input"
import { Select } from "@/components/input/select"
import { Message } from "@/components/message"
import { Modal } from "@/components/modal"
import { ChangeEvent, useState } from "react"
import { toast } from "sonner"
import s from "./active.module.scss"
import { useDelegate } from "@/hooks/useDelegate"
import { TokenExtended } from "@/types/token"

interface ModalUnstakeProps {
  title: string
  validatorAddress: string
  delegatedAssets: TokenExtended[]
  open: boolean
  setOpen: (open: boolean) => void
}

export const ModalUnstake = ({
  title,
  validatorAddress,
  delegatedAssets,
  open,
  setOpen
}: ModalUnstakeProps) => {
  const [amount, setAmount] = useState("0")
  const [selectedAsset, setSelectedAsset] = useState("")
  const { undelegate, isLoading, feedback } = useDelegate()

  const enrichedAsset = delegatedAssets?.find(
    (asset) => asset.functionnal.address === selectedAsset
  )

  const handleUnstake = async () => {
    if (!enrichedAsset) {
      toast.error("Please select an asset")
      return
    }

    const toastId = toast.loading("Sending unstake transaction...")
    try {
      await undelegate(
        validatorAddress,
        amount.toString(),
        enrichedAsset.functionnal.denom,
        enrichedAsset.functionnal.decimals
      )

      toast.success("Unstake successful!", {
        id: toastId
      })
      setOpen(false)
    } catch (err: any) {
      toast.error(err?.message || "Error during unstake", {
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
    (enrichedAsset && amountNb > enrichedAsset.balance.amount)

  return (
    <Modal
      title={title}
      onClose={() => setOpen(false)}
      open={open}
      className={s.modal}
      responsiveBottom
    >
      {delegatedAssets && delegatedAssets.length > 0 ? (
        <Select
          value={selectedAsset}
          onChange={(evt) => {
            setSelectedAsset(evt.target.value)
            setAmount("0")
          }}
          placeholder="Please select an asset"
          options={
            delegatedAssets.map((asset) => ({
              value: asset.functionnal.address,
              label: asset.display.name
            }))
          }
          label="Choose an asset"
        />
      ) : (
        <Message variant="warning" title="No Delegated Assets">
          You do not have any assets to unstake from this validator.
        </Message>
      )}

      {enrichedAsset && (
        <Input
          icon={enrichedAsset.display.symbolIcon}
          label="Amount"
          type="text"
          value={amount}
          onChange={handleAmountChange}
          balance={enrichedAsset.balance.amount}
          showMaxButton
          onMaxClick={() => setAmount(enrichedAsset.balance.amount.toString())}
        />
      )}

      <Message
        icon="hugeicons:alert-02"
        variant="warning"
        title="Unbonding Period"
        className={s.message}
      >
        Your assets will be locked for 30 seconds during the unbonding period.
        You will not earn any rewards during this period.
      </Message>

      <div className={s.group}>
        <Button
          variant="secondary"
          onClick={() => setOpen(false)}
          className={s.cancel}
        >
          Cancel
        </Button>
        <Button
          icon="hugeicons:minus-sign-circle"
          className={s.confirm}
          onClick={handleUnstake}
          variant="warning"
          disabled={isDisabled}
        >
          Confirm Unstake
        </Button>
      </div>
      {feedback && feedback.message !== "" && (
        <Message title="Unstaking feedback" variant={feedback.status}>
          {feedback.message}
        </Message>
      )}
    </Modal>
  )
}