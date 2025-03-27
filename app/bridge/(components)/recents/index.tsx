import { Button } from "@/components/button"
import { Card } from "@/components/card"
import { Heading } from "@/components/heading"
import s from "./recents.module.scss"

export const Recents = () => {
  return (
    <Card className={s.recents}>
      <Heading icon="hugeicons:blockchain-05" title="Recent Transactions">
        <Button icon="hugeicons:arrow-right-01" variant="secondary" border />
      </Heading>
    </Card>
  )
}
