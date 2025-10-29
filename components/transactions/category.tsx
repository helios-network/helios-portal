import { TransactionLastType } from "@/types/transaction"
import { Icon } from "../icon"
// import { TransactionStatus } from "@/types/Transactions"
// import Status from "./status"
import s from "./transactions.module.scss"
import Status from "./status"
export const CategoryConfig: {
  [key in TransactionLastType]: {
    name: string
    icon: string
  }
} = {
  BRIDGE_IN: { name: "Bridge in", icon: "hugeicons:arrow-down-left-01" },
  BRIDGE_OUT: { name: "Bridge out", icon: "hugeicons:arrow-up-right-01" },
  GOV_VOTE: {
    name: "Governance vote",
    icon: "hugeicons:bitcoin-withdraw"
  },
  STAKE_IN: { name: "Stake in", icon: "hugeicons:square-lock-add-02" },
  STAKE_OUT: { name: "Stake out", icon: "hugeicons:square-lock-minus-02" },
  DEPOSIT: { name: "Deposit", icon: "hugeicons:download-03" },
  WITHDRAW: { name: "Withdraw", icon: "hugeicons:upload-03" },
  UNKNOWN: { name: "Unknown", icon: "hugeicons:help-circle" },
  CREATE_CRON: { name: "Create cron", icon: "hugeicons:clock-01" },
  TRANSFER: { name: "Transfer", icon: "hugeicons:arrow-up-right-01" },
  CREATE_ERC20: { name: "Create HRC20", icon: "hugeicons:coins-02" }
}

export interface CategoryProps {
  type: TransactionLastType
  status?: string
}

const Category = ({ type, status }: CategoryProps) => {
  const config = type ? CategoryConfig[type] : CategoryConfig.UNKNOWN

  return (
    <div className={s.type}>
      <div className={s.icon}>
        <Icon icon={config?.icon} className={s.iconSvg} />
        {status && <Status status={status} />}
      </div>
      <strong className={s.stronger}>{config?.name}</strong>
    </div>
  )
}

export default Category
