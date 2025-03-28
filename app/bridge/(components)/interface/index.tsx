"use client"

import { Button } from "@/components/button"
import { Card } from "@/components/card"
import { Heading } from "@/components/heading"
import { Icon } from "@/components/icon"
import { Modal } from "@/components/modal"
import { Symbol } from "@/components/symbol"
import { getAllChains } from "@/config/chains"
import { getAllTokens } from "@/config/tokens"
import { formatNumber } from "@/lib/utils/number"
import { useUserStore } from "@/stores/user"
import { type Chain } from "@/types/Chains"
import { type Token } from "@/types/Tokens"
import clsx from "clsx"
import Image from "next/image"
import { useState } from "react"
import { toast } from "sonner"
import s from "./interface.module.scss"

type BridgeForm = {
  asset: Token
  from: Chain
  to: Chain
  amount: number
  address: string
}

export const Interface = () => {
  const tokens = getAllTokens()
  const chains = getAllChains()
  const { address } = useUserStore()
  const [openToken, setOpenToken] = useState(false)
  const [openChain, setOpenChain] = useState(false)
  const [openQr, setOpenQr] = useState(false)
  const [chainType, setChainType] = useState<"from" | "to">("from")
  const [form, setForm] = useState<BridgeForm>({
    asset: tokens[0],
    from: chains[0],
    to: chains[1],
    amount: 0,
    address: address || ""
  })

  const handleChangeToken = (token: Token) => {
    setForm({ ...form, asset: token })
    setOpenToken(false)
  }

  const handleOpenChain = (type: "from" | "to") => {
    setChainType(type)
    setOpenChain(true)
  }

  const handleChangeChain = (chain: Chain) => {
    if (chainType === "from" && chain.id === form.to.id) {
      setForm({ ...form, from: chain, to: form.from })
    } else if (chainType === "to" && chain.id === form.from.id) {
      setForm({ ...form, to: chain, from: form.to })
    } else {
      setForm({ ...form, [chainType]: chain })
    }
    setOpenChain(false)
  }

  const handleSwap = () => {
    setForm({ ...form, from: form.to, to: form.from })
  }

  const handleFocusInput = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      e.currentTarget.querySelector("input")?.focus()
    }
  }

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(form.address)
    toast.success("Address copied to clipboard")
  }

  return (
    <>
      <Card className={s.interface}>
        <Heading
          icon="hugeicons:exchange-02"
          title="Cross-Chain Bridge"
          description="Exchange your assets between chains."
        >
          <Button icon="hugeicons:download-03" />
          <Button icon="hugeicons:upload-03" variant="secondary" border />
        </Heading>
        <div className={s.content}>
          <div className={s.form}>
            <div
              className={clsx(s.input, s.inputToken)}
              onClick={() => setOpenToken(true)}
            >
              <Symbol
                icon={form.asset.symbolIcon}
                color={form.asset.color}
                className={s.icon}
              />
              <input className={s.value} value={form.asset.name} readOnly />
              <label htmlFor="amount" className={s.label}>
                Choose the cross-chain bridge asset
              </label>
              <Icon icon="hugeicons:arrow-right-01" className={s.arrow} />
            </div>
            <div className={s.swap}>
              <div
                className={clsx(s.swapInput, s.from)}
                onClick={() => handleOpenChain("from")}
              >
                <label htmlFor="from" className={s.swapLabel}>
                  From
                </label>
                <Symbol
                  icon={form.from.iconName}
                  color={form.from.color}
                  className={s.swapIcon}
                />
                <input
                  className={s.swapValue}
                  value={form.from.name}
                  readOnly
                />
                <Icon icon="hugeicons:arrow-down-01" className={s.swapArrow} />
              </div>
              <button onClick={handleSwap} className={s.swapButton}>
                <Icon icon="hugeicons:arrow-right-02" />
              </button>
              <div
                className={clsx(s.swapInput, s.to)}
                onClick={() => handleOpenChain("to")}
              >
                <label htmlFor="to" className={s.swapLabel}>
                  To
                </label>
                <Symbol
                  icon={form.to.iconName}
                  color={form.to.color}
                  className={s.swapIcon}
                />
                <input className={s.swapValue} value={form.to.name} readOnly />
                <Icon icon="hugeicons:arrow-down-01" className={s.swapArrow} />
              </div>
            </div>
            <div
              className={clsx(s.input, s.inputAmount)}
              onClick={handleFocusInput}
            >
              <input
                id="amount"
                className={s.value}
                type="number"
                step="0.000001"
                min="0"
                value={form.amount}
                onChange={(e) => {
                  const value =
                    e.target.value === "" ? 0 : parseFloat(e.target.value)
                  setForm({ ...form, amount: value })
                }}
              />
              <label htmlFor="amount" className={s.label}>
                Amount
                <small>Balance: {formatNumber(1000000)}</small>
              </label>
              <Button
                variant="secondary"
                className={s.max}
                size="xsmall"
                onClick={() => {
                  setForm({ ...form, amount: 1000000 })
                }}
              >
                Max
              </Button>
            </div>
            <div
              className={clsx(s.input, s.inputAddress)}
              onClick={handleFocusInput}
            >
              <input
                id="address"
                className={s.value}
                type="text"
                placeholder="Enter your address"
                value={form.address}
                onChange={(e) => {
                  const value = e.target.value
                  setForm({ ...form, address: value })
                }}
              />
              <label htmlFor="address" className={s.label}>
                Deposit Address
              </label>
              <Button
                variant="secondary"
                className={s.btn}
                size="xsmall"
                icon="hugeicons:copy-01"
                onClick={handleCopyAddress}
              />
              <Button
                variant="secondary"
                className={s.btn}
                size="xsmall"
                icon="hugeicons:qr-code"
                onClick={() => setOpenQr(true)}
              />
            </div>
          </div>
          <div className={s.recap}>
            <div className={s.recapItem}>
              <span>Estimated Fees:</span>
              <strong>0.005 ETH</strong>
            </div>
            <div className={s.recapItem}>
              <span>You will receive:</span>
              <strong>0.000 ETH</strong>
            </div>
          </div>
          <Button
            className={s.deposit}
            icon="hugeicons:download-03"
            size="large"
          >
            Deposit now
          </Button>
        </div>
      </Card>
      <Modal
        title="Select a Token"
        onClose={() => setOpenToken(false)}
        open={openToken}
        className={s.modal}
        responsiveBottom
      >
        <ul className={s.list}>
          {tokens.map((token) => (
            <li key={token.id}>
              <Button
                variant="secondary"
                iconRight="hugeicons:arrow-right-01"
                border
                onClick={() => handleChangeToken(token)}
                hovering={token.id === form.asset.id}
                className={clsx(s.button)}
              >
                <Symbol
                  icon={token.symbolIcon}
                  color={token.color}
                  className={s.icon}
                />
                <span>{token.name}</span>
              </Button>
            </li>
          ))}
        </ul>
      </Modal>
      <Modal
        title="Select a Chain"
        onClose={() => setOpenChain(false)}
        open={openChain}
        className={s.modal}
        responsiveBottom
      >
        <ul className={s.list}>
          {chains.map((chain) => {
            return (
              <li key={chain.id}>
                <Button
                  variant="secondary"
                  iconRight="hugeicons:arrow-right-01"
                  border
                  onClick={() => handleChangeChain(chain)}
                  hovering={chain.id === form[chainType].id}
                  className={s.button}
                >
                  <Symbol icon={chain.iconName} color={chain.color} />
                  <span>{chain.name}</span>
                </Button>
              </li>
            )
          })}
        </ul>
      </Modal>
      <Modal
        open={openQr}
        onClose={() => setOpenQr(false)}
        className={s.modalQrcode}
        closeButton={false}
      >
        <div className={s.qrcode}>
          <Image src="/img/qrcode.svg" alt="QR Code" width={200} height={200} />
        </div>
        <Button onClick={handleCopyAddress}>Copy this address</Button>
        <Button
          variant="secondary"
          onClick={() => setOpenQr(false)}
          size="small"
          className={s.close}
        >
          Close
        </Button>
      </Modal>
    </>
  )
}
