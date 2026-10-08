"use client";

import Link from "next/link";
import { useState } from "react";
import { Heart, LayoutGrid, LogOut, Menu, MessageSquareText, Moon, Plus, Sun, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { APP_NAME } from "@/lib/constants";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const links = [
    { href: "/", label: "Browse" },
    { href: "/my-listings", label: "My Listings" },
    { href: "/saved", label: "Saved" },
    { href: "/messages", label: "Messages" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 shadow-[0_8px_30px_-24px_oklch(0.22_0.035_278_/_50%)] backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2.5 text-lg font-black tracking-tight text-foreground">
          <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/25">
            <LayoutGrid className="h-5 w-5" />
          </span>
          <span>{APP_NAME}<span className="text-primary">.</span></span>
        </Link>

        <div className="hidden items-center gap-1 rounded-full border border-border/70 bg-card/80 p-1 md:flex">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="rounded-full px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-accent/70 hover:text-foreground"
            >
              {label}
            </Link>
          ))}
        </div>

        {user ? (
          <div className="flex items-center gap-2">
            <Link href="/listings/new" aria-label="Sell an item">
              <Button variant="default" size="sm" className="h-9 gap-2 rounded-full px-4 shadow-md shadow-primary/20">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Sell</span>
              </Button>
            </Link>
            <Link href="/messages" aria-label="Messages" className="hidden rounded-full border border-border bg-card p-2.5 text-foreground transition hover:border-primary/40 hover:text-primary sm:inline-flex">
              <MessageSquareText className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link href="/saved" aria-label="Saved listings" className="hidden rounded-full border border-border bg-card p-2.5 text-foreground transition hover:border-primary/40 hover:text-primary sm:inline-flex">
              <Heart className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Button variant="outline" size="sm" onClick={logout} className="hidden h-9 gap-2 rounded-full bg-card px-4 sm:inline-flex">
              <LogOut className="h-4 w-4" />
              <span className="hidden lg:inline">Logout</span>
            </Button>
          </div>
        ) : (
          <div className="hidden items-center gap-2 sm:flex">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="rounded-full">Login</Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="rounded-full px-4 shadow-md shadow-primary/20">Join CampusLoop</Button>
            </Link>
          </div>
        )}

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-full bg-card"
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            onClick={toggleTheme}
          >
            {theme === "light" ? <Moon /> : <Sun />}
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-full bg-card md:hidden"
            aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((open) => !open)}
          >
            {mobileOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </nav>
      {mobileOpen && (
        <div className="border-t border-border/70 bg-card/95 px-4 py-3 shadow-lg md:hidden">
          <div className="mx-auto grid max-w-7xl gap-1">
            {links.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className="rounded-xl px-4 py-3 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                {label}
              </Link>
            ))}
            {user ? (
              <Button variant="ghost" className="justify-start rounded-xl px-4" onClick={() => { logout(); setMobileOpen(false); }}>
                <LogOut className="mr-2 h-4 w-4" /> Logout
              </Button>
            ) : (
              <div className="mt-2 grid grid-cols-2 gap-2 border-t pt-3">
                <Link href="/login" onClick={() => setMobileOpen(false)}><Button variant="outline" className="w-full rounded-xl">Login</Button></Link>
                <Link href="/register" onClick={() => setMobileOpen(false)}><Button className="w-full rounded-xl">Register</Button></Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
