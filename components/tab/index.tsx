"use client"

import { Heading } from "@/components/heading"
import { useRouter } from "next/navigation"
import { FaHandHoldingHeart, FaRegListAlt, FaUsers } from "react-icons/fa"
import styles from "./tabs.module.scss"

const tabs = [
  { label: "Proposals", href: "/governance/proposals", icon: <FaRegListAlt /> },
  { label: "Voters", href: "/governance/voters", icon: <FaUsers /> },
  {
    label: "Power",
    href: "/governance/power",
    icon: <FaHandHoldingHeart />
  }
]

const TabSelector = () => {
  const router = useRouter()

  return (
    <div className={styles.tabContainer}>
      <Heading icon="mdi:details" title="For more detail" />
      <p className={styles.description}>
        Helios introduces a multi-chain governance model that extends beyond a
        single blockchain, leveraging staked assets from multiple networks,
        Hyperion modules, and the I-PoSR consensus to form a decentralized
        decision-making system that spans across multiple chains.
      </p>
      <div className={styles.sidebar}>
        {tabs.map((tab) => (
          <button
            key={tab.href}
            onClick={() => router.push(tab.href)}
            className={styles.tabButton}
          >
            <span className={styles.icon}>{tab.icon}</span>
            <span className={styles.label}>{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default TabSelector
