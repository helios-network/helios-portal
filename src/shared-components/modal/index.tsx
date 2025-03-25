"use client"

import clsx from "clsx"
import { ReactNode, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { Button } from "../button"
import s from "./modal.module.scss"

interface ModalProps {
  onClose: () => void
  children: ReactNode
  className?: string
  title?: string
  full?: boolean
  open: boolean
  responsiveBottom?: boolean
}

export function Modal({
  onClose,
  children,
  className,
  title,
  full,
  open,
  responsiveBottom
}: ModalProps) {
  const modalRootRef = useRef<Element | null>(null)

  useEffect(() => {
    modalRootRef.current = document.getElementById("modal-root")

    if (open) {
      document.body.classList.add("overflow")
    } else {
      document.body.classList.remove("overflow")
    }

    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && open) {
        handleClose()
      }
    }

    document.addEventListener("keydown", handleEscKey)

    return () => {
      document.body.classList.remove("overflow")
      document.removeEventListener("keydown", handleEscKey)
    }
  }, [open])

  const handleClose = () => {
    onClose()
  }

  const isBrowser = typeof window !== "undefined"

  if (!isBrowser || !open) {
    return null
  }

  if (!modalRootRef.current) {
    modalRootRef.current = document.getElementById("modal-root")
    if (!modalRootRef.current) return null
  }

  return createPortal(
    <div
      className={clsx(
        s.overlay,
        full && s.overlayFull,
        responsiveBottom && s.responsiveBottom
      )}
    >
      <div
        className={clsx(s.modal, className, full && s.full)}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
      >
        <Button
          icon="hugeicons:cancel-01"
          onClick={handleClose}
          variant="secondary"
          size="xsmall"
          border
          className={s.close}
        />
        {title && (
          <h2 id="modal-title" className={s.title}>
            {title}
          </h2>
        )}
        {children}
      </div>
      <div className={s.overlayClose} onClick={handleClose} />
    </div>,
    modalRootRef.current
  )
}
