'use client';

import { useState, useEffect } from 'react';
import { useActiveAccount, useActiveWallet } from 'thirdweb/react';
import { sendTransaction } from 'thirdweb';
import { checkUserAccess, getAccessPrice, prepareMakePaymentTransaction, getContractStats } from '@/lib/contract';
import WalletConnector from './WalletConnector';
import { SubscriptionStatus } from './SubscriptionStatus';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "";
const CHAIN_ID = 80002;
const WEATHER_API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY || "";
const SECRET_KEY = process.env.NEXT_PUBLIC_THIRDWEB_SECRET_KEY || "";

export default function WeatherSubscription() {
  const account = useActiveAccount();
  const wallet = useActiveWallet();
  
  const isConnected = !!account;
  const address = account?.address;
  const [hasAccess, setHasAccess] = useState(false);
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState('checking');
  const [city, setCity] = useState('London');
  const [contractStats, setContractStats] = useState({ totalPayments: BigInt(0), paymentCount: BigInt(0) });

  // Check access using smart contract
  const checkAccess = async (userAddress) => {
    setLoading(true);
    try {
      console.log('Checking access for address:', userAddress, 'on contract:', CONTRACT_ADDRESS);
      
      if (!CONTRACT_ADDRESS) {
        console.warn('Contract address not set');
        setSubscriptionStatus('error');
        return false;
      }
      
      const hasAccessResult = await checkUserAccess(CONTRACT_ADDRESS, userAddress);
      console.log('Access check result:', hasAccessResult);
      
      setHasAccess(hasAccessResult);
      setSubscriptionStatus(hasAccessResult ? 'active' : 'expired');
      return hasAccessResult;
    } catch (error) {
      console.error('Error checking access:', error);
      setSubscriptionStatus('error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Make payment to renew subscription using smart contract
  const renewSubscription = async () => {
    if (!isConnected || !address || !account) {
      alert('Please connect your wallet first');
      return;
    }

    if (!CONTRACT_ADDRESS) {
      alert('Contract address not configured. Please deploy the contract first.');
      return;
    }

    setLoading(true);
    try {
      console.log('Getting access price from contract...');
      
      // Get the current access price from the contract
      const accessPrice = await getAccessPrice(CONTRACT_ADDRESS);
      console.log('Access price from contract:', accessPrice.toString());
      
      if (accessPrice === BigInt(0)) {
        throw new Error('Failed to get access price from contract');
      }
      
      // Prepare the contract call transaction
      const transaction = prepareMakePaymentTransaction(CONTRACT_ADDRESS, accessPrice);
      console.log('Prepared makePayment transaction');
      
      // Send transaction to the contract
      const txResult = await sendTransaction({
        transaction,
        account,
      });
      
      console.log('Transaction successful:', txResult);
      alert('🎉 Subscription renewed successfully!\n\nTransaction Hash: ' + txResult.transactionHash);
      
      // Refresh access status from contract
      await checkAccess(address);
      
      // Refresh contract statistics
      await loadContractStats();
      
    } catch (error) {
      console.error('Transaction failed:', error);
      if (error.code === 4001 || error.message?.includes('User rejected') || error.message?.includes('user rejected')) {
        alert('❌ Transaction was cancelled by user');
      } else if (error.message?.includes('Insufficient payment')) {
        alert('❌ Insufficient payment for access. Please make sure you have enough POL tokens.');
      } else {
        alert('❌ Error processing payment: ' + (error.message || error.toString()));
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch weather data (only if user has access)
  const fetchWeatherData = async () => {
    if (!hasAccess) {
      alert('You need an active subscription to access weather data');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://api.weatherapi.com/v1/current.json?key=${WEATHER_API_KEY}&q=${city}&aqi=no`
      );
      
      if (!response.ok) {
        throw new Error('Weather API request failed');
      }
      
      const data = await response.json();
      setWeatherData(data);
    } catch (error) {
      console.error('Error fetching weather data:', error);
      alert('Error fetching weather data');
    } finally {
      setLoading(false);
    }
  };

  // Load contract statistics
  const loadContractStats = async () => {
    if (CONTRACT_ADDRESS) {
      try {
        const stats = await getContractStats(CONTRACT_ADDRESS);
        setContractStats(stats);
      } catch (error) {
        console.error('Error loading contract stats:', error);
      }
    }
  };

  // Check access when wallet connects
  useEffect(() => {
    if (isConnected && address) {
      checkAccess(address);
      loadContractStats();
    } else {
      setHasAccess(false);
      setSubscriptionStatus('not_connected');
    }
  }, [isConnected, address]);

  // Load contract stats on component mount
  useEffect(() => {
    loadContractStats();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Web3 Subscription Platform
        </h1>
        <p className="text-xl text-gray-700 mb-2">
          Automated Recurring Payments • Powered by Kwala
        </p>
        <p className="text-sm text-gray-600">
          🚀 Once you subscribe, Kwala automatically handles your renewal payments
        </p>
      </div>

      {/* Wallet Connection */}
      <div className="mb-6">
        <WalletConnector />
      </div>

      {/* X402 Payment Server Integration */}
      {isConnected && (
        <div className="mb-6">
          <SubscriptionStatus />
        </div>
      )}

      {!isConnected ? (
        // Show welcome message when wallet not connected
        <div className="text-center py-12">
          <div className="mb-6">
            <div className="w-24 h-24 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome to Web3 Subscriptions</h2>
            <p className="text-gray-600 max-w-md mx-auto">
              Experience the future of subscription payments! Connect your wallet to subscribe with crypto 
              and enjoy automated renewals powered by Kwala's smart infrastructure.
            </p>
          </div>
          
          <div className="max-w-sm mx-auto p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">🚀 Kwala Platform Features:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• 🔄 Automated renewal payments</li>
              <li>• 🔒 Blockchain-secured subscriptions</li>
              <li>• 💰 Ultra low cost: only 0.00001 POL</li>
              <li>• ⚡ Instant activation & management</li>
              <li>• 🌐 Access to premium API services</li>
            </ul>
          </div>
        </div>
      ) : (
        // Show subscription sections when wallet is connected
        <>
          {/* Subscription Status */}
          <div className="mb-6 p-4 bg-white border rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-3">Subscription Status</h2>
            <div className="flex items-center gap-3">
              <div className={`px-4 py-2 rounded-full text-sm font-medium ${
                subscriptionStatus === 'active' 
                  ? 'bg-green-100 text-green-800' 
                  : subscriptionStatus === 'expired'
                  ? 'bg-red-100 text-red-800'
                  : subscriptionStatus === 'checking'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {subscriptionStatus === 'active' && '✅ Active Subscription'}
                {subscriptionStatus === 'expired' && '❌ Subscription Expired'}
                {subscriptionStatus === 'checking' && '🔄 Checking...'}
                {subscriptionStatus === 'error' && '⚠️ Error Checking Status'}
                {subscriptionStatus === 'not_connected' && '⏳ Ready to Check'}
              </div>
              <div className="text-sm text-gray-500">
                Connected: {address.slice(0, 6)}...{address.slice(-4)}
              </div>
            </div>
          </div>

          {/* Subscription Renewal - Only show if not active */}
          {!hasAccess && (
            <div className="mb-8 p-4 bg-white border rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold mb-3">Subscribe to Kwala Platform</h2>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800">Premium API Subscription</p>
                  <p className="text-sm text-gray-600">Auto-renewal • Powered by Kwala • Instant access</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600">0.00001</p>
                  <p className="text-sm text-gray-500">POL</p>
                </div>
              </div>
            </div>
            
            <button
              onClick={renewSubscription}
              disabled={loading}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing Transaction...
                </div>
              ) : (
                '💳 Subscribe with 0.00001 POL (Auto-Renewal by Kwala)'
              )}
            </button>
            </div>
          )}
          
          {/* Subscription Active Success Message */}
          {hasAccess && (
            <div className="mb-8 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-xl">✨</span>
                </div>
                <div>
                  <p className="font-semibold text-green-800 mb-1">
                    🎉 Kwala Subscription Active!
                  </p>
                  <p className="text-green-700 text-sm">
                    Your subscription is now active with automated renewal! Kwala will handle future payments seamlessly. 
                    Enjoy unlimited API access!
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Weather API Demo - Only show when connected */}
      {isConnected && (
        <div className="mb-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Weather Data Access</h2>
            {hasAccess && (
              <span className="ml-auto px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                ✅ Active
              </span>
            )}
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-800 mb-3">
              🌍 Enter City Name:
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g., London, New York, Tokyo, Paris..."
              className="w-full px-4 py-3 text-gray-800 bg-white border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm text-lg placeholder-gray-500"
            />
          </div>

          <button
            onClick={fetchWeatherData}
            disabled={loading || !hasAccess}
            className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed mb-4 transition-all duration-200 shadow-lg text-lg"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-3">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Loading Weather Data...
              </div>
            ) : (
              '🌤️ Get Current Weather'
            )}
          </button>

          {!hasAccess && (
            <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                  <span className="text-amber-600 text-lg">⚠️</span>
                </div>
                <div>
                  <p className="font-medium text-amber-800">
                    Subscription Required
                  </p>
                  <p className="text-amber-700 text-sm">
                    You need an active subscription to access weather data. Subscribe above for just 0.00001 POL!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Weather Data Display */}
      {weatherData && (
        <div className="p-6 bg-gradient-to-br from-sky-50 to-blue-100 border-2 border-sky-200 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              🌡️ Current Weather
            </h3>
            <span className="px-3 py-1 bg-sky-100 text-sky-800 text-sm font-medium rounded-full">
              Live Data
            </span>
          </div>
          
          {/* Main Weather Info */}
          <div className="bg-white rounded-xl p-6 mb-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-2xl font-bold text-gray-800 mb-1">
                  {weatherData.location.name}, {weatherData.location.country}
                </h4>
                <p className="text-gray-600">{weatherData.current.condition.text}</p>
              </div>
              <div className="flex items-center gap-4">
                <img 
                  src={weatherData.current.condition.icon} 
                  alt={weatherData.current.condition.text}
                  className="w-20 h-20"
                />
                <div className="text-right">
                  <p className="text-4xl font-bold text-blue-600">{weatherData.current.temp_c}°</p>
                  <p className="text-lg text-gray-600">({weatherData.current.temp_f}°F)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Weather Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 text-center shadow-md">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-blue-600 text-xl">💧</span>
              </div>
              <p className="text-sm text-gray-600 mb-1">Humidity</p>
              <p className="text-xl font-bold text-gray-800">{weatherData.current.humidity}%</p>
            </div>
            
            <div className="bg-white rounded-lg p-4 text-center shadow-md">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-green-600 text-xl">🌬️</span>
              </div>
              <p className="text-sm text-gray-600 mb-1">Wind Speed</p>
              <p className="text-xl font-bold text-gray-800">{weatherData.current.wind_kph} km/h</p>
            </div>
            
            <div className="bg-white rounded-lg p-4 text-center shadow-md">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-orange-600 text-xl">🌡️</span>
              </div>
              <p className="text-sm text-gray-600 mb-1">Feels Like</p>
              <p className="text-xl font-bold text-gray-800">{weatherData.current.feelslike_c}°C</p>
            </div>
            
            <div className="bg-white rounded-lg p-4 text-center shadow-md">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-purple-600 text-xl">☀️</span>
              </div>
              <p className="text-sm text-gray-600 mb-1">UV Index</p>
              <p className="text-xl font-bold text-gray-800">{weatherData.current.uv}</p>
            </div>
          </div>
          
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Last updated: {new Date(weatherData.current.last_updated).toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* Demo Instructions - Only show when connected */}
      {isConnected && (
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">💡 How Kwala Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div className="p-3 bg-white rounded-md">
              <div className="font-medium text-blue-600 mb-1">1. 💳 Subscribe</div>
              <p className="text-gray-600">One-time setup with 0.00001 POL</p>
            </div>
            <div className="p-3 bg-white rounded-md">
              <div className="font-medium text-green-600 mb-1">2. 🌤️ Access</div>
              <p className="text-gray-600">Instant access to premium APIs</p>
            </div>
            <div className="p-3 bg-white rounded-md">
              <div className="font-medium text-purple-600 mb-1">3. 🔄 Auto-Renew</div>
              <p className="text-gray-600">Kwala handles future payments</p>
            </div>
            <div className="p-3 bg-white rounded-md">
              <div className="font-medium text-orange-600 mb-1">4. 🚀 Enjoy</div>
              <p className="text-gray-600">Seamless, worry-free service</p>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-700">
              <strong>Need test POL?</strong> Get free tokens from the <a href="https://faucet.polygon.technology/" target="_blank" rel="noopener noreferrer" className="underline font-medium">Polygon Amoy faucet</a>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}