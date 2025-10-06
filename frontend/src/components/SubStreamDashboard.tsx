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
import { WeatherWidget } from "./WeatherWidget";

interface SubscriptionData {
  has_access: boolean;
  wallet_address?: string;
  subscription_date?: string;
  tx_hash?: string;
  payment_amount?: string;
  message?: string;
}

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

export function SubStreamDashboard() {
  const account = useActiveAccount();
  const activeWallet = useActiveWallet();
  const { disconnect } = useDisconnect();
  const switchChain = useSwitchActiveWalletChain();
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

  const address = account?.address;
  const isConnected = !!account;

  const handleDisconnect = async () => {
    if (activeWallet) {
      await disconnect(activeWallet);
      setSubscriptionStatus(null);
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

  useEffect(() => {
    if (address) {
      checkSubscriptionStatus();
    } else {
      setSubscriptionStatus(null);
    }
  }, [address]);

  // Landing page for non-connected users
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="container mx-auto px-4 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                SubStream
              </h1>
            </div>
            <p className="text-xl text-gray-700 mb-2 font-medium">
              Seamless subscription flows on-chain
            </p>
            <p className="text-sm text-gray-600">
              Powered by <span className="font-semibold text-blue-600">Kwala</span>
            </p>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-800">Instant Access</h3>
              <p className="text-gray-700">Connect your wallet and get immediate access to premium weather data and services.</p>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-800">Secure & Decentralized</h3>
              <p className="text-gray-700">Your subscription is managed on-chain with complete transparency and security.</p>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-800">Simple Setup</h3>
              <p className="text-gray-700">No complex forms or lengthy processes. Just connect and subscribe in seconds.</p>
            </div>
          </div>

          {/* Connect Section */}
          <div className="max-w-md mx-auto">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 shadow-xl">
              <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Get Started</h2>
              <p className="text-gray-700 text-center mb-6 font-medium">
                Connect your wallet to access premium weather data and subscription services
              </p>
              
              <ConnectButton
                client={client}
                wallets={wallets}
                chain={polygonAmoy}
                connectModal={{
                  size: "wide",
                  title: "Connect to SubStream",
                  showThirdwebBranding: false,
                }}
                connectButton={{
                  label: "Connect Wallet",
                  className: "w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 transform hover:scale-105",
                }}
                detailsButton={{
                  displayBalanceToken: {
                    [polygonAmoy.id]: "0x0000000000000000000000000000000000001010",
                  },
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard for connected users
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">S</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                SubStream
              </h1>
              <p className="text-sm text-gray-600 font-medium">Powered by Kwala</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="bg-white/70 backdrop-blur-sm rounded-lg px-4 py-2 border border-gray-200/50">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-bold text-black">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </span>
              </div>
              {activeWallet && (
                <div className="text-xs text-gray-600 font-medium">
                  {activeWallet.getChain()?.name || "Unknown Network"}
                </div>
              )}
            </div>
            
            <button
              onClick={handleDisconnect}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
            >
              Disconnect
            </button>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Subscription Status */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Subscription Status</h2>
            
            {loading && (
              <div className="flex items-center gap-3 text-blue-600">
                <div className="animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                <span>Checking subscription...</span>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-800 mb-2">Error: {error}</p>
                <button
                  onClick={checkSubscriptionStatus}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                >
                  Retry
                </button>
              </div>
            )}

            {subscriptionStatus && (
              <div>
                {subscriptionStatus.has_access ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <h3 className="text-green-800 font-semibold text-lg">Active Subscription</h3>
                    </div>
                    <p className="text-green-700 mb-3">
                      You have full access to all premium features and weather data services.
                    </p>
                    {subscriptionStatus.subscription_date && (
                      <p className="text-green-700 text-sm font-medium">
                        Active since: {new Date(subscriptionStatus.subscription_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                      <h3 className="text-amber-800 font-semibold text-lg">No Active Subscription</h3>
                    </div>
                    <p className="text-amber-700 mb-4">
                      {subscriptionStatus.message || "Subscribe to access premium weather data and services"}
                    </p>
                    <button
                      onClick={checkSubscriptionStatus}
                      disabled={loading}
                      className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                      {loading ? "Checking..." : "Check Status"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Account Info */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Account Information</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-medium">Wallet Address:</span>
                <span className="font-mono text-sm text-gray-800">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-medium">Network:</span>
                <span className="text-sm text-gray-800 font-medium">{activeWallet?.getChain()?.name || "Unknown"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-medium">Status:</span>
                <span className="text-green-600 font-semibold">Connected</span>
              </div>
            </div>
          </div>
        </div>

        {/* Weather Widget - Only show if user has subscription */}
        {subscriptionStatus?.has_access && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Premium Weather Data</h2>
            <WeatherWidget />
          </div>
        )}

        {/* Feature Demo - Show if no subscription */}
        {subscriptionStatus && !subscriptionStatus.has_access && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Premium Features Preview</h2>
            <div className="grid md:grid-cols-3 gap-4 opacity-60">
              <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg p-4">
                <h3 className="font-semibold mb-2 text-gray-800">Real-time Weather</h3>
                <p className="text-sm text-gray-700">Get live weather updates for any location worldwide</p>
              </div>
              <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-lg p-4">
                <h3 className="font-semibold mb-2 text-gray-800">Detailed Forecasts</h3>
                <p className="text-sm text-gray-700">Access 7-day forecasts with hourly breakdowns</p>
              </div>
              <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg p-4">
                <h3 className="font-semibold mb-2 text-gray-800">Weather Alerts</h3>
                <p className="text-sm text-gray-700">Receive notifications for severe weather conditions</p>
              </div>
            </div>
            <div className="text-center mt-6">
              <p className="text-gray-700 mb-4 font-medium">Subscribe to unlock these premium features</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}