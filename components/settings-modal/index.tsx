"use client"

import { Button } from "@/components/button"
import { Input } from "@/components/input/input"
import { Modal } from "@/components/modal"
import { GasPriceOption, useAppStore } from "@/stores/app"
import { useState, useEffect, useRef } from "react"
import { toast } from "sonner"
import s from "./settings-modal.module.scss"
import { getGasPriceLabel, getGasPriceTimeEstimate } from "@/utils/gas"
import { useAccount } from "wagmi"
import { useWeb3Provider } from "@/hooks/useWeb3Provider"

interface SettingsModalProps {
  open: boolean
  onClose: () => void
}

export const SettingsModal = ({ open, onClose }: SettingsModalProps) => {
  const {
    debugMode,
    setDebugMode,
    rpcUrl,
    setRpcUrl,
    gasPriceOption,
    setGasPriceOption
  } = useAppStore()

  const { address, isConnected } = useAccount()
  const web3Provider = useWeb3Provider()

  // Initialize local state from the current store values
  // Using useEffect to ensure we always have the latest values from the store
  const [localDebugMode, setLocalDebugMode] = useState(debugMode)
  const [localRpcUrl, setLocalRpcUrl] = useState(rpcUrl)
  const [localGasPriceOption, setLocalGasPriceOption] =
    useState<GasPriceOption>(gasPriceOption)
  const [isGasPriceDropdownOpen, setIsGasPriceDropdownOpen] = useState(false)
  const [isResettingNonce, setIsResettingNonce] = useState(false)
  const [currentNonce, setCurrentNonce] = useState<number | null>(null)

  // Ref for the dropdown to handle click outside
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Fetch current nonce when modal opens and wallet is connected
  useEffect(() => {
    const fetchCurrentNonce = async () => {
      if (open && isConnected && address && web3Provider) {
        try {
          const nonce = await web3Provider.eth.getTransactionCount(
            address,
            "pending"
          )
          setCurrentNonce(Number(nonce))
        } catch (error) {
          console.error("Error fetching nonce:", error)
          setCurrentNonce(null)
        }
      }
    }

    fetchCurrentNonce()
  }, [open, isConnected, address, web3Provider])

  // Update local state when the modal is opened
  useEffect(() => {
    if (open) {
      setLocalDebugMode(debugMode)
      setLocalRpcUrl(rpcUrl)
      setLocalGasPriceOption(gasPriceOption)
      setIsGasPriceDropdownOpen(false)
    }
  }, [debugMode, rpcUrl, gasPriceOption, open])

  // Handle click outside to close the dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsGasPriceDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleSave = () => {
    // Check if settings have changed
    const debugModeChanged = debugMode !== localDebugMode
    const rpcUrlChanged = rpcUrl !== localRpcUrl && localDebugMode

    // Update settings in the store
    setDebugMode(localDebugMode)
    setGasPriceOption(localGasPriceOption)

    // Update RPC URL based on debug mode
    if (localDebugMode) {
      // In debug mode, use the custom RPC URL
      setRpcUrl(localRpcUrl)
    } else if (debugMode && !localDebugMode) {
      // If debug mode was turned off, reset to default RPC URL
      // This ensures we don't use a custom RPC URL when debug mode is off
      setRpcUrl("https://testnet1.helioschainlabs.org")
    }

    // Manually update localStorage to ensure settings are persisted immediately
    try {
      const storeData = JSON.parse(
        localStorage.getItem("helios-app-store") || "{}"
      )
      storeData.state = {
        ...storeData.state,
        debugMode: localDebugMode,
        rpcUrl: localDebugMode
          ? localRpcUrl
          : "https://testnet1.helioschainlabs.org",
        gasPriceOption: localGasPriceOption
      }
      localStorage.setItem("helios-app-store", JSON.stringify(storeData))
    } catch (e) {
      console.error("Error updating localStorage:", e)
    }

    toast.success("Settings saved successfully!")
    onClose()

    // Manually refresh the page if network settings changed
    if (debugModeChanged || rpcUrlChanged) {
      toast.info("Refreshing page to apply new network settings...", {
        duration: 2000,
        onAutoClose: () => {
          window.location.reload()
        }
      })
    }
  }

  const handleResetNonce = async () => {
    if (!isConnected || !address || !web3Provider) {
      toast.error("Please connect your wallet first")
      return
    }

    setIsResettingNonce(true)

    try {
      // Send a 0 value transaction to self to reset nonce
      // This will use the next available nonce and help sync wallet with chain
      const gasPrice = await web3Provider.eth.getGasPrice()

      const transaction = {
        from: address,
        to: address,
        value: "0x0", // Use hex format for value
        gas: "0x5208", // Use hex format for gas (21000 in hex)
        gasPrice: gasPrice
      }

      // Send the transaction
      const txResult = await web3Provider.eth.sendTransaction(transaction)

      // Extract transaction hash - it might be in different formats
      const txHash =
        typeof txResult === "string" ? txResult : txResult.transactionHash

      if (!txHash) {
        throw new Error("No transaction hash received")
      }

      toast.success(`Nonce reset transaction sent: ${txHash}`)

      // Wait a bit before trying to get the receipt
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Try to get transaction receipt with retries
      let receipt = null
      let retries = 0
      const maxRetries = 10

      while (!receipt && retries < maxRetries) {
        try {
          receipt = await web3Provider.eth.getTransactionReceipt(txHash)
          if (!receipt) {
            // Wait before retrying
            await new Promise((resolve) => setTimeout(resolve, 2000))
            retries++
          }
        } catch {
          console.log(
            `Retry ${
              retries + 1
            }/${maxRetries} - waiting for transaction confirmation...`
          )
          await new Promise((resolve) => setTimeout(resolve, 2000))
          retries++
        }
      }

      if (receipt) {
        if (
          receipt.status === BigInt("0x1") ||
          Number(receipt.status) === 1 ||
          receipt.status === BigInt(1)
        ) {
          toast.success(
            "Nonce reset successful! Your wallet nonce is now synced with the chain."
          )

          // Refresh the current nonce display
          const newNonce = await web3Provider.eth.getTransactionCount(
            address,
            "pending"
          )
          setCurrentNonce(Number(newNonce))
        } else {
          toast.error("Nonce reset transaction failed")
        }
      } else {
        // Even if we can't get the receipt, the transaction was sent
        toast.info(
          "Transaction sent but confirmation status unknown. Please check your wallet."
        )

        // Still try to refresh the nonce
        try {
          const newNonce = await web3Provider.eth.getTransactionCount(
            address,
            "pending"
          )
          setCurrentNonce(Number(newNonce))
        } catch (nonceError) {
          console.error("Error refreshing nonce:", nonceError)
        }
      }
    } catch (error: any) {
      console.error("Error resetting nonce:", error)

      // Handle specific error cases
      if (error.message?.includes("nonce")) {
        toast.error(
          "Nonce mismatch detected. Please try again or manually adjust your wallet nonce."
        )
      } else if (error.message?.includes("insufficient funds")) {
        toast.error("Insufficient funds for gas fees")
      } else if (error.message?.includes("User denied")) {
        toast.error("Transaction was cancelled by user")
      } else {
        toast.error(
          `Failed to reset nonce: ${error.message || "Unknown error"}`
        )
      }
    } finally {
      setIsResettingNonce(false)
    }
  }

  const handleCancel = () => {
    setLocalDebugMode(debugMode) // Reset to original value
    setLocalRpcUrl(rpcUrl) // Reset to original value
    setLocalGasPriceOption(gasPriceOption) // Reset to original value
    onClose()
  }

  return (
    <Modal
      title="Settings"
      className={s.modal}
      open={open}
      onClose={onClose}
      responsiveBottom
    >
      <div className={s.content}>
        <div className={s.section}>
          <h3 className={s.sectionTitle}>Debug Mode</h3>
          <p className={s.sectionDescription}>
            Enable debug mode to show additional development information like
            the latest block number in the bottom right corner.
          </p>

          <div className={s.toggleGroup}>
            <label className={s.toggle}>
              <input
                type="checkbox"
                checked={localDebugMode}
                onChange={(e) => {
                  const newDebugMode = e.target.checked
                  setLocalDebugMode(newDebugMode)

                  // If debug mode is being turned off, reset RPC URL input to default
                  if (!newDebugMode) {
                    setLocalRpcUrl("https://testnet1.helioschainlabs.org")
                  }
                }}
                className={s.toggleInput}
              />
              <span className={s["toggle-track"]}>
                <span className={s["toggle-thumb"]}></span>
              </span>
              <span className={s.toggleLabel}>
                {localDebugMode ? "Enabled" : "Disabled"}
              </span>
            </label>
          </div>
        </div>

        {localDebugMode && (
          <div className={s.section}>
            <h3 className={s.sectionTitle}>Transaction Settings</h3>
            <p className={s.sectionDescription}>
              Configure gas price settings for your transactions.
            </p>

            <div className={s.gasPriceContainer}>
              <div className={s.gasPriceSelector}>
                <div className={s.gasPriceLabel}>Transaction Speed:</div>
                <div className={s.gasPriceDropdown} ref={dropdownRef}>
                  <button
                    className={s.gasPriceDropdownButton}
                    onClick={() =>
                      setIsGasPriceDropdownOpen(!isGasPriceDropdownOpen)
                    }
                    type="button"
                  >
                    <div className={s.gasPriceSelectedOption}>
                      <div className={s.gasPriceAvatar}>
                        {localGasPriceOption === "low" && "🐢"}
                        {localGasPriceOption === "average" && "🚶"}
                        {localGasPriceOption === "fast" && "🚀"}
                      </div>
                      <div className={s.gasPriceOptionContent}>
                        <span className={s.gasPriceOptionLabel}>
                          {getGasPriceLabel(localGasPriceOption)}
                        </span>
                        <span className={s.gasPriceOptionDescription}>
                          {getGasPriceTimeEstimate(localGasPriceOption)}
                        </span>
                      </div>
                    </div>
                    <span className={s.gasPriceDropdownArrow}>
                      {isGasPriceDropdownOpen ? "▲" : "▼"}
                    </span>
                  </button>

                  {isGasPriceDropdownOpen && (
                    <div className={s.gasPriceDropdownMenu}>
                      {(["low", "average", "fast"] as GasPriceOption[]).map(
                        (option) => (
                          <div
                            key={option}
                            className={`${s.gasPriceDropdownItem} ${
                              localGasPriceOption === option
                                ? s.gasPriceDropdownItemSelected
                                : ""
                            }`}
                            onClick={() => {
                              setLocalGasPriceOption(option)
                              setIsGasPriceDropdownOpen(false)
                            }}
                          >
                            <div className={s.gasPriceAvatar}>
                              {option === "low" && "🐢"}
                              {option === "average" && "🚶"}
                              {option === "fast" && "🚀"}
                            </div>
                            <div className={s.gasPriceOptionContent}>
                              <span className={s.gasPriceOptionLabel}>
                                {getGasPriceLabel(option)}
                              </span>
                              <span className={s.gasPriceOptionDescription}>
                                {getGasPriceTimeEstimate(option)}
                              </span>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
              </div>
              <p className={s.gasPriceDescription}>
                Select your preferred transaction speed. Higher speeds will use
                higher gas prices but confirm faster.
              </p>
            </div>
          </div>
        )}

        {localDebugMode && (
          <div className={s.section}>
            <h3 className={s.sectionTitle}>RPC Configuration</h3>
            <p className={s.sectionDescription}>
              Configure RPC endpoints for different networks.
            </p>

            <div className={s.rpcList}>
              <div className={s.rpcItem}>
                <Input
                  label="Helios Testnet RPC"
                  value={localRpcUrl}
                  onChange={(e) => setLocalRpcUrl(e.target.value)}
                  helperText="Custom RPC endpoint for Helios testnet"
                />
              </div>
            </div>
          </div>
        )}

        {isConnected && (
          <div className={s.section}>
            <h3 className={s.sectionTitle}>Wallet Management</h3>
            <p className={s.sectionDescription}>
              Manage your wallet settings and resolve transaction issues. Use
              nonce reset when your wallet nonce is out of sync with the Helios
              chain.
            </p>

            <div className={s.walletInfo}>
              <div className={s.walletInfoItem}>
                <span className={s.walletInfoLabel}>Connected Address:</span>
                <span className={s.walletInfoValue}>{address}</span>
              </div>
              {currentNonce !== null && (
                <div className={s.walletInfoItem}>
                  <span className={s.walletInfoLabel}>Current Nonce:</span>
                  <span className={s.walletInfoValue}>{currentNonce}</span>
                </div>
              )}
            </div>

            <div className={s.walletActions}>
              <Button
                variant="secondary"
                onClick={handleResetNonce}
                disabled={isResettingNonce}
                icon={
                  isResettingNonce
                    ? "hugeicons:loading-03"
                    : "hugeicons:refresh"
                }
                className={s.resetNonceButton}
              >
                {isResettingNonce ? "Resetting Nonce..." : "Reset Nonce"}
              </Button>
              <p className={s.resetNonceDescription}>
                This will send a 0-value transaction to yourself to sync your
                wallet nonce with the Helios chain. Use this if you&apos;re
                experiencing &quot;nonce too high&quot; or similar transaction
                errors.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className={s.actions}>
        <Button variant="secondary" onClick={handleCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave} icon="hugeicons:checkmark-circle-02">
          Save Settings
        </Button>
      </div>
    </Modal>
  )
}
