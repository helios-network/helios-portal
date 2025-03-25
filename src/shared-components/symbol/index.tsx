import clsx from "clsx"
import { Icon } from "../icon"
import s from "./symbol.module.scss"

interface SymbolProps {
  icon: string
  color?: string
  className?: string
}

export const Symbol = ({ icon, color, className }: SymbolProps) => {
  return (
    <div
      className={clsx(s.symbol, className)}
      style={{ "--color": color } as React.CSSProperties}
      data-symbol={icon}
    >
      <Icon icon={icon} />
    </div>
  )
}
