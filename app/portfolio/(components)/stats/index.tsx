"use client";

import { Card } from "@/components/card";
import { Heading } from "@/components/heading";
import { Icon } from "@/components/icon";
import { usePortfolioInfo } from "@/hooks/usePortfolioInfo";
import { formatCurrency } from "@/lib/utils/number";
import s from "./stats.module.scss";

interface StatsProps {
  watchAddress?: string | null;
}

export function Stats({ watchAddress }: StatsProps) {
  const { totalUSD, portfolio, isLoading, isWatching } = usePortfolioInfo({ watchAddress });

  const tokensCount = portfolio.length;
  const highestToken = portfolio.length > 0
    ? portfolio.reduce((prev, current) =>
      (prev.balance.totalPrice || 0) > (current.balance.totalPrice || 0) ? prev : current
    )
    : null;

  return (
    <Card className={s.stats}>
      <Heading
        icon="hugeicons:wallet-04"
        title={isWatching ? "Watched Portfolio" : "My Portfolio"}
        description={isWatching ? "Viewing tokens from watched wallet" : "View and manage all your tokens in one place"}
      />

      <div className={s.grid}>
        <div className={s.statItem}>
          <div className={s.statIcon}>
            <Icon icon="hugeicons:coins-01" />
          </div>
          <div className={s.statContent}>
            <div className={s.statLabel}>Total Balance</div>
            {isLoading ? (
              <div className={s.statValue}>-</div>
            ) : (
              <div className={s.statValue}>{formatCurrency(totalUSD)}</div>
            )}
          </div>
        </div>

        <div className={s.statItem}>
          <div className={s.statIcon}>
            <Icon icon="hugeicons:wallet-02" />
          </div>
          <div className={s.statContent}>
            <div className={s.statLabel}>Total Tokens</div>
            {isLoading ? (
              <div className={s.statValue}>-</div>
            ) : (
              <div className={s.statValue}>{tokensCount}</div>
            )}
          </div>
        </div>

        <div className={s.statItem}>
          <div className={s.statIcon}>
            <Icon icon="hugeicons:star" />
          </div>
          <div className={s.statContent}>
            <div className={s.statLabel}>Top Asset</div>
            {isLoading ? (
              <div className={s.statValue}>-</div>
            ) : highestToken ? (
              <div className={s.statValue}>{highestToken.display.symbol.toUpperCase()}</div>
            ) : (
              <div className={s.statValue}>-</div>
            )}
          </div>
        </div>

        <div className={s.statItem}>
          <div className={s.statIcon}>
            <Icon icon="hugeicons:chart-line-data-01" />
          </div>
          <div className={s.statContent}>
            <div className={s.statLabel}>Top Value</div>
            {isLoading ? (
              <div className={s.statValue}>-</div>
            ) : highestToken ? (
              <div className={s.statValue}>{formatCurrency(highestToken.balance.totalPrice || 0)}</div>
            ) : (
              <div className={s.statValue}>-</div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

