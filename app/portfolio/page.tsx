"use client";

import { Stats } from "./(components)/stats";
import { TokenList } from "./(components)/token-list";
import { WalletWatch } from "./(components)/wallet-watch";
import s from "./page.module.scss";
import { useState, useEffect } from "react";

export default function PortfolioPage() {
  const [watchAddress, setWatchAddress] = useState<string | null>(null);

  // Sync with URL parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const watch = params.get("watch");
    if (watch) {
      setWatchAddress(watch);
    }
  }, []);

  const handleWatchAddress = (address: string | null) => {
    setWatchAddress(address);
    
    // Update URL parameters
    const params = new URLSearchParams(window.location.search);
    if (address) {
      params.set("watch", address);
    } else {
      params.delete("watch");
    }
    
    const newUrl = address 
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname;
    
    window.history.replaceState({}, "", newUrl);
  };

  return (
    <div className={s.portfolio}>
      <WalletWatch 
        onWatchAddress={handleWatchAddress} 
        currentAddress={watchAddress}
      />
      <Stats watchAddress={watchAddress} />
      <TokenList watchAddress={watchAddress} />
    </div>
  );
}

