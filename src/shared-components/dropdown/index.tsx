"use client"


import clsx from "clsx"
import { cloneElement, useRef, useState } from "react"
import { useOnClickOutside } from "usehooks-ts"
import s from "./dropdown.module.scss"
import { Positions } from "../../types/Positions"

interface DropdownProps {
  opener: React.ReactElement 
  children: React.ReactNode
  outside?: boolean
  position?: Positions
  className?: string
  classNameContent?: string
  classNameScroll?: string
  callbackOpen?: () => void
  callbackClose?: () => void
  isOpenControlled?: boolean
  ariaLabel?: string
}

export const Dropdown = ({
  opener,
  children,
  outside = true,
  position = "right-bottom",
  className,
  classNameContent,
  classNameScroll,
  callbackOpen,
  callbackClose,
  isOpenControlled,
  ariaLabel = "Dropdown"
}: DropdownProps) => {
  const [isOpenInternal, setIsOpenInternal] = useState(false)
  const isOpen =
    isOpenControlled !== undefined ? isOpenControlled : isOpenInternal
  const dropdownRef = useRef<HTMLDivElement>(null)

  const handleToggle = () => {
    if (isOpenControlled === undefined) {
      setIsOpenInternal(!isOpen)
    }

    if (isOpen) {
      callbackClose?.()
    } else {
      callbackOpen?.()
    }
  }

  // @ts-expect-error - useOnClickOutside not updated ts
  useOnClickOutside(dropdownRef, () => {
    if (isOpen && outside && isOpenControlled === undefined) {
      setIsOpenInternal(false)
      callbackClose?.()
    }
  })

  return (
    <div
      ref={dropdownRef}
      className={clsx(s.dropdown, className)}
      role="menu"
      aria-label={ariaLabel}
      aria-expanded={isOpen}
    >
      {cloneElement(opener, {
        // @ts-expect-error - handle on clone not updated ts
        onClick: handleToggle,
        "data-open": isOpen,
        "aria-haspopup": true
      })}
      {isOpen && (
        <div className={clsx(s.content, s[position], classNameContent)}>
          <div className={clsx(s.scroll, classNameScroll)}>{children}</div>
        </div>
      )}
    </div>
  )
}
