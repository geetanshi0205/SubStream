import { createThirdwebClient, defineChain } from "thirdweb";

export const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || "demo_client_id",
});

export const polygonAmoy = defineChain({
  id: 80002,
  name: "Polygon Amoy",
  rpc: "https://rpc-amoy.polygon.technology",
  nativeCurrency: {
    name: "Polygon Ecosystem Token",
    symbol: "POL",
    decimals: 18,
  },
  blockExplorers: [
    {
      name: "PolygonScan",
      url: "https://amoy.polygonscan.com",
    },
  ],
  testnet: true,
});

// Contract address (deployed)
export const WEATHER_SUBSCRIPTION_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "";

// WeatherAPI.com configuration
export const WEATHER_API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY || "";
export const WEATHER_BASE_URL = "https://api.weatherapi.com/v1";