"use client"

import { useEffect, useState } from "react"
import { Icon } from "@/components/icon"
import { Link } from "@/components/link"
import { Symbol } from "@/components/symbol"
import { truncateAddress } from "@/lib/utils"
import { Delegation } from "@/types/delegation"
import { useWhitelistedAssets } from "@/hooks/useWhitelistedAssets"
import { getAssetSymbol, getAssetDisplayProps } from "@/utils/assets"
import { fetchCGTokenData } from "@/utils/price"
import { formatTokenAmount } from "@/lib/utils/number"
import { ethers } from "ethers"
import Image from "next/image"
import styles from "./delegation-info.module.scss"

interface DelegationInfoProps {
  delegations: Delegation[]
  isLoading: boolean
  error: any
}

export function DelegationInfo({
  delegations,
  isLoading,
  error
}: DelegationInfoProps) {
  const { assets, isLoading: assetsLoading } = useWhitelistedAssets()
  const [tokenLogos, setTokenLogos] = useState<Record<string, string>>({})
  const [tokenPrices, setTokenPrices] = useState<Record<string, number>>({})

  // Fetch token logos from CoinGecko
  useEffect(() => {
    if (!delegations.length || !assets.length) return

    const fetchLogos = async () => {
      // Collect all unique symbols from delegations
      const symbols = new Set<string>()

      delegations.forEach((delegation) => {
        delegation.assets.forEach((asset) => {
          const assetInfo = assets.find((a) => a.denom === asset.denom)
          if (assetInfo) {
            console.log(
              "Adding asset symbol:",
              assetInfo.symbol,
              "for denom:",
              asset.denom
            )
            symbols.add(assetInfo.symbol.toLowerCase())
          }
        })

        const rewardAssetInfo = assets.find(
          (a) => a.denom === delegation.rewards.denom
        )
        if (rewardAssetInfo) {
          console.log(
            "Adding reward symbol:",
            rewardAssetInfo.symbol,
            "for denom:",
            delegation.rewards.denom
          )
          symbols.add(rewardAssetInfo.symbol.toLowerCase())
        } else {
          console.log(
            "No reward asset found for denom:",
            delegation.rewards.denom
          )
        }
      })

      if (symbols.size > 0) {
        console.log("Fetching logos for symbols:", Array.from(symbols))
        const cgData = await fetchCGTokenData(Array.from(symbols))
        console.log("CoinGecko data:", cgData)
        const logoMap: Record<string, string> = {}
        const priceMap: Record<string, number> = {}

        Object.entries(cgData).forEach(([symbol, data]) => {
          if (data.logo) {
            logoMap[symbol] = data.logo
          }
          if (data.price) {
            priceMap[symbol] = data.price
          }
        })

        console.log("Logo map:", logoMap)
        console.log("Price map:", priceMap)
        setTokenLogos(logoMap)
        setTokenPrices(priceMap)
      }
    }

    fetchLogos()
  }, [delegations, assets])

  // Helper function to get token logo
  const getTokenLogo = (denom: string): string | null => {
    const asset = assets.find((asset) => asset.denom === denom)
    if (!asset) {
      console.log("No asset found for denom:", denom)
      return null
    }

    const symbol = asset.symbol.toLowerCase()
    const logo = tokenLogos[symbol]
    console.log(
      "Getting logo for denom:",
      denom,
      "symbol:",
      symbol,
      "logo:",
      logo
    )
    return logo || null
  }

  // Helper function to get token price
  const getTokenPrice = (denom: string): number | null => {
    const asset = assets.find((asset) => asset.denom === denom)
    if (!asset) return null

    const symbol = asset.symbol.toLowerCase()
    return tokenPrices[symbol] || null
  }
  if (isLoading || assetsLoading) {
    return (
      <div className={styles.delegationSection}>
        <h3 className={styles.sectionTitle}>
          <Icon icon="mdi:vote-outline" width={20} height={20} />
          Your Voting Power
        </h3>
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Loading delegation data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.delegationSection}>
        <h3 className={styles.sectionTitle}>
          <Icon icon="mdi:vote-outline" width={20} height={20} />
          Your Voting Power
        </h3>
        <div className={styles.errorState}>
          <Icon icon="mdi:alert-circle-outline" width={24} height={24} />
          <p>Failed to load delegation data</p>
        </div>
      </div>
    )
  }

  if (!delegations || delegations.length === 0) {
    return (
      <div className={styles.delegationSection}>
        <h3 className={styles.sectionTitle}>
          <Icon icon="mdi:lightning-bolt" width={20} height={20} />
          Your Voting Power
        </h3>
        <div className={styles.emptyState}>
          <Icon icon="mdi:lightning-bolt-outline" width={48} height={48} />
          <p>No voting power</p>
          <span>
            You haven&apos;t delegated to any validators yet. Delegate tokens to
            validators to gain voting power in governance.
          </span>
        </div>
      </div>
    )
  }

  const totalShares = delegations.reduce((sum, delegation) => {
    return sum + parseFloat(ethers.formatUnits(delegation.shares, 18))
  }, 0)

  const totalRewards = delegations.reduce((sum, delegation) => {
    return sum + parseFloat(ethers.formatUnits(delegation.rewards.amount, 18))
  }, 0)

  return (
    <div className={styles.delegationSection}>
      <h3 className={styles.sectionTitle}>
        <Icon icon="mdi:lightning-bolt" width={20} height={20} />
        Your Voting Power
      </h3>

      <div className={styles.votingInfo}>
        <Icon icon="mdi:information-outline" width={16} height={16} />
        <span>
          Your voting power is determined by your delegated tokens. Review your
          delegations below before casting your vote.
        </span>
      </div>

      <div className={styles.summaryStats}>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Validators</span>
          <span className={styles.statValue}>{delegations.length}</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Voting Power</span>
          <span className={styles.statValue}>{formatTokenAmount(totalShares)}</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Pending Rewards</span>
          <span className={styles.statValue}>
            {formatTokenAmount(totalRewards)} {getAssetSymbol("ahelios", assets)}
          </span>
        </div>
      </div>

      <div className={styles.delegationsList}>
        {delegations.map((delegation, index) => (
          <div key={index} className={styles.delegationItem}>
            <div className={styles.validatorInfo}>
              <Icon icon="mdi:shield-account-outline" width={20} height={20} />
              <div className={styles.validatorDetails}>
                <Link
                  href={`/validators/${delegation.validatorAddress}`}
                  className={styles.validatorLink}
                  title="View validator details"
                >
                  {truncateAddress(delegation.validatorAddress)}
                </Link>
                <span className={styles.sharesAmount}>
                  {formatTokenAmount(parseFloat(
                    ethers.formatUnits(delegation.shares, 18)
                  ))}{" "}
                  shares
                </span>
              </div>
            </div>

            <div className={styles.assetsSection}>
              <h4 className={styles.assetsTitle}>
                <Icon icon="mdi:coins" width={16} height={16} />
                Delegated Assets ({delegation.assets.length})
              </h4>
              <div className={styles.assetsList}>
                {delegation.assets.map((asset, assetIndex) => {
                  const assetProps = getAssetDisplayProps(asset.denom, assets)
                  const tokenLogo = getTokenLogo(asset.denom)
                  return (
                    <div key={assetIndex} className={styles.assetItem}>
                      <div className={styles.assetInfo}>
                        <div className={styles.assetName}>
                          {tokenLogo && tokenLogo !== "" ? (
                            <Image
                              src={tokenLogo}
                              width={20}
                              height={20}
                              alt={assetProps.symbol}
                              className={styles.assetIcon}
                            />
                          ) : (
                            <Symbol
                              icon={assetProps.icon}
                              color={assetProps.color}
                              className={styles.assetIcon}
                            />
                          )}
                          <span
                            className={styles.assetDenom}
                            title={assetProps.displayName}
                          >
                            {assetProps.symbol}
                          </span>
                        </div>
                        <span className={styles.assetAmount}>
                          {formatTokenAmount(parseFloat(
                            ethers.formatUnits(asset.amount, 18)
                          ))}
                        </span>
                      </div>
                      <div className={styles.assetDetails}>
                        <div className={styles.assetDetailsLeft}>
                          <span className={styles.assetDetail}>
                            Base:{" "}
                            {formatTokenAmount(parseFloat(
                              ethers.formatUnits(asset.baseAmount, 18)
                            ))}
                          </span>
                          <span className={styles.assetDetail}>
                            Weighted:{" "}
                            {formatTokenAmount(parseFloat(
                              ethers.formatUnits(asset.weightedAmount, 18)
                            ))}
                          </span>
                        </div>
                        {(() => {
                          const price = getTokenPrice(asset.denom)
                          const amount = parseFloat(
                            ethers.formatUnits(asset.amount, 18)
                          )
                          return price ? (
                            <span className={styles.assetPrice}>
                              ${formatTokenAmount(amount * price)}
                            </span>
                          ) : null
                        })()}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className={styles.rewardsSection}>
              <div className={styles.rewardItem}>
                <Icon icon="mdi:gift-outline" width={16} height={16} />
                <span className={styles.rewardLabel}>Rewards:</span>
                <div className={styles.rewardAsset}>
                  {(() => {
                    const rewardLogo = getTokenLogo(delegation.rewards.denom)
                    const rewardProps = getAssetDisplayProps(
                      delegation.rewards.denom,
                      assets
                    )
                    return rewardLogo && rewardLogo !== "" ? (
                      <Image
                        src={rewardLogo}
                        width={16}
                        height={16}
                        alt={rewardProps.symbol}
                        className={styles.rewardIcon}
                      />
                    ) : (
                      <Symbol
                        icon={rewardProps.icon}
                        color={rewardProps.color}
                        className={styles.rewardIcon}
                      />
                    )
                  })()}
                  <span className={styles.rewardAmount}>
                    {formatTokenAmount(parseFloat(
                      ethers.formatUnits(delegation.rewards.amount, 18)
                    ))}{" "}
                    {getAssetSymbol(delegation.rewards.denom, assets)}
                  </span>
                </div>
              </div>
            </div>

            {delegation.totalBoost !== "0" && (
              <div className={styles.boostSection}>
                <Icon icon="mdi:rocket-launch-outline" width={16} height={16} />
                <span className={styles.boostLabel}>Total Boost:</span>
                <span className={styles.boostAmount}>
                  {formatTokenAmount(parseFloat(
                    ethers.formatUnits(delegation.totalBoost, 18)
                  ))}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
