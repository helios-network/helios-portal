import { Transaction } from "../../types/Transactions"
import { Table } from "../table"
import { TransactionsLine } from "./line"

interface TransactionsProps {
  transactions: Transaction[]
}

export const Transactions = ({ transactions }: TransactionsProps) => {
  return (
    <Table>
      <tbody>
        {transactions.map((transaction) => (
          <TransactionsLine key={transaction.id} {...transaction} />
        ))}
      </tbody>
    </Table>
  )
}
