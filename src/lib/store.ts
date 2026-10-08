import fs from "node:fs/promises";
import path from "node:path";
import type { DocumentData, DocumentReference } from "firebase-admin/firestore";
import { getAdminFirestore } from "@/lib/firebase-admin";

export type Category = "Books" | "Electronics" | "Lab Supplies" | "Furniture" | "Stationery" | "Other";
export type Condition = "New" | "Like New" | "Good" | "Fair";

export type User = {
  uid: string;
  name: string;
  email: string;
  college: string;
  token?: string;
  createdAt: string;
};

export type Listing = {
  id: string;
  title: string;
  description: string;
  price: number;
  category: Category;
  condition: Condition;
  pickupLocation: string;
  imageUrl: string;
  status: "available" | "sold";
  sellerId: string;
  sellerName: string;
  college: string;
  createdAt: string;
  updatedAt: string;
  book?: {
    isbn?: string;
    title?: string;
    authors?: string[];
    publisher?: string;
    coverUrl?: string;
  };
  searchText: string;
};

export type SavedListing = {
  id: string;
  userId: string;
  listingId: string;
  savedAt: string;
};

export type Message = {
  id: string;
  senderId: string;
  text: string;
  createdAt: string;
};

export type Conversation = {
  id: string;
  listingId: string;
  listingTitle: string;
  listingImageUrl: string;
  sellerId: string;
  sellerName: string;
  buyerId: string;
  buyerName: string;
  lastMessage: string;
  lastMessageAt: string;
  createdAt: string;
  unreadFor: string | null;
  messages: Message[];
};

export type AppState = {
  users: User[];
  listings: Listing[];
  saved: SavedListing[];
  conversations: Conversation[];
};

const STORE_PATH = path.join(process.cwd(), "data", "campusloop.json");
const COLLECTIONS = {
  users: "users",
  listings: "listings",
  saved: "savedListings",
  conversations: "conversations",
} as const;

function firestore() {
  return getAdminFirestore();
}

const seedUser: User = {
  uid: "demo-user",
  name: "Aarav Sharma",
  email: "aarav@student.campus.edu",
  college: "School of Engineering",
  token: "demo-token",
  createdAt: new Date().toISOString(),
};

const seedListing: Listing = {
  id: "listing-demo-1",
  title: "Data Structures Handbook",
  description: "Used textbook for CS101, covers arrays, stacks, queues and trees. Good condition.",
  price: 399,
  category: "Books",
  condition: "Good",
  pickupLocation: "Main Library",
  imageUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=900&q=80",
  status: "available",
  sellerId: seedUser.uid,
  sellerName: seedUser.name,
  college: seedUser.college,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  book: {
    isbn: "9780132350884",
    title: "Data Structures Handbook",
    authors: ["Aarav Sharma"],
    publisher: "Campus Press",
    coverUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80",
  },
  searchText: "data structures handbook used textbook cs101 arrays stacks queues trees",
};

const defaultState: AppState = {
  users: [seedUser],
  listings: [seedListing],
  saved: [],
  conversations: [],
};

async function ensureStore() {
  await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });

  try {
    const file = await fs.readFile(STORE_PATH, "utf-8");
    return JSON.parse(file) as AppState;
  } catch {
    await fs.writeFile(STORE_PATH, JSON.stringify(defaultState, null, 2), "utf-8");
    return defaultState;
  }
}

export async function getStore() {
  if (firestore()) {
    throw new Error("The JSON store is unavailable while Firestore persistence is enabled.");
  }
  return ensureStore();
}

export async function saveStore(nextState: AppState) {
  if (firestore()) {
    throw new Error("The JSON store is unavailable while Firestore persistence is enabled.");
  }
  await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
  await fs.writeFile(STORE_PATH, JSON.stringify(nextState, null, 2), "utf-8");
  return nextState;
}

export async function getUserByToken(token: string) {
  if (!firestore()) {
    const store = await getStore();
    return store.users.find((user) => user.token === token) ?? null;
  }
  return null;
}

export async function getUserByUid(uid: string) {
  const db = firestore();
  if (db) {
    const snapshot = await db.collection(COLLECTIONS.users).doc(uid).get();
    return snapshot.exists ? (snapshot.data() as User) : null;
  }
  const store = await getStore();
  return store.users.find((user) => user.uid === uid) ?? null;
}

export async function getUserByEmail(email: string) {
  const db = firestore();
  if (db) {
    const snapshot = await db.collection(COLLECTIONS.users)
      .where("email", "==", email.trim().toLowerCase())
      .limit(1)
      .get();
    return snapshot.empty ? null : (snapshot.docs[0].data() as User);
  }
  const store = await getStore();
  return store.users.find((user) => user.email.toLowerCase() === email.toLowerCase()) ?? null;
}

export async function createUser(payload: Omit<User, "uid" | "token" | "createdAt"> & { uid?: string; token?: string }) {
  const db = firestore();
  const uid = payload.uid ?? crypto.randomUUID();
  const user: User = {
    uid,
    name: payload.name,
    email: payload.email.trim().toLowerCase(),
    college: payload.college,
    ...(payload.token ? { token: payload.token } : {}),
    createdAt: new Date().toISOString(),
  };
  if (db) {
    const userRef = db.collection(COLLECTIONS.users).doc(uid);
    return db.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(userRef);
      if (snapshot.exists) {
        return snapshot.data() as User;
      }
      transaction.create(userRef, user);
      return user;
    });
  }

  const store = await getStore();
  const existing = store.users.find((user) => user.email.toLowerCase() === payload.email.toLowerCase());
  if (existing) {
    return existing;
  }

  store.users.push(user);
  await saveStore(store);
  return user;
}

export async function getListingById(listingId: string) {
  const db = firestore();
  if (db) {
    const snapshot = await db.collection(COLLECTIONS.listings).doc(listingId).get();
    return snapshot.exists ? (snapshot.data() as Listing) : null;
  }
  const store = await getStore();
  return store.listings.find((listing) => listing.id === listingId) ?? null;
}

export async function listListings() {
  const db = firestore();
  if (db) {
    const snapshot = await db.collection(COLLECTIONS.listings).get();
    return snapshot.docs
      .map((doc) => doc.data() as Listing)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  const store = await getStore();
  return [...store.listings].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function upsertListing(listing: Listing) {
  const db = firestore();
  if (db) {
    await db.collection(COLLECTIONS.listings).doc(listing.id).set(listing);
    return listing;
  }
  const store = await getStore();
  const index = store.listings.findIndex((item) => item.id === listing.id);
  if (index >= 0) {
    store.listings[index] = listing;
  } else {
    store.listings.push(listing);
  }
  await saveStore(store);
  return listing;
}

export async function deleteListing(listingId: string) {
  const db = firestore();
  if (db) {
    const [saved, conversations] = await Promise.all([
      db.collection(COLLECTIONS.saved).where("listingId", "==", listingId).get(),
      db.collection(COLLECTIONS.conversations).where("listingId", "==", listingId).get(),
    ]);
    const refs = [
      db.collection(COLLECTIONS.listings).doc(listingId),
      ...saved.docs.map((doc) => doc.ref),
      ...conversations.docs.map((doc) => doc.ref),
    ];
    for (const conversation of conversations.docs) {
      const messages = await conversation.ref.collection("messages").get();
      refs.push(...messages.docs.map((doc) => doc.ref));
    }
    for (let offset = 0; offset < refs.length; offset += 450) {
      const batch = db.batch();
      refs.slice(offset, offset + 450).forEach((ref) => batch.delete(ref));
      await batch.commit();
    }
    return;
  }
  const store = await getStore();
  store.listings = store.listings.filter((listing) => listing.id !== listingId);
  store.saved = store.saved.filter((entry) => entry.listingId !== listingId);
  store.conversations = store.conversations.filter((entry) => entry.listingId !== listingId);
  await saveStore(store);
}

export async function listSaved(userId: string) {
  const db = firestore();
  if (db) {
    const savedSnapshot = await db.collection(COLLECTIONS.saved).where("userId", "==", userId).get();
    const entries = savedSnapshot.docs.map((doc) => doc.data() as SavedListing);
    const listings = await Promise.all(entries.map((entry) => getListingById(entry.listingId)));
    return listings
      .flatMap((listing, index) => listing ? [{ ...listing, savedAt: entries[index].savedAt }] : [])
      .sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
  }
  const store = await getStore();
  return store.saved
    .filter((entry) => entry.userId === userId)
    .map((entry) => {
      const listing = store.listings.find((listing) => listing.id === entry.listingId);
      return listing ? { ...listing, savedAt: entry.savedAt } : null;
    })
    .filter(Boolean) as Array<Listing & { savedAt: string }>;
}

export async function saveListingForUser(userId: string, listingId: string) {
  const db = firestore();
  if (db) {
    const savedRef = db.collection(COLLECTIONS.saved).doc(`${userId}_${listingId}`);
    await db.runTransaction(async (transaction) => {
      const existing = await transaction.get(savedRef);
      if (!existing.exists) {
        transaction.create(savedRef, {
          id: savedRef.id,
          userId,
          listingId,
          savedAt: new Date().toISOString(),
        });
      }
    });
    return;
  }
  const store = await getStore();
  const exists = store.saved.some((entry) => entry.userId === userId && entry.listingId === listingId);
  if (exists) return;
  store.saved.push({
    id: crypto.randomUUID(),
    userId,
    listingId,
    savedAt: new Date().toISOString(),
  });
  await saveStore(store);
}

export async function unsaveListingForUser(userId: string, listingId: string) {
  const db = firestore();
  if (db) {
    await db.collection(COLLECTIONS.saved).doc(`${userId}_${listingId}`).delete();
    return;
  }
  const store = await getStore();
  store.saved = store.saved.filter((entry) => !(entry.userId === userId && entry.listingId === listingId));
  await saveStore(store);
}

export async function listConversations(userId: string) {
  const db = firestore();
  if (db) {
    const [buyerConversations, sellerConversations] = await Promise.all([
      db.collection(COLLECTIONS.conversations).where("buyerId", "==", userId).get(),
      db.collection(COLLECTIONS.conversations).where("sellerId", "==", userId).get(),
    ]);
    const docs = new Map([
      ...buyerConversations.docs.map((doc) => [doc.id, doc] as const),
      ...sellerConversations.docs.map((doc) => [doc.id, doc] as const),
    ]);
    const conversations = await Promise.all([...docs.values()].map((doc) => getConversation(doc.ref)));
    return conversations
      .filter((conversation): conversation is Conversation => conversation !== null)
      .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
  }
  const store = await getStore();
  return [...store.conversations]
    .filter((entry) => entry.buyerId === userId || entry.sellerId === userId)
    .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
}

export async function getConversationById(conversationId: string) {
  const db = firestore();
  if (db) {
    return getConversation(db.collection(COLLECTIONS.conversations).doc(conversationId));
  }
  const store = await getStore();
  return store.conversations.find((entry) => entry.id === conversationId) ?? null;
}

export async function createOrGetConversation(payload: Omit<Conversation, "messages"> & { messages?: Message[] }) {
  const db = firestore();
  if (db) {
    const conversationRef = db.collection(COLLECTIONS.conversations).doc(payload.id);
    const conversation = {
      ...payload,
      messages: payload.messages ?? [],
    };
    await db.runTransaction(async (transaction) => {
      const existing = await transaction.get(conversationRef);
      if (!existing.exists) {
        const { messages, ...summary } = conversation;
        transaction.create(conversationRef, summary);
      }
    });
    if (conversation.messages.length > 0) {
      const batch = db.batch();
      conversation.messages.forEach((message) => {
        batch.set(conversationRef.collection("messages").doc(message.id), message);
      });
      await batch.commit();
    }
    return (await getConversation(conversationRef)) ?? conversation;
  }
  const store = await getStore();
  const existing = store.conversations.find((entry) => entry.id === payload.id);
  if (existing) {
    if (payload.messages?.length) {
      existing.messages = payload.messages;
      existing.lastMessage = payload.lastMessage;
      existing.lastMessageAt = payload.lastMessageAt;
    }
    await saveStore(store);
    return existing;
  }

  const conversation: Conversation = {
    ...payload,
    messages: payload.messages ?? [],
  };
  store.conversations.push(conversation);
  await saveStore(store);
  return conversation;
}

export async function appendMessage(conversationId: string, message: Message) {
  const db = firestore();
  if (db) {
    const conversationRef = db.collection(COLLECTIONS.conversations).doc(conversationId);
    const messageRef = conversationRef.collection("messages").doc(message.id);
    const conversationExists = await db.runTransaction(async (transaction) => {
      const conversation = await transaction.get(conversationRef);
      if (!conversation.exists) {
        return false;
      }
      const data = conversation.data() as Omit<Conversation, "messages">;
      transaction.create(messageRef, message);
      transaction.update(conversationRef, {
        lastMessage: message.text,
        lastMessageAt: message.createdAt,
        unreadFor: data.buyerId === message.senderId ? data.sellerId : data.buyerId,
      });
      return true;
    });
    return conversationExists ? getConversation(conversationRef) : null;
  }
  const store = await getStore();
  const conversation = store.conversations.find((entry) => entry.id === conversationId);
  if (!conversation) return null;

  conversation.messages.push(message);
  conversation.lastMessage = message.text;
  conversation.lastMessageAt = message.createdAt;
  conversation.unreadFor = conversation.buyerId === message.senderId ? conversation.sellerId : conversation.buyerId;

  await saveStore(store);
  return conversation;
}

async function getConversation(
  conversationRef: DocumentReference<DocumentData>,
): Promise<Conversation | null> {
  const snapshot = await conversationRef.get();
  if (!snapshot.exists) {
    return null;
  }

  const [messages, data] = await Promise.all([
    conversationRef.collection("messages").orderBy("createdAt", "asc").get(),
    Promise.resolve(snapshot.data() as Omit<Conversation, "messages">),
  ]);
  return {
    ...data,
    messages: messages.docs.map((doc) => doc.data() as Message),
  };
}
