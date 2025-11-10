"use client"

import { Button } from "@/components/button"
import { Card } from "@/components/card"
import { Heading } from "@/components/heading"
import { Icon } from "@/components/icon"
import { Input } from "@/components/input"
import { Modal } from "@/components/modal"
import { ChangeEvent, useState } from "react"
import { toast } from "sonner"
import s from "./interface.module.scss"
import { useAccount, useChainId } from "wagmi"
import { HELIOS_NETWORK_ID } from "@/config/app"
import { useRecentETFsContext } from "@/context/RecentETFsContext"

type TokenInBasket = {
    address: string
    symbol: string
    percentage: number
}

type ETFForm = {
    name: string
    symbol: string
    tokens: TokenInBasket[]
    currentTokenAddress: string
    currentTokenSymbol: string
    currentTokenPercentage: string
    rebalancingMode: "automatic" | "manual" | "no-rebalancing" | null
}

export const ETFCreatorInterface = () => {
    const chainId = useChainId()
    const { address } = useAccount()
    const [showPreview, setShowPreview] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [deployedETF, setDeployedETF] = useState<any>(null)
    const [showAutomaticModal, setShowAutomaticModal] = useState(false)
    const [showManualModal, setShowManualModal] = useState(false)
    const [showNoRebalancingModal, setShowNoRebalancingModal] = useState(false)

    const [form, setForm] = useState<ETFForm>({
        name: "",
        symbol: "",
        tokens: [],
        currentTokenAddress: "",
        currentTokenSymbol: "",
        currentTokenPercentage: "",
        rebalancingMode: null
    })

    const { addETF } = useRecentETFsContext()

    const handleInputChange =
        (field: keyof ETFForm) =>
            (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
                const value = e.target.value

                if (field === "currentTokenPercentage") {
                    const percentageValue = parseFloat(value)
                    if (
                        value !== "" &&
                        (isNaN(percentageValue) || percentageValue < 0 || percentageValue > 100)
                    ) {
                        return
                    }
                }

                setForm((prev) => ({
                    ...prev,
                    [field]: value
                }))
            }

    const handleAddToken = () => {
        if (
            !form.currentTokenAddress ||
            !form.currentTokenSymbol ||
            !form.currentTokenPercentage
        ) {
            toast.error("Please fill in all token fields")
            return
        }

        const percentage = parseFloat(form.currentTokenPercentage)
        const currentTotal = form.tokens.reduce((sum, t) => sum + t.percentage, 0)

        if (currentTotal + percentage > 100) {
            toast.error("Total percentage cannot exceed 100%")
            return
        }

        // Check if token already exists
        if (
            form.tokens.some(
                (t) => t.address.toLowerCase() === form.currentTokenAddress.toLowerCase()
            )
        ) {
            toast.error("Token already added to basket")
            return
        }

        const newToken: TokenInBasket = {
            address: form.currentTokenAddress,
            symbol: form.currentTokenSymbol.toUpperCase(),
            percentage: percentage
        }

        setForm((prev) => ({
            ...prev,
            tokens: [...prev.tokens, newToken],
            currentTokenAddress: "",
            currentTokenSymbol: "",
            currentTokenPercentage: ""
        }))

        toast.success(`${newToken.symbol} added to basket`)
    }

    const handleRemoveToken = (address: string) => {
        setForm((prev) => ({
            ...prev,
            tokens: prev.tokens.filter((t) => t.address !== address)
        }))
        toast.info("Token removed from basket")
    }

    const getTotalPercentage = () => {
        return form.tokens.reduce((sum, t) => sum + t.percentage, 0)
    }

    const handlePreview = () => {
        setShowPreview(true)
    }

    const handleDeploy = async () => {
        setIsLoading(true)

        try {
            // Simulate deployment (replace with actual smart contract call)
            await new Promise((resolve) => setTimeout(resolve, 2000))

            const newETF = {
                name: form.name,
                symbol: form.symbol.toUpperCase(),
                tokens: form.tokens,
                address: `0x${Math.random().toString(16).substr(2, 40)}`,
                txHash: `0x${Math.random().toString(16).substr(2, 64)}`,
                timestamp: Date.now()
            }

            setDeployedETF(newETF)
            addETF(newETF)
            setShowPreview(false)
            setShowSuccess(true)
            toast.success("ETF basket created successfully!")
        } catch (error: any) {
            toast.error(error?.message || "ETF creation failed. Please try again.")
            console.error("ETF creation failed:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const resetForm = () => {
        setForm({
            name: "",
            symbol: "",
            tokens: [],
            currentTokenAddress: "",
            currentTokenSymbol: "",
            currentTokenPercentage: "",
            rebalancingMode: null
        })
        setDeployedETF(null)
        setShowSuccess(false)
        setShowPreview(false)
    }

    const isFormValid =
        form.name &&
        form.symbol &&
        form.tokens.length > 0 &&
        getTotalPercentage() === 100 &&
        form.rebalancingMode !== null

    const isHeliosNetwork = chainId === HELIOS_NETWORK_ID
    const isWalletConnected = !!address

    return (
        <>
            <Card className={s.interface}>
                <Heading
                    icon="hugeicons:package"
                    title="ETF Basket Creator"
                    description="Create a basket of tokens with custom allocations."
                />

                <div className={s.content}>
                    <div className={s.form}>
                        {/* ETF Name */}
                        <Input
                            label="ETF Basket Name"
                            icon="hugeicons:text"
                            type="text"
                            value={form.name}
                            placeholder="e.g., DeFi Blue Chip Basket"
                            onChange={handleInputChange("name")}
                            maxLength={50}
                        />

                        {/* ETF Symbol */}
                        <Input
                            label="ETF Symbol"
                            icon="hugeicons:tag-01"
                            type="text"
                            value={form.symbol}
                            placeholder="e.g., DEFI"
                            onChange={handleInputChange("symbol")}
                            maxLength={10}
                            style={{ textTransform: "uppercase" }}
                        />

                        {/* Rebalancing Mode Selection */}
                        <div className={s.modeSection}>
                            <div className={s.modeHeader}>
                                <h3>Rebalancing Mode</h3>
                                <p>Choose how your ETF will be managed</p>
                            </div>

                            <div className={s.modeGrid}>
                                <button
                                    className={`${s.modeButton} ${
                                        form.rebalancingMode === "automatic" ? s.selected : ""
                                    }`}
                                    onClick={() =>
                                        setForm((prev) => ({
                                            ...prev,
                                            rebalancingMode: "automatic"
                                        }))
                                    }
                                    type="button"
                                >
                                    <div className={s.modeButtonContent}>
                                        <Icon icon="hugeicons:automation" className={s.modeIcon} />
                                        <h4>Automatic Rebalancing</h4>
                                        <p>Automatically maintains target allocations</p>
                                        <button
                                            className={s.infoButton}
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                setShowAutomaticModal(true)
                                            }}
                                            type="button"
                                            title="Learn more about Automatic Rebalancing"
                                        >
                                            <Icon icon="hugeicons:help-circle" />
                                        </button>
                                    </div>
                                </button>

                                <button
                                    className={`${s.modeButton} ${
                                        form.rebalancingMode === "manual" ? s.selected : ""
                                    }`}
                                    onClick={() =>
                                        setForm((prev) => ({
                                            ...prev,
                                            rebalancingMode: "manual"
                                        }))
                                    }
                                    type="button"
                                >
                                    <div className={s.modeButtonContent}>
                                        <Icon icon="hugeicons:hand-02" className={s.modeIcon} />
                                        <h4>Manual Rebalancing</h4>
                                        <p>Full control over reserves and allocations</p>
                                        <button
                                            className={s.infoButton}
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                setShowManualModal(true)
                                            }}
                                            type="button"
                                            title="Learn more about Manual Rebalancing"
                                        >
                                            <Icon icon="hugeicons:help-circle" />
                                        </button>
                                    </div>
                                </button>

                                <button
                                    className={`${s.modeButton} ${
                                        form.rebalancingMode === "no-rebalancing" ? s.selected : ""
                                    }`}
                                    onClick={() =>
                                        setForm((prev) => ({
                                            ...prev,
                                            rebalancingMode: "no-rebalancing"
                                        }))
                                    }
                                    type="button"
                                >
                                    <div className={s.modeButtonContent}>
                                        <Icon
                                            icon="hugeicons:lock-02"
                                            className={s.modeIcon}
                                        />
                                        <h4>No Rebalancing</h4>
                                        <p>Fixed composition, no automatic adjustments</p>
                                        <button
                                            className={s.infoButton}
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                setShowNoRebalancingModal(true)
                                            }}
                                            type="button"
                                            title="Learn more about No Rebalancing"
                                        >
                                            <Icon icon="hugeicons:help-circle" />
                                        </button>
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* Token Selection Section */}
                        <div className={s.tokenSection}>
                            <div className={s.sectionHeader}>
                                <h3>Add Tokens to Basket</h3>
                                <span className={s.totalPercentage}>
                                    Total: {getTotalPercentage()}%
                                </span>
                            </div>

                            <div className={s.tokenInputs}>
                                <Input
                                    label="Token Address"
                                    icon="hugeicons:link-01"
                                    type="text"
                                    value={form.currentTokenAddress}
                                    placeholder="0x..."
                                    onChange={handleInputChange("currentTokenAddress")}
                                />

                                <Input
                                    label="Token Symbol"
                                    icon="hugeicons:coins-01"
                                    type="text"
                                    value={form.currentTokenSymbol}
                                    placeholder="e.g., ETH"
                                    onChange={handleInputChange("currentTokenSymbol")}
                                    maxLength={10}
                                    style={{ textTransform: "uppercase" }}
                                />

                                <Input
                                    label="Percentage (%)"
                                    icon="hugeicons:percent"
                                    type="number"
                                    value={form.currentTokenPercentage}
                                    placeholder="e.g., 25"
                                    onChange={handleInputChange("currentTokenPercentage")}
                                    min={0}
                                    max={100}
                                />

                                <Button
                                    variant="secondary"
                                    onClick={handleAddToken}
                                    iconLeft="hugeicons:add-01"
                                    className={s.addTokenBtn}
                                >
                                    Add Token
                                </Button>
                            </div>

                            {/* Token List */}
                            {form.tokens.length > 0 && (
                                <div className={s.tokenList}>
                                    {form.tokens.map((token) => (
                                        <div key={token.address} className={s.tokenItem}>
                                            <div className={s.tokenInfo}>
                                                <Icon icon="hugeicons:coins-01" />
                                                <div className={s.tokenDetails}>
                                                    <span className={s.tokenSymbol}>{token.symbol}</span>
                                                    <span className={s.tokenAddress}>
                                                        {token.address.slice(0, 6)}...
                                                        {token.address.slice(-4)}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className={s.tokenPercentage}>
                                                {token.percentage}%
                                            </div>
                                            <Button
                                                variant="secondary"
                                                size="xsmall"
                                                onClick={() => handleRemoveToken(token.address)}
                                                iconLeft="hugeicons:delete-02"
                                                className={s.removeBtn}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}

                            {getTotalPercentage() !== 100 && form.tokens.length > 0 && (
                                <div className={s.percentageWarning}>
                                    <Icon icon="hugeicons:alert-02" />
                                    Total percentage must equal 100% (currently{" "}
                                    {getTotalPercentage()}%)
                                </div>
                            )}
                        </div>

                        {/* Wallet Connection Warning */}
                        {!isWalletConnected && (
                            <div className={s.walletWarning}>
                                <Icon icon="hugeicons:alert-02" />
                                Please connect your wallet to create ETF baskets
                            </div>
                        )}

                        {/* Network Warning */}
                        {isWalletConnected && !isHeliosNetwork && (
                            <div className={s.warning}>
                                <Icon icon="hugeicons:alert-02" />
                                Please switch to Helios network to create ETF baskets
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className={s.actions}>
                            <Button
                                variant="secondary"
                                onClick={handlePreview}
                                disabled={
                                    !isFormValid || !isHeliosNetwork || !isWalletConnected
                                }
                                className={s.previewBtn}
                            >
                                Preview Basket
                            </Button>
                            <Button
                                onClick={handleDeploy}
                                disabled={
                                    !isFormValid ||
                                    !isHeliosNetwork ||
                                    !isWalletConnected ||
                                    isLoading
                                }
                                className={s.deployBtn}
                            >
                                {isLoading ? "Creating..." : "Create Basket"}
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Preview Modal */}
            <Modal
                open={showPreview}
                onClose={() => setShowPreview(false)}
                title="Review ETF Basket"
                className={s.modal}
            >
                <Card className={s.previewCard}>
                    <div className={s.preview}>
                        <div className={s.previewItem}>
                            <span className={s.previewLabel}>Name:</span>
                            <span className={s.previewValue}>{form.name}</span>
                        </div>
                        <div className={s.previewItem}>
                            <span className={s.previewLabel}>Symbol:</span>
                            <span className={s.previewValue}>
                                {form.symbol.toUpperCase()}
                            </span>
                        </div>
                        <div className={s.previewItem}>
                            <span className={s.previewLabel}>Total Tokens:</span>
                            <span className={s.previewValue}>{form.tokens.length}</span>
                        </div>

                        <div className={s.previewTokens}>
                            <h4>Token Allocation:</h4>
                            {form.tokens.map((token) => (
                                <div key={token.address} className={s.previewTokenItem}>
                                    <span className={s.previewTokenSymbol}>{token.symbol}</span>
                                    <span className={s.previewTokenPercentage}>
                                        {token.percentage}%
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={s.modalActions}>
                        <Button
                            variant="secondary"
                            onClick={() => setShowPreview(false)}
                            className={s.editButton}
                        >
                            Edit
                        </Button>
                        <Button onClick={handleDeploy} disabled={isLoading}>
                            {isLoading ? "Creating..." : "Confirm & Create"}
                        </Button>
                    </div>
                </Card>
            </Modal>

            {/* Success Modal */}
            <Modal
                open={showSuccess}
                onClose={() => setShowSuccess(false)}
                title="ETF Basket Created!"
                className={s.modal}
            >
                <Card className={s.successCard}>
                    <div className={s.success}>
                        <div className={s.successItem}>
                            <span className={s.successLabel}>Basket Address:</span>
                            <div className={s.addressContainer}>
                                <span className={s.address}>{deployedETF?.address}</span>
                                <Button
                                    variant="secondary"
                                    size="xsmall"
                                    onClick={() => {
                                        navigator.clipboard.writeText(deployedETF?.address || "")
                                        toast.success("Address copied!")
                                    }}
                                    iconLeft="hugeicons:copy-01"
                                />
                            </div>
                        </div>

                        <div className={s.successItem}>
                            <span className={s.successLabel}>Transaction Hash:</span>
                            <div className={s.addressContainer}>
                                <span className={s.txHash}>{deployedETF?.txHash}</span>
                                <Button
                                    variant="secondary"
                                    size="xsmall"
                                    onClick={() => {
                                        window.open(
                                            `https://explorer.helioschainlabs.org/tx/${deployedETF?.txHash}`,
                                            "_blank"
                                        )
                                    }}
                                    iconLeft="hugeicons:search-02"
                                />
                            </div>
                        </div>
                    </div>

                    <div className={s.successActions}>
                        <Button variant="secondary" onClick={resetForm}>
                            Create Another
                        </Button>
                        <Button
                            onClick={() => {
                                window.open(
                                    `https://explorer.helioschainlabs.org/address/${deployedETF?.address}`,
                                    "_blank"
                                )
                            }}
                        >
                            View on Explorer
                        </Button>
                    </div>
                </Card>
            </Modal>

            {/* Automatic Rebalancing Modal */}
            <Modal
                open={showAutomaticModal}
                onClose={() => setShowAutomaticModal(false)}
                title="Automatic Rebalancing Mode"
                className={s.modal}
            >
                <Card className={s.infoCard}>
                    <div className={s.infoContent}>
                        <div className={s.infoSection}>
                            <h4>How it works:</h4>
                            <p>
                                The smart contract automatically rebalances the basket to maintain your
                                target token allocations. When the price of tokens changes and allocations
                                drift from their targets, the contract executes rebalancing transactions to
                                restore the desired percentages.
                            </p>
                        </div>
                        <div className={s.infoSection}>
                            <h4>Key Features:</h4>
                            <ul>
                                <li>Automatically maintains target allocations</li>
                                <li>Rebalances when allocations drift beyond threshold</li>
                                <li>Minimal manual intervention required</li>
                                <li>Smart contract handles all operations</li>
                                <li>Best for passive management strategies</li>
                            </ul>
                        </div>
                        <div className={s.infoSection}>
                            <h4>Best For:</h4>
                            <p>
                                Passive investors who want a set-it-and-forget-it approach with
                                consistent portfolio allocations over time.
                            </p>
                        </div>
                    </div>
                </Card>
            </Modal>

            {/* Manual Rebalancing Modal */}
            <Modal
                open={showManualModal}
                onClose={() => setShowManualModal(false)}
                title="Manual Rebalancing Mode"
                className={s.modal}
            >
                <Card className={s.infoCard}>
                    <div className={s.infoContent}>
                        <div className={s.infoSection}>
                            <h4>How it works:</h4>
                            <p>
                                You have complete control over the ETF reserve and basket composition. You
                                can manually deposit tokens, withdraw tokens, and adjust the quantities of
                                each token in the basket. No automatic rebalancing occurs.
                            </p>
                        </div>
                        <div className={s.infoSection}>
                            <h4>Key Features:</h4>
                            <ul>
                                <li>Full control over all reserve operations</li>
                                <li>Can deposit and withdraw tokens at will</li>
                                <li>Adjust token quantities independently</li>
                                <li>Rebalance only when you decide</li>
                                <li>Active management required</li>
                            </ul>
                        </div>
                        <div className={s.infoSection}>
                            <h4>Best For:</h4>
                            <p>
                                Active fund managers who want precise control over their ETF composition
                                and are willing to manage rebalancing decisions manually.
                            </p>
                        </div>
                    </div>
                </Card>
            </Modal>

            {/* No Rebalancing Modal */}
            <Modal
                open={showNoRebalancingModal}
                onClose={() => setShowNoRebalancingModal(false)}
                title="No Rebalancing Mode"
                className={s.modal}
            >
                <Card className={s.infoCard}>
                    <div className={s.infoContent}>
                        <div className={s.infoSection}>
                            <h4>How it works:</h4>
                            <p>
                                The basket maintains a fixed composition with no automatic or manual
                                rebalancing. This is useful for creating specialized baskets like a
                                multi-origin token collection (e.g., WETH from Ethereum, WETH from BSC,
                                etc.) where the exact token sources matter.
                            </p>
                        </div>
                        <div className={s.infoSection}>
                            <h4>Key Features:</h4>
                            <ul>
                                <li>Fixed basket composition</li>
                                <li>No automatic rebalancing</li>
                                <li>No manual rebalancing possible</li>
                                <li>Ideal for multi-origin token baskets</li>
                                <li>Tracks different versions of the same token</li>
                            </ul>
                        </div>
                        <div className={s.infoSection}>
                            <h4>Best For:</h4>
                            <p>
                                Creating specialized indices or baskets that require multiple versions of
                                the same token from different blockchain sources or maintaining exact token
                                composition over time.
                            </p>
                        </div>
                    </div>
                </Card>
            </Modal>
        </>
    )
}