"use client"

import { Card } from "@/components/card"
import { SkeletonCard } from "@/components/card/skeleton"
import { Heading } from "@/components/heading"
import { Icon } from "@/components/icon"
import { getValidatorsByPageAndSizeWithHisAssetsAndCommissionAndDelegation, getDelegation } from "@/helpers/rpc-calls"
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useAccount } from "wagmi"
import { toHex } from "@/utils/number"
import { getTokenDetailsInBatch } from "@/hooks/useTokenEnrichmentBatch"
import { fetchCGTokenData } from "@/utils/price"
import { ethers } from "ethers"
import { TokenExtended } from "@/types/token"
import { TOKEN_COLORS } from "@/config/constants"
import { APP_COLOR_DEFAULT, HELIOS_NETWORK_ID } from "@/config/app"
import { Item } from "../item"
import { Empty } from "./empty"
import { Informations } from "./informations"
import s from "./list.module.scss"

export const List = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const { address: userAddress } = useAccount()
  const PAGE = 1
  const SIZE = 100

  // Fetch validators with enriched asset data using the optimized RPC method
  const { data: validatorsWithData = [], isLoading: validatorsIsLoading } = useQuery({
    queryKey: ["validatorsPageList", PAGE, SIZE, userAddress],
    queryFn: async () => {
      const validatorsData = await getValidatorsByPageAndSizeWithHisAssetsAndCommissionAndDelegation(
        toHex(PAGE),
        toHex(SIZE)
      )

      if (!validatorsData || validatorsData.length === 0) {
        return []
      }

      // Sort validators: active first, jailed last
      const sorted = validatorsData.sort((a, b) => {
        const aStatus = a.validator?.status || 0
        const bStatus = b.validator?.status || 0
        if (aStatus === bStatus) {
          const aJailed = a.validator?.jailed || false
          const bJailed = b.validator?.jailed || false
          if (aJailed && !bJailed) return 1
          if (!aJailed && bJailed) return -1
        }
        return bStatus - aStatus
      })

      // Collect all unique token addresses from all validators
      const allTokenAddresses = new Set<string>()
      sorted.forEach(data => {
        data.assets?.forEach((asset: any) => {
          allTokenAddresses.add(asset.contractAddress)
        })
      })

      // Batch fetch metadata for all unique tokens
      let batchMetadata: Record<string, any> = {}
      let cgData: Record<string, any> = {}

      if (allTokenAddresses.size > 0) {
        const tokenAddressesArray = Array.from(allTokenAddresses)
        batchMetadata = await getTokenDetailsInBatch(tokenAddressesArray)

        const symbols = Object.values(batchMetadata)
          .map((m: any) => m.metadata.symbol.toLowerCase())
        cgData = await fetchCGTokenData(symbols)
      }

      // Fetch user delegation data for all validators in parallel
      const userDelegationPromises = sorted.map(data =>
        userAddress ? getDelegation(userAddress, data.validator.validatorAddress).catch(() => null) : Promise.resolve(null)
      )
      const userDelegations = await Promise.all(userDelegationPromises)
      const userDelegationMap = new Map(
        sorted.map((data, idx) => [data.validator.validatorAddress, userDelegations[idx]])
      )

      // Enrich each validator's assets
      return sorted.map(data => {
        const enrichedAssets: TokenExtended[] = []

        data.assets?.forEach((asset: any) => {
          const metadata = batchMetadata[asset.contractAddress as keyof typeof batchMetadata]
          if (!metadata) return

          const symbol = metadata.metadata.symbol.toLowerCase()
          const cgToken = cgData[symbol as keyof typeof cgData]
          const unitPrice = cgToken?.price || 0

          const amount = parseFloat(
            ethers.formatUnits(asset.baseAmount || 0, metadata.metadata.decimals)
          )

          enrichedAssets.push({
            display: {
              name: metadata.metadata.name,
              description: "",
              logo: cgToken?.logo || "",
              symbol,
              symbolIcon: symbol === "hls" ? "helios" : `token:${symbol}`,
              color: TOKEN_COLORS[symbol as keyof typeof TOKEN_COLORS] || APP_COLOR_DEFAULT
            },
            price: { usd: unitPrice },
            balance: {
              amount,
              totalPrice: amount * unitPrice
            },
            functionnal: {
              address: asset.contractAddress,
              chainId: HELIOS_NETWORK_ID,
              denom: metadata.metadata.base,
              decimals: metadata.metadata.decimals
            },
            stats: {
              holdersCount: metadata.holdersCount,
              totalSupply: metadata.total_supply
            }
          } as TokenExtended)
        })

        return {
          ...data.validator,
          cachedDetails: {
            assets: data.assets,
            enrichedAssets: enrichedAssets.filter(t => t !== null)
          },
          userHasDelegated: !!userDelegationMap.get(data.validator.validatorAddress)
        }
      })
    },
    enabled: true,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000
  })

  const validators = validatorsWithData

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const filteredValidators = validators.filter((validator) =>
    validator.moniker.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <>
      <Card auto>
        <Heading
          icon="hugeicons:flowchart-01"
          title="Validators"
          description="Stake your assets with trusted validators to earn rewards and secure the Helios network."
        >
          <Informations />
        </Heading>
        <div className={s.search}>
          <Icon className={s.searchIcon} icon="hugeicons:search-01" />
          <input
            className={s.searchInput}
            type="search"
            placeholder="Search validators..."
            value={searchTerm}
            onChange={handleChange}
          />
        </div>
      </Card>
      <div className={s.list}>
        {filteredValidators.map((validator, i) => (
          <Item
            key={"validators-" + i}
            {...validator}
            cachedDetails={validator.cachedDetails}
            userHasDelegated={validator.userHasDelegated}
          />
        ))}
        {filteredValidators.length === 0 && !validatorsIsLoading && (
          <Empty icon="hugeicons:sad-02" title="No validators found" />
        )}
        {validatorsIsLoading && (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        )}
      </div>
    </>
  )
}
