"use client"

import clsx from "clsx"
import { forwardRef, MouseEvent } from "react"

interface LinkProps {
  href: string
  title?: string
  className?: string
  children: React.ReactNode
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void
  isActive?: boolean
  activeClassName?: string
}

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  (
    {
      href,
      title,
      className,
      onClick,
      children,
      isActive,
      activeClassName,
      ...props
    },
    ref
  ) => {
    const isExternal = href.startsWith("http")
    const isAnchor = href.startsWith("#")
    const isCurrentActive = isActive || false

    const attr = isExternal
      ? { target: "_blank", rel: "noopener noreferrer" }
      : {}

    const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
      if (isAnchor) {
        e.preventDefault()
        const targetId = href.includes("#") ? href.split("#")[1] : ""
        if (targetId) {
          const targetElement = document.getElementById(targetId)
          targetElement?.scrollIntoView({ behavior: "smooth" })
        }
      }
      onClick?.(e)
    }

    return (
      <a
        ref={ref}
        onClick={handleClick}
        href={href}
        title={title}
        className={clsx(className, isCurrentActive && activeClassName)}
        {...props}
        {...attr}
      >
        {children}
      </a>
    )
  }
)

Link.displayName = "Link"
