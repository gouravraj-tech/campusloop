"use client";

import Link from "next/link";
import { Bell, Heart, LayoutGrid, LogOut, MessageSquareText, Plus, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { APP_NAME } from "@/lib/constants";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b bg-white/90 backdrop-blur-sm">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-foreground">
          <LayoutGrid className="h-5 w-5 text-primary" />
          {APP_NAME}
        </Link>

        <div className="hidden items-center gap-5 md:flex">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">Browse</Link>
          <Link href="/my-listings" className="text-sm text-muted-foreground hover:text-foreground">My Listings</Link>
          <Link href="/saved" className="text-sm text-muted-foreground hover:text-foreground">Saved</Link>
          <Link href="/messages" className="text-sm text-muted-foreground hover:text-foreground">Messages</Link>
        </div>

        {user ? (
          <div className="flex items-center gap-2">
            <Link href="/listings/new">
              <Button variant="default" size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Sell
              </Button>
            </Link>
            <Link href="/messages" className="rounded-full border p-2">
              <MessageSquareText className="h-4 w-4" />
            </Link>
            <Link href="/saved" className="rounded-full border p-2">
              <Heart className="h-4 w-4" />
            </Link>
            <Button variant="outline" size="sm" onClick={logout} className="gap-2">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="outline" size="sm">Login</Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Register</Button>
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}
