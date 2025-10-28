import { Card } from "@/components/card"
import { Progress } from "@/components/progress"
import { useProposalInfo } from "@/hooks/useProposalInfo"
import { useValidatorInfo } from "@/hooks/useValidatorInfo"
import { formatDate } from "@/lib/utils/date"
import s from "./validators.module.scss"

export const Validators = () => {
  const { activeValidators, maxValidators } = useValidatorInfo()
  const { lastProposal } = useProposalInfo(1, 1, { enabled: false })

  return (
    <Card className={s.validators}>
      <div className={s.top}>
        <span className={s.title}>
          <strong>Selected Validators</strong>
        </span>
        <span className={s.subtitle}>
          <strong>{activeValidators}</strong>
        </span>
      </div>

      <div className={s.top}>
        <span className={s.title}>from last epoch</span>
        <span className={s.title}>max {maxValidators}</span>
      </div>
      <Progress
        value={activeValidators}
        max={maxValidators}
        className={s.progress}
      />
      {lastProposal ? (
        <div className={s.latest}>
          <div className={s.latestTop}>
            <div className={s.left}>Latest Governance Proposal</div>
            <div className={s.right}>
              <div
                className={s.badge}
                data-status-code={lastProposal.statusCode}
              >
                {lastProposal.status}
              </div>
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
