"use client";

import { Card } from "@/components/card";
import { Heading } from "@/components/heading";
import { Icon } from "@/components/icon";
import { usePortfolioInfo } from "@/hooks/usePortfolioInfo";
import { formatCurrency, formatTokenAmount } from "@/lib/utils/number";
import s from "./advanced-stats.module.scss";

interface AdvancedStatsProps {
  watchAddress?: string | null;
}

export function AdvancedStats({ watchAddress }: AdvancedStatsProps) {
  const { totalUSD, portfolio, isLoading } = usePortfolioInfo({ watchAddress });

  if (isLoading) return null;

  const calculateHerfindahlIndex = (): number => {
    if (portfolio.length === 0 || totalUSD === 0) return 0;
    let sum = 0;
    for (const token of portfolio) {
      const proportion = (token.balance.totalPrice || 0) / totalUSD;
      sum += proportion * proportion;
    }
    return Math.min(sum * 10000, 10000);
  };

  const diversificationScore = (): number => {
    if (portfolio.length === 0) return 0;
    const hhi = calculateHerfindahlIndex();
    return Math.max(0, Math.min(100, 100 - (hhi / 100)));
  };

  const calculateConcentration = (): number => {
    if (portfolio.length === 0) return 0;
    const topHolding = portfolio.reduce((max, token) => {
      const value = token.balance.totalPrice || 0;
      return value > (max.balance.totalPrice || 0) ? token : max;
    });
    return totalUSD > 0 ? ((topHolding.balance.totalPrice || 0) / totalUSD) * 100 : 0;
  };

  const averageTokenValue = (): number => {
    return portfolio.length > 0 ? totalUSD / portfolio.length : 0;
  };

  const herfindahlIndex = calculateHerfindahlIndex();
  const diversification = diversificationScore();
  const concentration = calculateConcentration();
  const avgValue = averageTokenValue();
  const topToken = portfolio.reduce((max, token) => {
    const value = token.balance.totalPrice || 0;
    return value > (max.balance.totalPrice || 0) ? token : max;
  }, portfolio[0]);

  const getRiskLevel = (hhi: number): string => {
    if (hhi > 5000) return "Very High";
    if (hhi > 3000) return "High";
    if (hhi > 2000) return "Medium";
    if (hhi > 1500) return "Low";
    return "Very Low";
  };

  const riskLevel = getRiskLevel(herfindahlIndex);

  return (
    <Card className={s.advancedStats}>
      <Heading
        icon="hugeicons:chart-breakout-circle"
        title="Advanced Analytics"
        description="Portfolio composition and risk analysis"
      />

      <div className={s.metricsGrid}>
        <div className={s.metricCard}>
          <div className={s.metricHeader}>
            <Icon icon="hugeicons:layers-02" className={s.metricIcon} />
            <span className={s.metricTitle}>Diversification Score</span>
          </div>
          <div className={s.metricValue}>{formatTokenAmount(diversification)}/100</div>
          <div className={s.metricBar}>
            <div
              className={s.metricBarFill}
              style={{ width: `${diversification}%` }}
            />
          </div>
          <div className={s.metricDescription}>
            {diversification > 70
              ? "Well diversified"
              : diversification > 40
                ? "Moderately diversified"
                : "Concentrated portfolio"}
          </div>
        </div>

        <div className={s.metricCard}>
          <div className={s.metricHeader}>
            <Icon icon="hugeicons:target-02" className={s.metricIcon} />
            <span className={s.metricTitle}>Top Holding %</span>
          </div>
          <div className={s.metricValue}>{formatTokenAmount(concentration)}%</div>
          <div className={s.metricBar}>
            <div
              className={s.metricBarFill}
              style={{ width: `${Math.min(concentration, 100)}%` }}
            />
          </div>
          <div className={s.metricDescription}>
            {topToken?.display.symbol.toUpperCase()} is your largest asset
          </div>
        </div>

        <div className={s.metricCard}>
          <div className={s.metricHeader}>
            <Icon icon="hugeicons:alert-02" className={s.metricIcon} />
            <span className={s.metricTitle}>Concentration Risk</span>
          </div>
          <div className={`${s.metricValue} ${s[`risk-${riskLevel.toLowerCase().replace(" ", "-")}`]}`}>
            {riskLevel}
          </div>
          <div className={s.metricBar}>
            <div
              className={`${s.metricBarFill} ${s[`risk-${riskLevel.toLowerCase().replace(" ", "-")}`]}`}
              style={{ width: `${Math.min(herfindahlIndex / 100, 100)}%` }}
            />
          </div>
          <div className={s.metricDescription}>
            Herfindahl Index: {formatTokenAmount(herfindahlIndex)}
          </div>
        </div>

        <div className={s.metricCard}>
          <div className={s.metricHeader}>
            <Icon icon="hugeicons:coins-01" className={s.metricIcon} />
            <span className={s.metricTitle}>Avg Holdings</span>
          </div>
          <div className={s.metricValue}>{formatCurrency(avgValue)}</div>
          <div className={s.metricBar}>
            <div
              className={s.metricBarFill}
              style={{ width: `${Math.min((avgValue / totalUSD) * 100 * portfolio.length, 100)}%` }}
            />
          </div>
          <div className={s.metricDescription}>
            Per token average value
          </div>
        </div>

        <div className={s.metricCard}>
          <div className={s.metricHeader}>
            <Icon icon="hugeicons:wallet-02" className={s.metricIcon} />
            <span className={s.metricTitle}>Total Tokens</span>
          </div>
          <div className={s.metricValue}>{portfolio.length}</div>
          <div className={s.metricBar}>
            <div
              className={s.metricBarFill}
              style={{ width: `${Math.min((portfolio.length / 50) * 100, 100)}%` }}
            />
          </div>
          <div className={s.metricDescription}>
            Unique assets in portfolio
          </div>
        </div>

        <div className={s.metricCard}>
          <div className={s.metricHeader}>
            <Icon icon="hugeicons:chart-line-data-01" className={s.metricIcon} />
            <span className={s.metricTitle}>Total Value</span>
          </div>
          <div className={s.metricValue}>{formatCurrency(totalUSD)}</div>
          <div className={s.metricBar}>
            <div className={s.metricBarFill} style={{ width: "100%" }} />
          </div>
          <div className={s.metricDescription}>
            Combined portfolio value
          </div>
        </div>
      </div>

      <div className={s.insights}>
        <div className={s.insightTitle}>Portfolio Insights</div>
        <div className={s.insightList}>
          {diversification > 70 && (
            <div className={s.insight}>
              <Icon icon="hugeicons:check-circle-02" className={s.insightIcon} />
              <span>Your portfolio is well-diversified across multiple assets</span>
            </div>
          )}
          {concentration > 50 && (
            <div className={s.insight}>
              <Icon icon="hugeicons:alert-02" className={s.insightIcon} />
              <span>
                Your largest holding ({topToken?.display.symbol.toUpperCase()}) represents
                more than 50% of your portfolio
              </span>
            </div>
          )}
          {portfolio.length < 5 && (
            <div className={s.insight}>
              <Icon icon="hugeicons:information-circle" className={s.insightIcon} />
              <span>Consider adding more tokens to diversify your portfolio</span>
            </div>
          )}
          {riskLevel.includes("High") && (
            <div className={s.insight}>
              <Icon icon="hugeicons:alert-circle" className={s.insightIcon} />
              <span>Your portfolio concentration is relatively high. Diversification is recommended.</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
