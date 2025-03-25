import clsx from "clsx"
import { Icon } from "../icon"
import s from "./heading.module.scss"

interface HeadingProps {
  icon?: string
  title?: string
  description?: string
  className?: string
  rightClassName?: string
  children?: React.ReactNode
}

export const Heading = ({
  icon,
  title,
  description,
  className,
  rightClassName,
  children
}: HeadingProps) => {
  return (
    <div className={clsx(s.heading, className)}>
      {icon && (
        <div className={s.icon}>
          <Icon icon={icon} />
        </div>
      )}
      {(title || description) && (
        <div className={s.content}>
          {title && <h2 className={s.title}>{title}</h2>}
          {description && <p className={s.description}>{description}</p>}
        </div>
      )}
      <div className={clsx(s.right, rightClassName)}>{children}</div>
    </div>
  )
}
