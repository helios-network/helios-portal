import { ethers } from "ethers"
import { formatUnits } from "ethers"

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

export function fromWeiToEther(value: string | number | bigint): string {
  // Handle different input types
  let stringValue: string

  if (typeof value === "bigint") {
    stringValue = value.toString()
  } else if (typeof value === "number") {
    // Convert scientific notation to fixed decimal string
    stringValue = value.toFixed(0)
  } else {
    // If it's already a string, check if it's in scientific notation
    stringValue = value
    if (stringValue.includes("e") || stringValue.includes("E")) {
      // Convert scientific notation string to regular number string
      const num = parseFloat(stringValue)
      stringValue = num.toFixed(0)
    }
  }

  try {
    return formatUnits(stringValue, 18)
  } catch (error) {
    console.error("Error formatting units:", error, "Input value:", value)
    return "0"
  }
}
