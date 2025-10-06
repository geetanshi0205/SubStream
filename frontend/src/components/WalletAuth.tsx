"use client";

import { useState, useEffect } from "react";
import {
  ConnectButton,
  useActiveAccount,
  useActiveWallet,
  useDisconnect,
  useSwitchActiveWalletChain,
} from "thirdweb/react";
import { createWallet } from "thirdweb/wallets";
import { client, polygonAmoy } from "@/lib/thirdweb";

interface SubscriptionData {
  has_access: boolean;
  wallet_address?: string;
  subscription_date?: string;
  tx_hash?: string;
  payment_amount?: string;
  message?: string;
}

// Removed payment UI/types; backend-only access verification flow

const wallets = [
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"), 
  createWallet("me.rainbow"),
  createWallet("io.zerion.wallet"),
  createWallet("inApp", {
    auth: {
      options: ["email", "google", "apple", "facebook"],
    },
  }),
];

export function WalletAuth() {
  const account = useActiveAccount();
  const activeWallet = useActiveWallet();
  const { disconnect } = useDisconnect();
  const switchChain = useSwitchActiveWalletChain();
  const [subscriptionStatus, setSubscriptionStatus] =
    useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

  const address = account?.address;
  const isConnected = !!account;

  const handleDisconnect = async () => {
    if (activeWallet) {
      await disconnect(activeWallet);
    }
  };

  const handleSwitchToPolygonAmoy = async () => {
    if (activeWallet) {
      try {
        await switchChain(activeWallet, polygonAmoy);
      } catch (error) {
        console.error("Failed to switch chain:", error);
        setError("Failed to switch to Polygon Amoy network");
      }
    }
  };

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

  // Removed getPaymentInfo; no payment prompts in UI

  // Removed executePayment flow; access is solely verified by backend

  useEffect(() => {
    if (address) {
      checkSubscriptionStatus();
    } else {
      setSubscriptionStatus(null);
    }
  }, [address]);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold mb-2 text-gray-800">
          X402 Payment Authentication
        </h1>
        <p className="text-gray-600">
          Connect your wallet and verify subscription access
        </p>
      </div>

      {/* Wallet Connection */}
      <div className="mb-6 p-4 border rounded-lg">
        <h2 className="text-lg font-semibold mb-3">Wallet Connection</h2>
        {isConnected ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div className="flex flex-col">
                <span className="text-green-700 font-medium">
                  Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
                </span>
                {activeWallet && (
                  <span className="text-sm text-gray-600">
                    Chain: {activeWallet.getChain()?.name || "Unknown"}
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSwitchToPolygonAmoy}
                className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded text-sm transition-colors"
              >
                Switch to Polygon Amoy
              </button>
              <button
                onClick={handleDisconnect}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm transition-colors"
              >
                Disconnect
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <ConnectButton
              client={client}
              wallets={wallets}
              chain={polygonAmoy}
              connectModal={{
                size: "wide",
                title: "Connect Your Wallet",
                showThirdwebBranding: false,
              }}
              connectButton={{
                label: "Connect Wallet",
                className: "w-full bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors",
              }}
              detailsButton={{
                displayBalanceToken: {
                  [polygonAmoy.id]: "0x0000000000000000000000000000000000001010", // MATIC token
                },
              }}
            />
          </div>
        )}
      </div>

      {/* Subscription Status */}
      {isConnected && (
        <div className="mb-6">
          {loading && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-blue-800">Checking subscription status...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-800">Error: {error}</p>
              <button
                onClick={checkSubscriptionStatus}
                className="mt-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {subscriptionStatus && (
            <div className="space-y-4">
              {subscriptionStatus.has_access ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <h3 className="text-green-800 font-semibold">
                      Subscription Active
                    </h3>
                  </div>
                  <p className="text-green-700 mb-2">
                    You have access to the X402 protected APIs
                  </p>
                  {subscriptionStatus.subscription_date && (
                    <p className="text-green-600 text-sm">
                      Subscribed:{" "}
                      {new Date(
                        subscriptionStatus.subscription_date
                      ).toLocaleDateString()}
                    </p>
                  )}
                  {subscriptionStatus.tx_hash && (
                    <p className="text-green-600 text-sm">
                      TX: {subscriptionStatus.tx_hash.slice(0, 10)}...
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
                  <p className="text-red-700 mb-4">
                    {subscriptionStatus.message ||
                      "You need to purchase a subscription to access protected APIs"}
                  </p>

                  <button
                    onClick={checkSubscriptionStatus}
                    disabled={loading}
                    className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded font-medium transition-colors"
                  >
                    {loading ? "Checking..." : "Check Access"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* API Access Demo */}
      {isConnected && subscriptionStatus?.has_access && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="text-green-800 font-semibold mb-2">
            🎉 API Access Granted
          </h3>
          <p className="text-green-700 text-sm">
            Your wallet is authenticated and verified. You now have access to
            X402 protected services.
          </p>
        </div>
      )}
    </div>
  );
}
