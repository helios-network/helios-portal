import BackSection from "@/components/back"
import { Power } from "../(components)/power"
import s from "./page.module.scss"

export default function PowerPage() {
  return (
    <>
      <BackSection />
      <div className={s.container}>
        <Power />
      </div>
    </>
  )
}
