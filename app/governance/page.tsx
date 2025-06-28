import TabSelector from "@/components/tab"
import { Guide } from "./(components)/guide"
import { History } from "./(components)/history"
import { Proposal } from "./(components)/proposal"
import { Statistics } from "./(components)/statistics"
import s from "./page.module.scss"

export default function Page() {
  return (
    <>
      <div className={s.governance}>
        <div className={s.left}>
          {/* <Power /> */}
          {/* <List /> */}
          <History />
          <Guide />
        </div>
        <div className={s.right}>
          <TabSelector />
          <Proposal />
          <Statistics />
        </div>
      </div>
    </>
  )
}
