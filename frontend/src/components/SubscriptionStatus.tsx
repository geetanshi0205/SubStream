"use client";

import { useState, useEffect } from "react";
import { useActiveAccount } from "thirdweb/react";

interface SubscriptionData {
  has_access: boolean;
  wallet_address?: string;
  subscription_date?: string;
  tx_hash?: string;
  payment_amount?: string;
  message?: string;
}

export function SubscriptionStatus() {
  const account = useActiveAccount();
  const address = account?.address;
  const [subscriptionStatus, setSubscriptionStatus] =
    useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

  const checkSubscriptionStatus = async () => {
    if (!address) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/verify-access`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          wallet_address: address,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to verify subscription");
      }

      const data = await response.json();
      setSubscriptionStatus(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // All payment flows are handled entirely by the backend; frontend only verifies access

  useEffect(() => {
    if (address) {
      checkSubscriptionStatus();
    } else {
      setSubscriptionStatus(null);
    }
  }, [address]);

  if (!address) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">
          Please connect your wallet to check subscription status
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-800">Checking subscription status...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error: {error}</p>
        <button
          onClick={checkSubscriptionStatus}
          className="mt-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!subscriptionStatus) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-gray-800">Unable to verify subscription status</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {subscriptionStatus.has_access ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <h3 className="text-green-800 font-semibold">
              Subscription Active
            </h3>
          </div>
          <p className="text-green-700">You have access to the weather API</p>
          {subscriptionStatus.subscription_date && (
            <p className="text-green-600 text-sm mt-1">
              Subscribed:{" "}
              {new Date(
                subscriptionStatus.subscription_date
              ).toLocaleDateString()}
            </p>
          )}
          {subscriptionStatus.tx_hash && (
            <p className="text-green-600 text-sm">
              Transaction: {subscriptionStatus.tx_hash.slice(0, 10)}...
              {subscriptionStatus.tx_hash.slice(-8)}
            </p>
          )}
        </div>
      ) : (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <h3 className="text-red-800 font-semibold">
              No Active Subscription
            </h3>
          </div>
          <p className="text-red-700 mb-3">
            {subscriptionStatus.message ||
              "You need to purchase a subscription to access the weather API"}
          </p>
        </div>
      )}
    </div>
  );
}
