"use client"

import { Card } from "@/components/card"
import { SkeletonCard } from "@/components/card/skeleton"
import { Heading } from "@/components/heading"
import { Icon } from "@/components/icon"
import { getValidatorsByPageAndSizeWithHisAssetsAndCommissionAndDelegation, getDelegationsForValidatorsByUser, getValidatorsCount } from "@/helpers/rpc-calls"
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
import HELIOS_NODE_MONIKERS from "@/config/helios-node-monikers"
import clsx from "clsx"

export const List = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const { address: userAddress } = useAccount()
  const ITEMS_PER_PAGE = 20

  const { data: validatorCount = 0, isLoading: validatorCountIsLoading } = useQuery({
    queryKey: ["validatorCount"],
    queryFn: () => getValidatorsCount(),
    enabled: true,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000
  })

  // Calculate total pages based on validator count
  const totalPages = Math.ceil((validatorCount || 0) / ITEMS_PER_PAGE)

  // Determine if we need to load all validators (when searching)
  const hasSearch = searchTerm.trim().length > 0
  const shouldLoadAll = hasSearch

  // Fetch validators with enriched asset data using the optimized RPC method
  const { data: validatorsWithData = [], isLoading: validatorsPageListIsLoading } = useQuery({
    queryKey: ["validatorsPageList", currentPage, ITEMS_PER_PAGE, userAddress, hasSearch],
    queryFn: async () => {
      // If searching, load all validators, otherwise load only current page
      let validatorsData: any[]
      
      if (shouldLoadAll) {
        // Load all validators for search - fetch in batches
        const allValidators: any[] = []
        const count = validatorCount || 0
        const totalPagesToLoad = Math.ceil(count / ITEMS_PER_PAGE)
        
        // Load all pages in parallel
        const pagePromises = Array.from({ length: totalPagesToLoad }, (_, i) => 
          getValidatorsByPageAndSizeWithHisAssetsAndCommissionAndDelegation(
            toHex(i + 1),
            toHex(ITEMS_PER_PAGE)
          )
        )
        
        const pagesData = await Promise.all(pagePromises)
        pagesData.forEach(pageData => {
          if (pageData) {
            allValidators.push(...pageData)
          }
        })
        
        validatorsData = allValidators
      } else {
        // Load only current page for normal pagination
        const pageData = await getValidatorsByPageAndSizeWithHisAssetsAndCommissionAndDelegation(
          toHex(currentPage),
          toHex(ITEMS_PER_PAGE)
        )
        validatorsData = pageData || []
      }

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

      let userDelegationMap = new Map<string, any>()
      if (userAddress) {

        try {

          // Extract all validator addresses from sorted validators
          const validatorAddresses = sorted
            .map((data: any) => data.validator?.validatorAddress)
            .filter(Boolean)
          if (validatorAddresses.length > 0) {
            const allUserDelegations = await getDelegationsForValidatorsByUser(userAddress, validatorAddresses)
            userDelegationMap = new Map(
              allUserDelegations
                ?.filter((delegation: any) => delegation !== null)
                ?.map((delegation: any) => [delegation.validatorAddress, delegation]) ?? []
            )
          }
        } catch (error) {
          console.warn("Failed to fetch user delegations:", error)
        }
      }

      // Enrich each validator's assets
      return sorted.map(data => {
        const enrichedAssets: TokenExtended[] = []
        const enrichedDelegationAssets: any[] = []

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

          enrichedDelegationAssets.push({
            denom: metadata.metadata.base,
            baseAmount: asset.baseAmount,
            amount: amount.toString(),
            weightedAmount: asset.weightedAmount,
            price: unitPrice,
            logo: cgToken?.logo || "",
            color: TOKEN_COLORS[symbol as keyof typeof TOKEN_COLORS] || APP_COLOR_DEFAULT,
            contractAddress: asset.contractAddress
          })
        })

        return {
          validator: data.validator,
          assets: data.assets,
          delegation: {
            validatorAddress: data.validator.validatorAddress,
            shares: data.validator.shares,
            assets: enrichedDelegationAssets.filter(a => a !== null),
            rewards: { denom: "", amount: "0" }
          },
          commission: data.commission,
          cachedDetails: {
            assets: data.assets,
            enrichedAssets: enrichedAssets.filter(t => t !== null)
          },
          userHasDelegated: !!userDelegationMap.get(data.validator.validatorAddress)
        }
      })
    },
    enabled: !validatorCountIsLoading && (validatorCount || 0) > 0,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000
  })

  const validatorsIsLoading = validatorCountIsLoading || validatorsPageListIsLoading

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1) // Reset to first page on search
  }

  // Filter validators if searching
  const filteredValidators = hasSearch
    ? validatorsWithData.filter((validator) =>
        validator.validator.moniker.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : validatorsWithData

  // Sort validators: active first, jailed last, helios nodes prioritized
  const sortedValidators = filteredValidators.sort((a, b) => {
    const statusDiff = b.validator.status - a.validator.status
    if (statusDiff !== 0) return statusDiff
    
    const aJailed = a.validator.jailed || false
    const bJailed = b.validator.jailed || false
    if (aJailed && !bJailed) return 1
    if (!aJailed && bJailed) return -1
    
    // Prioritize helios nodes
    const aIsHelios = HELIOS_NODE_MONIKERS.includes(a.validator.moniker)
    const bIsHelios = HELIOS_NODE_MONIKERS.includes(b.validator.moniker)
    if (aIsHelios && !bIsHelios) return -1
    if (!aIsHelios && bIsHelios) return 1
    
    return 0
  })

  // Pagination calculations
  // If searching, paginate client-side. Otherwise, server-side pagination is already done
  const displayValidators = hasSearch
    ? sortedValidators.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
      )
    : sortedValidators

  const totalValidators = hasSearch ? sortedValidators.length : (validatorCount || 0)
  const displayTotalPages = hasSearch
    ? Math.ceil(sortedValidators.length / ITEMS_PER_PAGE)
    : totalPages

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = hasSearch
    ? Math.min(currentPage * ITEMS_PER_PAGE, sortedValidators.length)
    : Math.min(currentPage * ITEMS_PER_PAGE, validatorCount || 0)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

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
        {displayValidators.map((validator, i) => (
          <Item
            key={`validator-${validator.validator.validatorAddress}-${i}`}
            validator={validator.validator}
            assets={validator.assets}
            delegation={validator.delegation}
            commission={validator.commission}
            enrichedAssets={validator.cachedDetails?.enrichedAssets}
            userHasDelegated={validator.userHasDelegated}
          />
        ))}
        {displayValidators.length === 0 && !validatorsIsLoading && (
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
      {!validatorsIsLoading && displayTotalPages > 1 && (
        <div className={s.pagination}>
          <div className={s.paginationInfo}>
            Showing {startIndex + 1}-{endIndex} of {totalValidators} validators
          </div>
          <div className={s.paginationControls}>
            <button
              className={s.paginationButton}
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              aria-label="Previous page"
            >
              <Icon icon="hugeicons:arrow-left-01" />
            </button>
            {Array.from({ length: displayTotalPages }, (_, i) => i + 1).map((page) => {
              // Show first page, last page, current page, and pages around current
              const showPage =
                page === 1 ||
                page === displayTotalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1)
              
              const showEllipsisBefore = page === currentPage - 2 && currentPage > 3
              const showEllipsisAfter = page === currentPage + 2 && currentPage < displayTotalPages - 2

              return (
                <span key={page}>
                  {showEllipsisBefore && <span className={s.paginationEllipsis}>...</span>}
                  {showPage && (
                    <button
                      className={clsx(s.paginationButton, page === currentPage && s.paginationButtonActive)}
                      onClick={() => handlePageChange(page)}
                      aria-label={`Page ${page}`}
                      aria-current={page === currentPage ? "page" : undefined}
                    >
                      {page}
                    </button>
                  )}
                  {showEllipsisAfter && <span className={s.paginationEllipsis}>...</span>}
                </span>
              )
            })}
            <button
              className={s.paginationButton}
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === displayTotalPages}
              aria-label="Next page"
            >
              <Icon icon="hugeicons:arrow-right-01" />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
