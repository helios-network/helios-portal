"use client"

import { Button } from "../../shared-components/button"
import { useActive } from "../../hooks/useActive"
import { useAppStore } from "../../stores/app"
import s from "./nav.module.scss"

export interface NavItemProps {
  icon: string
  label: string
  href: string
}

const NavItem = ({ icon, label, href }: NavItemProps) => {
  const active = useActive(href)
  const { setNav } = useAppStore()

  return (
    <li>
      <Button
        href={href}
        iconLeft={icon}
        className={s.item}
        isActive={active}
        isNav={true}
        onClick={() => setNav(false)}
      >
        {label}
      </Button>
    </li>
  )
}

export default NavItem
