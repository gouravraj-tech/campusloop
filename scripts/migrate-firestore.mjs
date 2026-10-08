import fs from "node:fs/promises";
import path from "node:path";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const storePath = path.join(process.cwd(), "data", "campusloop.json");
const applyChanges = process.argv.includes("--apply");

const rawStore = await fs.readFile(storePath, "utf8");
const store = JSON.parse(rawStore);
const counts = {
  users: store.users?.length ?? 0,
  listings: store.listings?.length ?? 0,
  savedListings: store.saved?.length ?? 0,
  conversations: store.conversations?.length ?? 0,
  messages: (store.conversations ?? []).reduce((total, conversation) => total + (conversation.messages?.length ?? 0), 0),
};

console.log(`${applyChanges ? "Applying" : "Dry run"}: ${JSON.stringify(counts)}`);
if (!applyChanges) {
  console.log("No data written. Add --apply to import these records into Firestore.");
  process.exit(0);
}

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

if (!projectId || !clientEmail || !privateKey) {
  throw new Error("Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY before migrating.");
}

const app = getApps()[0] ?? initializeApp({
  credential: cert({ projectId, clientEmail, privateKey }),
  projectId,
});
const db = getFirestore(app);
const writer = db.bulkWriter();

for (const user of store.users ?? []) {
  const profile = { ...user };
  delete profile.token;
  writer.set(db.collection("users").doc(user.uid), profile);
}

for (const listing of store.listings ?? []) {
  writer.set(db.collection("listings").doc(listing.id), listing);
}

for (const saved of store.saved ?? []) {
  const id = saved.id || `${saved.userId}_${saved.listingId}`;
  writer.set(db.collection("savedListings").doc(id), { ...saved, id });
}

for (const conversation of store.conversations ?? []) {
  const { messages = [], ...summary } = conversation;
  const conversationRef = db.collection("conversations").doc(conversation.id);
  writer.set(conversationRef, summary);
  for (const message of messages) {
    writer.set(conversationRef.collection("messages").doc(message.id), message);
  }
}

await writer.close();
console.log(`Imported ${Object.values(counts).reduce((total, count) => total + count, 0)} Firestore documents into project ${projectId}. User tokens were omitted.`);
