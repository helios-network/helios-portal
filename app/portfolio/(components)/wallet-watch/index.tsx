"use client";

import { Card } from "@/components/card";
import { Heading } from "@/components/heading";
import { Input } from "@/components/input/input";
import { Button } from "@/components/button";
import { Icon } from "@/components/icon";
import { useState } from "react";
import s from "./wallet-watch.module.scss";

interface WalletWatchProps {
  onWatchAddress: (address: string | null) => void;
  currentAddress: string | null;
}

export function WalletWatch({ onWatchAddress, currentAddress }: WalletWatchProps) {
  const [inputValue, setInputValue] = useState(currentAddress || "");
  const [error, setError] = useState("");

  const validateAddress = (address: string): boolean => {
    if (!address) return false;
    // Basic Ethereum address validation
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return false;
    }
    return true;
  };

  const handleWatch = () => {
    if (!inputValue.trim()) {
      setError("Please enter a wallet address");
      return;
    }

    if (!validateAddress(inputValue)) {
      setError("Invalid wallet address format (expected 0x...)");
      return;
    }

    setError("");
    onWatchAddress(inputValue);
  };

  const handleClear = () => {
    setInputValue("");
    setError("");
    onWatchAddress(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (error) setError("");
  };

  return (
    <Card className={s.walletWatch}>
      <Heading
        icon="hugeicons:search-01"
        title="Watch Wallet"
        description="Enter a wallet address to view its portfolio"
      />
      
      <div className={s.content}>
        <div className={s.inputWrapper}>
          <Input
            icon="hugeicons:wallet-04"
            placeholder="0x..."
            value={inputValue}
            onChange={handleInputChange}
            error={error}
            className={s.input}
          />
          <div className={s.actions}>
            <Button
              onClick={handleWatch}
              variant="primary"
              size="medium"
              className={s.watchButton}
            >
              <Icon icon="hugeicons:eye" />
              Watch
            </Button>
            {currentAddress && (
              <Button
                onClick={handleClear}
                variant="secondary"
                size="medium"
                className={s.clearButton}
              >
                <Icon icon="hugeicons:delete-02" />
                Clear
              </Button>
            )}
          </div>
        </div>

        {currentAddress && (
          <div className={s.watchingInfo}>
            <Icon icon="hugeicons:information-circle" />
            <span>Currently watching: <code>{currentAddress}</code></span>
          </div>
        )}
      </div>
    </Card>
  );
}

