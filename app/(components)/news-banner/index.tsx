import { Link } from "@/components/link"
import s from "./news-banner.module.scss"

export const NewsBanner = () => {
  return (
    <div className={s.banner} data-color="warning">
      <div className={s.tag}>Announcement</div>
      <p>
        Currently powered by Helios Beta Mainnet (RPC:{" "}
        <Link href="https://testnet1.helioschainlabs.org/docs">
          testnet1.helioschainlabs.org
        </Link>
        )
      </p>
    </div>
  )
}
