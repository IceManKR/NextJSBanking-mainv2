"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";

// HorizonBank_TransactionsPage.tsx
// Next.js App Router friendly client component (Tailwind CSS) for Transaction History
// Features:
// - Search, filters (date range, account, status), sorting
// - Pagination (client-side simulated) + page size
// - Transaction detail drawer/modal
// - CSV Export of current filtered view
// - Mock data / mock API function (replace with real API)

type Transaction = {
  id: string;
  date: string; // ISO
  description: string;
  account: string;
  category?: string;
  amount: number; // negative = debit
  status: "Completed" | "Pending" | "Failed";
  reference?: string;
};

export default function TransactionsPage() {
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [query, setQuery] = useState("");
  const [accountFilter, setAccountFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFrom, setDateFrom] = useState<string | null>(null);
  const [dateTo, setDateTo] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"date_desc" | "date_asc" | "amount_desc" | "amount_asc">("date_desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selected, setSelected] = useState<Transaction | null>(null);

  // mock accounts (in real app fetch from API/user profile)
  const accounts = useMemo(() => ["All", "Horizon Savings", "Business Current", "Salary Account"], []);

  // load mock data on mount
  useEffect(() => {
    setLoading(true);
    // simulate async fetch
    setTimeout(() => {
      const data = generateMockTransactions(120);
      setTransactions(data);
      setLoading(false);
    }, 300);
  }, []);

  // derived filtered list
  const filtered = useMemo(() => {
    let list = transactions.slice();

    if (accountFilter !== "All") {
      list = list.filter((t) => t.account === accountFilter);
    }
    if (statusFilter !== "All") {
      list = list.filter((t) => t.status === statusFilter);
    }
    if (dateFrom) {
      list = list.filter((t) => new Date(t.date) >= new Date(dateFrom));
    }
    if (dateTo) {
      // include whole day of dateTo
      const dt = new Date(dateTo);
      dt.setHours(23, 59, 59, 999);
      list = list.filter((t) => new Date(t.date) <= dt);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((t) => `${t.description} ${t.reference ?? ""} ${t.category ?? ""}`.toLowerCase().includes(q));
    }

    switch (sortBy) {
      case "date_asc":
        list.sort((a, b) => +new Date(a.date) - +new Date(b.date));
        break;
      case "date_desc":
        list.sort((a, b) => +new Date(b.date) - +new Date(a.date));
        break;
      case "amount_asc":
        list.sort((a, b) => a.amount - b.amount);
        break;
      case "amount_desc":
        list.sort((a, b) => b.amount - a.amount);
        break;
    }

    return list;
  }, [transactions, accountFilter, statusFilter, dateFrom, dateTo, query, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [totalPages]);

  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  function exportCSV() {
    const rows = [
      ["Date", "Description", "Account", "Category", "Amount", "Status", "Reference"],
      ...filtered.map((t) => [t.date, t.description, t.account, t.category ?? "", t.amount.toFixed(2), t.status, t.reference ?? ""]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transactions_export_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50 text-gray-800">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Transaction History</h1>
            <p className="text-sm text-gray-500">View and export your previous transactions.</p>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={exportCSV} className="px-3 py-2 bg-white border rounded-md">Export CSV</button>
            <div className="text-sm text-gray-500 text-right">{filtered.length} results</div>
          </div>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <FiltersPanel
            accounts={accounts}
            accountFilter={accountFilter}
            setAccountFilter={setAccountFilter}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            dateFrom={dateFrom}
            setDateFrom={setDateFrom}
            dateTo={dateTo}
            setDateTo={setDateTo}
            query={query}
            setQuery={setQuery}
            sortBy={sortBy}
            setSortBy={setSortBy}
          />

          <div className="lg:col-span-3">
            <div className="bg-white p-3 rounded-2xl shadow-sm">
              <TransactionsTable
                items={paged}
                loading={loading}
                onSelect={(t) => setSelected(t)}
              />

              <div className="flex items-center justify-between mt-4">
                <Pagination page={page} totalPages={totalPages} setPage={setPage} />
                <div className="flex items-center gap-3">
                  <label className="text-sm text-gray-500">Rows</label>
                  <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} className="border rounded px-2 py-1">
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </section>

        {selected && <TransactionModal transaction={selected} onClose={() => setSelected(null)} />}

      </div>
    </div>
  );
}

/* ---------------- Subcomponents ---------------- */

function FiltersPanel({
  accounts,
  accountFilter,
  setAccountFilter,
  statusFilter,
  setStatusFilter,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
  query,
  setQuery,
  sortBy,
  setSortBy,
}: any) {
  return (
    <aside className="space-y-4">
      <div className="bg-white p-4 rounded-2xl shadow-sm">
        <h3 className="text-sm font-medium mb-2">Search</h3>
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search description, ref or category" className="w-full border rounded px-3 py-2 text-sm" />
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm">
        <h3 className="text-sm font-medium mb-2">Filters</h3>
        <label className="text-xs text-gray-500">Account</label>
        <select value={accountFilter} onChange={(e) => setAccountFilter(e.target.value)} className="w-full border rounded px-2 py-1 mt-1 mb-2 text-sm">
          {accounts.map((a: string) => (<option key={a} value={a}>{a}</option>))}
        </select>

        <label className="text-xs text-gray-500">Status</label>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full border rounded px-2 py-1 mt-1 mb-2 text-sm">
          <option value="All">All</option>
          <option value="Completed">Completed</option>
          <option value="Pending">Pending</option>
          <option value="Failed">Failed</option>
        </select>

        <label className="text-xs text-gray-500">From</label>
        <input type="date" value={dateFrom ?? ""} onChange={(e) => setDateFrom(e.target.value || null)} className="w-full border rounded px-2 py-1 mt-1 mb-2 text-sm" />
        <label className="text-xs text-gray-500">To</label>
        <input type="date" value={dateTo ?? ""} onChange={(e) => setDateTo(e.target.value || null)} className="w-full border rounded px-2 py-1 mt-1 text-sm" />

        <label className="text-xs text-gray-500 mt-2">Sort</label>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="w-full border rounded px-2 py-1 mt-1 text-sm">
          <option value="date_desc">Newest first</option>
          <option value="date_asc">Oldest first</option>
          <option value="amount_desc">Highest amount</option>
          <option value="amount_asc">Lowest amount</option>
        </select>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm text-sm text-gray-600">
        <h4 className="font-medium mb-2">Tips</h4>
        <ul className="list-disc list-inside space-y-1">
          <li>Use date range to find old transactions quickly.</li>
          <li>Search works across description, reference, and category.</li>
          <li>Export to CSV for accounting or reconciliation.</li>
        </ul>
      </div>
    </aside>
  );
}

function TransactionsTable({ items, loading, onSelect }: any) {
  return (
    <div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm table-auto">
          <thead>
            <tr className="text-left text-xs text-gray-500 border-b">
              <th className="py-2">Date</th>
              <th className="py-2">Description</th>
              <th className="py-2">Account</th>
              <th className="py-2">Category</th>
              <th className="py-2 text-right">Amount</th>
              <th className="py-2">Status</th>
              <th className="py-2"> </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="py-6 text-center">Loading…</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={7} className="py-6 text-center">No transactions found.</td></tr>
            ) : (
              items.map((t: Transaction) => (
                <tr key={t.id} className="border-b last:border-b-0 hover:bg-gray-50">
                  <td className="py-3 text-xs text-gray-600">{formatDate(t.date)}</td>
                  <td className="py-3">{t.description}</td>
                  <td className="py-3 text-xs text-gray-500">{t.account}</td>
                  <td className="py-3 text-xs text-gray-500">{t.category ?? "—"}</td>
                  <td className={`py-3 text-right font-medium ${t.amount < 0 ? "text-red-500" : "text-green-600"}`}>{formatCurrency(t.amount)}</td>
                  <td className="py-3 text-xs"><span className={`px-2 py-1 rounded-full text-xs ${t.status === 'Completed' ? 'bg-green-100 text-green-800' : t.status==='Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{t.status}</span></td>
                  <td className="py-3 text-right"><button onClick={() => onSelect(t)} className="text-sm underline">Details</button></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Pagination({ page, totalPages, setPage }: any) {
  const smallRange = 3;
  const pages = [] as number[];
  const start = Math.max(1, page - smallRange);
  const end = Math.min(totalPages, page + smallRange);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className="flex items-center gap-2">
      <button onClick={() => setPage(1)} disabled={page === 1} className="px-2 py-1 border rounded disabled:opacity-50">First</button>
      <button onClick={() => setPage(Math.max(1, page - 1))} className="px-2 py-1 border rounded">Prev</button>
      {pages.map((p) => (
        <button key={p} onClick={() => setPage(p)} className={`px-3 py-1 border rounded ${p===page ? 'bg-sky-600 text-white' : ''}`}>{p}</button>
      ))}
      <button onClick={() => setPage(Math.min(totalPages, page + 1))} className="px-2 py-1 border rounded">Next</button>
      <button onClick={() => setPage(totalPages)} disabled={page === totalPages} className="px-2 py-1 border rounded disabled:opacity-50">Last</button>
    </div>
  );
}

function TransactionModal({ transaction, onClose }: any) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-end lg:items-center justify-center p-4 z-40">
      <div className="bg-white w-full lg:w-3/5 rounded-2xl shadow-xl p-6 relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-500">✕</button>
        <h2 className="text-lg font-semibold mb-2">Transaction Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-xs text-gray-500">Date</div>
            <div className="font-medium">{formatDate(transaction.date)}</div>

            <div className="text-xs text-gray-500 mt-3">Description</div>
            <div>{transaction.description}</div>

            <div className="text-xs text-gray-500 mt-3">Reference</div>
            <div className="text-sm text-gray-700">{transaction.reference ?? '—'}</div>
          </div>

          <div>
            <div className="text-xs text-gray-500">Account</div>
            <div className="font-medium">{transaction.account}</div>

            <div className="text-xs text-gray-500 mt-3">Category</div>
            <div>{transaction.category ?? '—'}</div>

            <div className="text-xs text-gray-500 mt-3">Amount</div>
            <div className={`font-semibold ${transaction.amount < 0 ? 'text-red-500' : 'text-green-600'}`}>{formatCurrency(transaction.amount)}</div>

            <div className="text-xs text-gray-500 mt-3">Status</div>
            <div>{transaction.status}</div>
          </div>
        </div>

        <div className="mt-6 text-right">
          <button onClick={onClose} className="px-4 py-2 border rounded">Close</button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Helpers & Mock Data ---------------- */

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

function formatCurrency(amount: number) {
  const sign = amount < 0 ? "-" : "";
  return `${sign}₹ ${Math.abs(amount).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function generateMockTransactions(count = 50): Transaction[] {
  const accounts = ["Horizon Savings", "Business Current", "Salary Account"];
  const categories = ["Groceries", "Utilities", "Salary", "Transfer", "Dining", "Fuel", "EMI", "Subscription"];
  const statuses: Transaction['status'][] = ["Completed", "Pending", "Failed"];
  const out: Transaction[] = [];
  for (let i = 0; i < count; i++) {
    const isDebit = Math.random() > 0.45;
    const amount = parseFloat((Math.random() * (isDebit ? 5000 : 100000) + 20).toFixed(2)) * (isDebit ? -1 : 1);
    const daysAgo = Math.floor(Math.random() * 365);
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    const acc = accounts[Math.floor(Math.random() * accounts.length)];
    const cat = categories[Math.floor(Math.random() * categories.length)];
    const status = statuses[Math.random() < 0.9 ? 0 : Math.random() < 0.5 ? 1 : 2];

    out.push({
      id: `tx-${i}-${Date.now()}`,
      date: date.toISOString(),
      description: `${cat} - ${isDebit ? 'Payment' : 'Credit'} ${i}`,
      account: acc,
      category: cat,
      amount,
      status,
      reference: `REF${Math.floor(100000 + Math.random() * 899999)}`,
    });
  }
  // sort newest first
  out.sort((a,b)=> +new Date(b.date) - +new Date(a.date));
  return out;
}
