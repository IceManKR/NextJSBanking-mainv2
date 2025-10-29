// lib/actions/user.actions.ts
// Client-side auth helpers (safe to import from client components)
// Single import of `account` only — no duplicate definitions.

import { account } from "@/lib/appwriteClient";

/**
 * Helper: attempt available session creation method in a safe order.
 */
async function createSessionWithEmail(email: string, password: string) {
  // Try several method names across SDK versions.
  if (typeof (account as any).createEmailPasswordSession === "function") {
    return await (account as any).createEmailPasswordSession(email, password);
  }
  if (typeof (account as any).createEmailSession === "function") {
    return await (account as any).createEmailSession(email, password);
  }
  if (typeof (account as any).createSession === "function") {
    return await (account as any).createSession(email, password);
  }
  throw new Error("No session creation method found on Appwrite Account object");
}

/**
 * Sign in (email + password).
 */
export async function signIn({ email, password }: { email: string; password: string }) {
  try {
    console.log("[client.signIn] attempting session creation for:", email);
    const session = await createSessionWithEmail(email, password);
    console.log("[client.signIn] session created:", session);

    const me = await (account as any).get();
    console.log("[client.signIn] fetched user:", me);

    return { ok: true, session, user: me };
  } catch (err: any) {
    console.error("[client.signIn] error:", err);
    return { ok: false, error: err?.message || String(err) };
  }
}

/**
 * Sign up (create user) — uses id-first signature (safe) and falls back if necessary.
 */
export async function signUp(userData: {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  [k: string]: any;
}) {
  console.log("[client.signUp] attempt:", userData?.email);
  try {
    // generate a safe userId: starts with letter, contains only allowed chars, <=36 chars
    const randomPart = Math.random().toString(36).substring(2, 10);
    const userId = `u_${randomPart}`.slice(0, 36);

    let created: any = null;

    // Try ID-first signature (works for SDKs that require an explicit id)
    try {
      created = await (account as any).create(
        userId,
        userData.email,
        userData.password,
        `${userData.firstName ?? ""} ${userData.lastName ?? ""}`.trim() || undefined
      );
      console.log("[client.signUp] created (id-first):", created);
    } catch (idFirstErr) {
      console.warn("[client.signUp] id-first create failed, trying email-first fallback:", idFirstErr?.message || idFirstErr);
      // Fallback: some SDKs support (email, password, name) signature
      created = await (account as any).create(
        userData.email,
        userData.password,
        `${userData.firstName ?? ""} ${userData.lastName ?? ""}`.trim() || undefined
      );
      console.log("[client.signUp] created (email-first fallback):", created);
    }

    // Create a session for the new user
    try {
      await createSessionWithEmail(userData.email, userData.password);
      console.log("[client.signUp] session created after sign up");
    } catch (sessErr) {
      console.warn("[client.signUp] session creation after signUp failed (non-fatal):", sessErr?.message || sessErr);
    }

    // Fetch current user
    const me = await (account as any).get();
    console.log("[client.signUp] current user (me):", me);

    return { ok: true, user: me, rawCreated: created };
  } catch (err: any) {
    console.error("[client.signUp] error:", err);
    return { ok: false, error: err?.message || String(err) };
  }
}

/**
 * Get currently logged in user (client)
 */
export async function getLoggedInUser() {
  try {
    const me = await (account as any).get();
    return { ok: true, user: me };
  } catch (err: any) {
    console.warn("[getLoggedInUser] no session or error:", err?.message || String(err));
    return { ok: false, error: "No session" };
  }
}

/**
 * Logout (delete current session)
 */
export async function logoutAccount() {
  try {
    // Prefer deleteSession if available
    if (typeof (account as any).deleteSession === "function") {
      await (account as any).deleteSession("current");
      return { ok: true };
    }
    // fallback name variations
    if (typeof (account as any).logout === "function") {
      await (account as any).logout();
      return { ok: true };
    }
    console.warn("[logoutAccount] no session deletion method found on account object");
    return { ok: false, error: "No session deletion method available" };
  } catch (err: any) {
    console.error("[logoutAccount] error:", err);
    return { ok: false, error: err?.message || String(err) };
  }
}
