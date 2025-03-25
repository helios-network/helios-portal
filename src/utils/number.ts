import { ethers } from "ethers"

export const toHex = (value: number): string => {
  if (typeof value === "number") {
    return "0x" + value.toString(16)
  } else {
    throw new Error("Invalid input: value must be a number.")
  }
}

export const fromHex = (hex: string, decimals: number = 0): number => {
  if (!hex.startsWith("0x")) {
    throw new Error("Invalid hex format. Hex string must start with '0x'.")
  }

  const value = BigInt(hex)

  return decimals > 0 ? Number(value) / 10 ** decimals : Number(value)
}

export const secondsToMilliseconds = (seconds: number): number => {
  return seconds * 1000
}

export const fromWeiToGwei = (wei: string): string => {
  return ethers.formatUnits(wei, 9)
}

export const fromWeiToEther = (wei: string): string => {
  return ethers.formatUnits(wei, 18)
}
