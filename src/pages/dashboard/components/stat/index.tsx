import { Card } from "../../../../shared-components/card"
import { Heading } from "../../../../shared-components/heading"
import s from "./stat.module.scss"

interface StatProps {
  icon: string
  label: string
  value: number | string
  left?: string
  right?: string
}

export const Stat = ({ icon, label, value, left, right }: StatProps) => {
  return (
    <Card className={s.stat}>
      <Heading icon={icon} />
      <div className={s.bottom}>
        <div className={s.value}>
          {left && <span>{left}</span>}
          <strong>{value}</strong>
          {right && <span>{right}</span>}
        </div>
        <div className={s.label}>{label}</div>
      </div>
    </Card>
  )
}
