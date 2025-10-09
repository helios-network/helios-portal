import { ETFCreatorInterface } from "./(components)/interface"
import { ETFCreatorRecents } from "./(components)/recents"
import { ETFCreationSteps } from "./(components)/steps"
import { ETFBestPractices } from "./(components)/tips"
import { ETFImportantNotes } from "./(components)/notes"
import { RecentETFsProvider } from "@/context/RecentETFsContext"
import s from "./page.module.scss"

export default function Page() {
    return (
        <RecentETFsProvider>
            <div className={s.etfCreator}>
                <div className={s.leftColumn}>
                    <ETFCreatorInterface />
                    <ETFBestPractices />
                </div>
                <div className={s.rightColumn}>
                    <ETFCreationSteps />
                    <ETFCreatorRecents />
                    <ETFImportantNotes />
                </div>
            </div>
        </RecentETFsProvider>
    )
}