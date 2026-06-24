"use client";

import { useEffect, useState } from "react";
import { CloseButton, Input } from "@heroui/react";
import { Search } from "lucide-react";

export function TaskSearchBar({
  onSearch,
}: {
  onSearch: (value: string) => void;
}) {
  const [value, setValue] = useState("");

  // Debounce: wait 300ms after the last keystroke before firing the
  // request, so typing a full word doesn't trigger five separate
  // network calls. Cleared on every keystroke via the effect's
  // cleanup function.
  useEffect(() => {
    const timeout = setTimeout(() => {
      onSearch(value);
    }, 300);
    return () => clearTimeout(timeout);
  }, [value, onSearch]);

  return (
    <div className="relative max-w-sm">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
      <Input
        className="pl-9 pr-9"
        placeholder="Search tasks by title or description..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      {value && (
        <CloseButton
          aria-label="Clear search"
          className="absolute right-2 top-1/2 -translate-y-1/2"
          onPress={() => setValue("")}
        />
      )}
    </div>
  );
}
