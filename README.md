# SubStream 🚀

Decentralized Subscription Automation for Web3

SubStream is a decentralized subscription management system built on blockchain, leveraging Kwala’s decentralized automation to make recurring payments fully autonomous, secure, and transparent. It removes the need for intermediaries or manual renewals, creating a seamless subscription experience for both users and service providers.

## 🔮 Vision

SubStream envisions a decentralized Web3 ecosystem where subscription payments are automated, trustless, and transparent. Users enjoy seamless recurring payments, while service providers receive secure, verifiable transactions — transforming how subscriptions work across platforms and blockchains.

## ⚡ How It Works

Subscription Setup: Users subscribe to a service by signing a smart contract specifying payment amount, frequency, and recipient.

Kwala Automation: Kwala monitors the blockchain and triggers recurring payments automatically based on the defined schedule.

Payment Execution: SubStream’s smart contracts execute token transfers securely and log the transactions immutably on-chain.

Transparent Recordkeeping: Every payment is permanently recorded, giving users and providers complete visibility.

## 🛠 Tech Stack

Frontend: React, MetaMask wallet integration

Automation: Kwala for event-driven subscription management

Blockchain: Ethereum-compatible smart contracts

Standards: ERC-20 tokens for payments

## ✨ Key Features

🔁 Automated recurring payments powered by decentralized triggers

💸 No intermediaries or manual renewals

🧾 Transparent, verifiable on-chain transaction logs

🧠 Flexible integration with any subscription-based dApp or service

🌍 Cross-Chain Capabilities

SubStream is designed to work across multiple blockchains, enabling users to pay and providers to receive tokens on their preferred chain — creating a truly interoperable subscription system.

## 📌 Kwala Workflow

You can view and interact with the deployed Kwala workflow for SubStream here: [Kwala Workflow – SubStream](https://kwala.network/yaml-editor?yaml=Name%3A+SubStream_final_d3fa_6a01%0ATrigger%3A%0A++TriggerSourceContract%3A+NA%0A++TriggerChainID%3A+NA%0A++TriggerEventName%3A+NA%0A++TriggerEventFilter%3A+NA%0A++TriggerSourceContractABI%3A+NA%0A++TriggerPrice%3A+NA%0A++RecurringSourceContract%3A+NA%0A++RecurringChainID%3A+NA%0A++RecurringEventName%3A+NA%0A++RecurringEventFilter%3A+NA%0A++RecurringSourceContractABI%3A+NA%0A++RecurringPrice%3A+NA%0A++RepeatEvery%3A+30d%0A++ExecuteAfter%3A+immediate%0A++ExpiresIn%3A+1884522120%0A++Meta%3A+NA%0A++ActionStatusNotificationPOSTURL%3A+https%3A%2F%2Fworkflow-notification-test.kalp.network%2Fpush_notification%0A++ActionStatusNotificationAPIKey%3A+NA%0AActions%3A%0A++-+Name%3A+payement%0A++++Type%3A+post%0A++++APIEndpoint%3A+https%3A%2F%2F0214195035fb.ngrok-free.app%2Fexecute-payment%0A++++APIPayload%3A%0A++++++wallet_address%3A+%270x64837E3827FCcF0aD406A6D6fC3dD3De0234D3fA%27%0A++++TargetContract%3A+NA%0A++++TargetFunction%3A+NA%0A++++TargetParams%3A+%0A++++ChainID%3A+NA%0A++++EncodedABI%3A+NA%0A++++Bytecode%3A+NA%0A++++Metadata%3A+NA%0A++++RetriesUntilSuccess%3A+5%0AExecution%3A%0A++Mode%3A+parallel%0A&name=SubStream_final_d3fa_6a01&status=WORKFLOW_DEPLOYED&workflowId=SubStream_final_d3fa_6a01&lastRun=Never&nextRun=Never&lastSaved=07%2F10%2F2025%2C+01%3A04%3A29)
