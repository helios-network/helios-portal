"use client"

import { Card } from "@/components/card"
import { Heading } from "@/components/heading"
import { Icon } from "@/components/icon"
import s from "./steps.module.scss"

const steps = [
    {
        icon: "hugeicons:text",
        title: "Name Your Basket",
        description: "Choose a descriptive name and symbol for your ETF basket"
    },
    {
        icon: "hugeicons:coins-01",
        title: "Add Tokens",
        description:
            "Select tokens and assign percentage allocations (must total 100%)"
    },
    {
        icon: "hugeicons:view",
        title: "Preview & Review",
        description: "Review your basket composition before deployment"
    },
    {
        icon: "hugeicons:rocket-01",
        title: "Deploy Basket",
        description: "Create your ETF basket on the Helios blockchain"
    }
]

export const ETFCreationSteps = () => {
    return (
        <Card className={s.steps}>
            <Heading
                icon="hugeicons:workflow-square-01"
                title="Creation Steps"
                description="Follow these steps to create your ETF basket"
            />

            <div className={s.list}>
                {steps.map((step, index) => (
                    <div key={index} className={s.step}>
                        <div className={s.stepNumber}>{index + 1}</div>
                        <div className={s.stepIcon}>
                            <Icon icon={step.icon} />
                        </div>
                        <div className={s.stepContent}>
                            <h3 className={s.stepTitle}>{step.title}</h3>
                            <p className={s.stepDescription}>{step.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    )
}