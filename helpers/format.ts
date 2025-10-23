import BigNumber from "bignumber.js"

export enum DECIMAL {
    DEFAULT = 2,
    USDC = 6,
}

export const NUMBER_UNITS = [
    { v: 1, s: "" },
    { v: Math.pow(10, 3), s: "K" },
    { v: Math.pow(10, 6), s: "M" },
    { v: Math.pow(10, 9), s: "B" },
    { v: Math.pow(10, 12), s: "T" },
]

/**
 * Validates if a value is safe to use with formatUnits or BigInt operations
 * @param value - The value to validate
 * @returns boolean - true if safe to use, false otherwise
 */
export function isValidNumericValue(
    value: string | number | null | undefined,
): boolean {
    if (value === null || value === undefined || value === "") return false

    const stringValue = String(value)
    if (
        stringValue === "NaN" ||
        stringValue === "null" ||
        stringValue === "undefined"
    )
        return false

    // Check if it's a valid number
    const numValue = Number(stringValue)
    if (isNaN(numValue)) return false

    return true
}

/**
 * Converts scientific notation strings to BigInt without precision loss
 * @param value - The value in scientific notation (e.g., "1.000505e+26")
 * @returns BigInt representation of the value
 */
export function scientificNotationToBigInt(value: string): bigint {
    if (!value || typeof value !== 'string') {
        return BigInt(0)
    }

    // Handle scientific notation like "1.000505e+26"
    if (value.includes('e') || value.includes('E')) {
        const [mantissa, exponent] = value.toLowerCase().split('e')
        const exp = parseInt(exponent, 10)

        if (isNaN(exp)) {
            return BigInt(0)
        }

        if (exp >= 0) {
            // Positive exponent: multiply by 10^exp
            const [integerPart, fractionalPart = ''] = mantissa.split('.')
            const totalDigits = integerPart + fractionalPart
            const zerosToAdd = exp - fractionalPart.length

            if (zerosToAdd >= 0) {
                // Add zeros to the right
                return BigInt(totalDigits + '0'.repeat(zerosToAdd))
            } else {
                // Need to handle decimal places
                const finalDigits = totalDigits.slice(0, totalDigits.length + zerosToAdd)
                return BigInt(finalDigits || '0')
            }
        } else {
            // Negative exponent: this would result in a decimal, return 0 for BigInt
            return BigInt(0)
        }
    }

    // Not scientific notation, handle as regular number
    const [integerPart] = value.split('.')
    return BigInt(integerPart || '0')
}

/**
 * Safe BigInt conversion with error handling
 */
export function safeToBigInt(value: string | number): bigint {
    try {
        if (typeof value === 'number') {
            return BigInt(Math.floor(value))
        }
        if (typeof value === 'string') {
            // Handle scientific notation
            if (value.includes('e') || value.includes('E')) {
                return scientificNotationToBigInt(value)
            }
            // Handle hex strings
            if (value.startsWith('0x') || value.startsWith('0X')) {
                return BigInt(value)
            }
            // Handle decimal strings
            const [integerPart] = value.split('.')
            return BigInt(integerPart || '0')
        }
        return BigInt(0)
    } catch (error) {
        return BigInt(0)
    }
}

/**
 * Format numbers with unit notation (K, M, B, T)
 */
export const formatNumberWithNotation = (
    number: BigNumber.Value | null,
    decimalPlace: DECIMAL | number = DECIMAL.DEFAULT,
    minimumNumberPrefix: string = "~",
    roundingMode: BigNumber.RoundingMode = BigNumber.ROUND_HALF_EVEN,
): string | null => {
    const bn = new BigNumber(number || "").absoluteValue()
    const isNegative = new BigNumber(number || "").isNegative()
    const negativeSymbol = isNegative ? "-" : ""

    if (bn.isNaN()) return null
    if (bn.eq(0)) return "0"

    let unit = NUMBER_UNITS[0]
    for (let i = NUMBER_UNITS.length - 1; i >= 0; i--) {
        if (bn.gte(NUMBER_UNITS[i].v)) {
            unit = NUMBER_UNITS[i]
            break
        }
    }

    const minimumNumber = new BigNumber(1).div(Math.pow(10, decimalPlace))
    if (bn.div(unit.v).lt(minimumNumber)) {
        return `${minimumNumberPrefix} ${negativeSymbol}${minimumNumber.toString(
            10,
        )}`
    }

    const shortenedNumberByUnit = bn.div(unit.v)
    return `${negativeSymbol}${shortenedNumberByUnit
        .dp(decimalPlace, roundingMode)
        .toString(10)}${unit.s}`
}

/**
 * Format token supply with proper precision for large numbers
 * Uses BigInt to avoid precision loss with large numbers
 */
export const formatTokenSupply = (
    totalSupply: string | null | undefined,
    decimals: number | null = 18,
    maxFractionDigits: number = 4,
): string => {
    if (!isValidNumericValue(totalSupply) || totalSupply === "0") return "0"

    const actualDecimals = decimals ?? 18

    try {
        // Use BigInt to handle large numbers without precision loss
        let supply: bigint
        if (totalSupply && (totalSupply.includes('e') || totalSupply.includes('E'))) {
            supply = scientificNotationToBigInt(totalSupply)
        } else {
            supply = safeToBigInt(totalSupply as string)
        }
        const divisor = BigInt(10) ** BigInt(actualDecimals)

        // Get integer and fractional parts
        const integerPart = supply / divisor
        const remainder = supply % divisor

        // Format the integer part with commas
        let result = integerPart.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")

        // Handle fractional part if there's a remainder
        if (remainder > BigInt(0) && maxFractionDigits > 0) {
            // Convert remainder to decimal string with proper padding
            let fractionalStr = remainder.toString().padStart(actualDecimals, "0")

            // Trim to maxFractionDigits and remove trailing zeros
            fractionalStr = fractionalStr
                .slice(0, maxFractionDigits)
                .replace(/0+$/, "")

            if (fractionalStr.length > 0) {
                result += "." + fractionalStr
            }
        }

        return result
    } catch (error) {

        return String(totalSupply)
    }
}

/**
 * Format token amount with proper decimal handling
 * Handles both ERC20 tokens and NFTs
 */
export const formatTokenAmount = (
    amount: string | null | undefined,
    decimals: number | null = 18,
    maxFractionDigits: number = 6,
    isNFT: boolean = false,
): string => {
    if (!amount || amount === "0") return "0"

    // For NFTs, return the amount as-is (usually token ID or quantity)
    if (isNFT) {
        return amount
    }

    // Handle null decimals by using default value of 18
    const actualDecimals = decimals ?? 18

    try {
        // Simple conversion without formatUnits dependency
        const supply = safeToBigInt(amount)
        const divisor = BigInt(10) ** BigInt(actualDecimals)

        const integerPart = supply / divisor
        const remainder = supply % divisor

        let result = integerPart.toString()

        if (remainder > BigInt(0) && maxFractionDigits > 0) {
            let fractionalStr = remainder.toString().padStart(actualDecimals, "0")
            fractionalStr = fractionalStr.slice(0, maxFractionDigits).replace(/0+$/, "")

            if (fractionalStr.length > 0) {
                result += "." + fractionalStr
            }
        }

        const num = Number.parseFloat(result)

        if (num === 0) return "0"
        if (num < 0.000001) return "< 0.000001"

        return num.toLocaleString(undefined, {
            maximumFractionDigits: maxFractionDigits,
            minimumFractionDigits: 0,
        })
    } catch (error) {

        // Fallback to formatTokenSupply for large numbers
        return formatTokenSupply(amount, actualDecimals, maxFractionDigits)
    }
}