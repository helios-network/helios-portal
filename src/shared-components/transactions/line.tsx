import { formatRelativeDate } from "../../lib/utils/date"
import { formatCurrency } from "../../lib/utils/number"
import { Transaction } from "../../types/Transactions"
import { TableCell, TableRow } from "../table"
import Category from "./category"
import s from "./transactions.module.scss"

export const TransactionsLine = (transaction: Transaction) => {
  const price = (
    <small className={s.small}>
      {formatCurrency(transaction.token.pricePerToken * transaction.amount)}
    </small>
  )

  return (
    <TableRow>
      <TableCell>
        <Category type={transaction.type} status={transaction.status} />
      </TableCell>
      <TableCell>
        <small className={s.small}>
          {formatRelativeDate(transaction.date)}
        </small>
      </TableCell>
      <TableCell className={s.cellAmount}>
        <strong className={s.stronger}>
          {transaction.amount} {transaction.token.symbol}
        </strong>
        {price}
      </TableCell>
      <TableCell align="right" className={s.cellRight}>
        {price}
      </TableCell>
    </TableRow>
  )
}
