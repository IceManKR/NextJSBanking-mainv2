// lib/plaid.ts
// Minimal stub for Plaid client so imports resolve while we replace Plaid flows
// Replace with actual logic later if you re-enable Plaid.

export const plaidClient: any = {
  // Example stub methods — if your code calls specific methods, add them here
  createLinkToken: async (...args: any[]) => {
    console.warn("plaidClient.createLinkToken called — running stub.");
    return { data: { link_token: "stub-link-token" } };
  },
  exchangePublicToken: async (...args: any[]) => {
    console.warn("plaidClient.exchangePublicToken called — running stub.");
    return { data: { access_token: "stub-access-token", item_id: "stub-item" } };
  },
  getAccounts: async (...args: any[]) => {
    console.warn("plaidClient.getAccounts called — running stub.");
    return { data: { accounts: [] } };
  },
};

export default plaidClient;
