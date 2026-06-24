"use client";

import { Avatar, Button, Spinner } from "@heroui/react";
import { LogOut } from "lucide-react";
import { useAuth } from "../../lib/hooks/useAuth";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 border-b border-slate-200 bg-white/90 flex items-center justify-between px-6 backdrop-blur">
      <div />
      <div className="flex items-center gap-3">
        {user && (
          <div className="flex items-center gap-2">
            <Avatar size="sm">
              <Avatar.Fallback>{getInitials(user.name)}</Avatar.Fallback>
            </Avatar>
            <span className="text-sm font-medium hidden sm:inline">{user.name}</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onPress={logout}
        >
          {({ isPending }) => (
            <>
              {isPending ? <Spinner size="sm" color="current" /> : <LogOut size={16} />}
              Sign out
            </>
          )}
        </Button>
      </div>
    </header>
  );
}
