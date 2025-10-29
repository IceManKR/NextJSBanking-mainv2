// components/RightSidebar.tsx
import React from "react";
import Link from "next/link";
import Image from "next/image";
import BankCard from "./BankCard";

type Bank = {
  $id?: string;
  currentBalance?: number;
  [k: string]: any;
};

type Transaction = {
  id?: string;
  amount?: number;
  description?: string;
  date?: string;
  [k: string]: any;
};

type UserType = {
  name?: string | null;
  email?: string | null;
  [k: string]: any;
};

interface RightSidebarProps {
  user?: UserType | null;
  transactions?: Transaction[];
  banks?: Bank[] | null;
}

export default function RightSidebar({
  user = null,
  transactions = [],
  banks = [],
}: RightSidebarProps) {
  // Safe display name and initial
  const displayName = user?.name ?? user?.email ?? "Guest";
  const initial = (displayName && displayName[0]) ? displayName[0].toUpperCase() : "G";

  // Safe total balance (example)
  const totalBalance = (banks || []).reduce((acc, b) => acc + (Number(b?.currentBalance) || 0), 0);

  // Safely pick first two banks if they exist
  const firstBank = banks && banks.length > 0 ? banks[0] : null;
  const secondBank = banks && banks.length > 1 ? banks[1] : null;

  return (
    <aside className="right-sidebar">
      <section className="flex flex-col pb-8">
        <div className="profile-banner" />
        <div className="profile flex items-center gap-4">
          <div className="profile-img rounded-full w-16 h-16 flex items-center justify-center bg-slate-100">
            <span className="text-2xl font-bold text-blue-500">{initial}</span>
          </div>

          <div className="profile-details">
            <h1 className="profile-name text-lg font-semibold">{displayName}</h1>
            <p className="profile-email text-sm text-gray-500">{user?.email ?? ""}</p>
          </div>
        </div>
      </section>

      <section className="banks mt-6">
        <div className="flex w-full justify-between items-center">
          <h2 className="header-2">My Banks</h2>
          <Link href="/" className="flex items-center gap-2">
            <Image src="/icons/plus.svg" width={20} height={20} alt="plus" />
            <h2 className="text-14 font-semibold text-gray-600">Add Banks</h2>
          </Link>
        </div>

        {firstBank ? (
          <div className="relative flex flex-1 flex-col items-center justify-center gap-5 mt-4">
            <div className="relative z-10 w-full max-w-sm">
              <BankCard
                key={firstBank.$id ?? "bank-0"}
                account={firstBank}
                userName={displayName}
                showBalance={false}
              />
            </div>

            {secondBank && (
              <div className="absolute right-0 top-8 z-0 w-[90%] max-w-sm">
                <BankCard
                  key={secondBank.$id ?? "bank-1"}
                  account={secondBank}
                  userName={displayName}
                  showBalance={false}
                />
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-500 mt-4">No banks connected yet</p>
        )}
      </section>

      <section className="mt-6">
        <h3 className="text-sm font-medium text-gray-600">Total Balance</h3>
        <p className="text-xl font-bold">${totalBalance.toFixed(2)}</p>
      </section>

      <section className="mt-6">
        <h4 className="text-sm font-medium text-gray-600">Recent Transactions</h4>
        {(!transactions || transactions.length === 0) ? (
          <p className="text-sm text-gray-500 mt-2">No recent transactions</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {transactions.slice(0, 5).map((t) => (
              <li key={t.id ?? Math.random()} className="flex justify-between text-sm">
                <span>{t.description ?? "—"}</span>
                <span className="font-medium">{t.amount ? `$${t.amount}` : "-"}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </aside>
  );
}
