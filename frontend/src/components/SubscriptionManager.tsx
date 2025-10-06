"use client";

import { useState } from "react";
import { useAddress, useContract, useContractWrite } from "@thirdweb-dev/react";
import { WEATHER_SUBSCRIPTION_CONTRACT_ADDRESS } from "@/lib/thirdweb";
import { useSubscription } from "@/hooks/useSubscription";
import { ethers } from "ethers";

export function SubscriptionManager() {
  const address = useAddress();
  const { contract } = useContract(WEATHER_SUBSCRIPTION_CONTRACT_ADDRESS);
  const { 
    hasActiveSubscription, 
    subscriptionData, 
    remainingTimeFormatted, 
    loading: subscriptionLoading 
  } = useSubscription(address);

  const [subscribing, setSubscribing] = useState(false);
  const [reneweing, setRenewing] = useState(false);

  const { mutateAsync: subscribe } = useContractWrite(contract, "subscribe");
  const { mutateAsync: autoRenew } = useContractWrite(contract, "autoRenew");

  const monthlyPrice = "0.01"; // 0.01 MATIC

  const handleSubscribe = async () => {
    if (!contract || !address) return;
    
    setSubscribing(true);
    try {
      await subscribe({
        args: [],
        overrides: {
          value: ethers.parseEther(monthlyPrice),
        },
      });
      alert("Successfully subscribed! You now have access to weather data.");
    } catch (error) {
      console.error("Subscription failed:", error);
      alert("Subscription failed. Please try again.");
    } finally {
      setSubscribing(false);
    }
  };

  const handleAutoRenew = async () => {
    if (!contract || !address) return;
    
    setRenewing(true);
    try {
      await autoRenew({
        args: [],
        overrides: {
          value: ethers.parseEther(monthlyPrice),
        },
      });
      alert("Successfully renewed subscription!");
    } catch (error) {
      console.error("Renewal failed:", error);
      alert("Renewal failed. Please try again.");
    } finally {
      setRenewing(false);
    }
  };

  if (!address) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Subscription Management</h2>
        <p className="text-gray-600">Please connect your wallet to manage your subscription</p>
      </div>
    );
  }

  if (!WEATHER_SUBSCRIPTION_CONTRACT_ADDRESS) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Subscription Management</h2>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-medium">Configuration Error</p>
          <p className="text-red-700 text-sm mt-1">
            Smart contract address not configured. Please deploy the contract and update the environment variables.
          </p>
        </div>
      </div>
    );
  }

  if (subscriptionLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Subscription Management</h2>
        <p className="text-gray-600">Loading subscription status...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Subscription Management</h2>
      
      <div className="space-y-4">
        {hasActiveSubscription ? (
          <div className="space-y-3">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="font-medium text-green-800">Active Subscription</span>
              </div>
              <p className="text-green-700 text-sm">
                Time remaining: {remainingTimeFormatted}
              </p>
              {subscriptionData?.totalPaid && (
                <p className="text-green-700 text-sm">
                  Total paid: {ethers.formatEther(subscriptionData.totalPaid)} MATIC
                </p>
              )}
            </div>

            <button
              onClick={handleAutoRenew}
              disabled={reneweing}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white py-3 px-4 rounded-lg font-medium transition-colors"
            >
              {reneweing ? "Renewing..." : `Renew Subscription (${monthlyPrice} MATIC)`}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-800 mb-2">Weather API Subscription</h3>
              <ul className="text-sm text-gray-600 space-y-1 mb-3">
                <li>• Access to real-time weather data</li>
                <li>• Search weather for any city worldwide</li>
                <li>• 30-day subscription period</li>
                <li>• Automatic renewal available</li>
              </ul>
              <p className="font-semibold text-gray-800">
                Price: {monthlyPrice} MATIC/month
              </p>
            </div>

            <button
              onClick={handleSubscribe}
              disabled={subscribing}
              className="w-full bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white py-3 px-4 rounded-lg font-medium transition-colors"
            >
              {subscribing ? "Subscribing..." : `Subscribe Now (${monthlyPrice} MATIC)`}
            </button>
          </div>
        )}

        <div className="border-t pt-4">
          <h4 className="font-medium text-gray-800 mb-2">Network Information</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <p>• Network: Polygon Amoy Testnet</p>
            <p>• Contract: {WEATHER_SUBSCRIPTION_CONTRACT_ADDRESS.slice(0, 10)}...</p>
            <p>• Payment: MATIC tokens</p>
          </div>
        </div>
      </div>
    </div>
  );
}