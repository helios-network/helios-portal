import { Area, Grid } from "@/components/grid"
import { Interface } from "./(components)/interface"
import { Recents } from "./(components)/recents"
import { Secure } from "./(components)/secure"
import { Supported } from "./(components)/supported"
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
          <Supported />
        </Area>
        <Area area="d">
          <Secure />
        </Area>
      </Grid>
    </>
  )
}
