import clsx from "clsx"
import { Icon } from "../icon"
import s from "./transactions.module.scss"

export const StatusConfig = {
  "pending": {
    name: "Pending",
    icon: "svg-spinners:clock",
    variant: "warning"
  },
  "failed": { name: "Failed", icon: "hugeicons:cancel-01", variant: "danger" },
  "completed": { name: "Success", icon: "hugeicons:tick-01", variant: "success" },
  "expired": { name: "Expired", icon: "hugeicons:time-01", variant: "danger" }
}

const Status = ({ status }: { status: string }) => {
  const config = StatusConfig[status as keyof typeof StatusConfig] ?? StatusConfig.pending

  return (
    <div className={clsx(s.status, s[config.variant])} title={config.name}>
      <Icon icon={config.icon} />
    </div>
  )
}

export default Status
