import { Card } from "@/components/card"
import { Area, Grid } from "@/components/grid"
import { Interface } from "./(components)/interface"
import { Recents } from "./(components)/recents"
import s from "./page.module.scss"

export default function Page() {
  return (
    <>
      <Grid className={s.bridge}>
        <Area area="a">
          <Interface />
        </Area>
        <Area area="b">
          <Recents />
        </Area>
        <Area area="c">
          <Card className={s.title}>Bridge</Card>
        </Area>
        <Area area="d">
          <Card className={s.title}>Bridge</Card>
        </Area>
      </Grid>
    </>
  )
}
