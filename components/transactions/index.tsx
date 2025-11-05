import { TransactionLight } from "@/types/transaction"
import { Table } from "../table"
import { TransactionsLine } from "./line"
import { Message } from "../message"

type TransactionsProps = {
  transactions: TransactionLight[]
  isClientTxs?: boolean
}

export const Transactions = ({ transactions, isClientTxs }: TransactionsProps) => {
  if (transactions.length === 0) {
    return (
      <Message title="Transactions informations" variant="primary">
        No recent transactions.
      </Message>
    )
  }

  return (
    <Table>
      <tbody>
        {transactions.map((transaction, index) => (
          <TransactionsLine
            key={"transactions-" + index}
            transaction={transaction}
            isClientTxs={isClientTxs}
          />
        ))}
      </tbody>
    </Table>
  )
}
