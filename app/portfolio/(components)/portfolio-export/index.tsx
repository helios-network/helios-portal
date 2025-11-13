"use client";

import { Button } from "@/components/button";
import { Icon } from "@/components/icon";
import { usePortfolioInfo } from "@/hooks/usePortfolioInfo";
import { getChainConfig } from "@/config/chain-config";
import { useState } from "react";
import { toast } from "sonner";
import s from "./portfolio-export.module.scss";

interface PortfolioExportProps {
  watchAddress?: string | null;
}

export function PortfolioExport({ watchAddress }: PortfolioExportProps) {
  const { portfolio, totalUSD, isLoading } = usePortfolioInfo({ watchAddress });
  const [isExporting, setIsExporting] = useState(false);

  const exportToCSV = async () => {
    if (portfolio.length === 0) {
      toast.error("No tokens to export");
      return;
    }

    setIsExporting(true);

    const headers = [
      "Symbol",
      "Name",
      "Balance",
      "Price (USD)",
      "Total Value (USD)",
      "Percentage",
      "Origin Chain",
      "Token Address",
      "Export Date"
    ];

    const rows = portfolio.map((token) => {
      const percentage = totalUSD > 0 ? ((token.balance.totalPrice || 0) / totalUSD) * 100 : 0;
      const chainConfig = getChainConfig(parseInt(token.originBlockchain));

      return [
        token.display.symbol.toUpperCase(),
        token.display.name,
        token.balance.amount.toFixed(8),
        token.price.usd.toFixed(8),
        (token.balance.totalPrice || 0).toFixed(2),
        percentage.toFixed(2),
        chainConfig?.name || "Unknown",
        token.functionnal.address,
        new Date().toISOString()
      ];
    });

    const summaryRow = [
      "SUMMARY",
      "",
      "",
      "",
      totalUSD.toFixed(2),
      "100",
      "",
      "",
      ""
    ];

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${cell}"`).join(",")
      ),
      "",
      summaryRow.map((cell) => `"${cell}"`).join(",")
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", `portfolio-${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setIsExporting(false);
    toast.success("Portfolio exported successfully!");
  };

  const exportToJSON = async () => {
    if (portfolio.length === 0) {
      toast.error("No tokens to export");
      return;
    }

    setIsExporting(true);

    const data = {
      exportDate: new Date().toISOString(),
      totalValue: totalUSD,
      tokenCount: portfolio.length,
      tokens: portfolio.map((token) => {
        const percentage = totalUSD > 0 ? ((token.balance.totalPrice || 0) / totalUSD) * 100 : 0;
        const chainConfig = getChainConfig(parseInt(token.originBlockchain));

        return {
          symbol: token.display.symbol.toUpperCase(),
          name: token.display.name,
          balance: token.balance.amount,
          price: token.price.usd,
          totalValue: token.balance.totalPrice || 0,
          percentage,
          chain: chainConfig?.name || "Unknown",
          address: token.functionnal.address
        };
      })
    };

    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: "application/json;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", `portfolio-${new Date().toISOString().split("T")[0]}.json`);
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setIsExporting(false);
    toast.success("Portfolio exported successfully!");
  };

  if (isLoading || portfolio.length === 0) {
    return null;
  }

  return (
    <div className={s.exportContainer}>
      <div className={s.exportLabel}>
        <Icon icon="hugeicons:download-03" />
        <span>Export Portfolio</span>
      </div>
      <div className={s.exportButtons}>
        <Button
          variant="secondary"
          size="small"
          onClick={exportToCSV}
          disabled={isExporting}
          iconLeft="hugeicons:download-03"
        >
          CSV
        </Button>
        <Button
          variant="secondary"
          size="small"
          onClick={exportToJSON}
          disabled={isExporting}
          iconLeft="hugeicons:download-03"
        >
          JSON
        </Button>
      </div>
    </div>
  );
}
