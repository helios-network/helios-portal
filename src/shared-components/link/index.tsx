"use client"

import clsx from "clsx"
import { Link as RouterLink } from "react-router-dom"
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

    if (isExternal) {
      return (
        <a
          ref={ref}
          href={href}
          title={title}
          className={className}
          onClick={onClick}
          target="_blank"
          rel="noopener noreferrer"
          {...props}
        >
          {children}
        </a>
      )
    }

    return (
      <RouterLink
        ref={ref}
        to={href}
        title={title}
        className={clsx(className, isActive && activeClassName)}
        onClick={onClick}
        {...props}
      >
        {children}
      </RouterLink>
    )
  }
)

Link.displayName = "Link"
