import { Area, Grid } from "@/components/grid"
import { TokenDeployerInterface } from "./(components)/interface"
import { TokenDeployerRecents } from "./(components)/recents"
import { DeploymentSteps } from "./(components)/steps"
import { BestPractices } from "./(components)/tips"
import { ImportantNotes } from "./(components)/notes"
import { RecentTokensProvider } from "@/context/RecentTokensContext"
import s from "./page.module.scss"

export default function Page() {
  return (
    <RecentTokensProvider>
      <Grid className={s.tokenDeployer}>
        <Area area="a">
          <TokenDeployerInterface />
        </Area>
        <Area area="b">
          <DeploymentSteps />
        </Area>
        <Area area="c">
          <TokenDeployerRecents />
        </Area>
        <Area area="d">
          <BestPractices />
        </Area>
        <Area area="e">
          <ImportantNotes />
        </Area>
      </Grid>
    </RecentTokensProvider>
  )
}
