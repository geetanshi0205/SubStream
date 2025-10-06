"use client";

import { ConnectButton, useActiveAccount, useActiveWallet, useDisconnect } from "thirdweb/react";
import { createWallet } from "thirdweb/wallets";
import { client, polygonAmoy } from "@/lib/thirdweb";

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

export function WalletConnect() {
  const account = useActiveAccount();
  const activeWallet = useActiveWallet();
  const { disconnect } = useDisconnect();

  const handleDisconnect = async () => {
    if (activeWallet) {
      await disconnect(activeWallet);
    }
  };

  return (
    <div className="flex items-center gap-4">
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
          className: "!bg-blue-500 !text-white hover:!bg-blue-600 !px-6 !py-3 !rounded-lg !font-medium transition-colors",
        }}
        detailsButton={{
          displayBalanceToken: {
            [polygonAmoy.id]: "0x0000000000000000000000000000000000001010", // MATIC token
          },
        }}
      />
      {account && activeWallet && (
        <button
          onClick={handleDisconnect}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm transition-colors ml-2"
        >
          Disconnect
        </button>
      )}
    </div>
  );
}