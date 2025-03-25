import { Card } from "../../../../shared-components/card"
import s from "./validators.module.scss"

export const Validators = () => {
  const maxValidators = 100
  const activeValidators = 80

  return (
    <Card className={s.validators}>
      <div className={s.top}>
        <span>Active Validators</span>
        <span>
          <strong>{activeValidators}</strong> / {maxValidators}
        </span>
      </div>
      <div className={s.progress}>
        <div
          className={s.progressBar}
          style={{ width: `${(activeValidators / maxValidators) * 100}%` }}
        />
      </div>
      <div className={s.latest}>
        <div className={s.latestTop}>
          <div className={s.left}>Latest Governance Proposal</div>
          <div className={s.right}>
            <div className={s.badge}>Active</div>
          </div>
        </div>
        <div className={s.latestBottom}>
          <div className={s.left}>HIP-23: Increase validator set to 150</div>
          <div className={s.right}>Voting ends in 2 days</div>
        </div>
      </div>
    </Card>
  )
}
