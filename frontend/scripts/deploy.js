const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying WeatherSubscription contract to Polygon Amoy...");

  // Get the ContractFactory and Signers
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Check balance
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "MATIC");

  // Deploy the contract
  const WeatherSubscription = await ethers.getContractFactory("WeatherSubscription");
  const weatherSubscription = await WeatherSubscription.deploy();

  await weatherSubscription.waitForDeployment();
  const contractAddress = await weatherSubscription.getAddress();

  console.log("WeatherSubscription deployed to:", contractAddress);
  console.log("Transaction hash:", weatherSubscription.deploymentTransaction().hash);

  // Verify deployment
  console.log("\nVerifying deployment...");
  const owner = await weatherSubscription.owner();
  const monthlyPrice = await weatherSubscription.monthlySubscriptionPrice();
  
  console.log("Contract owner:", owner);
  console.log("Monthly subscription price:", ethers.formatEther(monthlyPrice), "MATIC");

  console.log("\n📝 Update your .env.local file with:");
  console.log(`NEXT_PUBLIC_CONTRACT_ADDRESS=${contractAddress}`);
  console.log("\n🎉 Deployment completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });