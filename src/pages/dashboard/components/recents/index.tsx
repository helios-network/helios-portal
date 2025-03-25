"use client"

import { Button } from "../../../../shared-components/button"
import { Card } from "../../../../shared-components/card"
import { Heading } from "../../../../shared-components/heading"
import { Transactions } from "../../../../shared-components/transactions"
import { useUserStore } from "../../../../stores/user"

export const Recents = () => {
  const { history } = useUserStore()

  return (
    <Card>
      <Heading icon="hugeicons:blockchain-05" title="Recent Transactions">
        <Button icon="hugeicons:arrow-right-01" variant="secondary" border />
      </Heading>
      <Transactions transactions={history.slice(0, 3)} />
    </Card>
  )
}
