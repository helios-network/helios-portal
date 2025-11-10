"use client";

import { Card } from "@/components/card";
import { Heading } from "@/components/heading";
import { Icon } from "@/components/icon";
import { Symbol } from "@/components/symbol";
import { Table, TableCell, TableRow } from "@/components/table";
import { getChainConfig } from "@/config/chain-config";
import { usePortfolioInfo } from "@/hooks/usePortfolioInfo";
import { formatCurrency } from "@/lib/utils/number";
import { TokenExtended } from "@/types/token";
import { addTokenToWallet } from "@/utils/wallet";
import Image from "next/image";
import s from "./token-list.module.scss";
import { Badge } from "@/components/badge";

interface TokenRowProps {
  token: TokenExtended;
}

function TokenRowComponent({ token }: TokenRowProps) {
  const handleAddToWallet = () => {
    addTokenToWallet(token);
  };

  const originChainConfig = getChainConfig(parseInt(token.originBlockchain));
  const originBlockchainName = originChainConfig ? originChainConfig.name : "Unknown";

  return (
    <TableRow className={s.row}>
      <TableCell>
        <div className={s.tokenInfo}>
          <div className={s.logoContainer}>
            {token.display.logo && token.display.logo !== "" ? (
              <Image 
                src={token.display.logo} 
                width={40} 
                height={40} 
                alt={token.display.name}
                className={s.logo}
              />
            ) : (
              <Symbol icon={token.display.symbolIcon} color={token.display.color} />
            )}
          </div>
          <div className={s.tokenDetails}>
            <div className={s.tokenName}>{token.display.name}</div>
            <div className={s.tokenSymbol}>{token.display.symbol.toUpperCase()}</div>
          </div>
        </div>
      </TableCell>
      <TableCell align="center">
        <Badge className={s.chainBadge}>{originBlockchainName}</Badge>
      </TableCell>
      <TableCell align="right">
        <div className={s.balance}>
          <div className={s.balanceAmount}>{token.balance.amount.toFixed(4)}</div>
          <div className={s.balanceSymbol}>{token.display.symbol.toUpperCase()}</div>
        </div>
      </TableCell>
      <TableCell align="right">
        <div className={s.price}>
          <div className={s.priceValue}>{formatCurrency(token.balance.totalPrice || 0)}</div>
          {token.price.usd > 0 && (
            <div className={s.priceUnit}>@ {formatCurrency(token.price.usd)}</div>
          )}
        </div>
      </TableCell>
      <TableCell align="center">
        <button 
          onClick={handleAddToWallet} 
          className={s.addButton}
          title={`Add ${token.display.symbol} to wallet`}
        >
          <Icon icon="hugeicons:wallet-add-02" />
        </button>
      </TableCell>
    </TableRow>
  );
}

export function TokenList() {
  const { portfolio: tokens, isLoading, error } = usePortfolioInfo();

  if (isLoading) {
    return (
      <Card className={s.tokenList}>
        <Heading icon="hugeicons:coins-02" title="My Tokens" />
        <div className={s.loading}>
          <Icon icon="svg-spinners:ring-resize" />
          <span>Loading your tokens...</span>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={s.tokenList}>
        <Heading icon="hugeicons:coins-02" title="My Tokens" />
        <div className={s.error}>
          <Icon icon="hugeicons:alert-circle" />
          <span>Error loading tokens. Please try again later.</span>
        </div>
      </Card>
    );
  }

  if (tokens.length === 0) {
    return (
      <Card className={s.tokenList}>
        <Heading icon="hugeicons:coins-02" title="My Tokens" />
        <div className={s.empty}>
          <Icon icon="hugeicons:wallet-done-01" />
          <span>No tokens found in your portfolio.</span>
          <p className={s.emptyHint}>Connect your wallet or add some tokens to get started.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className={s.tokenList}>
      <Heading 
        icon="hugeicons:coins-02" 
        title="My Tokens"
      >
        <div className={s.tokenCount}>
          {tokens.length} {tokens.length === 1 ? "Token" : "Tokens"}
        </div>
      </Heading>

      <Table className={s.table} classNameContainer={s.tableContainer}>
        <thead>
          <tr>
            <th>Token</th>
            <th>Origin Chain</th>
            <th>Balance</th>
            <th>Value</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tokens.map((token) => (
            <TokenRowComponent key={token.functionnal.address} token={token} />
          ))}
        </tbody>
      </Table>
    </Card>
  );
}

