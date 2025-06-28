"use client"
import BackSection from "@/components/back"
import { DelegateCard } from "@/components/delegatecard"
import { Heading } from "@/components/heading"
import { useCallback, useEffect, useRef, useState } from "react"
import styles from "./voters.module.scss"

const links = [
  {
    url: "https://example.com",
    userid: "coby.eth",
    hasX: true,
    hasDiscord: true,
    label: "2.256M HEL   0% Participation",
    description:
      "The magnitude system allows governance participants to propose controlled adjustments to an asset's weight in the staking consensus. The magnitude level determines how much the asset’s weight will increase or decrease, directly impacting staking incentives and APY distribution."
  },
  {
    url: "https://example.com",
    userid: "coby.eth",
    hasX: true,
    hasDiscord: true,
    label: "2.256M HEL   0% Participation",
    description:
      "The magnitude system allows governance participants to propose controlled adjustments to an asset's weight in the staking consensus. The magnitude level determines how much the asset’s weight will increase or decrease, directly impacting staking incentives and APY distribution."
  },
  {
    url: "https://example.com",
    userid: "coby.eth",
    hasX: true,
    hasDiscord: true,
    label: "2.256M HEL   0% Participation",
    description:
      "The magnitude system allows governance participants to propose controlled adjustments to an asset's weight in the staking consensus. The magnitude level determines how much the asset’s weight will increase or decrease, directly impacting staking incentives and APY distribution."
  },
  {
    url: "https://example.com",
    userid: "coby.eth",
    hasX: true,
    hasDiscord: true,
    label: "2.256M HEL   0% Participation",
    description:
      "The magnitude system allows governance participants to propose controlled adjustments to an asset's weight in the staking consensus. The magnitude level determines how much the asset’s weight will increase or decrease, directly impacting staking incentives and APY distribution."
  },
  {
    url: "https://example.com",
    userid: "coby.eth",
    hasX: true,
    hasDiscord: true,
    label: "2.256M HEL   0% Participation",
    description:
      "The magnitude system allows governance participants to propose controlled adjustments to an asset's weight in the staking consensus. The magnitude level determines how much the asset’s weight will increase or decrease, directly impacting staking incentives and APY distribution."
  },
  {
    url: "https://example.com",
    userid: "coby.eth",
    hasX: true,
    hasDiscord: true,
    label: "2.256M HEL   0% Participation",
    description:
      "The magnitude system allows governance participants to propose controlled adjustments to an asset's weight in the staking consensus. The magnitude level determines how much the asset’s weight will increase or decrease, directly impacting staking incentives and APY distribution."
  },
  {
    url: "https://example.com",
    userid: "coby.eth",
    hasX: true,
    hasDiscord: true,
    label: "2.256M HEL   0% Participation",
    description:
      "The magnitude system allows governance participants to propose controlled adjustments to an asset's weight in the staking consensus. The magnitude level determines how much the asset’s weight will increase or decrease, directly impacting staking incentives and APY distribution."
  },
  {
    url: "https://example.com",
    userid: "coby.eth",
    hasX: true,
    hasDiscord: true,
    label: "2.256M HEL   0% Participation",
    description:
      "The magnitude system allows governance participants to propose controlled adjustments to an asset's weight in the staking consensus. The magnitude level determines how much the asset’s weight will increase or decrease, directly impacting staking incentives and APY distribution."
  },
  {
    url: "https://example.com",
    userid: "coby.eth",
    hasX: true,
    hasDiscord: true,
    label: "2.256M HEL   0% Participation",
    description:
      "The magnitude system allows governance participants to propose controlled adjustments to an asset's weight in the staking consensus. The magnitude level determines how much the asset’s weight will increase or decrease, directly impacting staking incentives and APY distribution."
  },
  {
    url: "https://example.com",
    userid: "coby.eth",
    hasX: true,
    hasDiscord: true,
    label: "2.256M HEL   0% Participation",
    description:
      "The magnitude system allows governance participants to propose controlled adjustments to an asset's weight in the staking consensus. The magnitude level determines how much the asset’s weight will increase or decrease, directly impacting staking incentives and APY distribution."
  },
  {
    url: "https://example.com",
    userid: "coby.eth",
    hasX: true,
    hasDiscord: true,
    label: "2.256M HEL   0% Participation",
    description:
      "The magnitude system allows governance participants to propose controlled adjustments to an asset's weight in the staking consensus. The magnitude level determines how much the asset’s weight will increase or decrease, directly impacting staking incentives and APY distribution."
  },
  {
    url: "https://example.com",
    userid: "coby.eth",
    hasX: true,
    hasDiscord: true,
    label: "2.256M HEL   0% Participation",
    description:
      "The magnitude system allows governance participants to propose controlled adjustments to an asset's weight in the staking consensus. The magnitude level determines how much the asset’s weight will increase or decrease, directly impacting staking incentives and APY distribution."
  },
  {
    url: "https://example.com",
    userid: "coby.eth",
    hasX: true,
    hasDiscord: true,
    label: "2.256M HEL   0% Participation",
    description:
      "The magnitude system allows governance participants to propose controlled adjustments to an asset's weight in the staking consensus. The magnitude level determines how much the asset’s weight will increase or decrease, directly impacting staking incentives and APY distribution."
  },
  {
    url: "https://example.com",
    userid: "coby.eth",
    hasX: true,
    hasDiscord: true,
    label: "2.256M HEL   0% Participation",
    description:
      "The magnitude system allows governance participants to propose controlled adjustments to an asset's weight in the staking consensus. The magnitude level determines how much the asset’s weight will increase or decrease, directly impacting staking incentives and APY distribution."
  },
  {
    url: "https://example.com",
    userid: "coby.eth",
    hasX: true,
    hasDiscord: true,
    label: "2.256M HEL   0% Participation",
    description:
      "The magnitude system allows governance participants to propose controlled adjustments to an asset's weight in the staking consensus. The magnitude level determines how much the asset’s weight will increase or decrease, directly impacting staking incentives and APY distribution."
  },
  {
    url: "https://example.com",
    userid: "coby.eth",
    hasX: true,
    hasDiscord: true,
    label: "2.256M HEL   0% Participation",
    description:
      "The magnitude system allows governance participants to propose controlled adjustments to an asset's weight in the staking consensus. The magnitude level determines how much the asset’s weight will increase or decrease, directly impacting staking incentives and APY distribution."
  },
  {
    url: "https://example.com",
    userid: "coby.eth",
    hasX: true,
    hasDiscord: true,
    label: "2.256M HEL   0% Participation",
    description:
      "The magnitude system allows governance participants to propose controlled adjustments to an asset's weight in the staking consensus. The magnitude level determines how much the asset’s weight will increase or decrease, directly impacting staking incentives and APY distribution."
  },
  {
    url: "https://example.com",
    userid: "coby.eth",
    hasX: true,
    hasDiscord: true,
    label: "2.256M HEL   0% Participation",
    description:
      "The magnitude system allows governance participants to propose controlled adjustments to an asset's weight in the staking consensus. The magnitude level determines how much the asset’s weight will increase or decrease, directly impacting staking incentives and APY distribution."
  },
  {
    url: "https://example.com",
    userid: "coby.eth",
    hasX: true,
    hasDiscord: true,
    label: "2.256M HEL   0% Participation",
    description:
      "The magnitude system allows governance participants to propose controlled adjustments to an asset's weight in the staking consensus. The magnitude level determines how much the asset’s weight will increase or decrease, directly impacting staking incentives and APY distribution."
  },
  {
    url: "https://example.com",
    userid: "coby.eth",
    hasX: true,
    hasDiscord: true,
    label: "2.256M HEL   0% Participation",
    description:
      "The magnitude system allows governance participants to propose controlled adjustments to an asset's weight in the staking consensus. The magnitude level determines how much the asset’s weight will increase or decrease, directly impacting staking incentives and APY distribution."
  },
  {
    url: "https://example.com",
    userid: "coby.eth",
    hasX: true,
    hasDiscord: true,
    label: "2.256M HEL   0% Participation",
    description:
      "The magnitude system allows governance participants to propose controlled adjustments to an asset's weight in the staking consensus. The magnitude level determines how much the asset’s weight will increase or decrease, directly impacting staking incentives and APY distribution."
  },
  {
    url: "https://example.com",
    userid: "coby.eth",
    hasX: true,
    hasDiscord: true,
    label: "2.256M HEL   0% Participation",
    description:
      "The magnitude system allows governance participants to propose controlled adjustments to an asset's weight in the staking consensus. The magnitude level determines how much the asset’s weight will increase or decrease, directly impacting staking incentives and APY distribution."
  },
  {
    url: "https://example.com",
    userid: "coby.eth",
    hasX: true,
    hasDiscord: true,
    label: "2.256M HEL   0% Participation",
    description:
      "The magnitude system allows governance participants to propose controlled adjustments to an asset's weight in the staking consensus. The magnitude level determines how much the asset’s weight will increase or decrease, directly impacting staking incentives and APY distribution."
  }
]

// export default function VotersPage() {
//   return (
//     <div className={styles.container}>
//       <div className={styles.cardGrid}>
//         {links.map((link, index) => (
//           <DelegateCard key={index} link={link} />
//         ))}
//       </div>
//     </div>
//   )
// }

export default function VotersPage() {
  const [visibleLinks, setVisibleLinks] = useState(links.slice(0, 9)) // initial 9 items
  const [loading, setLoading] = useState(false)
  const loaderRef = useRef<HTMLDivElement | null>(null)

  const loadMore = useCallback(async () => {
    if (loading) return
    if (visibleLinks.length >= links.length) return // no more items to load
    setLoading(true)

    setTimeout(() => {
      const currentLength = visibleLinks.length
      const more = links.slice(currentLength, currentLength + 6)
      setVisibleLinks((prev) => [...prev, ...more])
      setLoading(false)
    }, 1000)
  }, [loading, visibleLinks.length])

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          loadMore()
        }
      },
      { threshold: 1 }
    )

    const current = loaderRef.current
    if (current) observer.observe(current)

    return () => {
      if (current) observer.unobserve(current)
    }
  }, [visibleLinks, loading, loadMore])

  return (
    <>
      <BackSection />
      <div className={styles.container}>
        <Heading
          icon="solar:users-group-rounded-bold"
          title="Voters"
          className={styles.cardHeard}
        />
        <div className={styles.cardGrid}>
          {visibleLinks.map((link, index) => (
            <DelegateCard key={index} link={link} />
          ))}
        </div>
        <div ref={loaderRef} style={{ textAlign: "center", color: "#9ca3af" }}>
          {loading && <p>Loading...</p>}
        </div>
      </div>
    </>
  )
}
