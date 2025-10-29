"use client";

import { useEffect, useState } from "react";
import HeaderBox from "@/components/HeaderBox";
import RightSidebar from "@/components/RightSidebar";
import TotalBalanceBox from "@/components/TotalBalanceBox";
import { getLoggedInUser } from "@/lib/actions/user.actions";

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await getLoggedInUser();
        if (res?.ok) setUser(res.user);
      } catch (err) {
        console.error("Error fetching user:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <section className="home flex justify-center items-center min-h-screen">
        <p className="text-lg font-medium text-gray-500">Loading your dashboard...</p>
      </section>
    );
  }

  return (
    <section className="home flex flex-col lg:flex-row gap-6">
      <div className="home-content flex-1">
        <header className="home-header mb-6">
          <HeaderBox
            type="greeting"
            title="Welcome"
            user={user?.name || user?.email || "Guest"}
            subtext="Access and manage your account and transactions efficiently."
          />

          <TotalBalanceBox
            accounts={[]}
            totalBanks={user ? 1 : 0}
            totalCurrentBalance={user ? 1250.85 : 0}
          />
        </header>

        <h2 className="text-lg font-semibold text-gray-700 mt-6">
          RECENT TRANSACTIONS
        </h2>
        {/* Add transaction cards here later */}
      </div>

      <RightSidebar
        user={user}
        transactions={[]}
        banks={[
          { currentBalance: 123.5 },
          { currentBalance: 500.5 },
        ]}
      />
    </section>
  );
}
