import { TotalStakedValue } from "./total-staked-value"
import { TotalTransactions } from "./total-transactions"
import s from "./overview.module.scss"

export function Overview() {
    return (
        <div className={s.overview}>
            <TotalTransactions />
            <TotalStakedValue />
        </div>
    )
}

// Export individual components for separate use
export { TotalStakedValue } from "./total-staked-value"
export { TotalTransactions } from "./total-transactions"