"use client";

import { useEffect, useState } from "react";
import { Input, InputGroup, CloseButton } from "@heroui/react";
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
    <InputGroup className="max-w-sm">
      <InputGroup.Prefix>
        <Search size={16} className="text-slate-400" />
      </InputGroup.Prefix>
      <InputGroup.Input>
        <Input
          placeholder="Search tasks by title or description..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </InputGroup.Input>
      {value && (
        <InputGroup.Suffix>
          <CloseButton aria-label="Clear search" onPress={() => setValue("")} />
        </InputGroup.Suffix>
      )}
    </InputGroup>
  );
}