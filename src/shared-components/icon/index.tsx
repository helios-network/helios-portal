"use client"

import { Icon as Iconify, IconProps as IconifyProps } from "@iconify/react"
import clsx from "clsx"
import { Sprite } from "../sprite"
import s from "./icon.module.scss"

interface IconProps extends Omit<IconifyProps, "icon"> {
  icon: "helios" | string
}

export const Icon = ({ icon, ...props }: IconProps) =>
  icon === "helios" ? (
    <Sprite
      {...props}
      id="logotype"
      viewBox="0 0 455 455"
      className={clsx(s.icon, s.iconHelios, props.className)}
      data-icon={icon}
    />
  ) : (
    <Iconify
      {...props}
      className={clsx(s.icon, props.className)}
      icon={icon}
      data-icon={icon}
    />
  )
