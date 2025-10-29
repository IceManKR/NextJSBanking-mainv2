// lib/actions/dwolla.actions.ts
// Minimal stubs for Dwolla actions used by your codebase.
// Replace with real logic or remove imports later.

export async function addFundingSource(...args: any[]) {
  console.warn("addFundingSource called — stubbed.");
  return { success: true };
}

export async function createDwollaCustomer(...args: any[]) {
  console.warn("createDwollaCustomer called — stubbed.");
  return { id: "stub-customer-id" };
}

export default {
  addFundingSource,
  createDwollaCustomer,
};
