"use client";
import React, { useState, useMemo } from "react";

// HorizonBank_BankDashboard.jsx
// Single-file React component (Tailwind CSS) for a Bank Dashboard showing multiple accounts, loans, and key data.
// Default export = Dashboard component. Drop this into a React app using Tailwind.

export default function HorizonBankDashboard() {
  // Mock data - replace with real API calls
  const [accounts] = useState([
    { id: "acc-1", type: "Savings", name: "Horizon Savings", number: "XXXX-1234", balance: 123456.78, currency: "INR" },
    { id: "acc-2", type: "Current", name: "Business Current", number: "XXXX-5678", balance: 85200.5, currency: "INR" },
    { id: "acc-3", type: "Salary", name: "Salary Account", number: "XXXX-9999", balance: 40500.0, currency: "INR" },
  ]);

  const [loans] = useState([
    { id: "loan-1", type: "Home Loan", outstanding: 1450000.0, emi: 45000, tenure_left_months: 120 },
    { id: "loan-2", type: "Auto Loan", outstanding: 350000.0, emi: 8500, tenure_left_months: 36 },
  ]);

  const [transactions] = useState([
    { id: 1, date: "2025-10-28", desc: "UPI — Rahul Sharma", amount: -500, account: "Horizon Savings", status: "Completed" },
    { id: 2, date: "2025-10-27", desc: "Salary Credit — ACME Corp", amount: 50000, account: "Salary Account", status: "Completed" },
    { id: 3, date: "2025-10-26", desc: "Electricity Bill — BESCOM", amount: -3500, account: "Business Current", status: "Pending" },
  ]);

  const totalBalance = useMemo(() => accounts.reduce((s, a) => s + a.balance, 0), [accounts]);
  const totalOutstanding = useMemo(() => loans.reduce((s, l) => s + l.outstanding, 0), [loans]);

  return (
    <div className="min-h-screen bg-gray-50 p-6 lg:p-12 text-gray-800">
      <Navbar />

      <main className="max-w-7xl mx-auto space-y-6">
        {/* Top summary */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <SummaryCard title="Total Balance" value={formatCurrency(totalBalance)} note="Across all accounts" />
          <SummaryCard title="Total Loans Outstanding" value={formatCurrency(totalOutstanding)} note="Combined outstanding amount" />
          <SummaryCard title="Upcoming EMIs" value={formatCurrency(loans.reduce((s, l) => s + l.emi, 0))} note="This month" />
        </section>

        {/* Accounts and Quick Actions */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Accounts</h2>
              <button className="text-sm px-3 py-1.5 bg-white border rounded-md shadow-sm">Manage accounts</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {accounts.map((acc) => (
                <AccountCard key={acc.id} account={acc} />
              ))}
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Recent Transactions</h3>
              <TransactionList items={transactions} />
            </div>
          </div>

          <aside className="space-y-6">
            <QuickActions />

            <div className="bg-white p-4 rounded-2xl shadow-sm">
              <h3 className="text-sm font-medium mb-2">Loans Summary</h3>
              <div className="space-y-3">
                {loans.map((loan) => (
                  <LoanCard key={loan.id} loan={loan} />
                ))}
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl shadow-sm">
              <h3 className="text-sm font-medium mb-2">Important Notices</h3>
              <ul className="text-sm space-y-2">
                <li>• Your FD matured on 2025-10-20 — check statements.</li>
                <li>• Update KYC to avoid transaction limits.</li>
              </ul>
            </div>
          </aside>
        </section>

        <section>
          <Footer />
        </section>
      </main>
    </div>
  );
}

/* --------------------- Subcomponents ---------------------- */

function Navbar() {
  return (
    <header className="max-w-7xl mx-auto mb-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white font-bold">HB</div>
        <div>
          <div className="text-lg font-semibold">Horizon Bank</div>
          <div className="text-xs text-gray-500">Personal Dashboard</div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-lg hover:bg-gray-100">
          <span className="sr-only">Notifications</span>
          🔔
          <span className="absolute -top-1 -right-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white text-xs">3</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-sm font-medium">Suhas Karjigi</div>
            <div className="text-xs text-gray-500">Member since 2024</div>
          </div>
          <img alt="avatar" src="https://api.dicebear.com/6.x/initials/svg?seed=SK" className="w-10 h-10 rounded-full bg-gray-200" />
        </div>
      </div>
    </header>
  );
}

function SummaryCard({ title, value, note }) {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm flex flex-col justify-between">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
      <div className="mt-3 text-xs text-gray-400">{note}</div>
    </div>
  );
}

function AccountCard({ account }) {
  return (
    <article className="bg-white p-4 rounded-2xl shadow-sm flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-gray-500">{account.type}</div>
          <div className="font-medium">{account.name}</div>
          <div className="text-xs text-gray-400 mt-1">{maskAccount(account.number)}</div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Balance</div>
          <div className="text-lg font-semibold mt-1">{formatCurrency(account.balance)}</div>
        </div>
      </div>

      <div className="flex gap-2">
        <button className="flex-1 px-3 py-2 border rounded-lg text-sm">View</button>
        <button className="flex-1 px-3 py-2 bg-sky-600 text-white rounded-lg text-sm">Transfer</button>
      </div>
    </article>
  );
}

function LoanCard({ loan }) {
  return (
    <div className="flex items-center justify-between p-3 border rounded-lg">
      <div>
        <div className="text-sm font-medium">{loan.type}</div>
        <div className="text-xs text-gray-500">Tenure left: {loan.tenure_left_months} months</div>
      </div>
      <div className="text-right">
        <div className="text-sm text-gray-500">Outstanding</div>
        <div className="font-semibold">{formatCurrency(loan.outstanding)}</div>
        <div className="text-xs text-gray-400">EMI: {formatCurrency(loan.emi)}</div>
      </div>
    </div>
  );
}

function QuickActions() {
  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm">
      <h3 className="text-sm font-medium mb-3">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        <ActionBtn label="Transfer" emoji="➡️" />
        <ActionBtn label="Pay Bill" emoji="💡" />
        <ActionBtn label="Add Beneficiary" emoji="➕" />
        <ActionBtn label="Statements" emoji="📄" />
      </div>
    </div>
  );
}

function ActionBtn({ label, emoji }) {
  return (
    <button className="flex items-center gap-3 px-3 py-2 bg-white border rounded-lg hover:shadow-sm text-sm">
      <div className="text-xl">{emoji}</div>
      <div className="text-left">
        <div className="font-medium">{label}</div>
      </div>
    </button>
  );
}

function TransactionList({ items = [] }) {
  return (
    <div className="bg-white p-3 rounded-2xl shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-gray-500 border-b">
              <th className="py-2">Date</th>
              <th className="py-2">Description</th>
              <th className="py-2">Account</th>
              <th className="py-2 text-right">Amount</th>
              <th className="py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map((t) => (
              <tr key={t.id} className="border-b last:border-b-0">
                <td className="py-3 text-xs text-gray-600">{t.date}</td>
                <td className="py-3">{t.desc}</td>
                <td className="py-3 text-xs text-gray-500">{t.account}</td>
                <td className={`py-3 text-right font-medium ${t.amount < 0 ? "text-red-500" : "text-green-600"}`}>{formatCurrency(t.amount)}</td>
                <td className="py-3 text-xs"><span className={`px-2 py-1 rounded-full text-xs ${t.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{t.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 text-right">
        <button className="text-sm px-3 py-1.5 bg-white border rounded-md">View All Transactions</button>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <div className="mt-6 text-center text-sm text-gray-500">
      © Horizon Bank 2025 • <button className="underline">Terms</button> • <button className="underline">Privacy</button> • <button className="underline">Help</button>
    </div>
  );
}

/* --------------------- Helpers ---------------------- */

function maskAccount(ac) {
  if (!ac) return ac;
  return ac.replace(/.(?=.{4})/g, "*");
}

function formatCurrency(amount) {
  if (amount == null) return "-";
  const sign = amount < 0 ? "-" : "";
  const value = Math.abs(amount).toFixed(2);
  // basic INR formatting
  return `${sign}₹ ${Number(value).toLocaleString("en-IN")}`;
}
