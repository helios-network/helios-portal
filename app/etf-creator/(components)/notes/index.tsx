"use client"

import { Card } from "@/components/card"
import { Heading } from "@/components/heading"
import { Icon } from "@/components/icon"
import s from "./notes.module.scss"

const notes = [
    {
        icon: "hugeicons:alert-02",
        title: "Gas Fees Required",
        description:
            "Creating an ETF basket requires gas fees. Ensure you have sufficient HLS in your wallet"
    },
    {
        icon: "hugeicons:lock-01",
        title: "Immutable After Creation",
        description:
            "Once deployed, the basket composition cannot be changed. Review carefully before creating"
    },
    {
        icon: "hugeicons:coins-swap-01",
        title: "Token Liquidity",
        description:
            "Ensure all tokens in your basket have sufficient liquidity for smooth operations"
    }
]

export const ETFImportantNotes = () => {
    return (
        <Card className={s.notes}>
            <Heading
                icon="hugeicons:information-circle"
                title="Important Notes"
                description="Key information about ETF basket creation"
            />

            <div className={s.list}>
                {notes.map((note, index) => (
                    <div key={index} className={s.note}>
                        <div className={s.noteIcon}>
                            <Icon icon={note.icon} />
                        </div>
                        <div className={s.noteContent}>
                            <h3 className={s.noteTitle}>{note.title}</h3>
                            <p className={s.noteDescription}>{note.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    )
}