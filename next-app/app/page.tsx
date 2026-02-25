"use client";
import Clock from "./components/Home/Clock";
import Habits from "./components/Home/Habits";
import Stats from "./components/Home/Stats";
import Subjects from "./components/Home/Subjects";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { LogIn, LogOut, User } from "lucide-react";

export default function Home() {
  const { user, logout, loading } = useAuthStore();

  return (
    <div className="flex flex-col gap-4 p-4 min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex gap-2">
          {!loading && !user ? (
            <Button asChild variant="default" size="sm" className="gap-2">
              <Link href="/login">
                <LogIn className="h-4 w-4" />
                Login
              </Link>
            </Button>
          ) : (
            user && (
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-sm font-medium">{user.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {user.email}
                  </span>
                </div>
                <Button
                  asChild
                  variant="outline"
                  size="icon"
                  className="rounded-full"
                >
                  <Link href="/profile">
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt="Avatar"
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-5 w-5" />
                    )}
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="gap-2 text-destructive hover:text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>
            )
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-row gap-4 flex-wrap lg:flex-nowrap">
          <Clock />
          <Subjects />
        </div>
        <div className="flex flex-row gap-4 flex-wrap lg:flex-nowrap">
          <Habits />
          <Stats />
        </div>
      </div>
    </div>
  );
}
