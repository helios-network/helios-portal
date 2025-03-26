"use client"

import { Area, Grid } from "../../shared-components/grid"
import routes from "../../config/routes"
import { formatNumber } from "../../lib/utils/number"
import { Discover } from "./components/discover"
import { Linker } from "./components/linker"
import { Portfolio } from "./components/portfolio"
import { Recents } from "./components/recents"
import { Stat } from "./components/stat"
import { TVL } from "./components/tvl"
import { Validators } from "./components/validators"
import s from "./dashboard.module.scss"
import { useBlockInfo } from "../../hooks/useBlockInfo"
import { Link } from "react-router-dom"

export default function Page() {
  const { lastBlockNumber, blockTime, gasPriceUSD } = useBlockInfo()

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
            value={formatNumber(lastBlockNumber)}
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
        <Area area="g">
          <Link to={routes.delegations}>
            <Linker
              icon="hugeicons:chart-rose"
              href={routes.delegations}
              text="My Delegations"
            />
          </Link>
        </Area>
        <Area area="h">
          <Link to={routes.governance}>
            <Linker
              icon="hugeicons:bitcoin-withdraw"
              href={routes.governance}
              text="Governance Vote"
            />
          </Link>
        </Area>
        <Area area="i">
          <Recents />
        </Area>
        <Area area="j">
          <TVL />
        </Area>
      </Grid>
    </>
  )
}
