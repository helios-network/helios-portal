import { Card } from "@/components/card"
import { Icon } from "@/components/icon"
import s from "./secure.module.scss"

export const Secure = () => {
  return (
    <Card className={s.secure}>
      <div className={s.content}>
        <Icon icon="hugeicons:security-check" />
        <p>
          <strong>Helios Bridge</strong> is secured by a decentralized network
          of validators and <span>uses multi-signature technology</span> to
          ensure the <strong>safety of your assets</strong>.
        </p>
      </div>
    </Card>
  )
}
