import { TableCell, TableRow } from "../table"
import s from "./transactions.module.scss"
import { TransactionLight } from "@/types/transaction"
import { EXPLORER_URL } from "@/config/app"
import Category from "./category"
import * as Tooltip from '@radix-ui/react-tooltip';
import { Button } from "../button"
import { Symbol } from "@/components/symbol"
import { ethers } from "ethers"
import Image from "next/image"
import { getLogoByHash } from "@/utils/url"
import { Icon } from "../icon"
import { getChainConfig } from "@/config/chain-config"
import { useBridge } from "@/hooks/useBridge"

export const TransactionsLine = ({ transaction, isClientTxs }: { transaction: TransactionLight, isClientTxs?: boolean }) => {
  const { cancelSendToChain } = useBridge()
  const isCosmosHash = !transaction.hash?.startsWith("0x")
  let explorerLink = !isCosmosHash ? EXPLORER_URL + "/tx/" + transaction.hash : undefined

  if (transaction.chainId && transaction.type === "BRIDGE_OUT" && transaction.hash) {
    const chainConfig = getChainConfig(transaction.chainId)
    explorerLink = chainConfig ? `${chainConfig.explorerUrl}/tx/${transaction.hash}` : undefined
  } else if (transaction.type === "BRIDGE_IN" && transaction.hash) {
    explorerLink = `${EXPLORER_URL}/tx/${transaction.hash.split(",")[0]}`
  }

  return (
    <TableRow>
      <TableCell>
        <Tooltip.Provider>
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <div>
                <Category type={transaction.type} status={transaction.status} />
              </div>
            </Tooltip.Trigger>
            {transaction.timeout && transaction.timeout > 0 && (
              <Tooltip.Portal>
                <Tooltip.Content className={s.tooltipContent} sideOffset={5}>
                  Expire at block <strong>{transaction.timeout}</strong> on chain <strong>{transaction.chainName}</strong> {transaction.status_bridge_tx} {transaction.fees && `(fees: ${transaction.fees} HLS)`}
                  <Tooltip.Arrow className={s.tooltipArrow} />
                </Tooltip.Content>
              </Tooltip.Portal>
            )}
          </Tooltip.Root>
        </Tooltip.Provider>
      </TableCell>

      <TableCell className={s.cellAmount}>
        {transaction.amount && (
          <>
            <strong className={s.stronger}>
              {transaction.token && transaction.token.display.logo !== "" && (
                <Image
                  src={transaction.token.display.logo}
                  alt=""
                  width={16}
                  height={16}
                />
              )}
              {transaction.token && transaction.token.display.logo === "" && (
                <Symbol
                  icon={transaction.token.display.symbolIcon}
                  color={transaction.token.display.color}
                />
              )}
              {ethers.formatUnits(
                transaction.amount,
                transaction.token?.functionnal.decimals
              )}{" "}
              {transaction.token?.display.symbol.toUpperCase()}
              {transaction.chainName && transaction.type === "BRIDGE_OUT" && (
                <Icon icon="hugeicons:arrow-right-01" />
              )}
              {transaction.chainName && transaction.type === "BRIDGE_IN" && (
                <Icon icon="hugeicons:arrow-left-01" />
              )}
              {transaction.chainName && (
                <div className={s.chainName}>{transaction.chainName}</div>
              )}
              {transaction.chainId && (
                <div className={s.chainId}>
                  {transaction.chainLogo && (
                    <Image
                      src={getLogoByHash(transaction.chainLogo)}
                      alt=""
                      width={16}
                      height={16}
                    />
                  )}
                </div>
              )}
            </strong>
          </>
        )}
      </TableCell>
      <TableCell align="right" className={s.cellRight}>
        {isClientTxs && transaction.type === "BRIDGE_OUT" && transaction.status_bridge_tx === "PROGRESS_UNBATCHED" && (
          <Button
            icon="hugeicons:cancel-01"
            variant="danger"
            border
            onClick={async() => {
              await cancelSendToChain(transaction.chainId || 0, transaction.transactionId || 0)
            }}
          />
        )}
        {!isClientTxs && transaction.type === "BRIDGE_OUT" && transaction.status_bridge_tx === "PROGRESS_BATCHED" && (
          <Button
            icon="hugeicons:link-square-02"
            variant="secondary"
            border
            href={""}
          />
        )}
        {explorerLink && <Button
          icon="hugeicons:link-square-02"
          variant="secondary"
          border
          href={explorerLink}
        />}
      </TableCell>
    </TableRow>
  )
}
