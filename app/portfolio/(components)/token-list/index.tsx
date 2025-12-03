"use client";

import { Card } from "@/components/card";
import { Heading } from "@/components/heading";
import { Icon } from "@/components/icon";
import { Symbol } from "@/components/symbol";
import { Table, TableCell, TableRow } from "@/components/table";
import { getChainConfig } from "@/config/chain-config";
import { usePortfolioInfo } from "@/hooks/usePortfolioInfo";
import { formatCurrency, formatTokenAmount } from "@/lib/utils/number";
import { TokenExtended } from "@/types/token";
import { addTokenToWallet } from "@/utils/wallet";
import Image from "next/image";
import s from "./token-list.module.scss";
import { Badge } from "@/components/badge";
import { Input } from "@/components/input";
import { Button } from "@/components/button";
import { useState, useMemo } from "react";
import { TransferTokenModal } from "../transfer-token-modal";

interface TokenRowProps {
  token: TokenExtended;
  onSendClick: (token: TokenExtended) => void;
}

function TokenRowComponent({ token, onSendClick }: TokenRowProps) {
  const handleAddToWallet = () => {
    addTokenToWallet(token);
  };

  const originChainConfig = getChainConfig(parseInt(token.originBlockchain));
  const originBlockchainName = originChainConfig ? originChainConfig.name : "Unknown";

  return (
    <TableRow className={s.row}>
      <TableCell data-label="Token">
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
      <TableCell align="center" data-label="Chain">
        <Badge className={s.chainBadge}>{originBlockchainName}</Badge>
      </TableCell>
      <TableCell align="right" data-label="Balance">
        <div className={s.balance}>
          <div className={s.balanceAmount}>{formatTokenAmount(token.balance.amount)}</div>
          <div className={s.balanceSymbol}>{token.display.symbol.toUpperCase()}</div>
        </div>
      </TableCell>
      <TableCell align="right" data-label="Value">
        <div className={s.price}>
          <div className={s.priceValue}>{formatCurrency(token.balance.totalPrice || 0)}</div>
          {token.price.usd > 0 && (
            <div className={s.priceUnit}> {formatCurrency(token.price.usd)}</div>
          )}
        </div>
      </TableCell>
      <TableCell align="center" data-label="Actions">
        <div className={s.actions}>
          <button
            onClick={() => onSendClick(token)}
            className={s.sendButton}
            title={`Send ${token.display.symbol}`}
          >
            <Icon icon="hugeicons:arrow-data-transfer-horizontal" />
          </button>
          <button
            onClick={handleAddToWallet}
            className={s.addButton}
            title={`Add ${token.display.symbol} to wallet`}
          >
            <Icon icon="hugeicons:wallet-add-02" />
          </button>
        </div>
      </TableCell>
    </TableRow>
  );
}

interface TokenListProps {
  watchAddress?: string | null;
}

type SortField = "value" | "balance" | "name" | "chain";
type SortDirection = "asc" | "desc";

export function TokenList({ watchAddress }: TokenListProps) {
  const { portfolio: tokens, isLoading, error, isWatching } = usePortfolioInfo({ watchAddress });
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("value");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [selectedToken, setSelectedToken] = useState<TokenExtended | null>(null);

  const handleSendClick = (token: TokenExtended) => {
    setSelectedToken(token);
    setTransferModalOpen(true);
  };

  const handleCloseModal = () => {
    setTransferModalOpen(false);
    setSelectedToken(null);
  };

  const filteredAndSortedTokens = useMemo(() => {
    const filtered = tokens.filter((token) =>
      token.display.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.display.symbol.toLowerCase().includes(searchQuery.toLowerCase())
    );

    filtered.sort((a, b) => {
      let aValue: string | number = 0;
      let bValue: string | number = 0;

      switch (sortField) {
        case "value":
          aValue = a.balance.totalPrice || 0;
          bValue = b.balance.totalPrice || 0;
          break;
        case "balance":
          aValue = a.balance.amount || 0;
          bValue = b.balance.amount || 0;
          break;
        case "name":
          aValue = a.display.name;
          bValue = b.display.name;
          break;
        case "chain":
          aValue = getChainConfig(parseInt(a.originBlockchain))?.name || "";
          bValue = getChainConfig(parseInt(b.originBlockchain))?.name || "";
          break;
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [tokens, searchQuery, sortField, sortDirection]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

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
          <p className={s.errorHint}>{error.message}</p>
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
        title={isWatching ? "Watched Tokens" : "My Tokens"}
      >
        <div className={s.tokenCount}>
          {tokens.length} {tokens.length === 1 ? "Token" : "Tokens"}
        </div>
      </Heading>

      <div className={s.controls}>
        <Input
          icon="hugeicons:search-01"
          placeholder="Search tokens..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={s.searchInput}
        />
        <div className={s.sortButtons}>
          <Button
            variant={sortField === "value" ? "primary" : "secondary"}
            size="small"
            onClick={() => toggleSort("value")}
            iconLeft={sortField === "value" && sortDirection === "desc" ? "hugeicons:arrow-down-01" : sortField === "value" ? "hugeicons:arrow-up-01" : "hugeicons:arrow-sort-vertical"}
          >
            Value
          </Button>
          <Button
            variant={sortField === "balance" ? "primary" : "secondary"}
            size="small"
            onClick={() => toggleSort("balance")}
            iconLeft={sortField === "balance" && sortDirection === "desc" ? "hugeicons:arrow-down-01" : sortField === "balance" ? "hugeicons:arrow-up-01" : "hugeicons:arrow-sort-vertical"}
          >
            Balance
          </Button>
          <Button
            variant={sortField === "name" ? "primary" : "secondary"}
            size="small"
            onClick={() => toggleSort("name")}
            iconLeft={sortField === "name" && sortDirection === "desc" ? "hugeicons:arrow-down-01" : sortField === "name" ? "hugeicons:arrow-up-01" : "hugeicons:arrow-sort-vertical"}
          >
            Name
          </Button>
        </div>
      </div>

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
          {filteredAndSortedTokens.length > 0 ? (
            filteredAndSortedTokens.map((token) => (
              <TokenRowComponent
                key={token.functionnal.address}
                token={token}
                onSendClick={handleSendClick}
              />
            ))
          ) : (
            <tr>
              <td colSpan={5} className={s.noResults}>
                <Icon icon="hugeicons:search-no-1" />
                <span>No tokens match your search</span>
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      <TransferTokenModal
        open={transferModalOpen}
        onClose={handleCloseModal}
        token={selectedToken}
      />
    </Card>
  );
}

