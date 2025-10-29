// lib/services/accounts.ts
import { mockAccounts } from "@/lib/mockData";

export async function getAccountsForUser(userId: string) {
  // Replace with Appwrite DB read later — for now return mock
  return mockAccounts.filter(a => a.ownerId === userId || userId === "demo-user");
}
