"use client"

import { Icon } from "@/components/icon"
import { formatNumber, formatTokenAmount } from "@/lib/utils/number"
import { clsx } from "clsx"
import {
  forwardRef,
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes
} from "react"
import { Button } from "../button"
import s from "./input.module.scss"
import { Variants } from "@/types/feedback"

interface BaseInputProps {
  label?: string
  icon?: string
  balance?: number
  showMaxButton?: boolean
  onMaxClick?: () => void
  className?: string
  error?: string
  helperText?: string
  helperVariant?: Variants
  startAdornment?: ReactNode
  endAdornment?: ReactNode
}

interface InputProps
  extends BaseInputProps,
    Omit<InputHTMLAttributes<HTMLInputElement>, "className"> {
  type?: "text" | "number" | "password" | "email" | "tel" | "url"
}

interface TextareaProps
  extends BaseInputProps,
    Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "className"> {
  type: "textarea"
}

type Props = InputProps | TextareaProps

export const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement, Props>(
  (
    {
      label,
      icon,
      balance,
      showMaxButton = false,
      onMaxClick,
      className,
      error,
      helperVariant,
      helperText,
      startAdornment,
      endAdornment,
      type = "text",
      ...props
    },
    ref
  ) => {
    const handleFocusInput = (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) {
        const input = e.currentTarget.querySelector("input, textarea") as
          | HTMLInputElement
          | HTMLTextAreaElement
        input?.focus()
      }
    }

    return (
      <div className={clsx(s.wrapper, className)}>
        {label && (
          <label className={s.label}>
            {label}
            {balance !== undefined && (
              <small>Balance: {formatTokenAmount(balance)}</small>
            )}
          </label>
        )}
        <div
          className={clsx(s.input, type === "textarea" && s.textarea)}
          onClick={handleFocusInput}
        >
          {icon && (
            <Icon
              icon={icon}
              className={clsx(s.icon, type === "textarea" && s.iconTextarea)}
            />
          )}
          {startAdornment}
          {type === "textarea" ? (
            <textarea
              ref={ref as React.RefObject<HTMLTextAreaElement>}
              className={s.value}
              {...(props as TextareaHTMLAttributes<HTMLTextAreaElement>)}
            />
          ) : (
            <input
              ref={ref as React.RefObject<HTMLInputElement>}
              className={s.value}
              type={type}
              {...(props as InputHTMLAttributes<HTMLInputElement>)}
            />
          )}
          {endAdornment}
          {showMaxButton && (
            <Button
              className={s.max}
              onClick={onMaxClick}
              variant="secondary"
              size="xsmall"
            >
              Max
            </Button>
          )}
        </div>
        {(error || helperText) && (
          <span
            className={s.helper}
            data-color={error ? "danger" : helperVariant}
          >
            {error || helperText}
          </span>
        )}
      </div>
    )
  }
)

Input.displayName = "Input"
