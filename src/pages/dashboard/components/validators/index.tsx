import { Card } from "../../../../shared-components/card"
import s from "./validators.module.scss"
import { useValidatorInfos } from "../../../../hooks/useValidatorInfo"
import { useProposalInfo } from "../../../../hooks/useProposalInfo"
import { formatDate } from "../../../../lib/utils/date"

export const Validators = () => {
  const { activeValidators, maxValidators } = useValidatorInfos()
  const { lastProposal } = useProposalInfo()

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
      {lastProposal ? (
        <div className={s.latest}>
          <div className={s.latestTop}>
            <div className={s.left}>Latest Governance Proposal</div>
            <div className={s.right}>
              <div className={s.badge}>{lastProposal.status}</div>
            </div>
          </div>
          <div className={s.latestBottom}>
            <div className={s.left}>{lastProposal.title}</div>
            <div className={s.right}>
              Voting ends at {formatDate(lastProposal.votingEndTime.toString())}
            </div>
          </div>
        </div>
      ) : (
        <div className={s.latest}>
          <div className={s.latestTop}>
            <div className={s.left}>Latest Governance Proposal</div>
          </div>
          <div className={s.latestBottom}>
            <div className={s.left}>No active proposal.</div>
          </div>
        </div>
      )}
    </Card>
  )
}
