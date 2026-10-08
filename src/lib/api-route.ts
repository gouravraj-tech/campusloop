import { NextResponse } from "next/server";
import { ApiAuthError } from "@/lib/auth";

type RouteHandler<Args extends unknown[]> = (...args: Args) => Promise<NextResponse>;

export function withAuthErrors<Args extends unknown[]>(handler: RouteHandler<Args>): RouteHandler<Args> {
  return async (...args) => {
    try {
      return await handler(...args);
    } catch (error) {
      if (error instanceof ApiAuthError) {
        return NextResponse.json({ error: error.message }, { status: error.status });
      }
      throw error;
    }
  };
}
