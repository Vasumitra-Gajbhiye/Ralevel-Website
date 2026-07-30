"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { BLOCK_REGISTRY } from "./blockRegistry";

export default function AddBlockMenu({
  onAdd,
}: {
  onAdd: (block: any) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="text-gray-400 hover:text-gray-600"
      >
        <Plus size={18} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-40 bg-white border rounded-md shadow-lg z-50">
          {BLOCK_REGISTRY.map((b) => (
            <button
              key={b.type}
              onClick={() => {
                onAdd(b.create());
                setOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
            >
              + {b.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
