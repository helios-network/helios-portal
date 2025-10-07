"use client"

import { Card } from "@/components/card"
import { Heading } from "@/components/heading"
import { Icon } from "@/components/icon"
import s from "./tips.module.scss"

const tips = [
    {
        icon: "hugeicons:chart-pie",
        title: "Diversify Allocations",
        description:
            "Spread your allocations across multiple tokens to reduce risk and increase stability"
    },
    {
        icon: "hugeicons:shield-check",
        title: "Verify Token Addresses",
        description:
            "Always double-check token contract addresses before adding them to your basket"
    },
    {
        icon: "hugeicons:percent",
        title: "Balance Percentages",
        description:
            "Ensure total allocation equals exactly 100% before deploying your basket"
    },
    {
        icon: "hugeicons:search-02",
        title: "Research Tokens",
        description:
            "Thoroughly research each token's fundamentals before including it in your ETF"
    }
]

export const ETFBestPractices = () => {
    return (
        <Card className={s.tips}>
            <Heading
                icon="hugeicons:bulb"
                title="Best Practices"
                description="Tips for creating successful ETF baskets"
            />

            <div className={s.list}>
                {tips.map((tip, index) => (
                    <div key={index} className={s.tip}>
                        <div className={s.tipIcon}>
                            <Icon icon={tip.icon} />
                        </div>
                        <div className={s.tipContent}>
                            <h3 className={s.tipTitle}>{tip.title}</h3>
                            <p className={s.tipDescription}>{tip.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    )
}