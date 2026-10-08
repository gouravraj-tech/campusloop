import fs from "node:fs/promises";
import path from "node:path";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const storePath = path.join(process.cwd(), "data", "campusloop.json");
const applyChanges = process.argv.includes("--apply");
const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

if (!projectId || !clientEmail || !privateKey) {
  throw new Error("Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY before migrating.");
}

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

const app = getApps()[0] ?? initializeApp({
  credential: cert({ projectId, clientEmail, privateKey }),
  projectId,
});
const db = getFirestore(app);
const writes = [];

for (const user of store.users ?? []) {
  const { token: _token, ...profile } = user;
  writes.push(db.collection("users").doc(user.uid).set(profile));
}

for (const listing of store.listings ?? []) {
  writes.push(db.collection("listings").doc(listing.id).set(listing));
}

for (const saved of store.saved ?? []) {
  const id = saved.id || `${saved.userId}_${saved.listingId}`;
  writes.push(db.collection("savedListings").doc(id).set({ ...saved, id }));
}

for (const conversation of store.conversations ?? []) {
  const { messages = [], ...summary } = conversation;
  const conversationRef = db.collection("conversations").doc(conversation.id);
  writes.push(conversationRef.set(summary));
  for (const message of messages) {
    writes.push(conversationRef.collection("messages").doc(message.id).set(message));
  }
}

for (let offset = 0; offset < writes.length; offset += 100) {
  await Promise.all(writes.slice(offset, offset + 100));
}

console.log(`Imported ${writes.length} Firestore documents into project ${projectId}. User tokens were omitted.`);
