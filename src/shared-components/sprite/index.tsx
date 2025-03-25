"use client"

import React from "react"

export interface SpriteProps extends React.SVGProps<SVGSVGElement> {
  id: string
  title?: string
}

export const Sprite = React.forwardRef<SVGSVGElement, SpriteProps>(
  ({ id, title, ...props }, ref) => {
    return (
      <svg {...props} ref={ref}>
        {title && <title>{title}</title>}
        <use href={`/img/sprites.svg#${id}`} />
      </svg>
    )
  }
)

Sprite.displayName = "Sprite"
