"use client"

import { useNavigate, useLocation } from "react-router-dom"
import { Button } from "../../shared-components/button"
import { useAppStore } from "../../stores/app"
import s from "./nav.module.scss"

export interface NavItemProps {
  icon: string
  label: string
  href: string
}

const NavItem = ({ icon, label, href }: NavItemProps) => {
  const navigate = useNavigate()
  const location = useLocation()
  const active = location.pathname === href
  const { setNav } = useAppStore()
  
  const handleClick = () => {
    setNav(false)
    navigate(href)
  }

  return (
    <li>
      <Button
        iconLeft={icon}
        className={s.item}
        isActive={active}
        isNav={true}
        onClick={handleClick}
      >
        {label}
      </Button>
    </li>
  )
}

export default NavItem
