import { getContract, prepareContractCall, readContract } from "thirdweb";
import { client, polygonAmoy } from "./thirdweb";

// Contract ABI for the PaymentContract
export const CONTRACT_ABI = [
  {
    "inputs": [],
    "name": "checkAccess",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
    "name": "checkAccess",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "makePayment",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAccessPrice",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTotalPayments",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getPaymentCount",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "", "type": "address"}],
    "name": "hasAccess",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "accessPrice",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// Get contract instance
export function getPaymentContract(contractAddress: string) {
  return getContract({
    client,
    chain: polygonAmoy,
    address: contractAddress,
    abi: CONTRACT_ABI,
  });
}

// Check if a user has access to the weather service
export async function checkUserAccess(contractAddress: string, userAddress: string): Promise<boolean> {
  try {
    const contract = getPaymentContract(contractAddress);
    const hasAccess = await readContract({
      contract,
      method: "hasAccess",
      params: [userAddress],
    });
    return hasAccess as boolean;
  } catch (error) {
    console.error("Error checking user access:", error);
    return false;
  }
}

// Get the current access price from the contract
export async function getAccessPrice(contractAddress: string): Promise<bigint> {
  try {
    const contract = getPaymentContract(contractAddress);
    const price = await readContract({
      contract,
      method: "getAccessPrice",
      params: [],
    });
    return price as bigint;
  } catch (error) {
    console.error("Error getting access price:", error);
    return BigInt(0);
  }
}

// Prepare the makePayment transaction
export function prepareMakePaymentTransaction(contractAddress: string, paymentAmount: bigint) {
  const contract = getPaymentContract(contractAddress);
  return prepareContractCall({
    contract,
    method: "makePayment",
    params: [],
    value: paymentAmount,
  });
}

// Get contract statistics
export async function getContractStats(contractAddress: string) {
  try {
    const contract = getPaymentContract(contractAddress);
    
    const [totalPayments, paymentCount] = await Promise.all([
      readContract({
        contract,
        method: "getTotalPayments",
        params: [],
      }),
      readContract({
        contract,
        method: "getPaymentCount",
        params: [],
      }),
    ]);
    
    return {
      totalPayments: totalPayments as bigint,
      paymentCount: paymentCount as bigint,
    };
  } catch (error) {
    console.error("Error getting contract stats:", error);
    return {
      totalPayments: BigInt(0),
      paymentCount: BigInt(0),
    };
  }
}