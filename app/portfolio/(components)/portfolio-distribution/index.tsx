"use client";

import { Card } from "@/components/card";
import { Heading } from "@/components/heading";
import { Icon } from "@/components/icon";
import { Symbol } from "@/components/symbol";
import { Badge } from "@/components/badge";
import { usePortfolioInfo } from "@/hooks/usePortfolioInfo";
import { getChainConfig } from "@/config/chain-config";
import { formatCurrency, formatTokenAmount } from "@/lib/utils/number";
import Image from "next/image";
import s from "./portfolio-distribution.module.scss";

interface DistributionItem {
  symbol: string;
  name: string;
  logo: string | null;
  symbolIcon?: React.ReactNode;
  color: string;
  value: number;
  percentage: number;
  address: string;
  originChain: string;
}

interface PortfolioDistributionProps {
  watchAddress?: string | null;
}

export function PortfolioDistribution({ watchAddress }: PortfolioDistributionProps) {
  const { portfolio: tokens, totalUSD, isLoading } = usePortfolioInfo({ watchAddress });

  if (isLoading || tokens.length === 0) {
    return null;
  }

  const items: DistributionItem[] = tokens.map((token) => {
    const chainConfig = getChainConfig(parseInt(token.originBlockchain));
    const chainName = chainConfig ? chainConfig.name : "Unknown";

    return {
      symbol: token.display.symbol.toUpperCase(),
      name: token.display.name,
      logo: token.display.logo,
      symbolIcon: <Symbol icon={token.display.symbolIcon} color={token.display.color} />,
      color: token.display.color,
      value: token.balance.totalPrice || 0,
      percentage: totalUSD > 0 ? ((token.balance.totalPrice || 0) / totalUSD) * 100 : 0,
      address: token.functionnal.address,
      originChain: chainName
    };
  });

  const sortedItems = [...items].sort((a, b) => b.value - a.value);

  return (
    <Card className={s.distribution}>
      <Heading
        icon="hugeicons:chart-rose"
        title="Portfolio Allocation"
        description="Token distribution and holdings breakdown"
      />

      <div className={s.content}>
        <div className={s.legend}>
          {sortedItems.map((item) => (
            <div key={item.address} className={s.legendItem}>
              <div className={s.legendHeader}>
                <div className={s.tokenLogo}>
                  {item.logo ? (
                    <Image
                      src={item.logo}
                      width={24}
                      height={24}
                      alt={item.symbol}
                      className={s.logo}
                    />
                  ) : (
                    item.symbolIcon
                  )}
                </div>
                <div className={s.tokenMeta}>
                  <div className={s.tokenSymbol}>{item.symbol}</div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <div className={s.tokenName}>{item.name}</div>
                    <Badge>{item.originChain}</Badge>
                  </div>
                </div>
              </div>
              <div className={s.legendValue}>
                <div className={s.percentage}>{formatTokenAmount(item.percentage)}%</div>
                <div className={s.value}>{formatCurrency(item.value)}</div>
              </div>

              <div className={s.barContainer}>
                <div
                  className={s.bar}
                  style={{
                    width: `${item.percentage}%`,
                    backgroundColor: item.color
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className={s.summary}>
          <div className={s.summaryItem}>
            <span className={s.label}>
              <Icon icon="hugeicons:target-02" />
              Top Holding
            </span>
            <span className={s.value}>
              {sortedItems[0]?.symbol} ({formatTokenAmount(sortedItems[0]?.percentage)}%)
            </span>
          </div>

          <div className={s.summaryItem}>
            <span className={s.label}>
              <Icon icon="hugeicons:wallet-02" />
              Unique Tokens
            </span>
            <span className={s.value}>{tokens.length}</span>
          </div>

          <div className={s.summaryItem}>
            <span className={s.label}>
              <Icon icon="hugeicons:3d-scale" />
              Concentration
            </span>
            <span className={s.value}>
              {formatTokenAmount((sortedItems[0]?.percentage || 0) / 100 * 100)}%
            </span>
          </div>

          <div className={s.summaryItem}>
            <span className={s.label}>
              <Icon icon="hugeicons:layers-02" />
              Diversification
            </span>
            <span className={s.value}>
              {tokens.length < 5 ? "Low" : tokens.length < 10 ? "Medium" : "High"}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
