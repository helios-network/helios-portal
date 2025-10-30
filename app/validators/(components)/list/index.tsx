"use client"

import { Card } from "@/components/card"
import { SkeletonCard } from "@/components/card/skeleton"
import { Heading } from "@/components/heading"
import { Icon } from "@/components/icon"
import { useValidators } from "@/hooks/useValidators"
import { useState } from "react"
import { Item } from "../item"
import { Empty } from "./empty"
import { Informations } from "./informations"
import s from "./list.module.scss"
import HELIOS_NODE_MONIKERS from "@/config/helios-node-monikers"

export const List = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const { validators, isLoading: validatorsIsLoading } = useValidators()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const filteredValidators = validators.filter((validator) =>
    validator.moniker.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const sortedValidators = filteredValidators.sort((a, b) => {
    return b.status - a.status || (HELIOS_NODE_MONIKERS.includes(a.moniker) ? -1 : 1)
  })

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
        {sortedValidators.map((validator, i) => (
          <Item key={"validators-" + i} {...validator} />
        ))}
        {sortedValidators.length === 0 && !validatorsIsLoading && (
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
