"use client"

import { Card } from "@/components/card"
import { Heading } from "@/components/heading"
import { Icon } from "@/components/icon"
import { request } from "@/helpers/request"
import { useParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { getChainConfig } from "@/config/chain-config"
import s from "./hyperion.module.scss"

interface HyperionData {
  hyperion_id: number
  minimum_tx_fee: string
  minimum_batch_fee: string
  total_slash_amount: string
  tx_out_transfered: number
  tx_in_transfered: number
  batch_created: number
  batch_confirmed: number
  fee_collected: string
  external_data_tx_fee_collected: string
}

interface HyperionResponse {
  orchestrator: string
  orchestrator_hyperion_data: HyperionData[]
}

async function fetchValidatorHyperionData(
  validatorAddress: string
): Promise<HyperionResponse | null> {
  try {
    const result = await request<HyperionResponse>(
      "eth_getValidatorHyperionData",
      [validatorAddress]
    )
    return result
  } catch (err) {
    console.error("Error fetching hyperion data:", err)
    return null
  }
}

export const Hyperion = () => {
  const params = useParams()
  const validatorId = params.id as string

  const { data: hyperionData, isLoading } = useQuery({
    queryKey: ["validatorHyperion", validatorId],
    queryFn: () => fetchValidatorHyperionData(validatorId),
    enabled: !!validatorId,
    refetchInterval: 10000,
    refetchIntervalInBackground: true
  })

  if (isLoading) {
    return (
      <Card auto>
        <Heading icon="hugeicons:shield-energy" title="Hyperion Detail" />
        <div className={s.loading}>Loading hyperion data...</div>
      </Card>
    )
  }

  if (!hyperionData || !hyperionData.orchestrator_hyperion_data?.length) {
    return (
      <Card auto>
        <Heading icon="hugeicons:shield-energy" title="Hyperion Detail" />
        <div className={s.noData}>No hyperion data available</div>
      </Card>
    )
  }

  // Calculate totals for the summary
  const totalSlashes = hyperionData.orchestrator_hyperion_data.reduce(
    (acc, data) => acc + parseInt(data.total_slash_amount || "0"),
    0
  )

  // Calculate trust score (this is a simplified calculation)
  const trustScore = Math.max(0, Math.min(100, 100 - totalSlashes / 10))

  // Determine trust score class based on value
  const getTrustScoreClass = (score: number) => {
    if (score >= 90) return s.trustScoreExcellent
    if (score >= 75) return s.trustScoreGood
    if (score >= 50) return s.trustScoreFair
    return s.trustScorePoor
  }

  return (
    <Card auto>
      <Heading icon="hugeicons:shield-energy" title="Hyperion Detail" />

      <div className={s.summary}>
        <div className={s.stat}>
          <div className={s.statLabel}>Slash/24h</div>
          <div className={`${s.statValue} ${s.slashValue}`}>{totalSlashes}</div>
          <Icon
            icon="hugeicons:shield-energy"
            className={`${s.statIcon} ${s.slashIcon}`}
          />
        </div>
        <div className={s.stat}>
          <div className={s.statLabel}>Trust score</div>
          <div className={`${s.statValue} ${getTrustScoreClass(trustScore)}`}>
            {Math.round(trustScore)}%
          </div>
          <Icon
            icon="hugeicons:time-04"
            className={`${s.statIcon} ${s.trustIcon}`}
          />
        </div>
      </div>

      {trustScore > 75 && (
        <div className={s.trustBadge}>
          <Icon icon="mdi:check-circle" />
          <span>Excellent trust score</span>
        </div>
      )}

      <div className={s.table}>
        <div className={s.tableHeader}>
          <div className={s.headerCell}>Hyperion</div>
          <div className={s.headerCell}>Network</div>
          <div className={s.headerCell}>Slashs</div>
          <div className={s.headerCell}>Transfers</div>
        </div>

        {hyperionData.orchestrator_hyperion_data.map((data, index) => {
          const chainConfig = getChainConfig(data.hyperion_id)
          console.log(data)
          const totalTransfersForChain =
            (data.tx_out_transfered || 0) + (data.tx_in_transfered || 0)

          return (
            <div
              key={data.hyperion_id}
              className={s.tableRow}
              data-transfers={totalTransfersForChain}
              data-slashes={parseInt(data.total_slash_amount || "0")}
            >
              <div className={s.cell}>
                <span className={s.hyperionName}>
                  hyperion-{String(index + 1).padStart(2, "0")}
                </span>
              </div>
              <div className={s.cell}>
                <div className={s.network}>
                  <Icon
                    icon={chainConfig?.iconName || "token:ethereum"}
                    className={s.networkIcon}
                    style={
                      {
                        "--network-color": chainConfig?.color
                      } as React.CSSProperties
                    }
                  />
                  <span>
                    {chainConfig?.name || `Chain ${data.hyperion_id}`}
                  </span>
                </div>
              </div>
              <div className={s.cell}>
                <span className={s.slashCount}>
                  {parseInt(data.total_slash_amount || "0")}
                </span>
              </div>
              <div className={s.cell}>
                <span className={s.transferCount}>
                  {totalTransfersForChain || 0}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
