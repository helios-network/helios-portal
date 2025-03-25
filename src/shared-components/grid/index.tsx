import clsx from "clsx"
import { forwardRef } from "react"
import s from "./grid.module.scss"

interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

interface AreaProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  area: string
}

export const Grid = forwardRef<HTMLDivElement, GridProps>(
  ({ children, ...props }, ref) => {
    return (
      <div {...props} className={clsx(s.grid, props.className)} ref={ref}>
        {children}
      </div>
    )
  }
)

Grid.displayName = "Grid"

export const Area = forwardRef<HTMLDivElement, AreaProps>(
  ({ children, area, ...props }, ref) => {
    return (
      <div
        {...props}
        className={clsx(s.area, props.className)}
        style={{ gridArea: area }}
        data-area={area}
        ref={ref}
      >
        {children}
      </div>
    )
  }
)

Area.displayName = "Area"
