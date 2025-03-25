"use client"

import { Button } from "../../shared-components/button"
import { Dropdown } from "../../shared-components/dropdown"
import { truncateAddress } from "../../lib/utils"
import { useUserStore } from "../../stores/user"
import { toast } from "sonner"
import s from "./wallet.module.scss"

export const Wallet = () => {
  const { address, logged, setLogged } = useUserStore()

  const handleConnect = () => {
    setLogged(true)
    toast.success("Connected to wallet")
  }

  const handleLogout = () => {
    setLogged(false)
    toast.success("Logged out")
  }

  if (!logged) {
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
    <>
      {address && (
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
                variant="primary"
              >
                Logout
              </Button>
            </li>
          </ul>
        </Dropdown>
      )}
    </>
  )
}
