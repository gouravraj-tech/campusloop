import { NextRequest, NextResponse } from "next/server";

type GoogleBooksVolume = {
  id?: string;
  volumeInfo?: {
    title?: string;
    authors?: string[];
    publisher?: string;
    imageLinks?: { thumbnail?: string };
    industryIdentifiers?: Array<{ identifier?: string }>;
  };
};

type GoogleBooksResponse = {
  items?: GoogleBooksVolume[];
};

export async function GET(request: NextRequest) {
  const query = new URL(request.url).searchParams.get("q") ?? "";
  if (!query) {
    return NextResponse.json({ books: [] });
  }

  const searchParams = new URLSearchParams({ q: query, maxResults: "5" });
  const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
  if (apiKey) {
    searchParams.set("key", apiKey);
  }

  const response = await fetch(`https://www.googleapis.com/books/v1/volumes?${searchParams}`, {
    headers: { Accept: "application/json" },
  });
  if (!response.ok) {
    return NextResponse.json({ error: "Unable to look up books right now." }, { status: 502 });
  }
  const data = await response.json() as GoogleBooksResponse;
  const books = (data.items ?? []).map((item) => ({
    id: item.id ?? "",
    title: item.volumeInfo?.title ?? "Untitled",
    authors: item.volumeInfo?.authors ?? [],
    publisher: item.volumeInfo?.publisher ?? "Unknown",
    coverUrl: item.volumeInfo?.imageLinks?.thumbnail ?? "",
    isbn: item.volumeInfo?.industryIdentifiers?.[0]?.identifier ?? "",
  }));

  return NextResponse.json({ books });
}
