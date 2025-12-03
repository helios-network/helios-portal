"use client"

import { useState } from "react"
import { Modal } from "@/components/modal"
import { Input } from "@/components/input"
import { Button } from "@/components/button"
import { useTransferToken } from "@/hooks/useTransferToken"
import { TokenExtended } from "@/types/token"
import { formatTokenAmount } from "@/lib/utils/number"
import { Message } from "@/components/message"
import s from "./transfer-token-modal.module.scss"
import { useAccount, useChainId } from "wagmi"
import { toast } from "sonner"
import { HELIOS_NETWORK_ID } from "@/config/app"

interface TransferTokenModalProps {
  open: boolean
  onClose: () => void
  token: TokenExtended | null
}

export function TransferTokenModal({
  open,
  onClose,
  token
}: TransferTokenModalProps) {
  const { address } = useAccount()
  const chainId = useChainId()
  const { transfer, feedback, isLoading } = useTransferToken()
  const [recipientAddress, setRecipientAddress] = useState("")
  const [amount, setAmount] = useState("")
  const [errors, setErrors] = useState<{
    recipient?: string
    amount?: string
  }>({})

  const validateForm = () => {
    const newErrors: { recipient?: string; amount?: string } = {}

    // Validate recipient address
    if (!recipientAddress) {
      newErrors.recipient = "Recipient address is required"
    } else if (!/^0x[a-fA-F0-9]{40}$/i.test(recipientAddress)) {
      newErrors.recipient = "Invalid Ethereum address format"
    } else if (recipientAddress.toLowerCase() === address?.toLowerCase()) {
      newErrors.recipient = "Cannot send tokens to your own address"
    }

    // Validate amount
    if (!amount || parseFloat(amount) <= 0) {
      newErrors.amount = "Amount must be greater than zero"
    } else if (token && parseFloat(amount) > token.balance.amount) {
      newErrors.amount = "Insufficient balance"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleMaxClick = () => {
    if (token) {
      setAmount(token.balance.amount.toString())
    }
  }

  const handleSubmit = async () => {
    if (!token || !validateForm()) {
      return
    }

    // Check if we're on the correct network
    if (chainId !== HELIOS_NETWORK_ID) {
      toast.error(
        `Please switch to Helios network (Chain ID: ${HELIOS_NETWORK_ID}). Current chain ID: ${chainId}`
      )
      return
    }

    const toastId = toast.loading("Sending transfer transaction...")

    try {
      await transfer(
        token.functionnal.address,
        recipientAddress,
        amount,
        token.functionnal.decimals
      )

      toast.success("Transfer sent successfully!", { id: toastId })
      onClose()
    } catch (error: any) {
      toast.error(
        error.message || "Failed to send transfer transaction.",
        { id: toastId }
      )
    }
  }

  if (!token) return null

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Send ${token.display.symbol.toUpperCase()}`}
      className={s.modal}
    >
      <div className={s.content}>
        <div className={s.tokenInfo}>
          <div className={s.tokenName}>{token.display.name}</div>
          <div className={s.tokenSymbol}>
            Balance: {formatTokenAmount(token.balance.amount)}{" "}
            {token.display.symbol.toUpperCase()}
          </div>
        </div>

        <div className={s.form}>
          <Input
            label="Recipient Address"
            placeholder="0x..."
            value={recipientAddress}
            onChange={(e) => setRecipientAddress(e.target.value)}
            error={errors.recipient}
            icon="hugeicons:user-02"
            className={s.input}
          />

          <Input
            label="Amount"
            type="number"
            placeholder="0.0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            error={errors.amount}
            icon="hugeicons:coins-02"
            balance={token.balance.amount}
            showMaxButton
            onMaxClick={handleMaxClick}
            className={s.input}
          />

          {feedback.message && (
            <Message
              variant={feedback.status}
              className={s.message}
              title=""
            >
              {feedback.message}
            </Message>
          )}

          <div className={s.actions}>
            <Button
              variant="secondary"
              onClick={() => {
                setRecipientAddress("")
                setAmount("")
                setErrors({})
                onClose()
              }}
              disabled={isLoading}
            >
              Cancel
            </Button>
            {isLoading ? (<Button
              variant="secondary"
              disabled={true}
            >
              Sending...
            </Button>) : (
              <Button
                variant="primary"
                onClick={handleSubmit}
                disabled={isLoading || !recipientAddress || !amount}
              >
                Send
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  )
}

