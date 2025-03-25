import s from "./news-banner.module.scss"

export const NewsBanner = () => {
  return (
    <div className={s.banner}>
      <div className={s.tag}>Announcement</div>
      <div>
        Currently powered by Helios Testnet (RPC:{" "}
        <a href="https://testnet1.helioschainlabs.org/docs" target="_blank">
          testnet1.helioschainlabs.org
        </a>
        )
      </div>
    </div>
  )
}
