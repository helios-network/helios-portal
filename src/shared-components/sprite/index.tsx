"use client"

import React from "react"
import spriteSvg from "../../public/img/sprites.svg"

export interface SpriteProps extends React.SVGProps<SVGSVGElement> {
  id: string
  title?: string
}

export const Sprite = React.forwardRef<SVGSVGElement, SpriteProps>(
  ({ id, title, ...props }, ref) => {
    return (
      <svg {...props} ref={ref}>
        {title && <title>{title}</title>}
        <use href={`${spriteSvg}#${id}`} />
      </svg>
    )
  }
)

Sprite.displayName = "Sprite"
