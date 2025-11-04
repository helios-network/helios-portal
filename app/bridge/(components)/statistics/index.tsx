"use client"

import { Blocks } from "@/components/blocks"
import { Card } from "@/components/card"
import { Heading } from "@/components/heading"
import s from "./statistics.module.scss"

interface BridgeStats {
    txInQueue: number | null
    txInBatches: number | null
    txBridgedOut: number | null
    txBridgedIn: number | null
    totalTxBridged: number | null
}

export const Statistics = () => {
    // Placeholder data - will be replaced with API calls
    const stats: BridgeStats = {
        txInQueue: null,
        txInBatches: null,
        txBridgedOut: null,
        txBridgedIn: null,
        totalTxBridged: null,
    }

    const formatNumber = (value: number | null): string => {
        if (value === null) return "-"
        return value.toLocaleString()
    }

    const blocks = [
        {
            title: "Transactions In Queue",
            value: formatNumber(stats.txInQueue),
            bottom: "Waiting to be batched"
        },
        {
            title: "Transactions In Batches",
            value: formatNumber(stats.txInBatches),
            bottom: "Currently batching"
        },
        {
            title: "Transactions Bridged Out",
            value: formatNumber(stats.txBridgedOut),
            bottom: "Transferred from Helios"
        },
        {
            title: "Transactions Bridged In",
            value: formatNumber(stats.txBridgedIn),
            bottom: "Transferred to Helios"
        },
        {
            title: "Total Transactions Bridged",
            value: formatNumber(stats.totalTxBridged),
            color: "primary",
            bottom: "All-time total"
        },
    ]

    return (
        <Card className={s.statistics} auto>
            <Heading
                icon="hugeicons:chart-01"
                title="Bridge Global Statistics"
            ></Heading>
            <Blocks items={blocks} vertical className={s.blocks} />
        </Card>
    )
}