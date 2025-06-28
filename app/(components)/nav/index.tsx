"use client"

import { Button } from "@/components/button"
import routes from "@/config/routes"
import { useAppStore } from "@/stores/app"
import clsx from "clsx"
import { useRef } from "react"
import { useOnClickOutside } from "usehooks-ts"
import NavItem, { type NavItemProps } from "./nav-item"
import s from "./nav.module.scss"

export const Nav = () => {
  const { nav, setNav } = useAppStore()
  const ref = useRef(null)

  // @ts-expect-error - useOnClickOutside not updated ts
  useOnClickOutside(ref, () => setNav(false))

  const list: NavItemProps[] = [
    {
      icon: "hugeicons:home-01",
      label: "Dashboard",
      href: routes.dashboard
    },
    {
      icon: "hugeicons:exchange-02",
      label: "Bridge",
      href: routes.bridge
    },
    {
      icon: "hugeicons:flowchart-01",
      label: "Validators",
      href: routes.validators
    },
    {
      icon: "hugeicons:chart-rose",
      label: "Delegations",
      href: routes.delegations
    },
    {
      icon: "hugeicons:chart-breakout-circle",
      label: "Governance",
      href: routes.governance,
      disabled: false
    }
  ]

  return (
    <nav className={s.nav} ref={ref}>
      <ul className={s.list}>
        {list.map((item) => (
          <NavItem key={item.href} {...item} />
        ))}
      </ul>
      <ul className={clsx(s.sub, s.list, nav && s.open)}>
        {list.map((item) => (
          <NavItem key={item.href} {...item} />
        ))}
      </ul>
      <Button
        iconRight={nav ? "hugeicons:arrow-down-01" : "hugeicons:menu-01"}
        variant="secondary"
        className={s.bnav}
        onClick={() => setNav(!nav)}
        border
      />
    </nav>
  )
}
