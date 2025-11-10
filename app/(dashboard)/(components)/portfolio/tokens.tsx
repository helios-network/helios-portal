"use client"

import { Button } from "@/components/button"
import { Icon } from "@/components/icon"
import { Symbol } from "@/components/symbol"
import { APP_COLOR_SECONDARY } from "@/config/app"
import { formatCurrency } from "@/lib/utils/number"
import s from "./portfolio.module.scss"
import { usePortfolioInfo } from "@/hooks/usePortfolioInfo"
import { addTokenToWallet } from "@/utils/wallet"
import { TokenExtended } from "@/types/token"
import Image from "next/image"
import { getChainConfig } from "@/config/chain-config"

interface LineProps {
  name?: string
  logo?: string
  symbol?: string
  symbolIcon: React.ReactNode
  price: number
  amount?: string
  token?: TokenExtended
}

const Line = ({
  name,
  logo,
  symbol,
  symbolIcon,
  price,
  amount,
  token
}: LineProps) => {
  // const percent = (price / totalPriceUsd) * 100
  const amountFixed = amount ? parseFloat(amount).toFixed(4) : 0

  const handleAddToWallet = () => {
    if (token) {
      addTokenToWallet(token)
    }
  }

  const originChainConfig = token ? getChainConfig(parseInt(token.originBlockchain)) : "All"
  const originBlockchainName = originChainConfig !== "All" ? originChainConfig?.name : ""

  return (
    <li>
      {logo && logo !== "" ? (
        <Image src={logo} width={32} height={32} alt="logo" />
      ) : (
        symbolIcon
      )}
      <div className={s.info}>
        <div className={s.top}>{symbol}</div>
        <div className={s.bottom}>{name}</div>
        {originBlockchainName !== undefined && originBlockchainName !== "" && (
          <div className={s.bottom}>Origin: ({originBlockchainName})</div>
        )}
      </div>
      <div className={s.right}>
        {amountFixed && <div className={s.top}>{amountFixed}</div>}
        {price !== 0 && <div className={s.bottom}>{formatCurrency(price)}</div>}
        {/* <div className={s.bottom}>{percent.toFixed(2)}%</div> */}
      </div>
      {token && (
        <button
          onClick={handleAddToWallet}
          className={s.addToWallet}
          title={`Add ${symbol} to wallet`}
        >
          <Icon icon="hugeicons:plus-sign" />
        </button>
      )}
    </li>
  )
}

export const PortfolioTokens = () => {
  const { portfolio: tokens } = usePortfolioInfo()
  const totalOtherTokens = tokens
    .slice(4)
    .reduce((total, token) => total + (token.balance.totalPrice || 0), 0)

  if (tokens.length === 0) {
    return (
      <div className={s.empty}>
        <Icon icon="hugeicons:sad-02" className={s.sad} />
        <p>No tokens in your portfolio</p>
        <Button icon="hugeicons:download-03">Add tokens</Button>
      </div>
    )
  }

  return (
    <ul className={s.tokens}>
      {tokens.slice(0, 4).map((token) => (
        <Line
          key={"portfoliotokens-" + token.display.symbol}
          logo={token.display.logo}
          symbolIcon={
            <Symbol
              icon={token.display.symbolIcon}
              color={token.display.color}
            />
          }
          symbol={token.display.symbol.toUpperCase()}
          amount={token.balance.amount.toString()}
          name={token.display.name}
          price={token.balance.totalPrice || 0}
          token={token}
        />
      ))}
      {tokens.length > 4 && (
        <Line
          symbolIcon={
            <Symbol icon="mdi:star-four-points" color={APP_COLOR_SECONDARY} />
          }
          symbol="Other"
          price={totalOtherTokens}
        />
      )}
    </ul>
  )
}
