"use client"

import { Button } from "@/components/button"
import { Card } from "@/components/card"
import { Heading } from "@/components/heading"
import { Input } from "@/components/input/input"
import { Select } from "@/components/input/select"
import { generateVotes } from "@/lib/faker"
import { useState } from "react"
import s from "./list.module.scss"
import { Vote } from "./vote"

export const List = () => {
  const [status, setStatus] = useState<string>("active")
  const list = generateVotes(6)

  return (
    <Card className={s.list} auto>
      <Heading icon="hugeicons:task-01" title="Active Proposals" />
      <div className={s.filters}>
        <div className={s.left}>
          <Button
            size="small"
            variant={status !== "active" ? "secondary" : undefined}
            onClick={() => setStatus("active")}
          >
            Active
          </Button>
          <Button
            size="small"
            variant={status !== "passed" ? "secondary" : undefined}
            onClick={() => setStatus("passed")}
          >
            Passed
          </Button>
          <Button
            size="small"
            variant={status !== "rejected" ? "secondary" : undefined}
            onClick={() => setStatus("rejected")}
          >
            Rejected
          </Button>
        </div>
        <div className={s.right}>
          <Input
            icon="hugeicons:search-01"
            placeholder="Search a proposals..."
            className={s.search}
          />
          <Select
            className={s.select}
            options={[
              { value: "all-types", label: "All Types" },
              { value: "parameter-change", label: "Parameter Change" },
              { value: "asset-addition", label: "Asset Addition" },
              { value: "asset-weight-change", label: "Asset Weight" },
              { value: "text-proposal", label: "Text Proposal" },
              { value: "software-upgrade", label: "Software Upgrade" }
            ]}
          />
        </div>
      </div>
      <div className={s.listing}>
        {list
          .filter((item) => item.status === status)
          .map((item) => (
            <Vote key={item.hip} item={item} />
          ))}
      </div>
    </Card>
  )
}
