"use client"

import { Button } from "@/components/button"
import { Card } from "@/components/card"
import { Heading } from "@/components/heading"
import Image from "next/image"

import { useCallback, useRef } from "react"
import "swiper/css"
import "swiper/css/navigation"
import { Swiper, SwiperRef, SwiperSlide } from "swiper/react"
import s from "./supported.module.scss"
import { getLogoByHash } from "@/utils/url"
import { useChains } from "@/hooks/useChains"
import { useSwitchChain } from "wagmi"
import { useBlockInfo } from "@/hooks/useBlockInfo"
import { formatNumber } from "@/lib/utils/number"
import { useChainBlockNumbers } from "@/hooks/useChainBlockNumbers"

export const Supported = () => {
  const { chains } = useChains()
  const { switchChain } = useSwitchChain()
  const { lastBlockNumber } = useBlockInfo({ forceEnable: true })
  const { blockNumbers } = useChainBlockNumbers()

  const sliderRef = useRef<SwiperRef>(null)

  const handlePrev = useCallback(() => {
    if (!sliderRef.current) return
    sliderRef.current.swiper.slidePrev()
  }, [])

  const handleNext = useCallback(() => {
    if (!sliderRef.current) return
    sliderRef.current.swiper.slideNext()
  }, [])

  const handleSwitchNetwork = (chainId: number) => {
    switchChain({ chainId })
  }

  const getCurrentBlock = (chain: { hyperionId: number; chainId: number }) => {
    if (chain.hyperionId === 0) {
      return lastBlockNumber || 0
    }
    return blockNumbers[chain.chainId] || 0
  }

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
          {chains.map((chain) => {
            const currentBlock = getCurrentBlock(chain)
            return (
              <SwiperSlide key={chain.chainId} className={s.item}>
                <div
                  className={s.symbol}
                  onClick={() => handleSwitchNetwork(chain.chainId)}
                >
                  {chain.logo !== "" && (
                    <Image
                      src={getLogoByHash(chain.logo)}
                      alt=""
                      width={40}
                      height={40}
                    />
                  )}
                </div>
                <span className={s.name}>{chain.name}</span>
                {currentBlock > 0 && (
                  <time className={s.time}>~Block {formatNumber(currentBlock, 0)}</time>
                )}
              </SwiperSlide>
            )
          })}
        </Swiper>
      </div>
    </Card>
  )
}
