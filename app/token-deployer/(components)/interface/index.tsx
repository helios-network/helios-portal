"use client"

import { Button } from "@/components/button"
import { Card } from "@/components/card"
import { Heading } from "@/components/heading"
import { Icon } from "@/components/icon"
import { Input } from "@/components/input"
import { Modal } from "@/components/modal"
import { formatNumber } from "@/lib/utils/number"
import Image from "next/image"
import { ChangeEvent, useState } from "react"
import { toast } from "sonner"
import s from "./interface.module.scss"
import { useAccount, useChainId, useWalletClient } from "wagmi"
import { HELIOS_NETWORK_ID } from "@/config/app"
import { useCreateToken, type TokenParams } from "@/hooks/useCreateToken"
import { useRecentTokensContext } from "@/context/RecentTokensContext"

type TokenForm = {
  name: string
  symbol: string
  denom: string
  totalSupply: string
  decimals: string
  logoBase64: string
}

export const TokenDeployerInterface = () => {
  const chainId = useChainId()
  const { address } = useAccount()
  const { data: walletClient } = useWalletClient()
  const [showPreview, setShowPreview] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const [form, setForm] = useState<TokenForm>({
    name: "",
    symbol: "",
    denom: "",
    totalSupply: "",
    decimals: "18",
    logoBase64: ""
  })

  const { createToken, reset, deployedToken, isLoading } = useCreateToken()

  const { addToken } = useRecentTokensContext()

  const handleInputChange =
    (field: keyof TokenForm) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = e.target.value

      // Validation for specific fields
      if (field === "decimals") {
        const decimalsValue = parseInt(value)
        if (
          value !== "" &&
          (isNaN(decimalsValue) || decimalsValue < 0 || decimalsValue > 18)
        ) {
          return
        }
      }

      if (field === "totalSupply") {
        if (value !== "" && (isNaN(Number(value)) || Number(value) < 0)) {
          return
        }
      }

      setForm((prev) => ({
        ...prev,
        [field]: value
      }))
    }

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (PNG, JPEG)")
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new window.Image()
      img.onload = () => {
        // Validate image dimensions first (must be exactly 200x200)
        if (img.width !== 200 || img.height !== 200) {
          toast.error("Image must be exactly 200x200 pixels")
          return
        }

        // Validate file size after dimensions (max 1MB)
        if (file.size > 1 * 1024 * 1024) {
          toast.error("Image size must be less than 1MB")
          return
        }

        // Create canvas to process the 200x200 image
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
        canvas.width = 200
        canvas.height = 200

        if (ctx) {
          ctx.drawImage(img, 0, 0, 200, 200)
          const base64 = canvas.toDataURL("image/png").split(",")[1]
          setForm((prev) => ({
            ...prev,
            logoBase64: base64
          }))
        }
      }
      img.src = event.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  const handlePreview = () => {
    setShowPreview(true)
  }

  const handleDeploy = async () => {
    const tokenParams: TokenParams = {
      name: form.name,
      symbol: form.symbol,
      denom: form.denom,
      totalSupply: form.totalSupply,
      decimals: form.decimals,
      logoBase64: form.logoBase64
    }

    try {
      const result = await createToken(tokenParams)

      // Check if deployment was successful
      if (result && result.deployedToken) {
        // Add token to recent list
        addToken(result.deployedToken)
        setShowPreview(false)
        setShowSuccess(true)
      } else if (result === null) {
        // Validation failed (result is null) - validation already showed toast
        setShowPreview(false)
        console.error("Token deployment failed: Validation error")
      } else {
        // Deployment failed for other reasons
        setShowPreview(false)
        toast.error("Token deployment failed. Please try again.")
        console.error("Token deployment failed: No result returned")
      }
    } catch (error: any) {
      setShowPreview(false)
      // Show user-friendly error message in toast
      const errorMessage =
        error?.message || "Token deployment failed. Please try again."
      toast.error(errorMessage)
      console.error("Token deployment failed:", error)
    }
  }

  const handleAddToWallet = async () => {
    if (!deployedToken || !walletClient) return

    try {
      await walletClient.request({
        method: "wallet_watchAsset",
        params: {
          type: "ERC20",
          options: {
            address: deployedToken.address,
            symbol: deployedToken.symbol,
            decimals: deployedToken.decimals,
            image: deployedToken.logoBase64
              ? `data:image/png;base64,${deployedToken.logoBase64}`
              : undefined
          }
        }
      })
      toast.success("Token added to wallet!")
    } catch {
      toast.error("Failed to add token to wallet")
    }
  }

  const cancelTransaction = () => {
    reset()
    setShowPreview(false)
    setShowSuccess(false) // Explicitly ensure success modal is closed
    toast.info("Transaction cancelled. You can try again.")
  }

  const resetForm = () => {
    setForm({
      name: "",
      symbol: "",
      denom: "",
      totalSupply: "",
      decimals: "18",
      logoBase64: ""
    })
    reset()
    setShowSuccess(false)
    setShowPreview(false)
  }

  const isFormValid =
    form.name && form.symbol && form.denom && form.totalSupply && form.decimals
  const isHeliosNetwork = chainId === HELIOS_NETWORK_ID
  const isWalletConnected = !!address

  return (
    <>
      <Card className={s.interface}>
        <Heading
          icon="hugeicons:coins-01"
          title="Token Deployer"
          description="Create your own HRC20 token on Helios blockchain."
        />

        <div className={s.content}>
          <div className={s.form}>
            {/* Token Name */}
            <Input
              label="Token Name"
              icon="hugeicons:text"
              type="text"
              value={form.name}
              placeholder="e.g., Helios Token"
              onChange={handleInputChange("name")}
              maxLength={50}
            />

            {/* Token Symbol */}
            <Input
              label="Token Symbol"
              icon="hugeicons:tag-01"
              type="text"
              value={form.symbol}
              placeholder="e.g., HLS"
              onChange={handleInputChange("symbol")}
              maxLength={10}
              style={{ textTransform: "uppercase" }}
            />

            {/* Token Denomination */}
            <Input
              label="Denomination (smallest unit)"
              icon="hugeicons:coins-01"
              type="text"
              value={form.denom}
              placeholder="e.g., ahelios"
              onChange={handleInputChange("denom")}
              maxLength={20}
            />

            {/* Total Supply */}
            <Input
              label="Total Supply"
              icon="hugeicons:coins-02"
              type="text"
              value={form.totalSupply}
              placeholder="e.g., 1000000"
              onChange={handleInputChange("totalSupply")}
            />

            {/* Decimals */}
            <Input
              label="Decimals (0-18)"
              icon="hugeicons:balance-scale"
              type="number"
              value={form.decimals}
              placeholder="18"
              onChange={handleInputChange("decimals")}
              min={0}
              max={18}
            />

            {/* Logo Upload */}
            <div className={s.uploadSection}>
              <label className={s.uploadLabel}>
                Upload Logo (200x200px, optional)
              </label>
              <input
                id="logo"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className={s.fileInput}
              />
              <label htmlFor="logo" className={s.fileLabel}>
                <Icon icon="hugeicons:image-01" />
                {form.logoBase64 ? "Change Logo" : "Upload Logo"}
              </label>
              {form.logoBase64 && (
                <div className={s.logoPreview}>
                  <Image
                    src={`data:image/png;base64,${form.logoBase64}`}
                    alt="Token logo"
                    width={50}
                    height={50}
                  />
                  <span>Logo uploaded successfully</span>
                </div>
              )}
            </div>

            {/* Wallet Connection Warning */}
            {!isWalletConnected && (
              <div className={s.walletWarning}>
                <Icon icon="hugeicons:alert-02" />
                Please connect your wallet to deploy tokens
              </div>
            )}

            {/* Network Warning */}
            {isWalletConnected && !isHeliosNetwork && (
              <div className={s.warning}>
                <Icon icon="hugeicons:alert-02" />
                Please switch to Helios network to deploy tokens
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
                Preview Token
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
                {isLoading ? "Deploying..." : "Deploy Token"}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Preview Modal */}
      <Modal
        open={showPreview}
        onClose={() => setShowPreview(false)}
        title="Review Token Details"
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
              <span className={s.previewLabel}>Denomination:</span>
              <span className={s.previewValue}>{form.denom}</span>
            </div>
            <div className={s.previewItem}>
              <span className={s.previewLabel}>Total Supply:</span>
              <span className={s.previewValue}>
                {formatNumber(Number(form.totalSupply))}{" "}
                {form.symbol.toUpperCase()}
              </span>
            </div>
            <div className={s.previewItem}>
              <span className={s.previewLabel}>Decimals:</span>
              <span className={s.previewValue}>{form.decimals}</span>
            </div>
            {form.logoBase64 && (
              <div className={s.previewItem}>
                <span className={s.previewLabel}>Logo:</span>
                <Image
                  src={`data:image/png;base64,${form.logoBase64}`}
                  alt="Token logo"
                  width={50}
                  height={50}
                  className={s.previewLogo}
                />
              </div>
            )}
          </div>

          <div className={s.modalActions}>
            {isLoading ? (
              <>
                <Button
                  variant="secondary"
                  onClick={cancelTransaction}
                  className={s.cancelButton}
                >
                  Cancel
                </Button>
                <Button disabled>Deploying...</Button>
              </>
            ) : (
              <>
                <Button
                  variant="secondary"
                  onClick={() => setShowPreview(false)}
                  className={s.editButton}
                >
                  Edit
                </Button>
                <Button onClick={handleDeploy}>Confirm Deploy</Button>
              </>
            )}
          </div>
        </Card>
      </Modal>

      {/* Success Modal */}
      <Modal
        open={showSuccess && deployedToken && deployedToken.address}
        onClose={() => {
          setShowSuccess(false)
        }}
        title="Token Deployed Successfully!"
        className={s.modal}
      >
        <Card className={s.successCard}>
          <Heading
            icon="hugeicons:checkmark-circle-02"
            title="Deployment Complete"
            description="Your token has been successfully created on the Helios blockchain"
          />

          {deployedToken && (
            <div className={s.success}>
              <div className={s.successItem}>
                <span className={s.successLabel}>Token Address:</span>
                <div className={s.addressContainer}>
                  <code className={s.address}>{deployedToken.address}</code>
                  <Button
                    variant="secondary"
                    size="xsmall"
                    onClick={() => {
                      navigator.clipboard.writeText(deployedToken.address)
                      toast.success("Address copied!")
                    }}
                  >
                    Copy
                  </Button>
                </div>
              </div>

              <div className={s.successItem}>
                <span className={s.successLabel}>Transaction Hash:</span>
                <div className={s.addressContainer}>
                  <code className={s.txHash}>{deployedToken.txHash}</code>
                  <Button
                    variant="secondary"
                    size="xsmall"
                    onClick={() => {
                      navigator.clipboard.writeText(deployedToken.txHash)
                      toast.success("Transaction hash copied!")
                    }}
                  >
                    Copy
                  </Button>
                </div>
              </div>

              <div className={s.successActions}>
                <Button
                  variant="secondary"
                  onClick={handleAddToWallet}
                  iconLeft="hugeicons:wallet-01"
                >
                  Add to Wallet
                </Button>
                <Button onClick={resetForm}>Deploy Another Token</Button>
              </div>
            </div>
          )}
        </Card>
      </Modal>
    </>
  )
}
