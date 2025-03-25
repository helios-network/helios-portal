import clsx from "clsx"
import { forwardRef } from "react"
import s from "./table.module.scss"

export interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  children: React.ReactNode
  classNameContainer?: string
}

export const Table = forwardRef<HTMLTableElement, TableProps>(
  ({ children, classNameContainer, ...props }, ref) => {
    return (
      <div className={clsx(s.container, classNameContainer)}>
        <table ref={ref} className={s.table} {...props}>
          {children}
        </table>
      </div>
    )
  }
)

Table.displayName = "Table"

export interface TableRowProps
  extends React.HTMLAttributes<HTMLTableRowElement> {
  children: React.ReactNode
  className?: string
}

export const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <tr ref={ref} className={clsx(s.row, className)} {...props}>
        {children}
      </tr>
    )
  }
)

TableRow.displayName = "TableRow"

export interface TableCellProps
  extends React.HTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode
  className?: string
  align?: "left" | "right" | "center"
}

export const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ children, className, align, ...props }, ref) => {
    return (
      <td
        ref={ref}
        className={clsx(s.cell, className)}
        data-align={align}
        {...props}
      >
        {children}
      </td>
    )
  }
)

TableCell.displayName = "TableCell"
