"use client"

import { Icon } from "@/components/icon"
import { Modal } from "@/components/modal"
import Image from "next/image"
import { useCallback, useEffect, useMemo, useState } from "react"
import s from "./interface.module.scss"
import { getChainIcon } from "@/utils/url"
import { getChainConfig } from "@/config/chain-config"

interface TokenSearchModalProps {
  open: boolean
  onClose: () => void
  tokens: any[]
  onTokenSelect: (tokenAddress: string) => void
}

export const TokenSearchModal = ({ 
  open, 
  onClose, 
  tokens, 
  onTokenSelect 
}: TokenSearchModalProps) => {
  const [tokenSearchQuery, setTokenSearchQuery] = useState("")
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("")
  const [failedChainIcons, setFailedChainIcons] = useState<Set<string>>(new Set())

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(tokenSearchQuery)
    }, 150)

    return () => clearTimeout(timer)
  }, [tokenSearchQuery])

  // Function to get origin chain name
  const getOriginChainName = useCallback((originBlockchain: string) => {
    const chainId = parseInt(originBlockchain)
    const chainConfig = getChainConfig(chainId)
    return chainConfig?.name || `Chain ${chainId}`
  }, [])

  // Function to filter tokens based on search query
  const filteredTokens = useMemo(() => {
    if (!debouncedSearchQuery.trim()) {
      return tokens
    }
    
    const query = debouncedSearchQuery.toLowerCase()
    return tokens.filter(token => 
      token.display.symbol.toLowerCase().includes(query) ||
      token.display.name.toLowerCase().includes(query) ||
      getOriginChainName(token.originBlockchain).toLowerCase().includes(query)
    )
  }, [debouncedSearchQuery, tokens, getOriginChainName])

  // Function to handle chain icon load error
  const handleChainIconError = useCallback((originBlockchain: string) => {
    setFailedChainIcons(prev => new Set(prev).add(originBlockchain))
  }, [])

  // Function to handle token selection
  const handleTokenSelect = useCallback((tokenAddress: string) => {
    onTokenSelect(tokenAddress)
    onClose()
    setTokenSearchQuery("")
  }, [onTokenSelect, onClose])

  // Function to handle favorite toggle
  const handleFavoriteToggle = useCallback((tokenAddress: string) => {
    console.log('Toggle favorite for:', tokenAddress)
  }, [])

  return (
    <Modal
      title="Search Tokens"
      onClose={onClose}
      open={open}
      className={s.modal}
      responsiveBottom
    >
      <div className={s.searchContainer}>
        <div className={s.searchInput}>
          <input
            type="text"
            placeholder="Search by symbol, name or chain..."
            value={tokenSearchQuery}
            onChange={(e) => setTokenSearchQuery(e.target.value)}
            className={s.searchField}
          />
          <Icon icon="hugeicons:search-02" className={s.searchIcon} />
        </div>
        <div className={s.searchResults}>
          <table className={s.tokenTable}>
            <thead>
              <tr>
                <th>Token</th>
                <th>Details</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTokens.map((token) => (
                <tr key={token.functionnal?.address} className={s.tokenRow}>
                  <td 
                    className={s.tokenCell}
                    onClick={() => handleTokenSelect(token.functionnal?.address)}
                  >
                    <div className={s.tokenLogoWrapper}>
                      {token.display?.logo &&token.display.logo !== "" && (
                        <Image
                          src={token.display.logo}
                          alt=""
                          width={32}
                          height={32}
                          className={s.tokenLogo}
                        />
                      )}
                      {token.display?.logo &&token.display.logo === "" && (
                        <Icon 
                          icon={token.display.symbolIcon} 
                          className={s.tokenLogo}
                        />
                      )}
                      {!failedChainIcons.has(token.originBlockchain) && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={getChainIcon(parseInt(token.originBlockchain))}
                          alt=""
                          width={16}
                          height={16}
                          className={s.originChainIcon}
                          onError={() => handleChainIconError(token.originBlockchain)}
                        />
                      )}
                    </div>
                  </td>
                  <td 
                    className={s.tokenCell}
                    onClick={() => handleTokenSelect(token.functionnal?.address)}
                  >
                    <div className={s.tokenInfo}>
                      <div className={s.tokenName}>{token.display?.name}</div>
                      <div className={s.tokenDetails}>
                        <span className={s.tokenSymbol}>{token.display?.symbol.toUpperCase()}</span>
                        <span className={s.tokenAddress}>{token.functionnal?.address.slice(0, 6)}...{token.functionnal?.address.slice(-4)}</span>
                      </div>
                    </div>
                  </td>
                  <td className={s.tokenCell}>
                    <div className={s.tokenActions}>
                      <Icon 
                        icon="hugeicons:star" 
                        className={s.favoriteIcon}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleFavoriteToggle(token.functionnal?.address)
                        }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
                      {filteredTokens.length === 0 && tokenSearchQuery.trim() && (
              <div className={s.noResults}>
                No tokens found for &quot;{tokenSearchQuery}&quot;
              </div>
            )}
        </div>
      </div>
    </Modal>
  )
} 