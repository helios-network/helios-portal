import { HyperionChain } from "@/types/hyperion"
import { formatDuration } from "./date"

export function calculateTimeRemaining(
  expiryBlock: number,
  chain: HyperionChain | undefined
): string | null {
  if (
    !chain ||
    chain.averageCounterpartyBlockTime === undefined ||
    chain.latestObservedBlockHeight === undefined ||
    chain.latestObservedBlockTime === undefined
  ) {
    return null
  }

  const blocksRemaining = expiryBlock - chain.latestObservedBlockHeight

  if (blocksRemaining <= 0) {
    return "expired"
  }

  const timeSinceLastObservedMs =
    (Date.now() / 1000 - chain.latestObservedBlockTime) * 1000

  const timeRemainingMs =
    blocksRemaining * chain.averageCounterpartyBlockTime -
    timeSinceLastObservedMs

  if (timeRemainingMs <= 0) {
    return "expired"
  }

  return formatDuration(timeRemainingMs)
}

