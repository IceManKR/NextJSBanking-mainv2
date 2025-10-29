"use client";
import { useState } from "react";
import { mockAccounts } from "@/lib/mockData";

export default function ConnectBank({ onConnect }: { onConnect?: (account: any) => void }) {
  const [loading, setLoading] = useState(false);

  async function handleConnect() {
    setLoading(true);
    setTimeout(() => {
      const newAccount = mockAccounts[Math.floor(Math.random() * mockAccounts.length)];
      setLoading(false);
      alert(`Connected to ${newAccount.accountName}`);
      onConnect?.(newAccount);
    }, 700);
  }

  return (
    <button
      onClick={handleConnect}
      disabled={loading}
      className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-500 transition-all"
    >
      {loading ? "Connecting..." : "Connect a Bank"}
    </button>
  );
}
