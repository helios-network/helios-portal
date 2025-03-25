import clsx from "clsx"
import { Icon } from "../icon"
import s from "./transactions.module.scss"
import { TransactionStatus } from "../../types/Transactions"

export const StatusConfig = {
  pending: {
    name: "Pending",
    icon: "svg-spinners:clock",
    variant: "warning"
  },
  failed: { name: "Failed", icon: "hugeicons:cancel-01", variant: "danger" },
  completed: { name: "Success", icon: "hugeicons:tick-01", variant: "success" }
}

const Status = ({ status }: { status: TransactionStatus }) => {
  const config = StatusConfig[status]

  return (
    <div className={clsx(s.status, s[config.variant])} title={config.name}>
      <Icon icon={config.icon} />
    </div>
  )
}

export default Status
