// lib/mockData.ts
export type Account = {
  id: string;
  ownerId: string;
  accountName: string;
  accountNumberMasked: string;
  balance: number;
  currency: string;
  accountType: 'checking'|'savings'|'credit';
  createdAt: string;
};

export type Transaction = {
  id: string;
  accountId: string;
  ownerId: string;
  amount: number;
  description: string;
  category: string;
  date: string;
};

export const mockAccounts: Account[] = [
  {
    id: "acc-1",
    ownerId: "demo-user",
    accountName: "Demo Checking",
    accountNumberMasked: "**** 1234",
    balance: 4521.34,
    currency: "USD",
    accountType: "checking",
    createdAt: new Date().toISOString(),
  },
  {
    id: "acc-2",
    ownerId: "demo-user",
    accountName: "Demo Savings",
    accountNumberMasked: "**** 5678",
    balance: 12890.55,
    currency: "USD",
    accountType: "savings",
    createdAt: new Date().toISOString(),
  },
];

export const mockTransactions: Transaction[] = [
  { id: "t1", accountId: "acc-1", ownerId: "demo-user", amount: -5.75, description: "Coffee Shop", category: "Food", date: "2025-10-09" },
  { id: "t2", accountId: "acc-1", ownerId: "demo-user", amount: 2500.00, description: "Salary", category: "Income", date: "2025-10-08" },
  { id: "t3", accountId: "acc-2", ownerId: "demo-user", amount: -120.40, description: "Electricity", category: "Utilities", date: "2025-10-06" },
];
