"use client";

import { useState, useEffect } from "react";
import { useContract, useContractRead } from "@thirdweb-dev/react";
import { WEATHER_SUBSCRIPTION_CONTRACT_ADDRESS } from "@/lib/thirdweb";

export function useSubscription(address: string | undefined) {
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { contract } = useContract(WEATHER_SUBSCRIPTION_CONTRACT_ADDRESS);

  const {
    data: hasActive,
    isLoading: checkingActive,
    error: activeError,
  } = useContractRead(
    contract,
    "hasActiveSubscription",
    [address],
    { 
      enabled: !!contract && !!address,
    }
  );

  const {
    data: subscription,
    isLoading: loadingSubscription,
    error: subscriptionError,
  } = useContractRead(
    contract,
    "getSubscription", 
    [address],
    {
      enabled: !!contract && !!address,
    }
  );

  const {
    data: remainingTime,
    isLoading: loadingTime,
  } = useContractRead(
    contract,
    "getRemainingTime",
    [address],
    {
      enabled: !!contract && !!address,
    }
  );

  useEffect(() => {
    if (!address) {
      setHasActiveSubscription(false);
      setSubscriptionData(null);
      setLoading(false);
      setError(null);
      return;
    }

    if (!WEATHER_SUBSCRIPTION_CONTRACT_ADDRESS) {
      setError("Contract address not configured");
      setLoading(false);
      return;
    }

    const isLoading = checkingActive || loadingSubscription || loadingTime;
    setLoading(isLoading);

    if (activeError || subscriptionError) {
      setError(activeError?.message || subscriptionError?.message || "Failed to check subscription");
      return;
    }

    if (!isLoading) {
      setHasActiveSubscription(!!hasActive);
      setSubscriptionData({
        ...subscription,
        remainingTime: remainingTime,
      });
      setError(null);
    }
  }, [
    address,
    hasActive,
    subscription,
    remainingTime,
    checkingActive,
    loadingSubscription,
    loadingTime,
    activeError,
    subscriptionError,
  ]);

  const formatRemainingTime = (seconds: number): string => {
    if (seconds <= 0) return "Expired";
    
    const days = Math.floor(seconds / (24 * 60 * 60));
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((seconds % (60 * 60)) / 60);

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return {
    hasActiveSubscription,
    subscriptionData,
    remainingTime: subscriptionData?.remainingTime || 0,
    remainingTimeFormatted: subscriptionData?.remainingTime 
      ? formatRemainingTime(Number(subscriptionData.remainingTime))
      : "N/A",
    loading,
    error,
    contract,
  };
}