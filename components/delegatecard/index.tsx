import clsx from "clsx"
import Image from "next/image"
import { forwardRef } from "react"
import styles from "./index.module.scss"

interface Link {
  url?: string
  userid?: string
  hasX?: boolean
  hasDiscord?: boolean
  label?: string
  description?: string
}

interface CardProps {
  link: Link
  className?: string
}

export const DelegateCard = forwardRef<HTMLDivElement, CardProps>(
  ({ link, className }, ref) => {
    const {
      url = "",
      userid = "",
      hasX = false,
      hasDiscord = false,
      label = "",
      description = ""
    } = link

    return (
      <div ref={ref} className={clsx(styles.card, className)}>
        <div className={styles.cardTitle}>
          <Image
            className={styles.roundfull}
            src="/img/logo.png"
            alt="Discord"
            width={30}
            height={30}
          />
          {userid || "No UserID"}
        </div>
        <div className={styles.line} />
        <p className={styles.cardLabel}>{label || "No label"}</p>
        <p className={styles.cardDescription}>
          {description || "No description"}
        </p>
        <div className={styles.cardActions}>
          <div className={styles.iconscontainer}>
            {hasX && (
              <Image
                className={styles.clickable}
                src="/img/twitter.svg"
                alt="twitter"
                width={20}
                height={20}
              />
            )}
            {hasDiscord && (
              <Image
                className={styles.clickable}
                src="/img/discord.svg"
                alt="Discord"
                width={25}
                height={25}
              />
            )}
          </div>

          <div className={styles.delegatebutton}>Delegate</div>
        </div>
      </div>
    )
  }
)

DelegateCard.displayName = "DelegateCard"
