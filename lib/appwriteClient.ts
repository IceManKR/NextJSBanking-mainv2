// lib/appwriteClient.ts
// Client-side Appwrite initialization for browser usage (no Realtime)
import { Client, Account, Databases } from "appwrite";

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!) // e.g. https://cloud.appwrite.io/v1
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!); // project id

export const account = new Account(client);
export const databases = new Databases(client);

// Realtime is disabled in client init to avoid "Realtime is not a constructor" runtime errors.
// If you need Realtime later, we'll add it conditionally after verifying SDK version.
export default client;

