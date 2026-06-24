"use client";

import { useEffect, useState } from "react";
import { ModUser, saveModOrder } from "./actions";

export default function QotdClient({
  initialMods,
}: {
  initialMods: ModUser[];
}) {
  const [mods, setMods] = useState<ModUser[]>(initialMods);
  // Track the last confirmed saved state to compare against
  const [savedMods, setSavedMods] = useState<ModUser[]>(initialMods);

  const [newId, setNewId] = useState("");
  const [newTag, setNewTag] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Compare current state to saved state
  const hasUnsavedChanges = JSON.stringify(mods) !== JSON.stringify(savedMods);

  // Prevent accidental tab closure if there are unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = ""; // Required by most modern browsers to show the prompt
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleAdd = () => {
    if (!newId.trim() || !newTag.trim()) return;
    setMods([...mods, { id: newId.trim(), tag: newTag.trim() }]);
    setNewId("");
    setNewTag("");
  };

  const handleDelete = (index: number) => {
    setMods(mods.filter((_, i) => i !== index));
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    const newMods = [...mods];
    const swapIndex = direction === "up" ? index - 1 : index + 1;

    if (swapIndex < 0 || swapIndex >= newMods.length) return;

    [newMods[index], newMods[swapIndex]] = [newMods[swapIndex], newMods[index]];
    setMods(newMods);
  };

  const handleEdit = (index: number, field: "id" | "tag", value: string) => {
    const newMods = [...mods];
    newMods[index] = { ...newMods[index], [field]: value };
    setMods(newMods);
  };

  const handleSave = async () => {
    setIsSaving(true);
    await saveModOrder(mods);
    // Update our baseline to the newly saved array
    setSavedMods(mods);
    setIsSaving(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 font-sans">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold text-gray-800">QOTD Rotation</h1>
        <div className="flex items-center gap-4">
          {hasUnsavedChanges && (
            <span className="text-sm font-medium text-amber-500 animate-pulse">
              ● Unsaved changes
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving || !hasUnsavedChanges}
            className="bg-cyan-600 hover:bg-cyan-700 text-white px-5 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-100 shadow-sm rounded-xl overflow-hidden mb-8">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm">
              <th className="p-4 font-medium w-24">Order</th>
              <th className="p-4 font-medium w-1/3">Discord ID</th>
              <th className="p-4 font-medium">Tag</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {mods.map((mod, index) => (
              <tr
                key={`${mod.id}-${index}`}
                className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
              >
                <td className="p-4">
                  <div className="flex flex-col gap-1 items-start text-gray-400">
                    <button
                      onClick={() => handleMove(index, "up")}
                      disabled={index === 0}
                      className="hover:text-cyan-600 disabled:opacity-30 transition-colors"
                    >
                      ▲
                    </button>
                    <button
                      onClick={() => handleMove(index, "down")}
                      disabled={index === mods.length - 1}
                      className="hover:text-cyan-600 disabled:opacity-30 transition-colors"
                    >
                      ▼
                    </button>
                  </div>
                </td>
                <td className="p-4">
                  <input
                    type="text"
                    value={mod.id}
                    onChange={(e) => handleEdit(index, "id", e.target.value)}
                    className="w-full bg-transparent border-0 focus:ring-0 p-0 text-gray-700 text-sm font-mono"
                  />
                </td>
                <td className="p-4">
                  <input
                    type="text"
                    value={mod.tag}
                    onChange={(e) => handleEdit(index, "tag", e.target.value)}
                    className="w-full bg-transparent border-0 focus:ring-0 p-0 text-cyan-700 font-medium text-sm"
                  />
                </td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => handleDelete(index)}
                    className="text-red-400 hover:text-red-600 text-sm font-medium transition-colors"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add New User Section */}
      <div className="bg-cyan-50/50 border border-cyan-100 rounded-xl p-5 flex gap-4 items-end">
        <div className="flex-1">
          <label className="block text-xs font-semibold text-cyan-800 uppercase tracking-wider mb-2">
            Discord ID
          </label>
          <input
            type="text"
            value={newId}
            onChange={(e) => setNewId(e.target.value)}
            className="w-full border-gray-200 rounded-md shadow-sm focus:border-cyan-500 focus:ring-cyan-500 text-sm p-2.5 bg-white"
            placeholder="e.g. 1375526152638304369"
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs font-semibold text-cyan-800 uppercase tracking-wider mb-2">
            Tag
          </label>
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            className="w-full border-gray-200 rounded-md shadow-sm focus:border-cyan-500 focus:ring-cyan-500 text-sm p-2.5 bg-white"
            placeholder="e.g. rayasparkles"
          />
        </div>
        <button
          onClick={handleAdd}
          className="bg-white border border-cyan-200 text-cyan-700 hover:bg-cyan-50 px-6 py-2.5 rounded-md text-sm font-medium transition-colors shadow-sm"
        >
          Add to Rotation
        </button>
      </div>
    </div>
  );
}
