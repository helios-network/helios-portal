import { Blocks } from "@/components/blocks"
import { Card } from "@/components/card"
import { Heading } from "@/components/heading"
import { RechartsBar } from "@/components/recharts/bar"
import s from "./statistics.module.scss"

interface StatisticsProps {
  totalProposals?: number
}

export const Statistics = ({ totalProposals = 0 }: StatisticsProps) => {
  const blocks = [
    {
      title: "Total Proposals",
      value: totalProposals.toString(),
      bottom: "Since network launch"
    },
    {
      title: "Active Proposals",
      value: "3",
      bottom: "Currently in voting period",
      color: "primary"
    },
    {
      title: "Passed Proposals",
      value: "18",
      bottom: "72% success rate",
      color: "success"
    },
    {
      title: "Average Participation",
      value: "68%",
      bottom: "Of total voting power",
      color: "warning"
    }
  ]

  const proposalTypes = [
    { category: "Parameter", value: 12 },
    { category: "Assets", value: 6 },
    { category: "Text", value: 4 },
    { category: "Software", value: 3 }
  ]

  return (
    <Card className={s.statistics} auto>
      <Heading icon="hugeicons:chart-01" title="Governance Statistics" />
      <Blocks items={blocks} vertical className={s.blocks} />
      <div className={s.chart}>
        <h3>Proposal Types Distribution</h3>
        <RechartsBar data={proposalTypes} height={200} className={s.bars} />
      </div>
    </Card>
  )
}
