"use client"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Icon } from "../icon"
import styles from "./back.module.scss"

const descriptions = [
  "Helios introduces a multi-chain governance model that extends beyond a single blockchain, leveraging staked assets from multiple networks, Hyperion modules, and the I-PoSR consensus to form a decentralized decision-making system that spans across multiple chains.",
  "Governance in Helios is structured around staked assets, validator reputation, and Hyperion contributions, ensuring that decisions reflect the security and economic state of all integrated blockchains.",
  "Since Helios validators stake assets from multiple chains, governance voting weight is calculated based on the total interchain stake, rather than being restricted to a single asset.",
  "Slashed assets from misbehaving validators across multiple chains are collected into the Helios Treasury, which is governed by the Helios Foundation."
]

const BackSection = () => {
  const router = useRouter()
  const [index, setIndex] = useState(0)
  const [fade, setFade] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(true)
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % descriptions.length)
        setFade(false)
      }, 500) // match CSS fade-out duration
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const handleDotClick = (i: number) => {
    setFade(true)
    setTimeout(() => {
      setIndex(i)
      setFade(false)
    }, 400)
  }

  const handleBack = () => {
    router.back()
  }

  return (
    <>
      <div className={styles.container}>
        <div className={styles.icon} onClick={handleBack}>
          <Icon icon="material-symbols:arrow-back" />
          <span>Back</span>
        </div>
        <div className={styles.textContainer}>
          <h1 className={styles.headtitle}>Helios Governance</h1>
          <div
            className={`${styles.description} ${
              fade ? styles.fadeOut : styles.fadeIn
            }`}
          >
            {descriptions[index]}
          </div>
          <div className={styles.dots}>
            {descriptions.map((_, i) => (
              <span
                key={i}
                className={`${styles.dot} ${i === index ? styles.active : ""}`}
                onClick={() => handleDotClick(i)}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

export default BackSection
