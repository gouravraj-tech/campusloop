import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const query = new URL(request.url).searchParams.get("q") ?? "";
  if (!query) {
    return NextResponse.json({ books: [] });
  }

  const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=5`, {
    headers: { Accept: "application/json" },
  });
  const data = await response.json();
  const books = (data.items ?? []).map((item: any) => ({
    id: item.id,
    title: item.volumeInfo?.title ?? "Untitled",
    authors: item.volumeInfo?.authors ?? [],
    publisher: item.volumeInfo?.publisher ?? "Unknown",
    coverUrl: item.volumeInfo?.imageLinks?.thumbnail ?? "",
    isbn: item.volumeInfo?.industryIdentifiers?.[0]?.identifier ?? "",
  }));

  return NextResponse.json({ books });
}
