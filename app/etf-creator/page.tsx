import { Area, Grid } from "@/components/grid"
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
            <Grid className={s.etfCreator}>
                <Area area="a">
                    <ETFCreatorInterface />
                </Area>
                <Area area="b">
                    <ETFCreationSteps />
                </Area>
                <Area area="c">
                    <ETFCreatorRecents />
                </Area>
                <Area area="d">
                    <ETFBestPractices />
                </Area>
                <Area area="e">
                    <ETFImportantNotes />
                </Area>
            </Grid>
        </RecentETFsProvider>
    )
}