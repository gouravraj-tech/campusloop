import fs from "node:fs/promises";
import path from "node:path";

export type Category = "Books" | "Electronics" | "Lab Supplies" | "Furniture" | "Stationery" | "Other";
export type Condition = "New" | "Like New" | "Good" | "Fair";

export type User = {
  uid: string;
  name: string;
  email: string;
  college: string;
  token: string;
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
  return ensureStore();
}

export async function saveStore(nextState: AppState) {
  await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
  await fs.writeFile(STORE_PATH, JSON.stringify(nextState, null, 2), "utf-8");
  return nextState;
}

export async function getUserByToken(token: string) {
  const store = await getStore();
  return store.users.find((user) => user.token === token) ?? null;
}

export async function getUserByEmail(email: string) {
  const store = await getStore();
  return store.users.find((user) => user.email.toLowerCase() === email.toLowerCase()) ?? null;
}

export async function createUser(payload: Omit<User, "uid" | "token" | "createdAt"> & { uid?: string; token?: string }) {
  const store = await getStore();
  const existing = store.users.find((user) => user.email.toLowerCase() === payload.email.toLowerCase());
  if (existing) {
    return existing;
  }

  const user: User = {
    uid: payload.uid ?? crypto.randomUUID(),
    name: payload.name,
    email: payload.email,
    college: payload.college,
    token: payload.token ?? `campusloop-${crypto.randomUUID()}`,
    createdAt: new Date().toISOString(),
  };

  store.users.push(user);
  await saveStore(store);
  return user;
}

export async function getListingById(listingId: string) {
  const store = await getStore();
  return store.listings.find((listing) => listing.id === listingId) ?? null;
}

export async function listListings() {
  const store = await getStore();
  return [...store.listings].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function upsertListing(listing: Listing) {
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
  const store = await getStore();
  store.listings = store.listings.filter((listing) => listing.id !== listingId);
  store.saved = store.saved.filter((entry) => entry.listingId !== listingId);
  store.conversations = store.conversations.filter((entry) => entry.listingId !== listingId);
  await saveStore(store);
}

export async function listSaved(userId: string) {
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
  const store = await getStore();
  store.saved = store.saved.filter((entry) => !(entry.userId === userId && entry.listingId === listingId));
  await saveStore(store);
}

export async function listConversations(userId: string) {
  const store = await getStore();
  return [...store.conversations]
    .filter((entry) => entry.buyerId === userId || entry.sellerId === userId)
    .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
}

export async function getConversationById(conversationId: string) {
  const store = await getStore();
  return store.conversations.find((entry) => entry.id === conversationId) ?? null;
}

export async function createOrGetConversation(payload: Omit<Conversation, "messages"> & { messages?: Message[] }) {
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
