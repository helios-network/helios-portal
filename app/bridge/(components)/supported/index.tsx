"use client"

import { Button } from "@/components/button"
import { Card } from "@/components/card"
import { Heading } from "@/components/heading"
import { Symbol } from "@/components/symbol"
import { getAllChains } from "@/config/chains"
import { useCallback, useRef } from "react"
import "swiper/css"
import "swiper/css/navigation"
import { Swiper, SwiperRef, SwiperSlide } from "swiper/react"
import s from "./supported.module.scss"

export const Supported = () => {
  const chains = getAllChains()
  const sliderRef = useRef<SwiperRef>(null)

  const handlePrev = useCallback(() => {
    if (!sliderRef.current) return
    sliderRef.current.swiper.slidePrev()
  }, [])

  const handleNext = useCallback(() => {
    if (!sliderRef.current) return
    sliderRef.current.swiper.slideNext()
  }, [])

  return (
    <Card className={s.supported}>
      <Heading icon="hugeicons:neural-network" title="Supported Networks">
        <Button
          icon="hugeicons:arrow-left-01"
          variant="secondary"
          border
          onClick={handlePrev}
        />
        <Button
          icon="hugeicons:arrow-right-01"
          variant="secondary"
          border
          onClick={handleNext}
        />
      </Heading>
      <div className={s.container}>
        <Swiper
          ref={sliderRef}
          className={s.list}
          freeMode={true}
          spaceBetween={12}
          slidesPerView="auto"
        >
          {chains.map((chain) => (
            <SwiperSlide key={chain.id} className={s.item}>
              <Symbol icon={chain.iconName} color={chain.color} />
              <span className={s.name}>{chain.name}</span>
              <time className={s.time}>~30 seconds</time>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </Card>
  )
}
