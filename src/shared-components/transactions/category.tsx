import { TransactionStatus, TransactionType } from "../../types/Transactions"
import { Icon } from "../icon"
import Status from "./status"
import s from "./transactions.module.scss"
export const CategoryConfig = {
  "bridge-in": { name: "Bridge in", icon: "hugeicons:arrow-down-left-01" },
  "bridge-out": { name: "Bridge out", icon: "hugeicons:arrow-up-right-01" },
  "governance-vote": {
    name: "Governance vote",
    icon: "hugeicons:bitcoin-withdraw"
  },
  "stake-in": { name: "Stake in", icon: "hugeicons:square-lock-add-02" },
  "stake-out": { name: "Stake out", icon: "hugeicons:square-lock-minus-02" },
  deposit: { name: "Deposit", icon: "hugeicons:download-03" },
  withdraw: { name: "Withdraw", icon: "hugeicons:upload-03" }
}

export interface CategoryProps {
  type: TransactionType
  status: TransactionStatus
}

const Category = ({ type, status }: CategoryProps) => {
  const config = CategoryConfig[type]

  return (
    <div className={s.type}>
      <div className={s.icon}>
        <Icon icon={config.icon} className={s.iconSvg} />
        <Status status={status} />
      </div>
      <strong className={s.stronger}>{config.name}</strong>
    </div>
  )
}

export default Category
