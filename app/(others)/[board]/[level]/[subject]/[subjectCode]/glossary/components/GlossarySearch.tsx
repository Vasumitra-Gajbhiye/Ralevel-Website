"use client";

import { ChevronsUpDown } from "lucide-react";
import posthog from "posthog-js";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function GlossarySearch({ terms }: any) {
  const [open, setOpen] = useState(false);

  const suggestions = terms.slice(0, 4);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-full max-w-xl justify-between rounded-full"
        >
          Search glossary terms
          <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[400px] p-0">
        <Command>
          <CommandInput placeholder="Search term..." />

          <CommandEmpty>No term found.</CommandEmpty>

          <CommandGroup>
            {suggestions.map((term: any) => (
              <CommandItem
                key={term.slug}
                value={term.term}
                onSelect={() => {
                  posthog.capture("glossary_term_searched", {
                    term: term.term,
                    term_slug: term.slug,
                  });
                  window.location.hash = term.term[0].toUpperCase();
                  setOpen(false);
                }}
              >
                {term.term}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
