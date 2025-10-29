// lib/appwriteClient.ts
import { Client, Account, Databases } from "appwrite";

const client = new Client()
  .setEndpoint("https://cloud.appwrite.io/v1") // ✅ your Appwrite endpoint
  .setProject("YOUR_PROJECT_ID"); // ✅ replace with your real project ID

export const account = new Account(client);
export const databases = new Databases(client);

export default client;
