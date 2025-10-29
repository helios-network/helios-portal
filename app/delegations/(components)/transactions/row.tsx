import { Badge } from "@/components/badge"
import { Button } from "@/components/button"
import { Symbol } from "@/components/symbol"
import { TableCell, TableRow } from "@/components/table"
import s from "./transactions.module.scss"
import { TransactionLastType } from "@/types/transaction"
import { formatNumber } from "@/lib/utils/number"
import { Variants } from "@/types/feedback"
import Image from "next/image"

const TRANSACTION_LABELS: Record<
  TransactionLastType,
  { label: string; variant: Variants; icon: string }
> = {
  BRIDGE_OUT: {
    label: "Bridge Out",
    variant: "danger",
    icon: "hugeicons:arrow-left-up-03"
  },
  BRIDGE_IN: {
    label: "Bridge In",
    variant: "success",
    icon: "hugeicons:arrow-down-right-03"
  },
  STAKE_IN: {
    label: "Stake",
    variant: "success",
    icon: "hugeicons:plus-sign-circle"
  },
  STAKE_OUT: {
    label: "Unstake",
    variant: "warning",
    icon: "hugeicons:minus-sign-circle"
  },
  GOV_VOTE: {
    label: "Vote",
    variant: "primary",
    icon: "hugeicons:vote"
  },
  DEPOSIT: {
    label: "Deposit",
    variant: "success",
    icon: "hugeicons:download-02"
  },
  WITHDRAW: {
    label: "Withdraw",
    variant: "warning",
    icon: "hugeicons:upload-02"
  },
  UNKNOWN: {
    label: "Transaction",
    variant: "primary",
    icon: "hugeicons:gas-pipe"
  },
  CREATE_CRON: {
    label: "Create Cron",
    variant: "primary",
    icon: "hugeicons:calendar-plus"
  },
  TRANSFER: {
    label: "Transfer",
    variant: "primary",
    icon: "hugeicons:transfer"
  },
  CREATE_ERC20: {
    label: "Create Token",
    variant: "primary",
    icon: "hugeicons:token"
  },
}

interface TransactionRowProps {
  type: TransactionLastType
  amount?: number
  symbol?: string
  symbolIcon?: string
  logo?: string
  color?: string
  explorer: string
  date?: string
  from?: string
  to?: string
}

export const Row = ({
  type,
  amount,
  symbol,
  symbolIcon,
  logo,
  color,
  explorer
}: TransactionRowProps) => {
  if (!TRANSACTION_LABELS[type]) {
    type = "UNKNOWN"
  }

  const { label, variant, icon } = TRANSACTION_LABELS[type]

  return (
    <TableRow className={s.row}>
      <TableCell>
        <Badge status={variant} icon={icon} className={s.type}>
          {label}
        </Badge>
      </TableCell>
      <TableCell>
        <div className={s.amount}>
          {logo && logo !== "" && (
            <Image src={logo} alt={symbol || ""} width={16} height={16} />
          )}
          {(!logo || logo === "") && symbolIcon && (
            <Symbol icon={symbolIcon} color={color} />
          )}
          {formatNumber(amount || 0, 6)} {symbol?.toUpperCase()}
        </div>
      </TableCell>
      {/* <TableCell className={s.date}>{date || "-"}</TableCell> */}
      <TableCell align="right" className={s.explorer}>
        <Button
          icon="hugeicons:link-square-02"
          href={explorer}
          className={s.link}
          variant="secondary"
          size="xsmall"
          border
        >
          View
        </Button>
      </TableCell>
    </TableRow>
  )
}
