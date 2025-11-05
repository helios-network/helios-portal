"use client"

import { Icon } from "@/components/icon"
import { Symbol } from "@/components/symbol"
import { TokenExtended } from "@/types/token"
import { getChainConfig } from "@/config/chain-config"
import { HELIOS_NETWORK_ID } from "@/config/app"
import Image from "next/image"
import { useState, useCallback } from "react"
import s from "./asset-selector.module.scss"
import clsx from "clsx"

interface AssetSelectorProps {
    assets: TokenExtended[]
    selectedAssetAddress?: string
    onSelect: (assetAddress: string) => void
    label?: string
    placeholder?: string
}

export const AssetSelector = ({
    assets,
    selectedAssetAddress,
    onSelect,
    label = "Choose an asset",
    placeholder = "Please select an asset"
}: AssetSelectorProps) => {
    const [isOpen, setIsOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")

    const selectedAsset = assets.find(
        (asset) => asset.functionnal.address === selectedAssetAddress
    )

    const getChainIcon = useCallback((chainId: number): string => {
        const icons: { [key: number]: string } = {
            [HELIOS_NETWORK_ID]: "/img/chain-icons/helios.png",
            1: "token:ethereum",
            56: "token:binance-smart-chain",
            11155111: "token:ethereum",
            80002: "token:polygon",
            97: "token:binance-smart-chain",
            43113: "token:avax",
            42161: "token:arbitrum",
            8453: "token:base",
            10: "token:optimism",
            137: "token:polygon"
        }
        return icons[chainId] || ""
    }, [])

    const getOriginChainName = useCallback((originBlockchain: string) => {
        const chainId = parseInt(originBlockchain)
        const chainConfig = getChainConfig(chainId)
        return chainConfig?.name || `Chain ${chainId}`
    }, [])

    const filteredAssets = assets.filter(
        (asset) =>
            asset.display.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
            asset.display.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            getOriginChainName(asset.originBlockchain)
                .toLowerCase()
                .includes(searchQuery.toLowerCase())
    )

    const handleSelect = (assetAddress: string) => {
        onSelect(assetAddress)
        setIsOpen(false)
        setSearchQuery("")
    }

    return (
        <div className={s.wrapper}>
            {label && <label className={s.label}>{label}</label>}

            <div className={s.selector}>
                <button
                    className={clsx(s.trigger, { [s.open]: isOpen })}
                    onClick={() => setIsOpen(!isOpen)}
                    type="button"
                >
                    {selectedAsset ? (
                        <div className={s.selectedContent}>
                            <div className={s.selectedIcon}>
                                {selectedAsset.display.logo ? (
                                    <Image
                                        src={selectedAsset.display.logo}
                                        alt={selectedAsset.display.name}
                                        width={24}
                                        height={24}
                                    />
                                ) : (
                                    <Symbol
                                        icon={selectedAsset.display.symbolIcon}
                                        color={selectedAsset.display.color}
                                    />
                                )}
                            </div>
                            <div className={s.selectedInfo}>
                                <div className={s.selectedName}>
                                    {selectedAsset.display.name}
                                </div>
                                <div className={s.selectedSymbol}>
                                    {selectedAsset.display.symbol.toUpperCase()}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <span className={s.placeholder}>{placeholder}</span>
                    )}
                    <Icon
                        icon="hugeicons:arrow-down-01"
                        className={s.chevron}
                    />
                </button>

                {isOpen && (
                    <div className={s.dropdown}>
                        <div className={s.searchContainer}>
                            <Icon
                                icon="hugeicons:search-01"
                                className={s.searchIcon}
                            />
                            <input
                                type="search"
                                placeholder="Search by symbol, name or chain..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className={s.searchInput}
                                autoFocus
                            />
                        </div>

                        <div className={s.assetsList}>
                            {filteredAssets.length > 0 ? (
                                filteredAssets.map((asset) => (
                                    <button
                                        key={asset.functionnal.address}
                                        className={clsx(s.assetItem, {
                                            [s.selected]:
                                                selectedAssetAddress ===
                                                asset.functionnal.address
                                        })}
                                        onClick={() =>
                                            handleSelect(asset.functionnal.address)
                                        }
                                        type="button"
                                    >
                                        <div className={s.assetIcon}>
                                            {asset.display.logo ? (
                                                <Image
                                                    src={asset.display.logo}
                                                    alt={asset.display.name}
                                                    width={32}
                                                    height={32}
                                                />
                                            ) : (
                                                <Symbol
                                                    icon={asset.display.symbolIcon}
                                                    color={asset.display.color}
                                                />
                                            )}
                                            {asset.originBlockchain && parseInt(asset.originBlockchain) != 42000 && (
                                                <div className={s.chainBadge}>
                                                    <Icon
                                                        icon={getChainIcon(
                                                            parseInt(asset.originBlockchain)
                                                        )}
                                                        className={s.chainIcon}
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        <div className={s.assetInfo}>
                                            <div className={s.assetName}>
                                                {asset.display.name}
                                                <span className={s.originLabel}>
                                                    (Origin: {getOriginChainName(asset.originBlockchain)})
                                                </span>
                                            </div>
                                            <div className={s.assetDetails}>
                                                <span className={s.assetSymbol}>
                                                    {asset.display.symbol.toUpperCase()}
                                                </span>
                                                <span className={s.assetAddress}>
                                                    {asset.functionnal.address.slice(0, 6)}...
                                                    {asset.functionnal.address.slice(-4)}
                                                </span>
                                            </div>
                                        </div>
                                        {/* 
                                        <Icon
                                            icon="hugeicons:star"
                                            className={s.favoriteIcon}
                                        /> */}
                                    </button>
                                ))
                            ) : (
                                <div className={s.noResults}>
                                    No assets found for &quot;{searchQuery}&quot;
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}