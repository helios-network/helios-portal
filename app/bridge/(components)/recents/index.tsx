"use client"

import { Button } from "@/components/button"
import { Card } from "@/components/card"
import { Heading } from "@/components/heading"
import s from "./recents.module.scss"
import { Transactions } from "@/components/transactions"
import { useUserStore } from "@/stores/user"

export const Recents = () => {
  const { history } = useUserStore()

  return (
    <Card className={s.recents}>
      <Heading icon="hugeicons:blockchain-05" title="Recent Transactions">
        <Button icon="hugeicons:arrow-right-01" variant="secondary" border />
      </Heading>
      <Transactions transactions={history.slice(0, 3)} />
    </Card>
  )
}
