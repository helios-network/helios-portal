import clsx from "clsx"
import { forwardRef } from "react"
import s from "./card.module.scss"

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, ...props }, ref) => {
    return (
      <div {...props} className={clsx(s.card, props.className)} ref={ref}>
        {children}
      </div>
    )
  }
)

Card.displayName = "Card"
