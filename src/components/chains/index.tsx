"use client"

import { Modal } from "../../shared-components/modal"
import { Symbol } from "../../shared-components/symbol"
import { CHAINS, getChainByNumber } from "../../config/chains"
import { Chain } from "../../types/Chains"
import clsx from "clsx"
import { useState } from "react"
import { toast } from "sonner"
import s from "./chains.module.scss"
import { useChainId, useSwitchChain } from "wagmi"
import { Button } from "../../shared-components/button"

export const Chains = () => {
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()
  const [open, setOpen] = useState(false)
  const info = getChainByNumber(chainId)

  const handleChange = (chain: Chain) => {
    switchChain({ chainId: chain.chainNb })
    setOpen(false)
    toast.success(`Switched to ${chain.name}`)
  }

  return (
    <>
      <Button
        variant="secondary"
        iconRight="hugeicons:arrow-down-01"
        className={clsx(s.button, s.change)}
        border
        onClick={() => setOpen(!open)}
      >
        {info && (
          <>
            <Symbol icon={info.iconName} color={info.color} />
            <span>{info.name}</span>
          </>
        )}
      </Button>
      <Modal
        title="Select a Network"
        onClose={() => setOpen(false)}
        open={open}
        className={s.modal}
        responsiveBottom
      >
        <ul className={s.list}>
          {CHAINS.map((chain) => (
            <li key={chain.id}>
              <Button
                variant="secondary"
                iconRight="hugeicons:arrow-right-01"
                border
                onClick={() => handleChange(chain)}
                hovering={chain.chainNb === chainId}
                className={clsx(s.button)}
              >
                <Symbol
                  icon={chain.iconName}
                  color={chain.color}
                  className={s.icon}
                />
                <span>{chain.name}</span>
              </Button>
            </li>
          ))}
        </ul>
      </Modal>
    </>
  )
}
