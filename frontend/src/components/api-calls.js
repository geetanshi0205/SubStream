// Production API calls for Thirdweb integration
// Replace the demo functions in WeatherSubscription.jsx with these

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "";
const CHAIN_ID = 80002;
const SECRET_KEY = process.env.NEXT_PUBLIC_THIRDWEB_SECRET_KEY;

// Check if user has access to weather API
export const checkAccess = async (address) => {
  try {
    const response = await fetch("https://api.thirdweb.com/v1/contracts/read", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-secret-key": SECRET_KEY,
      },
      body: JSON.stringify({
        contractAddress: CONTRACT_ADDRESS,
        method: "function checkAccess(address user) view returns (bool)",
        params: [address],
        chainId: CHAIN_ID,
      }),
    });

    const data = await response.json();
    return data.result;
  } catch (error) {
    console.error('Error checking access:', error);
    return false;
  }
};

// Make payment to renew subscription
export const renewSubscription = async (userAddress) => {
  try {
    const response = await fetch("https://api.thirdweb.com/v1/contracts/write", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-secret-key": SECRET_KEY,
      },
      body: JSON.stringify({
        calls: [
          {
            contractAddress: CONTRACT_ADDRESS,
            method: "function makePayment() payable",
            params: [],
            value: "10000000000000000", // 0.01 ETH in wei
          },
        ],
        chainId: CHAIN_ID,
        from: userAddress,
      }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error renewing subscription:', error);
    throw error;
  }
};

// Grant access to specific address (owner only)
export const grantAccess = async (user, fromAddress) => {
  try {
    const response = await fetch("https://api.thirdweb.com/v1/contracts/write", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-secret-key": SECRET_KEY,
      },
      body: JSON.stringify({
        calls: [
          {
            contractAddress: CONTRACT_ADDRESS,
            method: "function grantAccess(address user)",
            params: [user],
          },
        ],
        chainId: CHAIN_ID,
        from: fromAddress,
      }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error granting access:', error);
    throw error;
  }
};

// Revoke access from specific address (owner only)
export const revokeAccess = async (user, fromAddress) => {
  try {
    const response = await fetch("https://api.thirdweb.com/v1/contracts/write", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-secret-key": SECRET_KEY,
      },
      body: JSON.stringify({
        calls: [
          {
            contractAddress: CONTRACT_ADDRESS,
            method: "function revokeAccess(address user)",
            params: [user],
          },
        ],
        chainId: CHAIN_ID,
        from: fromAddress,
      }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error revoking access:', error);
    throw error;
  }
};

// Update access price (owner only)
export const updateAccessPrice = async (newPrice, fromAddress) => {
  try {
    const response = await fetch("https://api.thirdweb.com/v1/contracts/write", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-secret-key": SECRET_KEY,
      },
      body: JSON.stringify({
        calls: [
          {
            contractAddress: CONTRACT_ADDRESS,
            method: "function updateAccessPrice(uint256 newPrice)",
            params: [newPrice],
          },
        ],
        chainId: CHAIN_ID,
        from: fromAddress,
      }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating access price:', error);
    throw error;
  }
};

// Withdraw contract balance (owner only)
export const withdraw = async (fromAddress) => {
  try {
    const response = await fetch("https://api.thirdweb.com/v1/contracts/write", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-secret-key": SECRET_KEY,
      },
      body: JSON.stringify({
        calls: [
          {
            contractAddress: CONTRACT_ADDRESS,
            method: "function withdraw()",
            params: [],
          },
        ],
        chainId: CHAIN_ID,
        from: fromAddress,
      }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error withdrawing:', error);
    throw error;
  }
};

// Transfer ownership (owner only)
export const transferOwnership = async (newOwner, fromAddress) => {
  try {
    const response = await fetch("https://api.thirdweb.com/v1/contracts/write", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-secret-key": SECRET_KEY,
      },
      body: JSON.stringify({
        calls: [
          {
            contractAddress: CONTRACT_ADDRESS,
            method: "function transferOwnership(address newOwner)",
            params: [newOwner],
          },
        ],
        chainId: CHAIN_ID,
        from: fromAddress,
      }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error transferring ownership:', error);
    throw error;
  }
};