"use client"

import { Area, Grid } from "@/components/grid"
import routes from "@/config/routes"
import { useBlockInfo } from "@/hooks/useBlockInfo"
import { Discover } from "./(components)/discover"
import { Linker } from "./(components)/linker"
import { Portfolio } from "./(components)/portfolio"
import { Recents } from "./(components)/recents"
import { Stat } from "./(components)/stat"
import { TVL } from "./(components)/tvl"
import { Validators } from "./(components)/validators"
import s from "./page.module.scss"
import { Weights } from "./(components)/weights"
import { formatNumber } from "@/lib/utils/number"

export default function Page() {
  const { lastBlockNumber, blockTime, gasPriceUSD } = useBlockInfo({
    forceEnable: true,
    includeGas: true
  })

  return (
    <>
      <Grid className={s.top}>
        <Area area="a">
          <Portfolio />
        </Area>
        <Area area="b">
          <Stat
            icon="hugeicons:blockchain-02"
            label="Block Height"
            value={formatNumber(lastBlockNumber, 0)}
            left="#"
          />
        </Area>
        <Area area="c">
          <Stat
            icon="hugeicons:time-management"
            label="Block Time"
            value={blockTime}
            right="s"
          />
        </Area>
        <Area area="d">
          <Stat
            icon="hugeicons:coins-02"
            label="Average Cost"
            value={gasPriceUSD}
            left="<"
          />
        </Area>
        <Area area="e">
          <Validators />
        </Area>
        <Area area="f">
          <Discover />
        </Area>
        <Area area="g" className={s.special}>
          <Linker
            icon="hugeicons:chart-rose"
            href={routes.delegations}
            text="My Delegations"
          />
        </Area>
        <Area area="h" className={s.special}>
          <Linker
            icon="hugeicons:exchange-02"
            href={routes.bridge}
            text="Bridge assets"
          />
        </Area>
        <Area area="i">
          <Recents />
        </Area>
        <Area area="j">
          <TVL />
        </Area>
        <Area area="k">
          <Weights />
        </Area>
      </Grid>
    </>
  )
}
