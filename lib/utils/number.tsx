interface FormatCurrencyOptions {
  currency?: string
  small?: boolean
  tspan?: boolean
}

export const formatCurrency = (
  amount: number,
  options: FormatCurrencyOptions = {
    currency: "USD",
    small: true,
    tspan: false
  }
) => {
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)

  const [wholePart, decimalPart] = formatted.split(".")
  const currencySymbol = options.currency === "USD" ? "$" : options.currency

  return (
    <>
      {currencySymbol}
      {wholePart}
      {options.small ? (
        <small>.{decimalPart}</small>
      ) : options.tspan ? (
        <tspan>.{decimalPart}</tspan>
      ) : (
        `.${decimalPart}`
      )}
    </>
  )
}

export function formatNumber(number: number, decimals?: number): string {
  if (decimals === 0) {
    return number.toLocaleString("en-US", {
      useGrouping: true
    })
  }

  const safeDecimals = Math.min(Math.max(decimals ?? 2, 0), 20)

  return number.toLocaleString("en-US", {
    maximumFractionDigits: safeDecimals,
    minimumFractionDigits: 2,
    useGrouping: true
  })
}

export const formatBigNumber = (number: number, toFixed = 2): string => {
  if (number < 1000) {
    return number.toFixed(toFixed)
  } else if (number < 1000000) {
    return `${(number / 1000).toFixed(1)}k`
  } else if (number < 1000000000) {
    return `${(number / 1000000).toFixed(1)}M`
  } else {
    return `${(number / 1000000000).toFixed(1)}B`
  }
}

export const formatTokenAmount = (amount: number) => {
  if (amount >= 1000) return amount.toLocaleString(undefined, { maximumFractionDigits: 2 })
  if (amount >= 1) return amount.toLocaleString(undefined, { maximumFractionDigits: 3 })
  if (amount >= 0.001) return amount.toLocaleString(undefined, { maximumFractionDigits: 4 })
  if (amount >= 0.0001) return amount.toLocaleString(undefined, { maximumFractionDigits: 5 })
  if (amount >= 0.00001) return amount.toLocaleString(undefined, { maximumFractionDigits: 6 })
  if (amount >= 0.000001) return amount.toLocaleString(undefined, { maximumFractionDigits: 7 })
  if (amount >= 0.0000001) return amount.toLocaleString(undefined, { maximumFractionDigits: 8 })
  if (amount >= 0.00000001) return amount.toLocaleString(undefined, { maximumFractionDigits: 9 })
  if (amount >= 0.000000001) return amount.toLocaleString(undefined, { maximumFractionDigits: 10 })
  if (amount >= 0.0000000001) return amount.toLocaleString(undefined, { maximumFractionDigits: 11 })
  if (amount >= 0.00000000001) return amount.toLocaleString(undefined, { maximumFractionDigits: 12 })
  if (amount >= 0.000000000001) return amount.toLocaleString(undefined, { maximumFractionDigits: 13 })
  if (amount >= 0.0000000000001) return amount.toLocaleString(undefined, { maximumFractionDigits: 14 })
  if (amount >= 0.00000000000001) return amount.toLocaleString(undefined, { maximumFractionDigits: 15 })
  if (amount >= 0.000000000000001) return amount.toLocaleString(undefined, { maximumFractionDigits: 16 })
  if (amount >= 0.0000000000000001) return amount.toLocaleString(undefined, { maximumFractionDigits: 17 })
  return amount.toLocaleString(undefined, { maximumFractionDigits: 18 })
}
