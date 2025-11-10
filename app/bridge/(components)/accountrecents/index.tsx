"use client"

import { Card } from "@/components/card"
import { Heading } from "@/components/heading"
import s from "./recents.module.scss"
import { Transactions } from "@/components/transactions"
import { useBridge } from "@/hooks/useBridge"
// import { useUserStore } from "@/stores/user"

export const AccountRecents = () => {
  const { lastAccountBridgeTxs } = useBridge()

  return (
    <Card className={s.recents}>
      <Heading
        icon="hugeicons:blockchain-05"
        title="Your recent bridge transactions"
      ></Heading>
      <Transactions transactions={lastAccountBridgeTxs} isClientTxs={true} />
    </Card>
  )
}
