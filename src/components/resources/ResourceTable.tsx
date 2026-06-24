// "use client";

// import { Link2, Plus, Trash2, Upload, X } from "lucide-react";
// import { useState } from "react";

// type Resource = {
//   id: string;
//   title: string;
//   description: string;
//   levels: string[];
//   boards: string[];
//   madeByMe: boolean;
//   links: string[];
//   files: File[];
// };

// const LEVELS = ["IGCSE", "AS", "A2"];
// const BOARDS = ["CAIE", "CBSE", "IB"];

// export default function ResourceTable({
//   resources,
//   setResources,
// }: {
//   resources: Resource[];
//   setResources: React.Dispatch<React.SetStateAction<Resource[]>>;
// }) {
//   const update = (id: string, patch: Partial<Resource>) => {
//     setResources((r) =>
//       r.map((res) => (res.id === id ? { ...res, ...patch } : res))
//     );
//   };

//   const remove = (id: string) =>
//     setResources((r) => r.filter((x) => x.id !== id));

//   const add = () =>
//     setResources((r) => [
//       ...r,
//       {
//         id: crypto.randomUUID(),
//         title: "",
//         description: "",
//         levels: [],
//         boards: [],
//         madeByMe: false,
//         links: [],
//         files: [],
//       },
//     ]);

//   return (
//     <div className="space-y-3">
//       {resources.map((res, i) => (
//         <ResourceRow
//           key={res.id}
//           index={i}
//           resource={res}
//           onUpdate={(p) => update(res.id, p)}
//           onRemove={() => remove(res.id)}
//         />
//       ))}

//       <button
//         onClick={add}
//         className="w-full rounded-lg border-2 border-dashed border-gray-300 py-3 text-sm font-medium text-gray-600 hover:border-gray-400 hover:bg-gray-50 transition-colors"
//       >
//         <Plus className="inline h-4 w-4 mr-1" />
//         Add another resource
//       </button>
//     </div>
//   );
// }

// function ResourceRow({
//   resource,
//   index,
//   onUpdate,
//   onRemove,
// }: {
//   resource: Resource;
//   index: number;
//   onUpdate: (p: Partial<Resource>) => void;
//   onRemove: () => void;
// }) {
//   const [linkDraft, setLinkDraft] = useState("");

//   const commitLink = () => {
//     const cleaned = linkDraft.trim();
//     if (!cleaned) return;

//     if (!resource.links.includes(cleaned)) {
//       onUpdate({
//         links: [...resource.links, cleaned],
//       });
//     }

//     setLinkDraft("");
//   };

//   return (
//     <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
//       <div className="grid gap-3 p-4">
//         {/* Header with title and delete */}
//         <div className="flex items-start gap-3">
//           <div className="flex-1 grid gap-3">
//             <div className="flex items-center gap-2">
//               <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-600">
//                 {index + 1}
//               </span>
//               <input
//                 placeholder="Resource title (e.g., Calculus Notes, Physics Past Papers)"
//                 value={resource.title}
//                 onChange={(e) => onUpdate({ title: e.target.value })}
//                 className="flex-1 text-sm font-medium border-0 border-b border-transparent px-2 py-1 focus:border-blue-500 focus:outline-none placeholder:text-gray-400"
//               />
//             </div>

//             <input
//               placeholder="Brief description (optional)"
//               value={resource.description}
//               onChange={(e) => onUpdate({ description: e.target.value })}
//               className="text-sm text-gray-600 border-0 border-b border-transparent px-2 py-1 focus:border-blue-500 focus:outline-none placeholder:text-gray-400"
//             />
//           </div>

//           <button
//             onClick={onRemove}
//             className="text-gray-400 hover:text-red-500 transition-colors mt-1"
//             title="Remove resource"
//           >
//             <Trash2 className="h-4 w-4" />
//           </button>
//         </div>

//         {/* Metadata row */}
//         <div className="flex flex-wrap items-center gap-x-6 gap-y-3 px-2">
//           <ToggleGroup
//             label="Level"
//             options={LEVELS}
//             value={resource.levels}
//             onChange={(v) => onUpdate({ levels: v })}
//           />
//           <ToggleGroup
//             label="Board"
//             options={BOARDS}
//             value={resource.boards}
//             onChange={(v) => onUpdate({ boards: v })}
//           />
//           <label className="flex items-center gap-2 text-sm">
//             <input
//               type="checkbox"
//               checked={resource.madeByMe}
//               onChange={(e) => onUpdate({ madeByMe: e.target.checked })}
//               className="rounded border-gray-300"
//             />
//             <span className="text-gray-700">Made by me</span>
//           </label>
//         </div>

//         {/* Files & Links section */}
//         <div className="space-y-3 px-2">
//           <p className="text-xs text-gray-500">
//             Add a resource link <span className="font-medium">OR</span> upload a
//             file.
//           </p>
//           {/* Show added links */}
//           {resource.links.length > 0 && (
//             <div className="flex flex-wrap gap-2">
//               {resource.links.map((link, idx) => (
//                 <div
//                   key={idx}
//                   className="flex items-center gap-1 rounded-md bg-blue-50 px-2 py-1 text-xs text-blue-700"
//                 >
//                   <Link2 className="h-3 w-3" />
//                   <span className="max-w-[200px] truncate">{link}</span>
//                   <button
//                     onClick={() =>
//                       onUpdate({
//                         links: resource.links.filter((_, i) => i !== idx),
//                       })
//                     }
//                     className="hover:text-blue-900"
//                   >
//                     <X className="h-3 w-3" />
//                   </button>
//                 </div>
//               ))}
//             </div>
//           )}

//           {/* Show uploaded files */}
//           {resource.files.length > 0 && (
//             <div className="flex flex-wrap gap-2">
//               {resource.files.map((file, idx) => (
//                 <div
//                   key={idx}
//                   className="flex items-center gap-1 rounded-md bg-green-50 px-2 py-1 text-xs text-green-700"
//                 >
//                   <span className="max-w-[200px] truncate">{file.name}</span>
//                   <button
//                     onClick={() =>
//                       onUpdate({
//                         files: resource.files.filter((_, i) => i !== idx),
//                       })
//                     }
//                     className="hover:text-green-900"
//                   >
//                     <X className="h-3 w-3" />
//                   </button>
//                 </div>
//               ))}
//             </div>
//           )}

//           {/* Add link/file actions */}
//           <div className="flex gap-2">
//             {/* Link input — hidden if a file exists */}
//             {resource.files.length === 0 && (
//               <div className="flex gap-2">
//                 <div className="flex-1 flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2 text-sm hover:border-gray-300 transition-colors">
//                   <Link2 className="h-4 w-4 text-gray-400" />
//                   <input
//                     value={linkDraft}
//                     placeholder="Paste a resource link"
//                     className="flex-1 outline-none placeholder:text-gray-400"
//                     onChange={(e) => setLinkDraft(e.target.value)}
//                     onKeyDown={(e) => {
//                       if (e.key === "Enter") {
//                         e.preventDefault();
//                         commitLink();
//                       }
//                     }}
//                     onBlur={() => {
//                       commitLink();
//                     }}
//                     onPaste={(e) => {
//                       const text = e.clipboardData.getData("text");
//                       if (text && text.startsWith("http")) {
//                         e.preventDefault();
//                         setLinkDraft(text);
//                         setTimeout(commitLink, 0);
//                       }
//                     }}
//                   />
//                 </div>

//                 <button
//                   type="button"
//                   onClick={commitLink}
//                   className="px-3 py-2 text-sm rounded-md border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
//                 >
//                   Add
//                 </button>
//               </div>
//             )}

//             {/* OR divider */}
//             {resource.links.length === 0 && linkDraft.trim() === "" && (
//               <div className="flex items-center gap-3 text-xs text-gray-400">
//                 <div className="flex-1 h-px bg-gray-200" />
//                 OR
//                 <div className="flex-1 h-px bg-gray-200" />
//               </div>
//             )}

//             {/* File upload — hidden if link exists */}
//             {resource.links.length === 0 && linkDraft.trim() === "" && (
//               <label className="flex cursor-pointer items-center gap-2 rounded-md border border-gray-200 px-3 py-2 text-sm hover:border-gray-300 hover:bg-gray-50 transition-colors whitespace-nowrap">
//                 <Upload className="h-4 w-4 text-gray-400" />
//                 Upload PDF / Image
//                 <input
//                   type="file"
//                   hidden
//                   onChange={(e) => {
//                     const file = e.target.files?.[0];
//                     if (!file) return;

//                     onUpdate({
//                       files: [file], // replace instead of append
//                       links: [], // ensure link removed
//                     });
//                   }}
//                 />
//               </label>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// function ToggleGroup({
//   label,
//   options,
//   value,
//   onChange,
// }: {
//   label: string;
//   options: string[];
//   value: string[];
//   onChange: (v: string[]) => void;
// }) {
//   return (
//     <div className="flex items-center gap-2">
//       <span className="text-xs font-medium text-gray-600">{label}:</span>
//       <div className="flex gap-1">
//         {options.map((opt) => {
//           const active = value.includes(opt);
//           return (
//             <button
//               key={opt}
//               onClick={() =>
//                 onChange(
//                   active ? value.filter((v) => v !== opt) : [...value, opt]
//                 )
//               }
//               className={`rounded px-2 py-0.5 text-xs font-medium transition-colors ${
//                 active
//                   ? "bg-blue-600 text-white"
//                   : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//               }`}
//             >
//               {opt}
//             </button>
//           );
//         })}
//       </div>
//     </div>
//   );
// }

"use client";

import { Link2, Plus, Trash2, Upload, X } from "lucide-react";
import { useState } from "react";

type Resource = {
  id: string;
  title: string;
  description: string;
  levels: string[];
  boards: string[];
  madeByMe: boolean;
  links: string[];
  files: File[];
};

const LEVELS = ["IGCSE", "AS", "A2"];
const BOARDS = ["CAIE", "CBSE", "IB"];

export default function ResourceTable({
  resources,
  setResources,
}: {
  resources: Resource[];
  setResources: React.Dispatch<React.SetStateAction<Resource[]>>;
}) {
  const update = (id: string, patch: Partial<Resource>) => {
    setResources((r) =>
      r.map((res) => (res.id === id ? { ...res, ...patch } : res))
    );
  };

  const remove = (id: string) =>
    setResources((r) => r.filter((x) => x.id !== id));

  const add = () =>
    setResources((r) => [
      ...r,
      {
        id: crypto.randomUUID(),
        title: "",
        description: "",
        levels: [],
        boards: [],
        madeByMe: false,
        links: [],
        files: [],
      },
    ]);

  return (
    <div className="space-y-3">
      {resources.map((res, i) => (
        <ResourceRow
          key={res.id}
          index={i}
          resource={res}
          onUpdate={(p) => update(res.id, p)}
          onRemove={() => remove(res.id)}
        />
      ))}

      <button
        onClick={add}
        className="w-full rounded-lg border-2 border-dashed border-gray-300 py-3 text-sm font-medium text-gray-600 hover:border-gray-400 hover:bg-gray-50 transition-colors flex items-center justify-center"
      >
        <Plus className="inline h-4 w-4 mr-1" />
        Add another resource
      </button>
    </div>
  );
}

function ResourceRow({
  resource,
  index,
  onUpdate,
  onRemove,
}: {
  resource: Resource;
  index: number;
  onUpdate: (p: Partial<Resource>) => void;
  onRemove: () => void;
}) {
  const [linkDraft, setLinkDraft] = useState("");

  const commitLink = () => {
    const cleaned = linkDraft.trim();
    if (!cleaned) return;

    if (!resource.links.includes(cleaned)) {
      onUpdate({
        links: [...resource.links, cleaned],
      });
    }

    setLinkDraft("");
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="grid gap-4 p-3 sm:p-4">
        {/* Header with title and delete */}
        <div className="flex items-start gap-2 sm:gap-3">
          <div className="flex-1 grid gap-2 sm:gap-3 min-w-0">
            <div className="flex items-start sm:items-center gap-2">
              <span className="mt-0.5 sm:mt-0 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-600">
                {index + 1}
              </span>
              <input
                placeholder="Resource title (e.g., Calculus Notes...)"
                value={resource.title}
                onChange={(e) => onUpdate({ title: e.target.value })}
                className="flex-1 text-sm font-medium border-0 border-b border-transparent px-1 py-1 focus:border-blue-500 focus:outline-none placeholder:text-gray-400 min-w-0 w-full"
              />
            </div>

            <input
              placeholder="Brief description (optional)"
              value={resource.description}
              onChange={(e) => onUpdate({ description: e.target.value })}
              className="text-sm text-gray-600 border-0 border-b border-transparent px-1 sm:px-2 py-1 ml-0 sm:ml-8 focus:border-blue-500 focus:outline-none placeholder:text-gray-400 min-w-0 w-full"
            />
          </div>

          <button
            onClick={onRemove}
            className="text-gray-400 hover:text-red-500 transition-colors p-1 sm:mt-1 shrink-0"
            title="Remove resource"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        {/* Metadata row */}
        <div className="flex flex-wrap items-center gap-x-4 sm:gap-x-6 gap-y-3 px-1 sm:px-2">
          <ToggleGroup
            label="Level"
            options={LEVELS}
            value={resource.levels}
            onChange={(v) => onUpdate({ levels: v })}
          />
          <ToggleGroup
            label="Board"
            options={BOARDS}
            value={resource.boards}
            onChange={(v) => onUpdate({ boards: v })}
          />
          <label className="flex items-center gap-2 text-sm w-full sm:w-auto pt-1 sm:pt-0">
            <input
              type="checkbox"
              checked={resource.madeByMe}
              onChange={(e) => onUpdate({ madeByMe: e.target.checked })}
              className="rounded border-gray-300 h-4 w-4"
            />
            <span className="text-gray-700">Made by me</span>
          </label>
        </div>

        {/* Files & Links section */}
        <div className="space-y-3 px-1 sm:px-2">
          <p className="text-xs text-gray-500">
            Add a resource link <span className="font-medium">OR</span> upload a
            file.
          </p>

          {/* Show added links */}
          {resource.links.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {resource.links.map((link, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1 rounded-md bg-blue-50 px-2 py-1 text-xs text-blue-700 max-w-full"
                >
                  <Link2 className="h-3 w-3 shrink-0" />
                  <span className="max-w-[150px] sm:max-w-[200px] truncate">
                    {link}
                  </span>
                  <button
                    onClick={() =>
                      onUpdate({
                        links: resource.links.filter((_, i) => i !== idx),
                      })
                    }
                    className="hover:text-blue-900 shrink-0 p-1"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Show uploaded files */}
          {resource.files.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {resource.files.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1 rounded-md bg-green-50 px-2 py-1 text-xs text-green-700 max-w-full"
                >
                  <span className="max-w-[150px] sm:max-w-[200px] truncate">
                    {file.name}
                  </span>
                  <button
                    onClick={() =>
                      onUpdate({
                        files: resource.files.filter((_, i) => i !== idx),
                      })
                    }
                    className="hover:text-green-900 shrink-0 p-1"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add link/file actions */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            {/* Link input — hidden if a file exists */}
            {resource.files.length === 0 && (
              <div className="flex gap-2 w-full sm:flex-1">
                <div className="flex-1 flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2 text-sm hover:border-gray-300 transition-colors min-w-0">
                  <Link2 className="h-4 w-4 text-gray-400 shrink-0" />
                  <input
                    value={linkDraft}
                    placeholder="Paste a link"
                    className="flex-1 outline-none placeholder:text-gray-400 min-w-0 w-full bg-transparent"
                    onChange={(e) => setLinkDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        commitLink();
                      }
                    }}
                    onBlur={() => {
                      commitLink();
                    }}
                    onPaste={(e) => {
                      const text = e.clipboardData.getData("text");
                      if (text && text.startsWith("http")) {
                        e.preventDefault();
                        setLinkDraft(text);
                        setTimeout(commitLink, 0);
                      }
                    }}
                  />
                </div>

                <button
                  type="button"
                  onClick={commitLink}
                  className="px-3 py-2 text-sm rounded-md border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors shrink-0 whitespace-nowrap"
                >
                  Add
                </button>
              </div>
            )}

            {/* OR divider */}
            {resource.links.length === 0 && linkDraft.trim() === "" && (
              <div className="flex items-center gap-3 text-xs text-gray-400 w-full sm:w-auto">
                <div className="flex-1 sm:w-8 h-px bg-gray-200" />
                OR
                <div className="flex-1 sm:w-8 h-px bg-gray-200" />
              </div>
            )}

            {/* File upload — hidden if link exists */}
            {resource.links.length === 0 && linkDraft.trim() === "" && (
              <label className="flex cursor-pointer items-center justify-center sm:justify-start gap-2 rounded-md border border-gray-200 px-3 py-2 text-sm hover:border-gray-300 hover:bg-gray-50 transition-colors whitespace-nowrap w-full sm:w-auto">
                <Upload className="h-4 w-4 text-gray-400 shrink-0" />
                Upload PDF / Image
                <input
                  type="file"
                  hidden
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    onUpdate({
                      files: [file], // replace instead of append
                      links: [], // ensure link removed
                    });
                  }}
                />
              </label>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ToggleGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string[];
  onChange: (v: string[]) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-medium text-gray-600">{label}:</span>
      <div className="flex flex-wrap gap-1">
        {options.map((opt) => {
          const active = value.includes(opt);
          return (
            <button
              key={opt}
              onClick={() =>
                onChange(
                  active ? value.filter((v) => v !== opt) : [...value, opt]
                )
              }
              className={`rounded px-2 py-0.5 text-xs font-medium transition-colors ${
                active
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}
