"use client"

import { Button } from "../../shared-components/button"
import { Dropdown } from "../../shared-components/dropdown"
import { truncateAddress } from "../../lib/utils"
import { toast } from "sonner"
import s from "./wallet.module.scss"
import { useAccount, useDisconnect } from "wagmi"
import { useEffect, useState } from "react"
import { useAppKit } from "@reown/appkit/react"

export const Wallet = () => {
  const { open: openLoginModal, close: closeLoginModal } = useAppKit()
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const [wasConnected, setWasConnected] = useState(false)

  useEffect(() => {
    if (isConnected && !wasConnected) {
      toast.success("Logged in")
      setWasConnected(true)
    }
    if (!isConnected) {
      setWasConnected(false)
    }
  }, [isConnected, wasConnected])

  const handleConnect = async () => {
    await openLoginModal()
  }

  const handleLogout = async () => {
    await closeLoginModal()
    disconnect()
    toast.success("Logged out")
  }

  if (!address) {
    return (
      <Button
        iconRight="hugeicons:wallet-01"
        className={s.button}
        onClick={handleConnect}
      >
        <span>Connect Wallet</span>
      </Button>
    )
  }

  return (
    <Dropdown
      opener={
        <Button
          iconRight="hugeicons:more-vertical-circle-01"
          className={s.button}
        >
          <span>{truncateAddress(address)}</span>
        </Button>
      }
      position="bottom-right"
    >
      <ul>
        <li>
          <Button iconLeft="hugeicons:user" isNav={true}>
            Account
          </Button>
        </li>
        <li>
          <Button iconLeft="hugeicons:settings-02" isNav={true}>
            Settings
          </Button>
        </li>
        <li>
          <Button
            iconLeft="hugeicons:logout-03"
            isNav={true}
            onClick={handleLogout}
            variant="danger"
          >
            Logout
          </Button>
        </li>
      </ul>
    </Dropdown>
  )
}
