// "use client";

// import { useState } from "react";
// import { useSession } from "next-auth/react";

// export default function ProfilePage() {
//   const { data: session } = useSession();
//   const [formData, setFormData] = useState({
//     subjectsAS: [],
//     subjectsA2: [],
//     examSession: "",
//     receiveEmails: false,
//   });

//   async function handleSubmit(e) {
//     e.preventDefault();
//     await fetch("/api/user/update", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ email: session.user.email, ...formData }),
//     });
//     alert("Profile updated!");
//   }

//   if (!session?.user) return <p>Please sign in with Google first.</p>;

//   return (
//     <form onSubmit={handleSubmit} className="p-6 max-w-lg mx-auto">
//       <h1 className="text-xl font-bold mb-4">Your Profile</h1>

//       <label>Subjects (AS Level)</label>
//       <input
//         type="text"
//         placeholder="e.g. Math, Physics"
//         onChange={(e) =>
//           setFormData({ ...formData, subjectsAS: e.target.value.split(",") })
//         }
//         className="w-full border p-2 mb-4"
//       />

//       <label>Subjects (A2 Level)</label>
//       <input
//         type="text"
//         placeholder="e.g. Chemistry, Biology"
//         onChange={(e) =>
//           setFormData({ ...formData, subjectsA2: e.target.value.split(",") })
//         }
//         className="w-full border p-2 mb-4"
//       />

//       <label>Exam Session</label>
//       <input
//         type="text"
//         placeholder="e.g. May/June 2026"
//         onChange={(e) =>
//           setFormData({ ...formData, examSession: e.target.value })
//         }
//         className="w-full border p-2 mb-4"
//       />

//       <label className="flex items-center space-x-2">
//         <input
//           type="checkbox"
//           onChange={(e) =>
//             setFormData({ ...formData, receiveEmails: e.target.checked })
//           }
//         />
//         <span>Receive emails about new resources?</span>
//       </label>

//       <button
//         type="submit"
//         className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
//       >
//         Save
//       </button>
//     </form>
//   );
// }

// "use client";

// import { useState, FormEvent } from "react";
// import { useSession } from "next-auth/react";

// interface FormData {
//   subjectsAS: string[];
//   subjectsA2: string[];
//   examSession: string;
//   receiveEmails: boolean;
// }

// export default function ProfilePage() {
//   const { data: session } = useSession();

//   const [formData, setFormData] = useState<FormData>({
//     subjectsAS: [],
//     subjectsA2: [],
//     examSession: "",
//     receiveEmails: false,
//   });

//   async function handleSubmit(e: FormEvent<HTMLFormElement>) {
//     e.preventDefault();

//     if (!session?.user?.email) {
//       alert("Please sign in with Google first.");
//       return;
//     }

//     try {
//       const res = await fetch("/api/user/update", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email: session.user.email, ...formData }),
//       });

//       if (!res.ok) throw new Error("Network response was not ok");

//       alert("Profile updated!");
//     } catch (error) {
//       console.error("Error updating profile:", error);
//       alert("There was a problem updating your profile. Please try again.");
//     }
//   }

//   // Show this if the user is not signed in
//   if (!session?.user) return <p>Please sign in with Google first.</p>;

//   return (
//     <form onSubmit={handleSubmit} className="p-6 max-w-lg mx-auto">
//       <h1 className="text-xl font-bold mb-4">Your Profile</h1>

//       {/* AS Level Subjects */}
//       <label className="block mb-1">Subjects (AS Level)</label>
//       <input
//         type="text"
//         placeholder="e.g. Math, Physics"
//         onChange={(e) =>
//           setFormData({
//             ...formData,
//             subjectsAS: e.target.value
//               .split(",")
//               .map((s) => s.trim())
//               .filter(Boolean),
//           })
//         }
//         className="w-full border p-2 mb-4 rounded"
//       />

//       {/* A2 Level Subjects */}
//       <label className="block mb-1">Subjects (A2 Level)</label>
//       <input
//         type="text"
//         placeholder="e.g. Chemistry, Biology"
//         onChange={(e) =>
//           setFormData({
//             ...formData,
//             subjectsA2: e.target.value
//               .split(",")
//               .map((s) => s.trim())
//               .filter(Boolean),
//           })
//         }
//         className="w-full border p-2 mb-4 rounded"
//       />

//       {/* Exam Session */}
//       <label className="block mb-1">Exam Session</label>
//       <input
//         type="text"
//         placeholder="e.g. May/June 2026"
//         onChange={(e) =>
//           setFormData({ ...formData, examSession: e.target.value })
//         }
//         className="w-full border p-2 mb-4 rounded"
//       />

//       {/* Email Notifications */}
//       <label className="flex items-center space-x-2">
//         <input
//           type="checkbox"
//           onChange={(e) =>
//             setFormData({ ...formData, receiveEmails: e.target.checked })
//           }
//         />
//         <span>Receive emails about new resources?</span>
//       </label>

//       {/* Submit Button */}
//       <button
//         type="submit"
//         className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
//       >
//         Save
//       </button>
//     </form>
//   );
// }

// "use client";

// import React, { useEffect, useMemo, useState } from "react";
// import Image from "next/image";
// import { useSession, signOut } from "next-auth/react";
// import { useRouter } from "next/navigation";
// import { FormEvent } from "react";

// /**
//  * Profile Page 2.0
//  *
//  * - Floating left user card (desktop)
//  * - Boards multi-select -> unlocks subject lists & session dropdowns
//  * - AS/A2 subject pickers with subject codes (sample lists, 4-5 per board)
//  * - Prefills data from GET /api/user
//  * - POST /api/user/update on Save
//  *
//  * Notes:
//  * - Ensure next.config.js includes remote hosts (google avatars) or fallback to <img>
//  * - Ensure /api/user returns the user object with fields:
//  *   { name, email, subjectsAS: string[], subjectsA2: string[], examSession: string, receiveEmails: boolean, boards: string[] }
//  */

// type BoardKey = "CAIE" | "Edexcel" | "Edexcel-IAL" | "AQA" | "OCR" | "WJEC";

// const BOARDS: { key: BoardKey; label: string }[] = [
//   { key: "CAIE", label: "Cambridge (CAIE)" },
//   { key: "Edexcel", label: "Pearson Edexcel (UK)" },
//   { key: "Edexcel-IAL", label: "Edexcel IAL" },
//   { key: "AQA", label: "AQA" },
//   { key: "OCR", label: "OCR" },
//   { key: "WJEC", label: "WJEC/Eduqas" },
// ];

// /**
//  * Sample subject lists (4-5 each) with codes.
//  * Replace / expand later — this is a compact sample as requested.
//  */
// const SUBJECTS_BY_BOARD: Record<BoardKey, { code: string; name: string }[]> = {
//   CAIE: [
//     { code: "9709", name: "Mathematics" },
//     { code: "9701", name: "Chemistry" },
//     { code: "9702", name: "Physics" },
//     { code: "9708", name: "Economics" },
//     { code: "9691", name: "Computer Science" },
//   ],
//   Edexcel: [
//     { code: "9MA0", name: "Mathematics" },
//     { code: "8CH0", name: "Chemistry" },
//     { code: "8PH0", name: "Physics" },
//     { code: "9EC0", name: "Economics" },
//     { code: "9PS0", name: "Psychology" },
//   ],
//   "Edexcel-IAL": [
//     { code: "IAL-MA", name: "Mathematics (IAL)" },
//     { code: "IAL-CH", name: "Chemistry (IAL)" },
//     { code: "IAL-PH", name: "Physics (IAL)" },
//     { code: "IAL-EC", name: "Economics (IAL)" },
//     { code: "IAL-CS", name: "Computer Science (IAL)" },
//   ],
//   AQA: [
//     { code: "7408", name: "Biology" },
//     { code: "7405", name: "Chemistry" },
//     { code: "7407", name: "Physics" },
//     { code: "7181", name: "Economics" },
//     { code: "7182", name: "Psychology" },
//   ],
//   OCR: [
//     { code: "H230", name: "Biology" },
//     { code: "H432", name: "Chemistry" },
//     { code: "H556", name: "Physics" },
//     { code: "H866", name: "Computer Science" },
//     { code: "H581", name: "History" },
//   ],
//   WJEC: [
//     { code: "WJEC-01", name: "Chemistry" },
//     { code: "WJEC-02", name: "Physics" },
//     { code: "WJEC-03", name: "Mathematics" },
//     { code: "WJEC-04", name: "Economics" },
//     { code: "WJEC-05", name: "Business" },
//   ],
// };

// /**
//  * Exam sessions per board (sample tags)
//  */
// const SESSIONS_BY_BOARD: Record<BoardKey, string[]> = {
//   CAIE: ["May/June", "Oct/Nov", "Mar"],
//   Edexcel: ["May/June", "Jan", "Oct/Nov"],
//   "Edexcel-IAL": ["May/June", "Oct/Nov", "Nov"],
//   AQA: ["May/June", "Jan", "Oct/Nov"],
//   OCR: ["May/June", "Jan", "Oct/Nov"],
//   WJEC: ["May/June", "Jan", "Oct/Nov"],
// };

// interface UserPayload {
//   name: string;
//   email: string;
//   boards?: BoardKey[];
//   subjectsAS?: string[]; // store as "Board|code|name" or simpler "code — name"
//   subjectsA2?: string[];
//   examSession?: string; // we will store as "Board|session" if multi-board? For now keep single string
//   receiveEmails?: boolean;
// }

// export default function ProfilePage() {
//   const { data: session } = useSession();
//   const router = useRouter();

//   // local UI state
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [toast, setToast] = useState<string | null>(null);

//   // form state
//   const [boards, setBoards] = useState<BoardKey[]>([]);
//   const [activeLevel, setActiveLevel] = useState<"AS" | "A2">("AS"); // toggle between AS / A2 lists
//   const [subjectsAS, setSubjectsAS] = useState<string[]>([]);
//   const [subjectsA2, setSubjectsA2] = useState<string[]>([]);
//   const [examSession, setExamSession] = useState<string>(""); // we will store as "BoardKey::session"
//   const [receiveEmails, setReceiveEmails] = useState<boolean>(false);
//   const [name, setName] = useState<string>("");

//   // helper: show temporary toast message
//   function showToast(msg: string, ms = 2500) {
//     setToast(msg);
//     window.setTimeout(() => setToast(null), ms);
//   }

//   // compute combined subjects available for the selected boards
//   const availableSubjects = useMemo(() => {
//     const set = new Map<string, { code: string; name: string }>();
//     boards.forEach((b) => {
//       const list = SUBJECTS_BY_BOARD[b] || [];
//       list.forEach((s) => {
//         // key by code + board to avoid collisions: `${b}::${s.code}`
//         const key = `${b}::${s.code}`;
//         if (!set.has(key)) set.set(key, s);
//       });
//     });
//     // return array of {key, board, code, name}
//     return Array.from(set.entries()).map(([key, val]) => {
//       const [board] = key.split("::");
//       return { key, board: board as BoardKey, code: val.code, name: val.name };
//     });
//   }, [boards]);

//   // load existing user data from backend
//   useEffect(() => {
//     async function load() {
//       if (!session?.user?.email) {
//         setLoading(false);
//         return;
//       }
//       try {
//         setLoading(true);
//         const res = await fetch("/api/user", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ email: session.user.email }),
//         });
//         if (!res.ok) throw new Error("Failed to fetch user");
//         const data: UserPayload = await res.json();
//         setName(data.name ?? session.user?.name ?? "");
//         if (data.boards) setBoards(data.boards);
//         if (data.subjectsAS) setSubjectsAS(data.subjectsAS);
//         if (data.subjectsA2) setSubjectsA2(data.subjectsA2);
//         if (data.examSession) setExamSession(data.examSession);
//         if (typeof data.receiveEmails === "boolean")
//           setReceiveEmails(data.receiveEmails);
//       } catch (err) {
//         console.error(err);
//         showToast("Could not load profile — try reloading.");
//       } finally {
//         setLoading(false);
//       }
//     }
//     load();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [session?.user?.email]);

//   // toggle board selected/unselected
//   function toggleBoard(b: BoardKey) {
//     setBoards((prev) => {
//       if (prev.includes(b)) {
//         // removing: also remove any subjects chosen that come from this board
//         const newBoards = prev.filter((x) => x !== b);
//         // filter subject lists to only keep ones from remaining boards
//         const remainingBoardKeys = new Set(newBoards);
//         setSubjectsAS((prevAS) =>
//           prevAS.filter((s) => {
//             // s stored as `${board}::${code}::${name}`
//             const parts = s.split("::");
//             return parts.length >= 3 && remainingBoardKeys.has(parts[0] as BoardKey);
//           })
//         );
//         setSubjectsA2((prevA2) =>
//           prevA2.filter((s) => {
//             const parts = s.split("::");
//             return parts.length >= 3 && remainingBoardKeys.has(parts[0] as BoardKey);
//           })
//         );
//         // if examSession was for this board, clear
//         if (examSession.startsWith(`${b}::`)) setExamSession("");
//         return newBoards;
//       } else {
//         return [...prev, b];
//       }
//     });
//   }

//   // toggle a subject (AS or A2)
//   function toggleSubject(level: "AS" | "A2", board: BoardKey, code: string, name_: string) {
//     // store subject as `${board}::${code}::${name}`
//     const key = `${board}::${code}::${name_}`;
//     if (level === "AS") {
//       // must have boards selected
//       if (boards.length === 0) {
//         showToast("Select at least one exam board before adding subjects.");
//         return;
//       }
//       setSubjectsAS((prev) => {
//         if (prev.includes(key)) return prev.filter((p) => p !== key);
//         return [...prev, key];
//       });
//     } else {
//       if (boards.length === 0) {
//         showToast("Select at least one exam board before adding subjects.");
//         return;
//       }
//       setSubjectsA2((prev) => {
//         if (prev.includes(key)) return prev.filter((p) => p !== key);
//         return [...prev, key];
//       });
//     }
//   }

//   // helper to display subject chip label (code — name)
//   function renderSubjectLabel(subjectKey: string) {
//     // subjectKey: `${board}::${code}::${name}`
//     const parts = subjectKey.split("::");
//     if (parts.length >= 3) {
//       return `${parts[1]} — ${parts[2]}`;
//     }
//     return subjectKey;
//   }

//   // helper to check if a subject is selected
//   function isSubjectSelected(level: "AS" | "A2", key: string) {
//     if (level === "AS") return subjectsAS.includes(key);
//     return subjectsA2.includes(key);
//   }

//   // save changes
//   async function handleSave(e?: FormEvent) {
//     if (e) e.preventDefault();
//     if (!session?.user?.email) {
//       showToast("Sign in required");
//       return;
//     }
//     setSaving(true);
//     try {
//       const payload: UserPayload = {
//         name,
//         email: session.user.email,
//         boards,
//         subjectsAS,
//         subjectsA2,
//         examSession,
//         receiveEmails,
//       };
//       const res = await fetch("/api/user/update", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });
//       if (!res.ok) throw new Error("Save failed");
//       showToast("Profile saved");
//     } catch (err) {
//       console.error(err);
//       showToast("Could not save profile");
//     } finally {
//       setSaving(false);
//     }
//   }

//   // render helper for sessions dropdown (combined for selected boards)
//   const sessionOptions = useMemo(() => {
//     const opts: { key: string; label: string }[] = [];
//     boards.forEach((b) => {
//       const sessions = SESSIONS_BY_BOARD[b] || [];
//       sessions.forEach((s) => {
//         opts.push({ key: `${b}::${s}`, label: `${b} — ${s}` });
//       });
//     });
//     return opts;
//   }, [boards]);

//   // small loading skeleton
//   if (loading || !session?.user) {
//     return (
//       <div className="p-8 max-w-5xl mx-auto">
//         <div className="animate-pulse bg-gray-100 rounded-lg p-6">
//           <div className="h-6 w-48 bg-gray-200 rounded mb-4" />
//           <div className="h-36 bg-gray-200 rounded mb-4" />
//           <div className="h-10 bg-gray-200 rounded" />
//         </div>
//       </div>
//     );
//   }

//   return (
//     <main className="p-6 md:p-10 max-w-7xl mx-auto relative">
//       {/* Toast */}
//       {toast && (
//         <div className="fixed right-6 top-6 z-50 bg-gray-900 text-white px-4 py-2 rounded shadow">
//           {toast}
//         </div>
//       )}

//       <div className="flex flex-col md:flex-row gap-6">
//         {/* Floating card (left) */}
//         <aside
//           className="md:w-80 sticky top-24 self-start"
//           aria-hidden={false}
//         >
//           <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 shadow-lg transition-transform transform hover:-translate-y-1">
//             <div className="flex items-center gap-4">
//               <div className="w-16 h-16 rounded-full overflow-hidden border border-gray-200 relative">
//                 {session.user?.image ? (
//                   // next/image will work if next.config.js allows the host
//                   // fallback to <img> if you haven't configured next.config.js
//                   // (Image is nicer if you have domains set)
//                   // use width/height props for reliability
//                   <Image
//                     src={session.user.image}
//                     alt={session.user.name ?? "avatar"}
//                     width={64}
//                     height={64}
//                     className="object-cover"
//                   />
//                 ) : (
//                   <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
//                     {session.user?.name ? session.user.name.charAt(0) : "U"}
//                   </div>
//                 )}
//               </div>

//               <div className="flex-1">
//                 <div className="text-lg font-semibold text-gray-800">
//                   {name || session.user?.name}
//                 </div>
//                 <div className="text-xs text-gray-500 mt-1">Signed in with Google</div>
//               </div>
//             </div>

//             <div className="mt-6">
//               <button
//                 onClick={() => signOut()}
//                 className="w-full text-center bg-red-50 text-red-700 border border-red-100 px-3 py-2 rounded font-semibold hover:bg-red-100 transition"
//               >
//                 Sign out
//               </button>
//             </div>
//           </div>

//           {/* small helper card */}
//           <div className="mt-6 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-4 shadow-sm text-sm text-gray-600">
//             <strong className="block text-gray-800 mb-1">Tip</strong>
//             Select your exam boards first — subjects & sessions depend on them.
//           </div>
//         </aside>

//         {/* Main interactive panel */}
//         <section className="flex-1">
//           <form onSubmit={handleSave}>
//             <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 shadow-sm transition">
//               <div className="flex items-center justify-between">
//                 <h2 className="text-2xl font-bold text-gray-800">Profile</h2>
//                 <div className="text-sm text-gray-500">Make changes and Save</div>
//               </div>

//               {/* Boards selection */}
//               <div className="mt-6">
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Exam boards</label>
//                 <div className="flex flex-wrap gap-3">
//                   {BOARDS.map((b) => {
//                     const active = boards.includes(b.key);
//                     return (
//                       <button
//                         key={b.key}
//                         type="button"
//                         onClick={() => toggleBoard(b.key)}
//                         className={`px-3 py-1.5 rounded-full text-sm font-semibold transition shadow-sm focus:outline-none ${
//                           active
//                             ? "bg-blue-600 text-white shadow-md"
//                             : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//                         }`}
//                       >
//                         {b.label}
//                       </button>
//                     );
//                   })}
//                 </div>
//                 <p className="text-xs text-gray-400 mt-2">You can select multiple boards.</p>
//               </div>

//               {/* Level toggle and subject lists */}
//               <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div>
//                   <div className="flex items-center justify-between">
//                     <h3 className="text-lg font-semibold text-gray-800">Subjects — {activeLevel}</h3>
//                     <div className="flex items-center space-x-2">
//                       <button
//                         type="button"
//                         onClick={() => setActiveLevel("AS")}
//                         className={`px-3 py-1 rounded-md text-sm font-medium transition ${
//                           activeLevel === "AS"
//                             ? "bg-blue-50 text-blue-600"
//                             : "text-gray-600 hover:bg-gray-100"
//                         }`}
//                       >
//                         AS
//                       </button>
//                       <button
//                         type="button"
//                         onClick={() => setActiveLevel("A2")}
//                         className={`px-3 py-1 rounded-md text-sm font-medium transition ${
//                           activeLevel === "A2"
//                             ? "bg-blue-50 text-blue-600"
//                             : "text-gray-600 hover:bg-gray-100"
//                         }`}
//                       >
//                         A2
//                       </button>
//                     </div>
//                   </div>

//                   <p className="text-xs text-gray-400 mt-2">
//                     Choose subjects from the boards you selected.
//                   </p>

//                   <div className="mt-4">
//                     {boards.length === 0 ? (
//                       <div className="text-sm text-gray-500 italic">Select an exam board to show subjects.</div>
//                     ) : (
//                       <div className="flex flex-wrap gap-2">
//                         {availableSubjects.map((s) => {
//                           // subjectKey used in storage: `${board}::${code}::${name}`
//                           const key = `${s.board}::${s.code}::${s.name}`;
//                           const selected = isSubjectSelected(activeLevel, key);
//                           return (
//                             <button
//                               type="button"
//                               key={key}
//                               onClick={() => toggleSubject(activeLevel, s.board, s.code, s.name)}
//                               className={`px-3 py-1.5 rounded-full text-sm font-medium transition transform ${
//                                 selected
//                                   ? "bg-blue-600 text-white shadow-md scale-100"
//                                   : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//                               }`}
//                             >
//                               <div className="flex items-center gap-2">
//                                 <span className="font-mono text-xs opacity-80">{s.code}</span>
//                                 <span>{s.name}</span>
//                               </div>
//                             </button>
//                           );
//                         })}
//                       </div>
//                     )}

//                     {/* currently selected for level */}
//                     <div className="mt-4">
//                       <div className="text-xs text-gray-500 mb-2">Selected {activeLevel} subjects</div>
//                       <div className="flex flex-wrap gap-2">
//                         {(activeLevel === "AS" ? subjectsAS : subjectsA2).length === 0 ? (
//                           <div className="text-sm text-gray-400 italic">No subjects selected yet.</div>
//                         ) : (
//                           (activeLevel === "AS" ? subjectsAS : subjectsA2).map((k) => (
//                             <div
//                               key={k}
//                               className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-50 border border-gray-100 text-sm"
//                             >
//                               <span className="font-mono text-xs opacity-80">{k.split("::")[1]}</span>
//                               <span>{k.split("::")[2]}</span>
//                               <button
//                                 type="button"
//                                 onClick={() =>
//                                   activeLevel === "AS"
//                                     ? setSubjectsAS((prev) => prev.filter((p) => p !== k))
//                                     : setSubjectsA2((prev) => prev.filter((p) => p !== k))
//                                 }
//                                 className="ml-2 text-xs text-red-500 hover:underline"
//                               >
//                                 Remove
//                               </button>
//                             </div>
//                           ))
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* right column: exam session & preferences */}
//                 <div>
//                   <div>
//                     <h3 className="text-lg font-semibold text-gray-800">Exam Session</h3>
//                     <p className="text-xs text-gray-400 mt-1">Pick the session for your exams (board-specific).</p>

//                     <div className="mt-4">
//                       {boards.length === 0 ? (
//                         <div className="text-sm text-gray-500 italic">Select at least one board to choose sessions.</div>
//                       ) : (
//                         <>
//                           <label className="block text-sm text-gray-700 mb-2">Session (board-specific)</label>
//                           <select
//                             value={examSession}
//                             onChange={(e) => setExamSession(e.target.value)}
//                             className="w-full border rounded p-2 bg-white"
//                           >
//                             <option value="">-- Select session --</option>
//                             {sessionOptions.map((opt) => (
//                               <option key={opt.key} value={opt.key}>
//                                 {opt.label}
//                               </option>
//                             ))}
//                           </select>
//                           <p className="text-xs text-gray-400 mt-2">Sessions are listed per selected board (Board — Session).</p>
//                         </>
//                       )}
//                     </div>

//                     <div className="mt-6">
//                       <label className="flex items-center gap-3">
//                         <input
//                           type="checkbox"
//                           checked={receiveEmails}
//                           onChange={(e) => setReceiveEmails(e.target.checked)}
//                         />
//                         <span className="text-sm text-gray-700">Receive emails about new resources for selected subjects</span>
//                       </label>
//                     </div>
//                   </div>

//                   {/* currently chosen boards summary */}
//                   <div className="mt-6 bg-gray-50 border border-gray-100 rounded p-3 text-sm text-gray-700">
//                     <strong className="block text-gray-800 mb-2">Boards selected</strong>
//                     {boards.length === 0 ? (
//                       <div className="text-gray-400 italic">None</div>
//                     ) : (
//                       <div className="flex flex-wrap gap-2">
//                         {boards.map((b) => (
//                           <div key={b} className="px-2 py-1 rounded bg-white border text-xs">
//                             {b}
//                           </div>
//                         ))}
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>

//               {/* Save button */}
//               <div className="mt-6 flex items-center justify-end gap-4">
//                 <button
//                   type="button"
//                   onClick={() => {
//                     // reset (reload)
//                     if (!confirm("Reload saved profile from server? Unsaved changes will be lost.")) return;
//                     window.location.reload();
//                   }}
//                   className="px-3 py-2 rounded text-sm bg-gray-50 border hover:bg-gray-100"
//                 >
//                   Cancel
//                 </button>

//                 <button
//                   type="submit"
//                   disabled={saving}
//                   className={`px-4 py-2 rounded-md text-sm font-semibold transition ${
//                     saving ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
//                   } text-white`}
//                 >
//                   {saving ? "Saving..." : "Save Changes"}
//                 </button>
//               </div>
//             </div>
//           </form>
//         </section>
//       </div>
//     </main>
//   );
// }

// "use client";

// import React, { useEffect, useMemo, useState, FormEvent } from "react";
// import Image from "next/image";
// import { useSession, signOut } from "next-auth/react";
// import { motion, AnimatePresence } from "framer-motion";

// /* ---------------------------------- Types ---------------------------------- */

// type BoardKey = "CAIE" | "Edexcel" | "Edexcel-IAL" | "AQA" | "OCR" | "WJEC";

// /* -------------------------------- Constants -------------------------------- */

// const BOARDS: { key: BoardKey; label: string }[] = [
//   { key: "CAIE", label: "Cambridge (CAIE)" },
//   { key: "Edexcel", label: "Pearson Edexcel (UK)" },
//   { key: "Edexcel-IAL", label: "Edexcel IAL" },
//   { key: "AQA", label: "AQA" },
//   { key: "OCR", label: "OCR" },
//   { key: "WJEC", label: "WJEC/Eduqas" },
// ];

// const SUBJECTS_BY_BOARD: Record<BoardKey, { code: string; name: string }[]> = {
//   CAIE: [
//     { code: "9709", name: "Mathematics" },
//     { code: "9701", name: "Chemistry" },
//     { code: "9702", name: "Physics" },
//     { code: "9708", name: "Economics" },
//     { code: "9691", name: "Computer Science" },
//   ],
//   Edexcel: [
//     { code: "9MA0", name: "Mathematics" },
//     { code: "8CH0", name: "Chemistry" },
//     { code: "8PH0", name: "Physics" },
//     { code: "9EC0", name: "Economics" },
//     { code: "9PS0", name: "Psychology" },
//   ],
//   "Edexcel-IAL": [
//     { code: "IAL-MA", name: "Mathematics (IAL)" },
//     { code: "IAL-CH", name: "Chemistry (IAL)" },
//     { code: "IAL-PH", name: "Physics (IAL)" },
//     { code: "IAL-EC", name: "Economics (IAL)" },
//     { code: "IAL-CS", name: "Computer Science (IAL)" },
//   ],
//   AQA: [
//     { code: "7408", name: "Biology" },
//     { code: "7405", name: "Chemistry" },
//     { code: "7407", name: "Physics" },
//     { code: "7181", name: "Economics" },
//     { code: "7182", name: "Psychology" },
//   ],
//   OCR: [
//     { code: "H230", name: "Biology" },
//     { code: "H432", name: "Chemistry" },
//     { code: "H556", name: "Physics" },
//     { code: "H866", name: "Computer Science" },
//     { code: "H581", name: "History" },
//   ],
//   WJEC: [
//     { code: "WJEC-01", name: "Chemistry" },
//     { code: "WJEC-02", name: "Physics" },
//     { code: "WJEC-03", name: "Mathematics" },
//     { code: "WJEC-04", name: "Economics" },
//     { code: "WJEC-05", name: "Business" },
//   ],
// };

// const SESSIONS_BY_BOARD: Record<BoardKey, string[]> = {
//   CAIE: ["May/June", "Oct/Nov", "Mar"],
//   Edexcel: ["May/June", "Jan", "Oct/Nov"],
//   "Edexcel-IAL": ["May/June", "Oct/Nov", "Nov"],
//   AQA: ["May/June", "Jan", "Oct/Nov"],
//   OCR: ["May/June", "Jan", "Oct/Nov"],
//   WJEC: ["May/June", "Jan", "Oct/Nov"],
// };

// /* -------------------------------- Component -------------------------------- */

// interface UserPayload {
//   name: string;
//   email: string;
//   boards?: BoardKey[];
//   subjectsAS?: string[];
//   subjectsA2?: string[];
//   examSession?: string;
//   receiveEmails?: boolean;
// }

// export default function ProfilePage() {
//   const { data: session } = useSession();

//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [toast, setToast] = useState<string | null>(null);

//   const [boards, setBoards] = useState<BoardKey[]>([]);
//   const [subjectsAS, setSubjectsAS] = useState<string[]>([]);
//   const [subjectsA2, setSubjectsA2] = useState<string[]>([]);
//   const [activeLevel, setActiveLevel] = useState<"AS" | "A2">("AS");
//   const [examSession, setExamSession] = useState("");
//   const [receiveEmails, setReceiveEmails] = useState(false);
//   const [name, setName] = useState("");

//   const availableSubjects = useMemo(() => {
//     const combined = new Map<string, { board: BoardKey; code: string; name: string }>();
//     boards.forEach((b) => {
//       SUBJECTS_BY_BOARD[b]?.forEach((s) => {
//         const key = `${b}::${s.code}`;
//         if (!combined.has(key)) combined.set(key, { board: b, ...s });
//       });
//     });
//     return Array.from(combined.entries()).map(([key, val]) => ({ key, ...val }));
//   }, [boards]);

//   function showToast(msg: string, ms = 2500) {
//     setToast(msg);
//     setTimeout(() => setToast(null), ms);
//   }

//   useEffect(() => {
//     async function loadUser() {
//       if (!session?.user?.email) return setLoading(false);
//       try {
//         const res = await fetch("/api/user", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ email: session.user.email }),
//         });
//         if (!res.ok) throw new Error("Failed to load profile");
//         const data: UserPayload = await res.json();
//         setName(data.name ?? session.user.name ?? "");
//         setBoards(data.boards ?? []);
//         setSubjectsAS(data.subjectsAS ?? []);
//         setSubjectsA2(data.subjectsA2 ?? []);
//         setExamSession(data.examSession ?? "");
//         setReceiveEmails(data.receiveEmails ?? false);
//       } catch {
//         showToast("Could not load profile");
//       } finally {
//         setLoading(false);
//       }
//     }
//     loadUser();
//   }, [session?.user?.email]);

//   async function handleSave(e: FormEvent) {
//     e.preventDefault();
//     if (!session?.user?.email) return showToast("Sign in required");
//     try {
//       setSaving(true);
//       const payload: UserPayload = {
//         name,
//         email: session.user.email,
//         boards,
//         subjectsAS,
//         subjectsA2,
//         examSession,
//         receiveEmails,
//       };
//       const res = await fetch("/api/user/update", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });
//       if (!res.ok) throw new Error("Save failed");
//       showToast("Profile saved!");
//     } catch {
//       showToast("Error saving profile");
//     } finally {
//       setSaving(false);
//     }
//   }

//   const sessionOptions = useMemo(() => {
//     const opts: { key: string; label: string }[] = [];
//     boards.forEach((b) => {
//       SESSIONS_BY_BOARD[b]?.forEach((s) =>
//         opts.push({ key: `${b}::${s}`, label: `${b} — ${s}` })
//       );
//     });
//     return opts;
//   }, [boards]);

//   if (loading) {
//     return (
//       <div className="p-10 text-center text-gray-500">Loading your profile...</div>
//     );
//   }

//   if (!session?.user) {
//     return (
//       <div className="p-10 text-center text-gray-700">
//         Please sign in with Google first.
//       </div>
//     );
//   }

//   return (
//     <main className="max-w-7xl mx-auto p-6 md:p-10 flex flex-col md:flex-row gap-6">
//       {/* Toast */}
//       <AnimatePresence>
//         {toast && (
//           <motion.div
//             initial={{ opacity: 0, y: -10 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, y: -10 }}
//             className="fixed top-6 right-6 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-md"
//           >
//             {toast}
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* Floating user card */}
//       <motion.aside
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ delay: 0.1 }}
//         className="md:w-80 h-fit bg-white/80 backdrop-blur-md border border-gray-200 rounded-2xl p-6 shadow-md"
//       >
//         <div className="flex items-center gap-4">
//           <div className="relative w-16 h-16 rounded-full overflow-hidden border border-gray-200">
//             <Image
//               src={session.user.image || "/default-avatar.png"}
//               alt="Profile"
//               width={64}
//               height={64}
//               className="object-cover"
//             />
//           </div>
//           <div>
//             <h2 className="text-lg font-semibold text-gray-800">
//               {name || session.user.name}
//             </h2>
//             <p className="text-xs text-gray-500">Signed in with Google</p>
//           </div>
//         </div>

//         <button
//           onClick={() => signOut()}
//           className="mt-6 w-full bg-red-50 text-red-600 border border-red-100 py-2 rounded-lg font-semibold hover:bg-red-100 transition"
//         >
//           Sign Out
//         </button>

//         <div className="mt-6 bg-blue-50 border border-blue-100 text-blue-800 p-3 rounded-lg text-sm">
//           💡 Tip: Select your exam boards first — subjects & sessions depend on them.
//         </div>
//       </motion.aside>

//       {/* Main interactive panel */}
//       <motion.section
//         initial={{ opacity: 0, y: 15 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ delay: 0.15 }}
//         className="flex-1 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-sm p-6"
//       >
//         <form onSubmit={handleSave}>
//           <div className="flex items-center justify-between">
//             <h2 className="text-2xl font-bold text-gray-800">Profile Settings</h2>
//             <span className="text-sm text-gray-500">r/alevel account</span>
//           </div>

//           {/* Boards */}
//           <div className="mt-6">
//             <label className="text-sm font-medium text-gray-700 mb-2 block">
//               Exam Boards
//             </label>
//             <div className="flex flex-wrap gap-2">
//               {BOARDS.map((b) => {
//                 const active = boards.includes(b.key);
//                 return (
//                   <button
//                     key={b.key}
//                     type="button"
//                     onClick={() =>
//                       setBoards((prev) =>
//                         prev.includes(b.key)
//                           ? prev.filter((x) => x !== b.key)
//                           : [...prev, b.key]
//                       )
//                     }
//                     className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
//                       active
//                         ? "bg-blue-600 text-white shadow"
//                         : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//                     }`}
//                   >
//                     {b.label}
//                   </button>
//                 );
//               })}
//             </div>
//           </div>

//           {/* Subjects */}
//           <div className="mt-8">
//             <div className="flex justify-between items-center">
//               <h3 className="text-lg font-semibold text-gray-800">
//                 Subjects — {activeLevel}
//               </h3>
//               <div className="space-x-2">
//                 <button
//                   type="button"
//                   onClick={() => setActiveLevel("AS")}
//                   className={`px-3 py-1 rounded text-sm ${
//                     activeLevel === "AS"
//                       ? "bg-blue-100 text-blue-700"
//                       : "hover:bg-gray-100"
//                   }`}
//                 >
//                   AS
//                 </button>
//                 <button
//                   type="button"
//                   onClick={() => setActiveLevel("A2")}
//                   className={`px-3 py-1 rounded text-sm ${
//                     activeLevel === "A2"
//                       ? "bg-blue-100 text-blue-700"
//                       : "hover:bg-gray-100"
//                   }`}
//                 >
//                   A2
//                 </button>
//               </div>
//             </div>

//             {boards.length === 0 ? (
//               <p className="text-sm text-gray-500 mt-3 italic">
//                 Select a board first to choose subjects.
//               </p>
//             ) : (
//               <div className="flex flex-wrap gap-2 mt-3">
//                 {availableSubjects.map((s) => {
//                   const key = `${s.board}::${s.code}::${s.name}`;
//                   const selected =
//                     activeLevel === "AS"
//                       ? subjectsAS.includes(key)
//                       : subjectsA2.includes(key);
//                   return (
//                     <button
//                       type="button"
//                       key={key}
//                       onClick={() => {
//                         const updater =
//                           activeLevel === "AS" ? setSubjectsAS : setSubjectsA2;
//                         updater((prev) =>
//                           prev.includes(key)
//                             ? prev.filter((p) => p !== key)
//                             : [...prev, key]
//                         );
//                       }}
//                       className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
//                         selected
//                           ? "bg-blue-600 text-white"
//                           : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//                       }`}
//                     >
//                       <span className="font-mono text-xs">{s.code}</span> {s.name}
//                     </button>
//                   );
//                 })}
//               </div>
//             )}
//           </div>

//           {/* Exam Session */}
//           <div className="mt-8">
//             <h3 className="text-lg font-semibold text-gray-800">Exam Session</h3>
//             {boards.length === 0 ? (
//               <p className="text-sm text-gray-500 mt-2 italic">
//                 Select a board first to choose exam sessions.
//               </p>
//             ) : (
//               <select
//                 value={examSession}
//                 onChange={(e) => setExamSession(e.target.value)}
//                 className="mt-3 border rounded-md p-2 w-full bg-white"
//               >
//                 <option value="">-- Select Session --</option>
//                 {sessionOptions.map((opt) => (
//                   <option key={opt.key} value={opt.key}>
//                     {opt.label}
//                   </option>
//                 ))}
//               </select>
//             )}
//           </div>

//           {/* Preferences */}
//           <div className="mt-8 flex items-center gap-3">
//             <input
//               type="checkbox"
//               checked={receiveEmails}
//               onChange={(e) => setReceiveEmails(e.target.checked)}
//             />
//             <span className="text-sm text-gray-700">
//               Receive updates about new resources for your subjects
//             </span>
//           </div>

//           {/* Save */}
//           <div className="mt-8 flex justify-end gap-3">
//             <button
//               type="button"
//               onClick={() => window.location.reload()}
//               className="px-4 py-2 bg-gray-100 rounded-md text-sm hover:bg-gray-200"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               disabled={saving}
//               className={`px-4 py-2 rounded-md text-sm font-semibold text-white ${
//                 saving ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
//               }`}
//             >
//               {saving ? "Saving..." : "Save Changes"}
//             </button>
//           </div>
//         </form>
//       </motion.section>
//     </main>
//   );
// }

// "use client";

// import React, { useEffect, useMemo, useState, FormEvent } from "react";
// import Image from "next/image";
// import { useSession, signOut } from "next-auth/react";
// import { motion, AnimatePresence } from "framer-motion";

// /* ---------------------------------- Types ---------------------------------- */

// type BoardKey = "CAIE" | "Edexcel" | "Edexcel-IAL" | "AQA" | "OCR" | "WJEC";

// /* -------------------------------- Constants -------------------------------- */

// const BOARDS: { key: BoardKey; label: string }[] = [
//   { key: "CAIE", label: "Cambridge (CAIE)" },
//   { key: "Edexcel", label: "Pearson Edexcel (UK)" },
//   { key: "Edexcel-IAL", label: "Edexcel IAL" },
//   { key: "AQA", label: "AQA" },
//   { key: "OCR", label: "OCR" },
//   { key: "WJEC", label: "WJEC/Eduqas" },
// ];

// const SUBJECTS_BY_BOARD: Record<BoardKey, { code: string; name: string }[]> = {
//   CAIE: [
//     { code: "9709", name: "Mathematics" },
//     { code: "9701", name: "Chemistry" },
//     { code: "9702", name: "Physics" },
//     { code: "9708", name: "Economics" },
//     { code: "9691", name: "Computer Science" },
//   ],
//   Edexcel: [
//     { code: "9MA0", name: "Mathematics" },
//     { code: "8CH0", name: "Chemistry" },
//     { code: "8PH0", name: "Physics" },
//     { code: "9EC0", name: "Economics" },
//     { code: "9PS0", name: "Psychology" },
//   ],
//   "Edexcel-IAL": [
//     { code: "IAL-MA", name: "Mathematics (IAL)" },
//     { code: "IAL-CH", name: "Chemistry (IAL)" },
//     { code: "IAL-PH", name: "Physics (IAL)" },
//     { code: "IAL-EC", name: "Economics (IAL)" },
//     { code: "IAL-CS", name: "Computer Science (IAL)" },
//   ],
//   AQA: [
//     { code: "7408", name: "Biology" },
//     { code: "7405", name: "Chemistry" },
//     { code: "7407", name: "Physics" },
//     { code: "7181", name: "Economics" },
//     { code: "7182", name: "Psychology" },
//   ],
//   OCR: [
//     { code: "H230", name: "Biology" },
//     { code: "H432", name: "Chemistry" },
//     { code: "H556", name: "Physics" },
//     { code: "H866", name: "Computer Science" },
//     { code: "H581", name: "History" },
//   ],
//   WJEC: [
//     { code: "WJEC-01", name: "Chemistry" },
//     { code: "WJEC-02", name: "Physics" },
//     { code: "WJEC-03", name: "Mathematics" },
//     { code: "WJEC-04", name: "Economics" },
//     { code: "WJEC-05", name: "Business" },
//   ],
// };

// const SESSIONS_BY_BOARD: Record<BoardKey, string[]> = {
//   CAIE: ["May/June", "Oct/Nov", "Mar"],
//   Edexcel: ["May/June", "Jan", "Oct/Nov"],
//   "Edexcel-IAL": ["May/June", "Oct/Nov", "Nov"],
//   AQA: ["May/June", "Jan", "Oct/Nov"],
//   OCR: ["May/June", "Jan", "Oct/Nov"],
//   WJEC: ["May/June", "Jan", "Oct/Nov"],
// };

// /* -------------------------------- Component -------------------------------- */

// interface UserPayload {
//   name: string;
//   email: string;
//   boards?: BoardKey[];
//   subjectsAS?: string[];
//   subjectsA2?: string[];
//   examSession?: string[]; // ✅ changed to array
//   receiveEmails?: boolean;
// }

// export default function ProfilePage() {
//   const { data: session } = useSession();

//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [toast, setToast] = useState<string | null>(null);

//   const [boards, setBoards] = useState<BoardKey[]>([]);
//   const [subjectsAS, setSubjectsAS] = useState<string[]>([]);
//   const [subjectsA2, setSubjectsA2] = useState<string[]>([]);
//   const [activeLevel, setActiveLevel] = useState<"AS" | "A2">("AS");
//   const [examSession, setExamSession] = useState<string[]>([]); // ✅ multiple sessions
//   const [receiveEmails, setReceiveEmails] = useState(false);
//   const [name, setName] = useState("");

//   const availableSubjects = useMemo(() => {
//     const combined = new Map<string, { board: BoardKey; code: string; name: string }>();
//     boards.forEach((b) => {
//       SUBJECTS_BY_BOARD[b]?.forEach((s) => {
//         const key = `${b}::${s.code}`;
//         if (!combined.has(key)) combined.set(key, { board: b, ...s });
//       });
//     });
//     return Array.from(combined.entries()).map(([key, val]) => ({ key, ...val }));
//   }, [boards]);

//   function showToast(msg: string, ms = 2500) {
//     setToast(msg);
//     setTimeout(() => setToast(null), ms);
//   }

//   /* ---------------------------- Load user data ---------------------------- */
//   useEffect(() => {
//     async function loadUser() {
//       if (!session?.user?.email) return setLoading(false);
//       try {
//         const res = await fetch("/api/user", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ email: session.user.email }),
//         });
//         if (!res.ok) throw new Error("Failed to load profile");
//         const data: UserPayload = await res.json();
//         setName(data.name ?? session.user.name ?? "");
//         setBoards(data.boards ?? []);
//         setSubjectsAS(data.subjectsAS ?? []);
//         setSubjectsA2(data.subjectsA2 ?? []);
//         setExamSession(data.examSession ?? []); // ✅ fix reload issue
//         setReceiveEmails(data.receiveEmails ?? false);
//       } catch {
//         showToast("Could not load profile");
//       } finally {
//         setLoading(false);
//       }
//     }
//     loadUser();
//   }, [session?.user?.email]);

//   /* ---------------------------- Save user data ---------------------------- */
//   async function handleSave(e: FormEvent) {
//     e.preventDefault();
//     if (!session?.user?.email) return showToast("Sign in required");
//     try {
//       setSaving(true);
//       const payload: UserPayload = {
//         name,
//         email: session.user.email,
//         boards,
//         subjectsAS,
//         subjectsA2,
//         examSession, // ✅ save multiple sessions
//         receiveEmails,
//       };
//       const res = await fetch("/api/user/update", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });
//       if (!res.ok) throw new Error("Save failed");
//       showToast("Profile saved!");
//     } catch {
//       showToast("Error saving profile");
//     } finally {
//       setSaving(false);
//     }
//   }

//   /* ----------------------------- Session Options ----------------------------- */
//   const sessionOptions = useMemo(() => {
//     const opts: { key: string; label: string }[] = [];
//     boards.forEach((b) => {
//       SESSIONS_BY_BOARD[b]?.forEach((s) =>
//         opts.push({ key: `${b}::${s}`, label: `${b} — ${s}` })
//       );
//     });
//     return opts;
//   }, [boards]);

//   /* ------------------------------- Loading ------------------------------- */
//   if (loading) {
//     return <div className="p-10 text-center text-gray-500">Loading your profile...</div>;
//   }

//   if (!session?.user) {
//     return <div className="p-10 text-center text-gray-700">Please sign in with Google first.</div>;
//   }

//   /* ------------------------------- Render ------------------------------- */
//   return (
//     <main className="max-w-7xl mx-auto p-6 md:p-10 flex flex-col md:flex-row gap-6">
//       {/* Toast */}
//       <AnimatePresence>
//         {toast && (
//           <motion.div
//             initial={{ opacity: 0, y: -10 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, y: -10 }}
//             className="fixed top-6 right-6 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-md"
//           >
//             {toast}
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* Sidebar */}
//       <motion.aside
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ delay: 0.1 }}
//         className="md:w-80 h-fit bg-white/80 backdrop-blur-md border border-gray-200 rounded-2xl p-6 shadow-md"
//       >
//         <div className="flex items-center gap-4">
//           <div className="relative w-16 h-16 rounded-full overflow-hidden border border-gray-200">
//             <Image
//               src={session.user.image || "/default-avatar.png"}
//               alt="Profile"
//               width={64}
//               height={64}
//               className="object-cover"
//             />
//           </div>
//           <div>
//             <h2 className="text-lg font-semibold text-gray-800">
//               {name || session.user.name}
//             </h2>
//             <p className="text-xs text-gray-500">Signed in with Google</p>
//           </div>
//         </div>

//         <button
//           onClick={() => signOut()}
//           className="mt-6 w-full bg-red-50 text-red-600 border border-red-100 py-2 rounded-lg font-semibold hover:bg-red-100 transition"
//         >
//           Sign Out
//         </button>

//         <div className="mt-6 bg-blue-50 border border-blue-100 text-blue-800 p-3 rounded-lg text-sm">
//           💡 Tip: Select your exam boards first — subjects & sessions depend on them.
//         </div>
//       </motion.aside>

//       {/* Main Section */}
//       <motion.section
//         initial={{ opacity: 0, y: 15 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ delay: 0.15 }}
//         className="flex-1 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-sm p-6"
//       >
//         <form onSubmit={handleSave}>
//           <div className="flex items-center justify-between">
//             <h2 className="text-2xl font-bold text-gray-800">Profile Settings</h2>
//             <span className="text-sm text-gray-500">r/alevel account</span>
//           </div>

//           {/* Boards */}
//           <div className="mt-6">
//             <label className="text-sm font-medium text-gray-700 mb-2 block">Exam Boards</label>
//             <div className="flex flex-wrap gap-2">
//               {BOARDS.map((b) => {
//                 const active = boards.includes(b.key);
//                 return (
//                   <button
//                     key={b.key}
//                     type="button"
//                     onClick={() =>
//                       setBoards((prev) =>
//                         prev.includes(b.key)
//                           ? prev.filter((x) => x !== b.key)
//                           : [...prev, b.key]
//                       )
//                     }
//                     className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
//                       active
//                         ? "bg-blue-600 text-white shadow"
//                         : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//                     }`}
//                   >
//                     {b.label}
//                   </button>
//                 );
//               })}
//             </div>
//           </div>

//           {/* Subjects */}
//           <div className="mt-8">
//             <div className="flex justify-between items-center">
//               <h3 className="text-lg font-semibold text-gray-800">
//                 Subjects — {activeLevel}
//               </h3>
//               <div className="space-x-2">
//                 <button
//                   type="button"
//                   onClick={() => setActiveLevel("AS")}
//                   className={`px-3 py-1 rounded text-sm ${
//                     activeLevel === "AS"
//                       ? "bg-blue-100 text-blue-700"
//                       : "hover:bg-gray-100"
//                   }`}
//                 >
//                   AS
//                 </button>
//                 <button
//                   type="button"
//                   onClick={() => setActiveLevel("A2")}
//                   className={`px-3 py-1 rounded text-sm ${
//                     activeLevel === "A2"
//                       ? "bg-blue-100 text-blue-700"
//                       : "hover:bg-gray-100"
//                   }`}
//                 >
//                   A2
//                 </button>
//               </div>
//             </div>

//             {boards.length === 0 ? (
//               <p className="text-sm text-gray-500 mt-3 italic">
//                 Select a board first to choose subjects.
//               </p>
//             ) : (
//               <div className="flex flex-wrap gap-2 mt-3">
//                 {availableSubjects.map((s) => {
//                   const key = `${s.board}::${s.code}::${s.name}`;
//                   const selected =
//                     activeLevel === "AS"
//                       ? subjectsAS.includes(key)
//                       : subjectsA2.includes(key);
//                   return (
//                     <button
//                       type="button"
//                       key={key}
//                       onClick={() => {
//                         const updater =
//                           activeLevel === "AS" ? setSubjectsAS : setSubjectsA2;
//                         updater((prev) =>
//                           prev.includes(key)
//                             ? prev.filter((p) => p !== key)
//                             : [...prev, key]
//                         );
//                       }}
//                       className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
//                         selected
//                           ? "bg-blue-600 text-white"
//                           : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//                       }`}
//                     >
//                       <span className="font-mono text-xs">{s.code}</span> {s.name}
//                     </button>
//                   );
//                 })}
//               </div>
//             )}
//           </div>

//           {/* ✅ Multiple Exam Sessions */}
//           <div className="mt-8">
//             <h3 className="text-lg font-semibold text-gray-800">Exam Sessions</h3>
//             {boards.length === 0 ? (
//               <p className="text-sm text-gray-500 mt-2 italic">
//                 Select a board first to choose exam sessions.
//               </p>
//             ) : (
//               <div className="flex flex-wrap gap-2 mt-3">
//                 {sessionOptions.map((opt) => {
//                   const selected = examSession.includes(opt.key);
//                   return (
//                     <button
//                       key={opt.key}
//                       type="button"
//                       onClick={() =>
//                         setExamSession((prev) =>
//                           selected
//                             ? prev.filter((s) => s !== opt.key)
//                             : [...prev, opt.key]
//                         )
//                       }
//                       className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
//                         selected
//                           ? "bg-blue-600 text-white"
//                           : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//                       }`}
//                     >
//                       {opt.label}
//                     </button>
//                   );
//                 })}
//               </div>
//             )}
//           </div>

//           {/* Preferences */}
//           <div className="mt-8 flex items-center gap-3">
//             <input
//               type="checkbox"
//               checked={receiveEmails}
//               onChange={(e) => setReceiveEmails(e.target.checked)}
//             />
//             <span className="text-sm text-gray-700">
//               Receive updates about new resources for your subjects
//             </span>
//           </div>

//           {/* Save */}
//           <div className="mt-8 flex justify-end gap-3">
//             <button
//               type="button"
//               onClick={() => window.location.reload()}
//               className="px-4 py-2 bg-gray-100 rounded-md text-sm hover:bg-gray-200"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               disabled={saving}
//               className={`px-4 py-2 rounded-md text-sm font-semibold text-white ${
//                 saving ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
//               }`}
//             >
//               {saving ? "Saving..." : "Save Changes"}
//             </button>
//           </div>
//         </form>
//       </motion.section>
//     </main>
//   );
// }

// "use client";

// import React, { useEffect, useMemo, useState, FormEvent } from "react";
// import Image from "next/image";
// import { useSession, signOut } from "next-auth/react";
// import { motion, AnimatePresence } from "framer-motion";

// /* ---------------------------------- Types ---------------------------------- */
// type BoardKey = "CAIE" | "Edexcel" | "Edexcel_IAL" | "AQA" | "OCR" | "WJEC";

// /* -------------------------------- Constants -------------------------------- */
// const BOARDS: { key: BoardKey; label: string }[] = [
//   { key: "CAIE", label: "Cambridge (CAIE)" },
//   { key: "Edexcel", label: "Pearson Edexcel (UK)" },
//   { key: "Edexcel_IAL", label: "Edexcel IAL" },
//   { key: "AQA", label: "AQA" },
//   { key: "OCR", label: "OCR" },
//   { key: "WJEC", label: "WJEC/Eduqas" },
// ];

// const SUBJECTS_BY_BOARD: Record<BoardKey, { code: string; name: string }[]> = {
//   CAIE: [
//     { code: "9709", name: "Mathematics" },
//     { code: "9701", name: "Chemistry" },
//     { code: "9702", name: "Physics" },
//     { code: "9708", name: "Economics" },
//     { code: "9691", name: "Computer Science" },
//   ],
//   Edexcel: [
//     { code: "9MA0", name: "Mathematics" },
//     { code: "8CH0", name: "Chemistry" },
//     { code: "8PH0", name: "Physics" },
//     { code: "9EC0", name: "Economics" },
//     { code: "9PS0", name: "Psychology" },
//   ],
//   Edexcel_IAL: [
//     { code: "IAL-MA", name: "Mathematics (IAL)" },
//     { code: "IAL-CH", name: "Chemistry (IAL)" },
//     { code: "IAL-PH", name: "Physics (IAL)" },
//     { code: "IAL-EC", name: "Economics (IAL)" },
//     { code: "IAL-CS", name: "Computer Science (IAL)" },
//   ],
//   AQA: [
//     { code: "7408", name: "Biology" },
//     { code: "7405", name: "Chemistry" },
//     { code: "7407", name: "Physics" },
//     { code: "7181", name: "Economics" },
//     { code: "7182", name: "Psychology" },
//   ],
//   OCR: [
//     { code: "H230", name: "Biology" },
//     { code: "H432", name: "Chemistry" },
//     { code: "H556", name: "Physics" },
//     { code: "H866", name: "Computer Science" },
//     { code: "H581", name: "History" },
//   ],
//   WJEC: [
//     { code: "WJEC-01", name: "Chemistry" },
//     { code: "WJEC-02", name: "Physics" },
//     { code: "WJEC-03", name: "Mathematics" },
//     { code: "WJEC-04", name: "Economics" },
//     { code: "WJEC-05", name: "Business" },
//   ],
// };

// const SESSIONS_BY_BOARD: Record<BoardKey, string[]> = {
//   CAIE: ["Feb/Mar 2026","May/June 2026", "Oct/Nov 2026", "Feb/Mar 2027", "May/June 2027", "Oct/Nov 2027", "2028"],
//   Edexcel: ["May/June", "Jan", "Oct/Nov"],
//   Edexcel_IAL: ["May/June", "Oct/Nov", "Nov"],
//   AQA: ["May/June", "Jan", "Oct/Nov"],
//   OCR: ["May/June", "Jan", "Oct/Nov"],
//   WJEC: ["May/June", "Jan", "Oct/Nov"],
// };

// /* -------------------------------- Component -------------------------------- */
// interface UserPayload {
//   name: string;
//   email: string;
//   boards?: BoardKey[];
//   subjectsAS?: string[];
//   subjectsA2?: string[];
//   examSession?: string[];
//   receiveEmails?: boolean;
// }

// /* -------------------------- Normalization Helpers -------------------------- */
// function findBoardForCode(code: string): { board: BoardKey; code: string; name: string } | null {
//   for (const b of Object.keys(SUBJECTS_BY_BOARD) as BoardKey[]) {
//     const found = SUBJECTS_BY_BOARD[b].find((s) => s.code === code || s.name === code);
//     if (found) return { board: b, code: found.code, name: found.name };
//   }
//   return null;
// }

// function normalizeSubjects(arr?: string[] | null) {
//   if (!arr) return [];
//   const out: string[] = [];
//   arr.forEach((item) => {
//     if (!item) return;
//     if (item.includes("::")) return out.push(item);
//     const dashMatch = item.match(/^(.+?)\s*[-—]\s*(.+)$/);
//     if (dashMatch) {
//       const code = dashMatch[1].trim();
//       const name = dashMatch[2].trim();
//       const found = findBoardForCode(code);
//       out.push(found ? `${found.board}::${found.code}::${found.name}` : `CAIE::${code}::${name}`);
//     } else {
//       const codeOnly = item.trim();
//       const found = findBoardForCode(codeOnly);
//       out.push(found ? `${found.board}::${found.code}::${found.name}` : codeOnly);
//     }
//   });
//   return out;
// }

// /* -------------------------------- Component -------------------------------- */
// export default function ProfilePage() {
//   const { data: session } = useSession();
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [toast, setToast] = useState<string | null>(null);

//   const [boards, setBoards] = useState<BoardKey[]>([]);
//   const [subjectsAS, setSubjectsAS] = useState<string[]>([]);
//   const [subjectsA2, setSubjectsA2] = useState<string[]>([]);
//   const [examSession, setExamSession] = useState<string[]>([]);
//   const [activeLevel, setActiveLevel] = useState<"AS" | "A2">("AS");
//   const [receiveEmails, setReceiveEmails] = useState(false);
//   const [name, setName] = useState("");

//   const availableSubjects = useMemo(() => {
//     const combined = new Map<string, { board: BoardKey; code: string; name: string }>();
//     boards.forEach((b) =>
//       SUBJECTS_BY_BOARD[b]?.forEach((s) => {
//         const key = `${b}::${s.code}`;
//         if (!combined.has(key)) combined.set(key, { board: b, ...s });
//       })
//     );
//     return Array.from(combined.entries()).map(([key, val]) => ({ key, ...val }));
//   }, [boards]);

//   const sessionOptions = useMemo(() => {
//     const opts: { key: string; label: string }[] = [];
//     boards.forEach((b) => {
//       SESSIONS_BY_BOARD[b]?.forEach((s) =>
//         opts.push({ key: `${b}::${s}`, label: `${b} — ${s}` })
//       );
//     });
//     return opts;
//   }, [boards]);

//   function showToast(msg: string, ms = 2500) {
//     setToast(msg);
//     setTimeout(() => setToast(null), ms);
//   }

//   /* ---------------------------- Load user data ---------------------------- */
// /* ---------------------------- Load user data ---------------------------- */
// useEffect(() => {
//   async function loadUser() {
//     if (!session?.user?.email) return setLoading(false);
//     try {
//       const res = await fetch("/api/user", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email: session.user.email }),
//       });
//       if (!res.ok) throw new Error("Failed to load profile");

//       const data: any = await res.json();

//       const normalizedAS = normalizeSubjects(data.subjectsAS);
//       const normalizedA2 = normalizeSubjects(data.subjectsA2);
//       const normalizedSessions = Array.isArray(data.examSession)
//         ? data.examSession
//         : [data.examSession].filter(Boolean);

//       // ✅ Auto-detect boards from saved subjects or sessions
//       const detectedBoards = new Set<BoardKey>();
//       [...normalizedAS, ...normalizedA2, ...normalizedSessions].forEach((item) => {
//         const match = (item || "").split("::")[0] as BoardKey;
//         if (BOARDS.some((b) => b.key === match)) detectedBoards.add(match);
//       });

//       setBoards(Array.from(detectedBoards));
//       setSubjectsAS(normalizedAS);
//       setSubjectsA2(normalizedA2);
//       setExamSession(normalizedSessions);
//       setReceiveEmails(!!data.receiveEmails);
//       setName(data.name ?? session.user.name ?? "");
//     } catch (err) {
//       console.error(err);
//       showToast("Could not load profile");
//     } finally {
//       setLoading(false);
//     }
//   }
//   loadUser();
// }, [session?.user?.email]);
//   /* ---------------------------- Save user data ---------------------------- */
//   async function handleSave(e: FormEvent) {
//     e.preventDefault();
//     if (!session?.user?.email) return showToast("Sign in required");
//     try {
//       setSaving(true);
//       const payload: UserPayload = {
//         name,
//         email: session.user.email,
//         boards,
//         subjectsAS,
//         subjectsA2,
//         examSession,
//         receiveEmails,
//       };
//       const res = await fetch("/api/user/update", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });
//       if (!res.ok) throw new Error("Save failed");
//       showToast("Profile saved!");
//     } catch {
//       showToast("Error saving profile");
//     } finally {
//       setSaving(false);
//     }
//   }

//   /* ------------------------------- Render ------------------------------- */
//   if (loading) return <div className="p-10 text-center text-gray-500">Loading your profile...</div>;
//   if (!session?.user)
//     return <div className="p-10 text-center text-gray-700">Please sign in with Google first.</div>;

//   return (
//     <main className="max-w-7xl mx-auto p-6 md:p-10 flex flex-col md:flex-row gap-6">
//       {/* Toast */}
//       <AnimatePresence>
//         {toast && (
//           <motion.div
//             initial={{ opacity: 0, y: -10 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, y: -10 }}
//             className="fixed top-6 right-6 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-md"
//           >
//             {toast}
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* Sidebar */}
//       <motion.aside
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ delay: 0.1 }}
//         className="md:w-80 h-fit bg-white/80 backdrop-blur-md border border-gray-200 rounded-2xl p-6 shadow-md"
//       >
//         <div className="flex items-center gap-4">
//           <div className="relative w-16 h-16 rounded-full overflow-hidden border border-gray-200">
//             <Image
//               src={session.user.image || "/default-avatar.png"}
//               alt="Profile"
//               width={64}
//               height={64}
//               className="object-cover"
//             />
//           </div>
//           <div>
//             <h2 className="text-lg font-semibold text-gray-800">{name || session.user.name}</h2>
//             <p className="text-xs text-gray-500">Signed in with Google</p>
//           </div>
//         </div>

//         <button
//           onClick={() => signOut()}
//           className="mt-6 w-full bg-red-50 text-red-600 border border-red-100 py-2 rounded-lg font-semibold hover:bg-red-100 transition"
//         >
//           Sign Out
//         </button>

//         <div className="mt-6 bg-blue-50 border border-blue-100 text-blue-800 p-3 rounded-lg text-sm">
//           💡 Tip: Select your exam boards first — subjects & sessions depend on them.
//         </div>
//       </motion.aside>

//       {/* Main Section */}
//       <motion.section
//         initial={{ opacity: 0, y: 15 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ delay: 0.15 }}
//         className="flex-1 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-sm p-6"
//       >
//         <form onSubmit={handleSave}>
//           <div className="flex items-center justify-between">
//             <h2 className="text-2xl font-bold text-gray-800">Profile Settings</h2>
//             <span className="text-sm text-gray-500">r/alevel account</span>
//           </div>

//           {/* Boards */}
//           <div className="mt-6">
//             <label className="text-sm font-medium text-gray-700 mb-2 block">Exam Boards</label>
//             <div className="flex flex-wrap gap-2">
//               {BOARDS.map((b) => {
//                 const active = boards.includes(b.key);
//                 return (
//                   <button
//                     key={b.key}
//                     type="button"
//                     onClick={() =>
//                       setBoards((prev) =>
//                         prev.includes(b.key)
//                           ? prev.filter((x) => x !== b.key)
//                           : [...prev, b.key]
//                       )
//                     }
//                     className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
//                       active ? "bg-blue-600 text-white shadow" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//                     }`}
//                   >
//                     {b.label}
//                   </button>
//                 );
//               })}
//             </div>
//           </div>

//           {/* Subjects */}
//           <div className="mt-8">
//             <div className="flex justify-between items-center">
//               <h3 className="text-lg font-semibold text-gray-800">Subjects — {activeLevel}</h3>
//               <div className="space-x-2">
//                 {["AS", "A2"].map((lvl) => (
//                   <button
//                     key={lvl}
//                     type="button"
//                     onClick={() => setActiveLevel(lvl as "AS" | "A2")}
//                     className={`px-3 py-1 rounded text-sm ${
//                       activeLevel === lvl ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100"
//                     }`}
//                   >
//                     {lvl}
//                   </button>
//                 ))}
//               </div>
//             </div>

//             {boards.length === 0 ? (
//               <p className="text-sm text-gray-500 mt-3 italic">
//                 Select a board first to choose subjects.
//               </p>
//             ) : (
//               <div className="flex flex-wrap gap-2 mt-3">
//                 {availableSubjects.map((s) => {
//                   const key = `${s.board}::${s.code}::${s.name}`;
//                   const selected =
//                     activeLevel === "AS" ? subjectsAS.includes(key) : subjectsA2.includes(key);
//                   return (
//                     <button
//                       type="button"
//                       key={key}
//                       onClick={() => {
//                         const updater = activeLevel === "AS" ? setSubjectsAS : setSubjectsA2;
//                         updater((prev) =>
//                           prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key]
//                         );
//                       }}
//                       className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
//                         selected ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//                       }`}
//                     >
//                       <span className="font-mono text-xs">{s.code}</span> {s.name}
//                     </button>
//                   );
//                 })}
//               </div>
//             )}
//           </div>

//           {/* Exam Sessions */}
//           <div className="mt-8">
//             <h3 className="text-lg font-semibold text-gray-800">Exam Sessions</h3>
//             {boards.length === 0 ? (
//               <p className="text-sm text-gray-500 mt-2 italic">
//                 Select a board first to choose exam sessions.
//               </p>
//             ) : (
//               <div className="flex flex-wrap gap-2 mt-3">
//                 {sessionOptions.map((opt) => {
//                   const selected = examSession.includes(opt.key);
//                   return (
//                     <button
//                       key={opt.key}
//                       type="button"
//                       onClick={() =>
//                         setExamSession((prev) =>
//                           selected ? prev.filter((s) => s !== opt.key) : [...prev, opt.key]
//                         )
//                       }
//                       className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
//                         selected ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//                       }`}
//                     >
//                       {opt.label}
//                     </button>
//                   );
//                 })}
//               </div>
//             )}
//           </div>

//           {/* Preferences */}
//           <div className="mt-8 flex items-center gap-3">
//             <input
//               type="checkbox"
//               checked={receiveEmails}
//               onChange={(e) => setReceiveEmails(e.target.checked)}
//             />
//             <span className="text-sm text-gray-700">
//               Receive updates about new resources for your subjects
//             </span>
//           </div>

//           {/* Save */}
//           <div className="mt-8 flex justify-end gap-3">
//             <button
//               type="button"
//               onClick={() => window.location.reload()}
//               className="px-4 py-2 bg-gray-100 rounded-md text-sm hover:bg-gray-200"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               disabled={saving}
//               className={`px-4 py-2 rounded-md text-sm font-semibold text-white ${
//                 saving ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
//               }`}
//             >
//               {saving ? "Saving..." : "Save Changes"}
//             </button>
//           </div>
//         </form>

//       </motion.section>
//     </main>
//   );
// }

// "use client";

// import { AnimatePresence, motion } from "framer-motion";
// import { signOut, useSession } from "next-auth/react";
// import Image from "next/image";
// import { FormEvent, useEffect, useMemo, useState } from "react";

// /* ---------------------------------- Types ---------------------------------- */
// type BoardKey = "CAIE" | "Edexcel" | "Edexcel_IAL" | "AQA" | "OCR" | "WJEC";

// /* -------------------------------- Constants -------------------------------- */
// const BOARDS: { key: BoardKey; label: string }[] = [
//   { key: "CAIE", label: "Cambridge (CAIE)" },
//   { key: "Edexcel", label: "Pearson Edexcel (UK)" },
//   { key: "Edexcel_IAL", label: "Edexcel IAL" },
//   { key: "AQA", label: "AQA" },
//   { key: "OCR", label: "OCR" },
//   { key: "WJEC", label: "WJEC/Eduqas" },
// ];

// const SUBJECTS_BY_BOARD: Record<BoardKey, { code: string; name: string }[]> = {
//   CAIE: [
//     { code: "9709", name: "Mathematics" },
//     { code: "9701", name: "Chemistry" },
//     { code: "9702", name: "Physics" },
//     { code: "9708", name: "Economics" },
//     { code: "9691", name: "Computing / Computer Science" },
//     { code: "9700", name: "Biology" },
//     { code: "9609", name: "Business Studies" },
//     { code: "9706", name: "Accounting" },
//     { code: "9704", name: "Art & Design" },
//     { code: "9696", name: "Geography" },
//     { code: "9695", name: "Literature in English" },
//     { code: "9699", name: "Sociology" },
//     { code: "9990", name: "Psychology" },
//     { code: "9693", name: "Marine Science" },
//     { code: "9703", name: "Music" },
//     { code: "9705", name: "Design & Technology" },
//     { code: "9713", name: "Applied ICT" },
//     { code: "9680", name: "Arabic" },
//     { code: "9687", name: "Hindi" },
//     { code: "9715", name: "Chinese" },
//     { code: "9716", name: "French" },
//     { code: "9717", name: "German" },
//     { code: "9719", name: "Spanish" },
//     { code: "9231", name: "Further Mathematics" },
//     { code: "9626", name: "Information Technology" },
//     { code: "9698", name: "Psychology (alternate code)" },
//     { code: "9395", name: "Travel & Tourism" },
//     { code: "9093", name: "English Language" },
//     { code: "8291", name: "Environmental Management" },
//     { code: "9608", name: "Computer Science (older code)" },
//     { code: "9676", name: "Urdu" },
//     { code: "9689", name: "Tamil" },
//   ],
//   Edexcel: [
//     { code: "9MA0", name: "Mathematics" },
//     { code: "8CH0/9CH0", name: "Chemistry" },
//     { code: "8PH0/9PH0", name: "Physics" },
//     { code: "9EC0", name: "Economics" },
//     { code: "9PS0", name: "Psychology" },
//     { code: "9BI0", name: "Biology" },
//     { code: "9BS0", name: "Business" },
//     { code: "9FM0", name: "Further Mathematics" },
//     { code: "9EN0", name: "English Language" },
//     { code: "9ET0", name: "English Literature" },
//     { code: "9RS0", name: "Religious Studies" },
//     { code: "9HI0", name: "History" },
//     { code: "9GE0", name: "Geography" },
//     { code: "9PL0", name: "Politics" },
//     { code: "9PE0", name: "Physical Education" },
//     { code: "9CS0", name: "Computer Science" },
//     { code: "9DT0", name: "Design and Technology" },
//     { code: "9FA0", name: "Fine Art" },
//     { code: "9PY0", name: "Photography" },
//     { code: "9MU0", name: "Music" },
//     { code: "9DR0", name: "Drama and Theatre" },
//     { code: "9FD0", name: "Fashion and Textiles" },
//     { code: "9AD0", name: "Art, Craft and Design" },
//     { code: "9SP0", name: "Spanish" },
//     { code: "9FR0", name: "French" },
//     { code: "9GN0", name: "German" },
//     { code: "9RU0", name: "Russian" },
//     { code: "9PLH0", name: "Politics (Newer Code Variant)" },
//     { code: "9TD0", name: "Technology (Design Engineering)" },
//     { code: "9H0", name: "History (alt code ranges)" }, // optional, history has variants
//     { code: "9CL0", name: "Classical Civilisation" },
//     { code: "9LT0", name: "Latin" },
//     { code: "9G10", name: "Geography (fieldwork variant)" },
//     { code: "9PH0W", name: "Physics (endorsement/variant)" },
//   ],
//   Edexcel_IAL: [
//     { code: "XMA01", name: "Mathematics (AS)" },
//     { code: "YMA01", name: "Mathematics (A Level)" },

//     { code: "XFM01", name: "Further Mathematics (AS)" },
//     { code: "YFM01", name: "Further Mathematics (A Level)" },

//     { code: "XPH11", name: "Physics (AS)" },
//     { code: "YPH11", name: "Physics (A Level)" },

//     { code: "XCH11", name: "Chemistry (AS)" },
//     { code: "YCH11", name: "Chemistry (A Level)" },

//     { code: "XBI11", name: "Biology (AS)" },
//     { code: "YBI11", name: "Biology (A Level)" },

//     { code: "XEC11", name: "Economics (AS)" },
//     { code: "YEC11", name: "Economics (A Level)" },

//     { code: "XBS11", name: "Business Studies (AS)" },
//     { code: "YBS11", name: "Business Studies (A Level)" },

//     { code: "XAC11", name: "Accounting (AS)" },
//     { code: "YAC11", name: "Accounting (A Level)" },

//     { code: "XCS11", name: "Computer Science (AS)" },
//     { code: "YCS11", name: "Computer Science (A Level)" },

//     { code: "XIT11", name: "Information Technology (AS)" },
//     { code: "YIT11", name: "Information Technology (A Level)" },

//     { code: "XPS11", name: "Psychology (AS)" },
//     { code: "YPS11", name: "Psychology (A Level)" },

//     { code: "XHI11", name: "History (AS)" },
//     { code: "YHI11", name: "History (A Level)" },

//     { code: "XGE11", name: "Geography (AS)" },
//     { code: "YGE11", name: "Geography (A Level)" },

//     { code: "XEN01", name: "English Language (AS)" },
//     { code: "YEN01", name: "English Language (A Level)" },

//     { code: "XET01", name: "English Literature (AS)" },
//     { code: "YET01", name: "English Literature (A Level)" },

//     { code: "XCH01", name: "Chinese (AS)" },
//     { code: "YCH01", name: "Chinese (A Level)" },

//     { code: "XFR01", name: "French (AS)" },
//     { code: "YFR01", name: "French (A Level)" },

//     { code: "XGN01", name: "German (AS)" },
//     { code: "YGN01", name: "German (A Level)" },

//     { code: "XSP01", name: "Spanish (AS)" },
//     { code: "YSP01", name: "Spanish (A Level)" },

//     { code: "XHI01", name: "Hindi (AS)" },
//     { code: "YHI01", name: "Hindi (A Level)" },

//     { code: "XAR01", name: "Arabic (AS)" },
//     { code: "YAR01", name: "Arabic (A Level)" },

//     { code: "XAD01", name: "Art & Design (AS)" },
//     { code: "YAD01", name: "Art & Design (A Level)" },
//   ],
//   AQA: [
//     // Sciences
//     { code: "7408", name: "Biology" },
//     { code: "7405", name: "Chemistry" },
//     { code: "7407", name: "Physics" },

//     // Social Sciences
//     { code: "7181", name: "Economics (AS)" },
//     { code: "7182", name: "Economics (A Level)" }, // Economics uses 7182 as full A-level
//     { code: "7182", name: "Psychology" }, // psychology uses 7182 for full A-level; AS is 7181

//     // Maths
//     { code: "7357", name: "Mathematics" },
//     { code: "7367", name: "Further Mathematics" },

//     // English
//     { code: "7702", name: "English Language" },
//     { code: "7712", name: "English Literature A" },
//     { code: "7717", name: "English Language and Literature" },

//     // Humanities
//     { code: "7037", name: "Geography" },
//     { code: "7042", name: "History" },
//     { code: "7062", name: "Religious Studies" },
//     { code: "7172", name: "Sociology" },

//     // Business & Accounting
//     { code: "7132", name: "Business" },
//     { code: "7127", name: "Accounting" },

//     // Computer Science
//     { code: "7517", name: "Computer Science" },

//     // Physical Education
//     { code: "7582", name: "Physical Education" },

//     // Political Studies
//     { code: "7152", name: "Politics" },

//     // Media & Arts
//     { code: "7572", name: "Media Studies" },
//     { code: "7202", name: "Art and Design" },
//     { code: "7242", name: "Music" },
//     { code: "7262", name: "Drama and Theatre" },

//     // Languages (major A-level languages available under AQA)
//     { code: "7652", name: "French" },
//     { code: "7662", name: "German" },
//     { code: "7692", name: "Spanish" },

//     // Others (less common but official)
//     { code: "8631", name: "Law" }, // A-level Law (AQA)
//     { code: "7932", name: "Environmental Science" },
//     { code: "7136", name: "Business (older/AS code)" },
//   ],
//   OCR: [
//     // Sciences
//     { code: "H420", name: "Biology A" }, // Biology (A)
//     { code: "H422", name: "Biology B (Advancing Biology)" },

//     { code: "H432", name: "Chemistry A" }, // Chemistry (A)
//     { code: "H433", name: "Chemistry B (Salters)" },

//     { code: "H556", name: "Physics A" }, // Physics (A)
//     { code: "H557", name: "Physics B (Advancing Physics)" },

//     // Mathematics
//     { code: "H240", name: "Mathematics" },
//     { code: "H245", name: "Further Mathematics" },

//     // Computing & IT
//     { code: "H446", name: "Computer Science" }, // official: H446 (not H866)
//     { code: "H052", name: "IT (Cambridge Technicals)" }, // optional listing

//     // Psychology, Sociology, Philosophy
//     { code: "H567", name: "Psychology" },
//     { code: "H580", name: "Sociology" },
//     { code: "H573", name: "Philosophy" }, // OCR has a well-known Philosophy A-level

//     // History
//     { code: "H505", name: "History A" },
//     { code: "H506", name: "History B (Schools History Project)" },

//     // Geography
//     { code: "H481", name: "Geography" },

//     // English
//     { code: "H470", name: "English Literature" },
//     { code: "H474", name: "English Language and Literature" },
//     { code: "H470", name: "English Language (varies by centre)" },

//     // Religious Studies
//     { code: "H573", name: "Religious Studies" },

//     // Economics & Business
//     { code: "H460", name: "Economics" },
//     { code: "H431", name: "Business" },

//     // Art & Design
//     { code: "H601", name: "Art and Design (Fine Art)" },
//     { code: "H603", name: "Art and Design (Graphics)" },
//     { code: "H605", name: "Art and Design (Photography)" },

//     // Media & Performing Arts
//     { code: "H409", name: "Media Studies" },
//     { code: "H459", name: "Drama and Theatre" },
//     { code: "H543", name: "Music" },

//     // Physical Education
//     { code: "H555", name: "Physical Education" },

//     // Classical Subjects
//     { code: "H408", name: "Classical Civilisation" },
//     { code: "H441", name: "Latin" },
//     { code: "H443", name: "Classical Greek" },
//   ],
//   WJEC: [
//     // Sciences
//     { code: "WJEC-CH", name: "Chemistry" },
//     { code: "WJEC-PH", name: "Physics" },
//     { code: "WJEC-BI", name: "Biology" },

//     // Mathematics
//     { code: "WJEC-MA", name: "Mathematics" },
//     { code: "WJEC-FM", name: "Further Mathematics" },

//     // Social Sciences
//     { code: "WJEC-EC", name: "Economics" },
//     { code: "WJEC-BS", name: "Business" },
//     { code: "WJEC-PS", name: "Psychology" },
//     { code: "WJEC-SO", name: "Sociology" },
//     { code: "WJEC-GE", name: "Geography" },
//     { code: "WJEC-HI", name: "History" },
//     { code: "WJEC-PL", name: "Politics / Government & Politics" },

//     // English
//     { code: "WJEC-EL", name: "English Language" },
//     { code: "WJEC-ET", name: "English Literature" },
//     { code: "WJEC-ELL", name: "English Language & Literature" },

//     // Computer Science
//     { code: "WJEC-CS", name: "Computer Science" },
//     { code: "WJEC-IT", name: "Information Technology" },

//     // Arts
//     { code: "WJEC-AD", name: "Art & Design" },
//     { code: "WJEC-PHOTO", name: "Photography" },
//     { code: "WJEC-DT", name: "Design & Technology" },
//     { code: "WJEC-DR", name: "Drama & Theatre" },
//     { code: "WJEC-MU", name: "Music" },

//     // Sport
//     { code: "WJEC-PE", name: "Physical Education" },

//     // Languages
//     { code: "WJEC-FR", name: "French" },
//     { code: "WJEC-SP", name: "Spanish" },
//     { code: "WJEC-GN", name: "German" },
//     { code: "WJEC-BY", name: "Welsh (First Language)" },
//     { code: "WJEC-WL", name: "Welsh (Second Language)" },

//     // Religious Studies
//     { code: "WJEC-RS", name: "Religious Studies" },

//     // Media
//     { code: "WJEC-ME", name: "Media Studies" },
//   ],
// };

// const SESSIONS_BY_BOARD: Record<BoardKey, string[]> = {
//   CAIE: [
//     "Feb/Mar", // some regions e.g. India for IGCSE/IAL Feb-Mar session  [oai_citation:0‡Scribd](https://www.scribd.com/document/875871431/February-March-2026-Examination-Time-Table?utm_source=chatgpt.com)
//     "May/June",
//     "Oct/Nov",
//   ],
//   Edexcel: [
//     "May/June", // UK A-Level main series  [oai_citation:1‡Save My Exams](https://www.savemyexams.com/learning-hub/exam-dates-timetables/a-level-and-as-level-exam-dates/?utm_source=chatgpt.com)
//     "Jan", // International / early series for IAL and summer entry  [oai_citation:2‡British Council](https://www.britishcouncil.om/en/exam/school-exams/register/dates-deadlines?utm_source=chatgpt.com)
//     "Oct/Nov",
//   ],
//   Edexcel_IAL: [
//     "Jan",
//     "May/June",
//     "Oct/Nov", // Verified International A-Level series months  [oai_citation:3‡British Council](https://www.britishcouncil.om/en/exam/school-exams/register/dates-deadlines?utm_source=chatgpt.com)
//   ],
//   AQA: [
//     "May/June", // UK mainstream A-Level series  [oai_citation:4‡Save My Exams](https://www.savemyexams.com/learning-hub/exam-dates-timetables/a-level-and-as-level-exam-dates/?utm_source=chatgpt.com)
//     "Oct/Nov", // Some international variants use Oct/Nov (but less standard)
//     "Jan", // International sessions
//   ],
//   OCR: [
//     "May/June",
//     "Jan",
//     "Oct/Nov", // International/variant sessions
//   ],
//   WJEC: [
//     "May/June", // Welsh A-Level standard series
//     "Jan", // Some international or special arrangements
//     "Oct/Nov",
//   ],
// };

// /* -------------------------------- Component -------------------------------- */
// interface UserPayload {
//   name: string;
//   email: string;
//   boards?: BoardKey[];
//   subjectsAS?: string[];
//   subjectsA2?: string[];
//   examSession?: string[];
//   receiveEmails?: boolean;
// }

// /* -------------------------- Normalization Helpers -------------------------- */
// function findBoardForCode(
//   code: string
// ): { board: BoardKey; code: string; name: string } | null {
//   for (const b of Object.keys(SUBJECTS_BY_BOARD) as BoardKey[]) {
//     const found = SUBJECTS_BY_BOARD[b].find(
//       (s) => s.code === code || s.name === code
//     );
//     if (found) return { board: b, code: found.code, name: found.name };
//   }
//   return null;
// }

// function normalizeSubjects(arr?: string[] | null) {
//   if (!arr) return [];
//   const out: string[] = [];
//   arr.forEach((item) => {
//     if (!item) return;
//     if (item.includes("::")) return out.push(item);
//     const dashMatch = item.match(/^(.+?)\s*[-—]\s*(.+)$/);
//     if (dashMatch) {
//       const code = dashMatch[1].trim();
//       const name = dashMatch[2].trim();
//       const found = findBoardForCode(code);
//       out.push(
//         found
//           ? `${found.board}::${found.code}::${found.name}`
//           : `CAIE::${code}::${name}`
//       );
//     } else {
//       const codeOnly = item.trim();
//       const found = findBoardForCode(codeOnly);
//       out.push(
//         found ? `${found.board}::${found.code}::${found.name}` : codeOnly
//       );
//     }
//   });
//   return out;
// }

// /* -------------------------------- Component -------------------------------- */
// export default function ProfilePage() {
//   const { data: session } = useSession();
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [dirty, setDirty] = useState(false);
//   const [toast, setToast] = useState<string | null>(null);

//   const [boards, setBoards] = useState<BoardKey[]>([]);
//   const [subjectsAS, setSubjectsAS] = useState<string[]>([]);
//   const [subjectsA2, setSubjectsA2] = useState<string[]>([]);
//   const [examSession, setExamSession] = useState<string[]>([]);
//   const [receiveEmails, setReceiveEmails] = useState(false);
//   const [name, setName] = useState("");
//   const [initialSnapshot, setInitialSnapshot] = useState<string>("");

//   const availableSubjects = useMemo(() => {
//     const combined = new Map<
//       string,
//       { board: BoardKey; code: string; name: string }
//     >();
//     boards.forEach((b) =>
//       SUBJECTS_BY_BOARD[b]?.forEach((s) => {
//         const key = `${b}::${s.code}`;
//         if (!combined.has(key)) combined.set(key, { board: b, ...s });
//       })
//     );
//     return Array.from(combined.entries()).map(([key, val]) => ({
//       key,
//       ...val,
//     }));
//   }, [boards]);

//   const sessionOptions = useMemo(() => {
//     const opts: { key: string; label: string }[] = [];
//     boards.forEach((b) => {
//       SESSIONS_BY_BOARD[b]?.forEach((s) =>
//         opts.push({ key: `${b}::${s}`, label: `${b} — ${s}` })
//       );
//     });
//     return opts;
//   }, [boards]);

//   function showToast(msg: string, ms = 2500) {
//     setToast(msg);
//     setTimeout(() => setToast(null), ms);
//   }

//   /* ---------------------------- Load user data ---------------------------- */
//   useEffect(() => {
//     async function loadUser() {
//       if (!session?.user?.email) return setLoading(false);
//       try {
//         const res = await fetch("/api/user", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ email: session.user.email }),
//         });
//         if (!res.ok) throw new Error("Failed to load profile");

//         const data: any = await res.json();
//         const normalizedAS = normalizeSubjects(data.subjectsAS);
//         const normalizedA2 = normalizeSubjects(data.subjectsA2);
//         const normalizedSessions = Array.isArray(data.examSession)
//           ? data.examSession
//           : [data.examSession].filter(Boolean);

//         const detectedBoards = new Set<BoardKey>();
//         [...normalizedAS, ...normalizedA2, ...normalizedSessions].forEach(
//           (item) => {
//             const match = (item || "").split("::")[0] as BoardKey;
//             if (BOARDS.some((b) => b.key === match)) detectedBoards.add(match);
//           }
//         );

//         setBoards(Array.from(detectedBoards));
//         setSubjectsAS(normalizedAS);
//         setSubjectsA2(normalizedA2);
//         setExamSession(normalizedSessions);
//         setReceiveEmails(!!data.receiveEmails);
//         setName(data.name ?? session.user.name ?? "");

//         setInitialSnapshot(
//           JSON.stringify({
//             boards: Array.from(detectedBoards),
//             subjectsAS: normalizedAS,
//             subjectsA2: normalizedA2,
//             examSession: normalizedSessions,
//             receiveEmails: !!data.receiveEmails,
//           })
//         );
//       } catch (err) {
//         console.error(err);
//         showToast("Could not load profile");
//       } finally {
//         setLoading(false);
//       }
//     }
//     loadUser();
//   }, [session?.user?.email]);

//   // Detect unsaved changes
//   useEffect(() => {
//     if (!initialSnapshot) return;
//     const current = JSON.stringify({
//       boards,
//       subjectsAS,
//       subjectsA2,
//       examSession,
//       receiveEmails,
//     });
//     setDirty(current !== initialSnapshot);
//   }, [boards, subjectsAS, subjectsA2, examSession, receiveEmails]);

//   /* ---------------------------- Save user data ---------------------------- */
//   async function handleSave(e: FormEvent) {
//     e.preventDefault();
//     if (!session?.user?.email) return showToast("Sign in required");
//     try {
//       setSaving(true);
//       const payload: UserPayload = {
//         name,
//         email: session.user.email,
//         boards,
//         subjectsAS,
//         subjectsA2,
//         examSession,
//         receiveEmails,
//       };
//       const res = await fetch("/api/user/update", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });
//       if (!res.ok) throw new Error("Save failed");
//       showToast("Profile saved!");
//       setInitialSnapshot(JSON.stringify(payload));
//       setDirty(false);
//     } catch {
//       showToast("Error saving profile");
//     } finally {
//       setSaving(false);
//     }
//   }

//   /* ------------------------------- Render ------------------------------- */
//   if (loading)
//     return (
//       <div className="p-10 text-center text-gray-500">
//         Loading your profile...
//       </div>
//     );
//   if (!session?.user)
//     return (
//       <div className="p-10 text-center text-gray-700">
//         Please sign in with Google first.
//       </div>
//     );

//   return (
//     <main className="max-w-7xl mx-auto p-6 md:p-10 flex flex-col md:flex-row gap-6">
//       {/* Toast */}
//       <AnimatePresence>
//         {toast && (
//           <motion.div
//             initial={{ opacity: 0, y: -10 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, y: -10 }}
//             className="fixed top-6 right-6 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-md"
//           >
//             {toast}
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* Sidebar */}
//       <motion.aside
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ delay: 0.1 }}
//         className="md:w-80 h-fit bg-white/80 backdrop-blur-md border border-gray-200 rounded-2xl p-6 shadow-md max-md:mt-8"
//       >
//         <div className="flex items-center gap-4">
//           <div className="relative w-16 h-16 rounded-full overflow-hidden border border-gray-200">
//             <Image
//               src={session.user.image || "/default-avatar.png"}
//               alt="Profile"
//               width={64}
//               height={64}
//               className="object-cover"
//             />
//           </div>
//           <div>
//             <h2 className="text-lg font-semibold text-gray-800">
//               {name || session.user.name}
//             </h2>
//             <p className="text-xs text-gray-500">Signed in with Google</p>
//           </div>
//         </div>

//         <button
//           onClick={() => signOut()}
//           className="mt-6 w-full bg-red-50 text-red-600 border border-red-100 py-2 rounded-lg font-semibold hover:bg-red-100 transition"
//         >
//           Sign Out
//         </button>

//         <div
//           className={`mt-6 border rounded-lg p-3 text-sm transition-all ${
//             dirty
//               ? "bg-yellow-50 border-yellow-200 text-yellow-800 animate-pulse"
//               : "bg-blue-50 border-blue-100 text-blue-800"
//           }`}
//         >
//           {dirty ? (
//             <>
//               ⚠️ Unsaved changes — click <strong>“Save Changes”</strong> below.
//             </>
//           ) : (
//             <>
//               💡 Tip: Select your exam boards first — subjects & sessions depend
//               on them.
//             </>
//           )}
//         </div>
//       </motion.aside>

//       {/* Main Section */}
//       <motion.section
//         initial={{ opacity: 0, y: 15 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ delay: 0.15 }}
//         className="flex-1 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-sm p-6"
//       >
//         <form onSubmit={handleSave}>
//           {/* Top Buttons */}
//           {/* <div className="flex justify-end gap-3 mb-6">
//             <button
//               type="button"
//               onClick={() => window.location.reload()}
//               className="px-4 py-2 bg-gray-100 rounded-md text-sm hover:bg-gray-200"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               disabled={!dirty || saving}
//               className={`px-4 py-2 rounded-md text-sm font-semibold text-white transition ${
//                 !dirty
//                   ? "bg-gray-300 cursor-not-allowed"
//                   : saving
//                   ? "bg-blue-400"
//                   : "bg-blue-600 hover:bg-blue-700"
//               }`}
//             >
//               {saving ? "Saving..." : "Save Changes"}
//             </button>
//           </div> */}

//           {/* Boards */}
//           <div className="mt-4">
//             <h3 className="text-lg font-semibold text-gray-800 mb-2">
//               Exam Boards
//             </h3>
//             <div className="flex flex-wrap gap-2">
//               {BOARDS.map((b) => {
//                 const active = boards.includes(b.key);
//                 return (
//                   <button
//                     key={b.key}
//                     type="button"
//                     onClick={() =>
//                       setBoards((prev) =>
//                         prev.includes(b.key)
//                           ? prev.filter((x) => x !== b.key)
//                           : [...prev, b.key]
//                       )
//                     }
//                     className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
//                       active
//                         ? "bg-blue-600 text-white shadow"
//                         : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//                     }`}
//                   >
//                     {b.label}
//                   </button>
//                 );
//               })}
//             </div>
//           </div>

//           {/* AS Subjects */}
//           <div className="mt-8">
//             <h3 className="text-lg font-semibold text-gray-800">
//               AS Level Subjects
//             </h3>
//             {boards.length === 0 ? (
//               <p className="text-sm text-gray-500 mt-3 italic">
//                 Select a board first to choose AS subjects.
//               </p>
//             ) : (
//               <div className="flex flex-wrap gap-2 mt-3">
//                 {availableSubjects.map((s) => {
//                   const key = `${s.board}::${s.code}::${s.name}`;
//                   const selected = subjectsAS.includes(key);
//                   return (
//                     <button
//                       key={key}
//                       type="button"
//                       onClick={() =>
//                         setSubjectsAS((prev) =>
//                           prev.includes(key)
//                             ? prev.filter((p) => p !== key)
//                             : [...prev, key]
//                         )
//                       }
//                       className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
//                         selected
//                           ? "bg-blue-600 text-white"
//                           : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//                       }`}
//                     >
//                       <span className="font-mono text-xs">{s.code}</span>{" "}
//                       {s.name}
//                     </button>
//                   );
//                 })}
//               </div>
//             )}
//           </div>

//           {/* A2 Subjects */}
//           <div className="mt-8">
//             <h3 className="text-lg font-semibold text-gray-800">
//               A2 Level Subjects
//             </h3>
//             {boards.length === 0 ? (
//               <p className="text-sm text-gray-500 mt-3 italic">
//                 Select a board first to choose A2 subjects.
//               </p>
//             ) : (
//               <div className="flex flex-wrap gap-2 mt-3">
//                 {availableSubjects.map((s) => {
//                   const key = `${s.board}::${s.code}::${s.name}`;
//                   const selected = subjectsA2.includes(key);
//                   return (
//                     <button
//                       key={key}
//                       type="button"
//                       onClick={() =>
//                         setSubjectsA2((prev) =>
//                           prev.includes(key)
//                             ? prev.filter((p) => p !== key)
//                             : [...prev, key]
//                         )
//                       }
//                       className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
//                         selected
//                           ? "bg-blue-600 text-white"
//                           : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//                       }`}
//                     >
//                       <span className="font-mono text-xs">{s.code}</span>{" "}
//                       {s.name}
//                     </button>
//                   );
//                 })}
//               </div>
//             )}
//           </div>

//           {/* Exam Sessions */}
//           <div className="mt-8">
//             <h3 className="text-lg font-semibold text-gray-800">
//               Exam Sessions
//             </h3>
//             {boards.length === 0 ? (
//               <p className="text-sm text-gray-500 mt-2 italic">
//                 Select a board first to choose exam sessions.
//               </p>
//             ) : (
//               <div className="flex flex-wrap gap-2 mt-3">
//                 {sessionOptions.map((opt) => {
//                   const selected = examSession.includes(opt.key);
//                   return (
//                     <button
//                       key={opt.key}
//                       type="button"
//                       onClick={() =>
//                         setExamSession((prev) =>
//                           selected
//                             ? prev.filter((s) => s !== opt.key)
//                             : [...prev, opt.key]
//                         )
//                       }
//                       className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
//                         selected
//                           ? "bg-blue-600 text-white"
//                           : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//                       }`}
//                     >
//                       {opt.label}
//                     </button>
//                   );
//                 })}
//               </div>
//             )}
//           </div>

//           {/* Preferences */}
//           <div className="mt-8 flex items-center gap-3">
//             <input
//               type="checkbox"
//               checked={receiveEmails}
//               onChange={(e) => setReceiveEmails(e.target.checked)}
//               className="w-4 h-4 accent-blue-600"
//             />
//             <span className="text-sm text-gray-700">
//               Receive updates about new resources for your subjects
//             </span>
//           </div>

//           {/* Save Buttons (Bottom) */}
//           <div className="mt-10 flex justify-end gap-3">
//             <button
//               type="button"
//               onClick={() => window.location.reload()}
//               className="px-4 py-2 bg-gray-100 rounded-md text-sm hover:bg-gray-200"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               disabled={!dirty || saving}
//               className={`px-4 py-2 rounded-md text-sm font-semibold text-white transition ${
//                 !dirty
//                   ? "bg-gray-300 cursor-not-allowed"
//                   : saving
//                   ? "bg-blue-400"
//                   : "bg-blue-600 hover:bg-blue-700"
//               }`}
//             >
//               {saving ? "Saving..." : "Save Changes"}
//             </button>
//           </div>
//         </form>
//       </motion.section>
//     </main>
//   );
// }

// "use client";

// import { AnimatePresence, motion } from "framer-motion";
// import { signOut, useSession } from "next-auth/react";
// import Image from "next/image";
// import { FormEvent, useEffect, useMemo, useState } from "react";

// // shadcn/ui components (assumes you have them wired up in your project)
// import { Button } from "@/components/ui/button";
// import { Checkbox } from "@/components/ui/checkbox";
// import {
//   Dialog,
//   DialogContent,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { Switch } from "@/components/ui/switch";
// import { Search } from "lucide-react";

// // IMPORTANT: Export/import these constants from your constants file or replace them inline
// import {
//   BOARDS,
//   SESSIONS_BY_BOARD,
//   SUBJECTS_BY_BOARD,
// } from "@/lib/exam-constants";

// /* ---------------------------------- Types ---------------------------------- */
// type BoardKey = "CAIE" | "Edexcel" | "Edexcel_IAL" | "AQA" | "OCR" | "WJEC";

// interface UserPayload {
//   name: string;
//   email: string;
//   boards?: BoardKey[];
//   subjectsAS?: string[];
//   subjectsA2?: string[];
//   examSession?: string[];
//   receiveEmails?: boolean;
// }

// /* ------------------------ Small helper utilities ----------------------- */
// function showSimpleToast(msg: string) {
//   // replace with your toast system if you have one
//   alert(msg);
// }

// function normalizeSubjects(arr?: string[] | null) {
//   if (!arr) return [];
//   return arr;
// }

// /* ---------------------------- Subject Modal --------------------------- */
// function SubjectPickerModal({
//   open,
//   onOpenChange,
//   subjects,
//   onSave,
//   title,
// }: {
//   open: boolean;
//   onOpenChange: (v: boolean) => void;
//   subjects: { key: string; board: BoardKey; code: string; name: string }[];
//   onSave: (selected: string[]) => void;
//   title: string;
// }) {
//   const [query, setQuery] = useState("");
//   const [selected, setSelected] = useState<Record<string, boolean>>({});

//   useEffect(() => {
//     if (!open) {
//       setQuery("");
//       setSelected({});
//     }
//   }, [open]);

//   const filtered = useMemo(() => {
//     const q = query.trim().toLowerCase();
//     if (!q) return subjects;
//     return subjects.filter((s) =>
//       (s.name + " " + s.code).toLowerCase().includes(q)
//     );
//   }, [subjects, query]);

//   function toggle(key: string) {
//     setSelected((p) => ({ ...p, [key]: !p[key] }));
//   }

//   function handleAdd() {
//     const picked = Object.keys(selected).filter((k) => selected[k]);
//     onSave(picked);
//     onOpenChange(false);
//   }

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="max-w-2xl w-full">
//         <DialogHeader>
//           <DialogTitle>{title}</DialogTitle>
//         </DialogHeader>

//         <div className="mt-4">
//           <div className="flex items-center gap-2 mb-3">
//             <Search className="w-4 h-4 text-gray-400" />
//             <Input
//               value={query}
//               onChange={(e: any) => setQuery(e.target.value)}
//               placeholder="Search subjects by name or code..."
//             />
//           </div>

//           <div className="max-h-[40vh] overflow-y-auto space-y-1">
//             {filtered.length === 0 && (
//               <div className="text-sm text-gray-500 p-6 text-center">
//                 No subjects found
//               </div>
//             )}

//             {filtered.map((s) => (
//               <label
//                 key={s.key}
//                 className="flex items-center gap-3 p-2 rounded-md hover:bg-slate-50 cursor-pointer"
//               >
//                 <Checkbox
//                   checked={!!selected[s.key]}
//                   onCheckedChange={() => toggle(s.key)}
//                 />
//                 <div className="flex-1 text-sm">
//                   <div className="font-medium">{s.name}</div>
//                   <div className="text-xs text-gray-500">
//                     {s.code} • {s.board}
//                   </div>
//                 </div>
//               </label>
//             ))}
//           </div>

//           <DialogFooter className="mt-4 flex justify-between">
//             <Button variant="ghost" onClick={() => onOpenChange(false)}>
//               Cancel
//             </Button>
//             <div className="flex gap-2">
//               <Button variant="outline" onClick={() => setSelected({})}>
//                 Clear
//               </Button>
//               <Button onClick={handleAdd}>
//                 Add Selected (
//                 {Object.keys(selected).filter((k) => selected[k]).length})
//               </Button>
//             </div>
//           </DialogFooter>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }

// /* ---------------------------- Session Modal --------------------------- */
// function SessionPickerModal({
//   open,
//   onOpenChange,
//   options,
//   current,
//   onSave,
// }: {
//   open: boolean;
//   onOpenChange: (v: boolean) => void;
//   options: { key: string; label: string }[];
//   current: string[];
//   onSave: (selected: string[]) => void;
// }) {
//   const [selected, setSelected] = useState<Record<string, boolean>>({});

//   useEffect(() => {
//     if (open) {
//       const map: Record<string, boolean> = {};
//       options.forEach((o) => (map[o.key] = current.includes(o.key)));
//       setSelected(map);
//     }
//   }, [open, options, current]);

//   function toggle(key: string) {
//     setSelected((p) => ({ ...p, [key]: !p[key] }));
//   }

//   function handleSave() {
//     onSave(Object.keys(selected).filter((k) => selected[k]));
//     onOpenChange(false);
//   }

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="max-w-lg w-full">
//         <DialogHeader>
//           <DialogTitle>Select Exam Sessions</DialogTitle>
//         </DialogHeader>

//         <div className="mt-4 max-h-[50vh] overflow-y-auto">
//           {options.map((o) => (
//             <label
//               key={o.key}
//               className="flex items-center gap-3 p-2 rounded-md hover:bg-slate-50 cursor-pointer"
//             >
//               <Checkbox
//                 checked={!!selected[o.key]}
//                 onCheckedChange={() => toggle(o.key)}
//               />
//               <div className="text-sm">{o.label}</div>
//             </label>
//           ))}
//         </div>

//         <DialogFooter className="mt-4 flex justify-end">
//           <Button variant="ghost" onClick={() => onOpenChange(false)}>
//             Cancel
//           </Button>
//           <Button onClick={handleSave}>Save</Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// }

// /* ----------------------------- Main Page UI --------------------------- */
// export default function ProfilePageRedesigned() {
//   const { data: session } = useSession();
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [dirty, setDirty] = useState(false);
//   const [toast, setToast] = useState<string | null>(null);

//   const [boards, setBoards] = useState<BoardKey[]>([]);
//   const [subjectsAS, setSubjectsAS] = useState<string[]>([]); // keys: board::code
//   const [subjectsA2, setSubjectsA2] = useState<string[]>([]);
//   const [examSession, setExamSession] = useState<string[]>([]);
//   const [receiveEmails, setReceiveEmails] = useState(false);
//   const [name, setName] = useState("");
//   const [initialSnapshot, setInitialSnapshot] = useState<string>("");

//   // modal states
//   const [openASModal, setOpenASModal] = useState(false);
//   const [openA2Modal, setOpenA2Modal] = useState(false);
//   const [openSessionModal, setOpenSessionModal] = useState(false);

//   // Build available subjects from selected boards (flat list)
//   const availableSubjects = useMemo(() => {
//     const combined: {
//       key: string;
//       board: BoardKey;
//       code: string;
//       name: string;
//     }[] = [];
//     boards.forEach((b) => {
//       const list = (SUBJECTS_BY_BOARD as any)[b] as {
//         code: string;
//         name: string;
//       }[];
//       (list || []).forEach((s) =>
//         combined.push({
//           key: `${b}::${s.code}`,
//           board: b as BoardKey,
//           code: s.code,
//           name: s.name,
//         })
//       );
//     });
//     return combined;
//   }, [boards]);

//   const sessionOptions = useMemo(() => {
//     const opts: { key: string; label: string }[] = [];
//     boards.forEach((b) => {
//       const arr = (SESSIONS_BY_BOARD as any)[b] as string[];
//       if (!arr) return;
//       arr.forEach((s) =>
//         opts.push({ key: `${b}::${s}`, label: `${b} — ${s}` })
//       );
//     });
//     return opts;
//   }, [boards]);

//   function showToast(msg: string, ms = 2500) {
//     setToast(msg);
//     setTimeout(() => setToast(null), ms);
//   }

//   /* ---------------------------- Load user data ---------------------------- */
//   useEffect(() => {
//     async function loadUser() {
//       if (!session?.user?.email) return setLoading(false);
//       try {
//         const res = await fetch("/api/user", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ email: session.user.email }),
//         });
//         if (!res.ok) throw new Error("Failed to load profile");
//         const data: any = await res.json();

//         // normalize subjects (expects keys like Board::code::name or similar)
//         const normalizedAS = normalizeSubjects(data.subjectsAS);
//         const normalizedA2 = normalizeSubjects(data.subjectsA2);
//         const normalizedSessions = Array.isArray(data.examSession)
//           ? data.examSession
//           : [data.examSession].filter(Boolean);

//         const detectedBoards = new Set<BoardKey>();
//         [...normalizedAS, ...normalizedA2, ...normalizedSessions].forEach(
//           (item: any) => {
//             const match = (item || "").split("::")[0] as BoardKey;
//             if ((BOARDS as any).some((b: any) => b.key === match))
//               detectedBoards.add(match);
//           }
//         );

//         setBoards(Array.from(detectedBoards));
//         setSubjectsAS(normalizedAS);
//         setSubjectsA2(normalizedA2);
//         setExamSession(normalizedSessions);
//         setReceiveEmails(!!data.receiveEmails);
//         setName(data.name ?? session.user.name ?? "");

//         setInitialSnapshot(
//           JSON.stringify({
//             boards: Array.from(detectedBoards),
//             subjectsAS: normalizedAS,
//             subjectsA2: normalizedA2,
//             examSession: normalizedSessions,
//             receiveEmails: !!data.receiveEmails,
//           })
//         );
//       } catch (err) {
//         console.error(err);
//         showToast("Could not load profile");
//       } finally {
//         setLoading(false);
//       }
//     }
//     loadUser();
//   }, [session?.user?.email]);

//   // Detect unsaved changes
//   useEffect(() => {
//     if (!initialSnapshot) return;
//     const current = JSON.stringify({
//       boards,
//       subjectsAS,
//       subjectsA2,
//       examSession,
//       receiveEmails,
//     });
//     setDirty(current !== initialSnapshot);
//   }, [
//     boards,
//     subjectsAS,
//     subjectsA2,
//     examSession,
//     receiveEmails,
//     initialSnapshot,
//   ]);

//   /* ---------------------------- Add handlers ---------------------------- */
//   function handleAddSubjectsAS(keys: string[]) {
//     // keys are in format board::code
//     const merged = Array.from(new Set([...subjectsAS, ...keys]));
//     setSubjectsAS(merged);
//   }
//   function handleAddSubjectsA2(keys: string[]) {
//     const merged = Array.from(new Set([...subjectsA2, ...keys]));
//     setSubjectsA2(merged);
//   }

//   function handleRemoveAS(key: string) {
//     setSubjectsAS((p) => p.filter((x) => x !== key));
//   }
//   function handleRemoveA2(key: string) {
//     setSubjectsA2((p) => p.filter((x) => x !== key));
//   }

//   function handleSaveSessions(keys: string[]) {
//     setExamSession(keys);
//   }

//   /* ---------------------------- Save user data ---------------------------- */
//   async function handleSave(e: FormEvent) {
//     e.preventDefault();
//     if (!session?.user?.email) return showToast("Sign in required");
//     try {
//       setSaving(true);
//       const payload: UserPayload = {
//         name,
//         email: session.user.email,
//         boards,
//         subjectsAS,
//         subjectsA2,
//         examSession,
//         receiveEmails,
//       };
//       const res = await fetch("/api/user/update", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });
//       if (!res.ok) throw new Error("Save failed");
//       showToast("Profile saved!");
//       setInitialSnapshot(JSON.stringify(payload));
//       setDirty(false);
//     } catch (err) {
//       console.error(err);
//       showToast("Error saving profile");
//     } finally {
//       setSaving(false);
//     }
//   }

//   /* ------------------------------- Render ------------------------------- */
//   if (loading)
//     return (
//       <div className="p-10 text-center text-gray-500">
//         Loading your profile...
//       </div>
//     );
//   if (!session?.user)
//     return (
//       <div className="p-10 text-center text-gray-700">
//         Please sign in with Google first.
//       </div>
//     );

//   return (
//     <main className="max-w-7xl mx-auto p-6 md:p-10 flex flex-col md:flex-row gap-6">
//       {/* Toast */}
//       <AnimatePresence>
//         {toast && (
//           <motion.div
//             initial={{ opacity: 0, y: -10 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, y: -10 }}
//             className="fixed top-6 right-6 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-md"
//           >
//             {toast}
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* Sidebar */}
//       <motion.aside
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ delay: 0.1 }}
//         className="md:w-80 h-fit bg-white/80 backdrop-blur-md border border-gray-200 rounded-2xl p-6 shadow-md max-md:mt-8"
//       >
//         <div className="flex items-center gap-4">
//           <div className="relative w-16 h-16 rounded-full overflow-hidden border border-gray-200">
//             <Image
//               src={session.user.image || "/default-avatar.png"}
//               alt="Profile"
//               width={64}
//               height={64}
//               className="object-cover"
//             />
//           </div>
//           <div>
//             <h2 className="text-lg font-semibold text-gray-800">
//               {name || session.user.name}
//             </h2>
//             <p className="text-xs text-gray-500">Signed in with Google</p>
//           </div>
//         </div>

//         <div className="mt-6 grid gap-3">
//           <Button
//             variant="ghost"
//             onClick={() => signOut()}
//             className="w-full justify-start"
//           >
//             Sign out
//           </Button>

//           <div
//             className={`border rounded-lg p-3 text-sm transition-all ${
//               dirty
//                 ? "bg-yellow-50 border-yellow-200 text-yellow-800 animate-pulse"
//                 : "bg-blue-50 border-blue-100 text-blue-800"
//             }`}
//           >
//             {dirty ? (
//               <>
//                 ⚠️ Unsaved changes — click <strong>“Save Changes”</strong>{" "}
//                 below.
//               </>
//             ) : (
//               <>
//                 💡 Tip: Select your exam boards first — subjects & sessions
//                 depend on them.
//               </>
//             )}
//           </div>

//           <div className="text-xs text-gray-500">
//             <div>
//               <strong>Boards:</strong>
//             </div>
//             <div className="flex flex-wrap gap-2 mt-2">
//               {(BOARDS as any).map((b: any) => {
//                 const active = boards.includes(b.key);
//                 return (
//                   <button
//                     key={b.key}
//                     type="button"
//                     onClick={() =>
//                       setBoards((prev) =>
//                         prev.includes(b.key)
//                           ? prev.filter((x) => x !== b.key)
//                           : [...prev, b.key]
//                       )
//                     }
//                     className={`px-2 py-1 rounded-full text-sm font-medium transition ${
//                       active
//                         ? "bg-blue-600 text-white shadow"
//                         : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//                     }`}
//                   >
//                     {b.label}
//                   </button>
//                 );
//               })}
//             </div>
//           </div>
//         </div>
//       </motion.aside>

//       {/* Main Section */}
//       <motion.section
//         initial={{ opacity: 0, y: 15 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ delay: 0.15 }}
//         className="flex-1 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-sm p-6"
//       >
//         <form onSubmit={handleSave} className="flex flex-col gap-6">
//           <div className="flex items-center justify-between gap-4">
//             <div>
//               <h1 className="text-2xl font-bold">Profile</h1>
//               <p className="text-sm text-gray-500 mt-1">
//                 Manage your boards, subjects and exam sessions.
//               </p>
//             </div>

//             <div className="flex items-center gap-3">
//               <Input
//                 value={name}
//                 onChange={(e) => setName(e.target.value)}
//                 className="max-w-sm"
//                 placeholder="Display name"
//               />
//             </div>
//           </div>

//           {/* Subjects area */}
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//             {/* AS column */}
//             <div className="border rounded-lg p-4">
//               <div className="flex items-center justify-between mb-3">
//                 <h3 className="text-lg font-semibold">AS Level Subjects</h3>
//                 <div className="flex items-center gap-2">
//                   <Button onClick={() => setOpenASModal(true)}>
//                     + Add AS Subjects
//                   </Button>
//                 </div>
//               </div>

//               {subjectsAS.length === 0 ? (
//                 <div className="text-sm text-gray-500">
//                   No AS subjects selected. Click “Add AS Subjects”.
//                 </div>
//               ) : (
//                 <div className="space-y-2">
//                   {subjectsAS.map((key) => {
//                     const [board, code] = key.split("::");
//                     const subj = (SUBJECTS_BY_BOARD as any)[board]?.find(
//                       (s: any) => s.code === code
//                     );
//                     return (
//                       <div
//                         key={key}
//                         className="flex items-center justify-between p-2 rounded-md hover:bg-slate-50"
//                       >
//                         <div>
//                           <div className="text-sm font-medium">
//                             {subj?.name || code}
//                           </div>
//                           <div className="text-xs text-gray-500">
//                             {code} • {board}
//                           </div>
//                         </div>
//                         <div className="flex items-center gap-2">
//                           <Button
//                             variant="ghost"
//                             size="sm"
//                             onClick={() => handleRemoveAS(key)}
//                           >
//                             Remove
//                           </Button>
//                         </div>
//                       </div>
//                     );
//                   })}
//                 </div>
//               )}
//             </div>

//             {/* A2 column */}
//             <div className="border rounded-lg p-4">
//               <div className="flex items-center justify-between mb-3">
//                 <h3 className="text-lg font-semibold">A2 Level Subjects</h3>
//                 <div className="flex items-center gap-2">
//                   <Button onClick={() => setOpenA2Modal(true)}>
//                     + Add A2 Subjects
//                   </Button>
//                 </div>
//               </div>

//               {subjectsA2.length === 0 ? (
//                 <div className="text-sm text-gray-500">
//                   No A2 subjects selected. Click “Add A2 Subjects”.
//                 </div>
//               ) : (
//                 <div className="space-y-2">
//                   {subjectsA2.map((key) => {
//                     const [board, code] = key.split("::");
//                     const subj = (SUBJECTS_BY_BOARD as any)[board]?.find(
//                       (s: any) => s.code === code
//                     );
//                     return (
//                       <div
//                         key={key}
//                         className="flex items-center justify-between p-2 rounded-md hover:bg-slate-50"
//                       >
//                         <div>
//                           <div className="text-sm font-medium">
//                             {subj?.name || code}
//                           </div>
//                           <div className="text-xs text-gray-500">
//                             {code} • {board}
//                           </div>
//                         </div>
//                         <div className="flex items-center gap-2">
//                           <Button
//                             variant="ghost"
//                             size="sm"
//                             onClick={() => handleRemoveA2(key)}
//                           >
//                             Remove
//                           </Button>
//                         </div>
//                       </div>
//                     );
//                   })}
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Sessions + Notifications */}
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             <div className="border rounded-lg p-4">
//               <div className="flex items-center justify-between mb-2">
//                 <h3 className="text-lg font-semibold">Exam Sessions</h3>
//                 <Button onClick={() => setOpenSessionModal(true)}>
//                   Manage
//                 </Button>
//               </div>

//               {examSession.length === 0 ? (
//                 <div className="text-sm text-gray-500">
//                   No sessions selected.
//                 </div>
//               ) : (
//                 <div className="flex flex-wrap gap-2 mt-2">
//                   {examSession.map((s) => (
//                     <span
//                       key={s}
//                       className="px-3 py-1 rounded-full bg-gray-100 text-sm text-gray-700"
//                     >
//                       {s.replace("::", " — ")}
//                     </span>
//                   ))}
//                 </div>
//               )}
//             </div>

//             <div className="border rounded-lg p-4 md:col-span-2">
//               <div className="flex items-center justify-between mb-2">
//                 <h3 className="text-lg font-semibold">Notifications</h3>
//               </div>

//               <div className="flex items-center gap-3">
//                 <Switch
//                   checked={receiveEmails}
//                   onCheckedChange={(v) => setReceiveEmails(!!v)}
//                 />
//                 <div>
//                   <div className="text-sm font-medium">
//                     Receive updates about new resources
//                   </div>
//                   <div className="text-xs text-gray-500">
//                     We will email you when new resources are added to your
//                     selected subjects.
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="h-20" />

//           <div className="text-xs text-gray-400">
//             Profile last updated: {/* show timestamp if you have */}
//           </div>
//         </form>

//         {/* Sticky Save Bar */}
//         <div
//           className={`fixed left-0 right-0 bottom-4 flex justify-center pointer-events-none`}
//         >
//           <div className={`max-w-7xl w-full px-6 md:px-10`}>
//             <div
//               className={`bg-white/95 backdrop-blur border border-gray-200 rounded-2xl p-3 flex items-center justify-between gap-4 pointer-events-auto shadow-xl`}
//             >
//               <div className="flex items-center gap-3">
//                 {dirty ? (
//                   <div className="text-sm text-yellow-700">
//                     ⚠️ You have unsaved changes
//                   </div>
//                 ) : (
//                   <div className="text-sm text-gray-600">All changes saved</div>
//                 )}
//               </div>

//               <div className="flex items-center gap-2">
//                 <Button
//                   variant="ghost"
//                   onClick={() => window.location.reload()}
//                 >
//                   Cancel
//                 </Button>
//                 <Button
//                   onClick={(e: any) => void handleSave(e)}
//                   disabled={!dirty || saving}
//                 >
//                   {saving ? "Saving..." : "Save Changes"}
//                 </Button>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Modals */}
//         <SubjectPickerModal
//           open={openASModal}
//           onOpenChange={setOpenASModal}
//           subjects={availableSubjects}
//           onSave={handleAddSubjectsAS}
//           title="Add AS Subjects"
//         />
//         <SubjectPickerModal
//           open={openA2Modal}
//           onOpenChange={setOpenA2Modal}
//           subjects={availableSubjects}
//           onSave={handleAddSubjectsA2}
//           title="Add A2 Subjects"
//         />
//         <SessionPickerModal
//           open={openSessionModal}
//           onOpenChange={setOpenSessionModal}
//           options={sessionOptions}
//           current={examSession}
//           onSave={handleSaveSessions}
//         />
//       </motion.section>
//     </main>
//   );
// }

// "use client";

// import { AnimatePresence, motion } from "framer-motion";
// import { signOut, useSession } from "next-auth/react";
// import Image from "next/image";
// import { FormEvent, useEffect, useMemo, useState } from "react";

// // shadcn/ui components (assumes you have them wired up in your project)
// import { Button } from "@/components/ui/button";
// import { Checkbox } from "@/components/ui/checkbox";
// import {
//   Dialog,
//   DialogContent,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { Switch } from "@/components/ui/switch";
// import { Menu, Search, X } from "lucide-react";

// // IMPORTANT: Export/import these constants from your constants file or replace them inline
// import {
//   BOARDS,
//   SESSIONS_BY_BOARD,
//   SUBJECTS_BY_BOARD,
// } from "@/lib/exam-constants";

// /* ---------------------------------- Types ---------------------------------- */
// type BoardKey = "CAIE" | "Edexcel" | "Edexcel_IAL" | "AQA" | "OCR" | "WJEC";

// interface UserPayload {
//   name: string;
//   email: string;
//   boards?: BoardKey[];
//   subjectsAS?: string[];
//   subjectsA2?: string[];
//   examSession?: string[];
//   receiveEmails?: boolean;
// }

// /* ------------------------ Small helper utilities ----------------------- */
// function showSimpleToast(msg: string) {
//   // replace with your toast system if you have one
//   alert(msg);
// }

// function normalizeSubjects(arr?: string[] | null) {
//   if (!arr) return [];
//   return arr;
// }

// /* ---------------------------- Subject Modal --------------------------- */
// function SubjectPickerModal({
//   open,
//   onOpenChange,
//   subjects,
//   onSave,
//   title,
// }: {
//   open: boolean;
//   onOpenChange: (v: boolean) => void;
//   subjects: { key: string; board: BoardKey; code: string; name: string }[];
//   onSave: (selected: string[]) => void;
//   title: string;
// }) {
//   const [query, setQuery] = useState("");
//   const [selected, setSelected] = useState<Record<string, boolean>>({});

//   useEffect(() => {
//     if (!open) {
//       setQuery("");
//       setSelected({});
//     }
//   }, [open]);

//   const filtered = useMemo(() => {
//     const q = query.trim().toLowerCase();
//     if (!q) return subjects;
//     return subjects.filter((s) =>
//       (s.name + " " + s.code).toLowerCase().includes(q)
//     );
//   }, [subjects, query]);

//   function toggle(key: string) {
//     setSelected((p) => ({ ...p, [key]: !p[key] }));
//   }

//   function handleAdd() {
//     const picked = Object.keys(selected).filter((k) => selected[k]);
//     onSave(picked);
//     onOpenChange(false);
//   }

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="max-w-2xl w-full">
//         <DialogHeader>
//           <DialogTitle>{title}</DialogTitle>
//         </DialogHeader>

//         <div className="mt-4">
//           <div className="flex items-center gap-2 mb-3">
//             <Search className="w-5 h-5 text-blue-400" />
//             <Input
//               value={query}
//               onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
//                 setQuery(e.target.value)
//               }
//               placeholder="Search subjects by name or code..."
//             />
//           </div>

//           <div className="max-h-[50vh] sm:max-h-[40vh] overflow-y-auto space-y-1">
//             {filtered.length === 0 && (
//               <div className="text-sm text-slate-500 p-6 text-center">
//                 No subjects found
//               </div>
//             )}

//             {filtered.map((s) => (
//               <label
//                 key={s.key}
//                 className="flex items-center gap-3 p-2 rounded-md hover:bg-slate-50 cursor-pointer"
//               >
//                 <Checkbox
//                   checked={!!selected[s.key]}
//                   onCheckedChange={() => toggle(s.key)}
//                 />
//                 <div className="flex-1 text-sm">
//                   <div className="font-medium text-slate-800">{s.name}</div>
//                   <div className="text-xs text-slate-500">
//                     {s.code} • {s.board}
//                   </div>
//                 </div>
//               </label>
//             ))}
//           </div>

//           <DialogFooter className="mt-4 flex justify-between">
//             <Button variant="ghost" onClick={() => onOpenChange(false)}>
//               Cancel
//             </Button>
//             <div className="flex gap-2">
//               <Button variant="outline" onClick={() => setSelected({})}>
//                 Clear
//               </Button>
//               <Button onClick={handleAdd}>
//                 Add Selected (
//                 {Object.keys(selected).filter((k) => selected[k]).length})
//               </Button>
//             </div>
//           </DialogFooter>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }

// /* ---------------------------- Session Modal --------------------------- */
// function SessionPickerModal({
//   open,
//   onOpenChange,
//   options,
//   current,
//   onSave,
// }: {
//   open: boolean;
//   onOpenChange: (v: boolean) => void;
//   options: { key: string; label: string }[];
//   current: string[];
//   onSave: (selected: string[]) => void;
// }) {
//   const [selected, setSelected] = useState<Record<string, boolean>>({});

//   useEffect(() => {
//     if (open) {
//       const map: Record<string, boolean> = {};
//       options.forEach((o) => (map[o.key] = current.includes(o.key)));
//       setSelected(map);
//     }
//   }, [open, options, current]);

//   function toggle(key: string) {
//     setSelected((p) => ({ ...p, [key]: !p[key] }));
//   }

//   function handleSave() {
//     onSave(Object.keys(selected).filter((k) => selected[k]));
//     onOpenChange(false);
//   }

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="max-w-lg w-full">
//         <DialogHeader>
//           <DialogTitle>Select Exam Sessions</DialogTitle>
//         </DialogHeader>

//         <div className="mt-4 max-h-[50vh] overflow-y-auto">
//           {options.map((o) => (
//             <label
//               key={o.key}
//               className="flex items-center gap-3 p-2 rounded-md hover:bg-slate-50 cursor-pointer"
//             >
//               <Checkbox
//                 checked={!!selected[o.key]}
//                 onCheckedChange={() => toggle(o.key)}
//               />
//               <div className="text-sm text-slate-800">{o.label}</div>
//             </label>
//           ))}
//         </div>

//         <DialogFooter className="mt-4 flex justify-end">
//           <Button variant="ghost" onClick={() => onOpenChange(false)}>
//             Cancel
//           </Button>
//           <Button onClick={handleSave}>Save</Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// }

// /* ----------------------------- Main Page UI --------------------------- */
// export default function ProfilePageRedesigned() {
//   const { data: session } = useSession();
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [dirty, setDirty] = useState(false);
//   const [toast, setToast] = useState<string | null>(null);

//   const [boards, setBoards] = useState<BoardKey[]>([]);
//   const [subjectsAS, setSubjectsAS] = useState<string[]>([]); // keys: board::code
//   const [subjectsA2, setSubjectsA2] = useState<string[]>([]);
//   const [examSession, setExamSession] = useState<string[]>([]);
//   const [receiveEmails, setReceiveEmails] = useState(false);
//   const [name, setName] = useState("");
//   const [initialSnapshot, setInitialSnapshot] = useState<string>("");

//   // modal states
//   const [openASModal, setOpenASModal] = useState(false);
//   const [openA2Modal, setOpenA2Modal] = useState(false);
//   const [openSessionModal, setOpenSessionModal] = useState(false);

//   // sidebar (mobile) open
//   const [sidebarOpen, setSidebarOpen] = useState(false);

//   // Build available subjects from selected boards (flat list)
//   const availableSubjects = useMemo(() => {
//     const combined: {
//       key: string;
//       board: BoardKey;
//       code: string;
//       name: string;
//     }[] = [];
//     boards.forEach((b) => {
//       const list = (SUBJECTS_BY_BOARD as any)[b] as {
//         code: string;
//         name: string;
//       }[];
//       (list || []).forEach((s) =>
//         combined.push({
//           key: `${b}::${s.code}`,
//           board: b as BoardKey,
//           code: s.code,
//           name: s.name,
//         })
//       );
//     });
//     return combined;
//   }, [boards]);

//   const sessionOptions = useMemo(() => {
//     const opts: { key: string; label: string }[] = [];
//     boards.forEach((b) => {
//       const arr = (SESSIONS_BY_BOARD as any)[b] as string[];
//       if (!arr) return;
//       arr.forEach((s) =>
//         opts.push({ key: `${b}::${s}`, label: `${b} — ${s}` })
//       );
//     });
//     return opts;
//   }, [boards]);

//   function showToast(msg: string, ms = 2500) {
//     setToast(msg);
//     setTimeout(() => setToast(null), ms);
//   }

//   /* ---------------------------- Load user data ---------------------------- */
//   useEffect(() => {
//     async function loadUser() {
//       if (!session?.user?.email) return setLoading(false);
//       try {
//         const res = await fetch("/api/user", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ email: session.user.email }),
//         });
//         if (!res.ok) throw new Error("Failed to load profile");
//         const data: any = await res.json();

//         // normalize subjects (expects keys like Board::code::name or similar)
//         const normalizedAS = normalizeSubjects(data.subjectsAS);
//         const normalizedA2 = normalizeSubjects(data.subjectsA2);
//         const normalizedSessions = Array.isArray(data.examSession)
//           ? data.examSession
//           : [data.examSession].filter(Boolean);

//         const detectedBoards = new Set<BoardKey>();
//         [...normalizedAS, ...normalizedA2, ...normalizedSessions].forEach(
//           (item: any) => {
//             const match = (item || "").split("::")[0] as BoardKey;
//             if ((BOARDS as any).some((b: any) => b.key === match))
//               detectedBoards.add(match);
//           }
//         );

//         setBoards(Array.from(detectedBoards));
//         setSubjectsAS(normalizedAS);
//         setSubjectsA2(normalizedA2);
//         setExamSession(normalizedSessions);
//         setReceiveEmails(!!data.receiveEmails);
//         setName(data.name ?? session.user.name ?? "");

//         setInitialSnapshot(
//           JSON.stringify({
//             boards: Array.from(detectedBoards),
//             subjectsAS: normalizedAS,
//             subjectsA2: normalizedA2,
//             examSession: normalizedSessions,
//             receiveEmails: !!data.receiveEmails,
//           })
//         );
//       } catch (err) {
//         console.error(err);
//         showToast("Could not load profile");
//       } finally {
//         setLoading(false);
//       }
//     }
//     loadUser();
//   }, [session?.user?.email]);

//   // Detect unsaved changes
//   useEffect(() => {
//     if (!initialSnapshot) return;
//     const current = JSON.stringify({
//       boards,
//       subjectsAS,
//       subjectsA2,
//       examSession,
//       receiveEmails,
//     });
//     setDirty(current !== initialSnapshot);
//   }, [
//     boards,
//     subjectsAS,
//     subjectsA2,
//     examSession,
//     receiveEmails,
//     initialSnapshot,
//   ]);

//   /* ---------------------------- Add handlers ---------------------------- */
//   function handleAddSubjectsAS(keys: string[]) {
//     // keys are in format board::code
//     const merged = Array.from(new Set([...subjectsAS, ...keys]));
//     setSubjectsAS(merged);
//   }
//   function handleAddSubjectsA2(keys: string[]) {
//     const merged = Array.from(new Set([...subjectsA2, ...keys]));
//     setSubjectsA2(merged);
//   }

//   function handleRemoveAS(key: string) {
//     setSubjectsAS((p) => p.filter((x) => x !== key));
//   }
//   function handleRemoveA2(key: string) {
//     setSubjectsA2((p) => p.filter((x) => x !== key));
//   }

//   function handleSaveSessions(keys: string[]) {
//     setExamSession(keys);
//   }

//   /* ---------------------------- Save user data ---------------------------- */
//   async function handleSave(e?: FormEvent) {
//     if (e) e.preventDefault();
//     if (!session?.user?.email) return showToast("Sign in required");
//     try {
//       setSaving(true);
//       const payload: UserPayload = {
//         name,
//         email: session.user.email,
//         boards,
//         subjectsAS,
//         subjectsA2,
//         examSession,
//         receiveEmails,
//       };
//       const res = await fetch("/api/user/update", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });
//       if (!res.ok) throw new Error("Save failed");
//       showToast("Profile saved!");
//       setInitialSnapshot(JSON.stringify(payload));
//       setDirty(false);
//     } catch (err) {
//       console.error(err);
//       showToast("Error saving profile");
//     } finally {
//       setSaving(false);
//     }
//   }

//   /* ------------------------------- Render ------------------------------- */
//   if (loading)
//     return (
//       <div className="p-10 text-center text-slate-500">
//         Loading your profile...
//       </div>
//     );
//   if (!session?.user)
//     return (
//       <div className="p-10 text-center text-slate-700">
//         Please sign in with Google first.
//       </div>
//     );

//   return (
//     <main className="max-w-7xl mx-auto p-4 sm:p-6 md:p-10">
//       {/* Toast */}
//       <AnimatePresence>
//         {toast && (
//           <motion.div
//             initial={{ opacity: 0, y: -8 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, y: -8 }}
//             className="fixed top-4 right-4 bg-blue-800 text-white px-4 py-2 rounded-lg shadow-md z-50"
//           >
//             {toast}
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* Top mobile bar: menu toggle + title + save hint */}
//       <div className="flex items-center justify-between mb-4 md:hidden">
//         <button
//           aria-label="Open menu"
//           onClick={() => setSidebarOpen(true)}
//           className="p-2 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100"
//         >
//           <Menu className="w-5 h-5" />
//         </button>

//         <div className="text-center flex-1">
//           <h1 className="text-lg font-semibold text-slate-800">Profile</h1>
//           <div className="text-xs text-slate-500">
//             Manage your boards & subjects
//           </div>
//         </div>

//         <div className="ml-2">
//           <button
//             onClick={() => void handleSave()}
//             disabled={!dirty || saving}
//             className={`px-3 py-1.5 rounded-md text-sm font-semibold ${
//               !dirty
//                 ? "bg-slate-100 text-slate-400 cursor-not-allowed"
//                 : "bg-blue-600 text-white hover:bg-blue-700"
//             }`}
//           >
//             {saving ? "Saving..." : "Save"}
//           </button>
//         </div>
//       </div>

//       <div className="flex flex-col md:flex-row gap-6">
//         {/* Sidebar (left) - desktop visible, mobile drawer */}
//         <aside className="md:w-80">
//           {/* mobile drawer overlay */}
//           <div
//             className={`fixed inset-0 z-40 md:hidden transition-opacity ${
//               sidebarOpen ? "opacity-100 visible" : "opacity-0 invisible"
//             }`}
//             onClick={() => setSidebarOpen(false)}
//             aria-hidden
//           >
//             <div className="absolute inset-0 bg-black/30" />
//           </div>

//           <motion.div
//             initial={{ x: -18, opacity: 0 }}
//             animate={{ x: 0, opacity: 1 }}
//             className={`bg-white/90 backdrop-blur-md border border-slate-200 rounded-2xl p-5 shadow-md md:sticky md:top-8 ${
//               // mobile drawer styles
//               sidebarOpen
//                 ? "fixed z-50 left-4 top-12 w-[90%] max-w-xs"
//                 : "hidden md:block"
//             }`}
//           >
//             {/* Header */}
//             <div className="flex items-center gap-3 mb-4">
//               <div className="relative w-14 h-14 rounded-full overflow-hidden border border-slate-200">
//                 <Image
//                   src={session.user.image || "/default-avatar.png"}
//                   alt="Profile"
//                   width={56}
//                   height={56}
//                   className="object-cover"
//                 />
//               </div>

//               <div className="flex-1">
//                 <div className="text-sm font-semibold text-slate-800">
//                   {name || session.user.name}
//                 </div>
//                 <div className="text-xs text-slate-500">
//                   Signed in with Google
//                 </div>
//               </div>

//               {/* close button (mobile) */}
//               <button
//                 onClick={() => setSidebarOpen(false)}
//                 className="md:hidden p-2 rounded-full text-slate-600 hover:bg-slate-100"
//                 aria-label="Close menu"
//               >
//                 <X className="w-4 h-4" />
//               </button>
//             </div>

//             <div className="grid gap-3">
//               <Button
//                 variant="ghost"
//                 onClick={() => signOut()}
//                 className="w-full justify-start text-blue-700"
//               >
//                 Sign out
//               </Button>

//               <div
//                 className={`border rounded-lg p-3 text-sm transition-all ${
//                   dirty
//                     ? "bg-yellow-50 border-yellow-200 text-yellow-800"
//                     : "bg-blue-50 border-blue-100 text-blue-800"
//                 }`}
//               >
//                 {dirty ? (
//                   <>
//                     ⚠️ Unsaved changes — click <strong>“Save Changes”</strong>{" "}
//                     below.
//                   </>
//                 ) : (
//                   <>
//                     💡 Tip: Select your exam boards first — subjects & sessions
//                     depend on them.
//                   </>
//                 )}
//               </div>

//               <div className="text-xs text-slate-600">
//                 <div className="mb-1 font-medium text-slate-700">Boards</div>
//                 <div className="flex flex-wrap gap-2">
//                   {(BOARDS as any).map((b: any) => {
//                     const active = boards.includes(b.key);
//                     return (
//                       <button
//                         key={b.key}
//                         type="button"
//                         onClick={() =>
//                           setBoards((prev) =>
//                             prev.includes(b.key)
//                               ? prev.filter((x) => x !== b.key)
//                               : [...prev, b.key]
//                           )
//                         }
//                         className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
//                           active
//                             ? "bg-blue-600 text-white shadow"
//                             : "bg-slate-100 text-slate-700 hover:bg-slate-200"
//                         }`}
//                       >
//                         {b.label}
//                       </button>
//                     );
//                   })}
//                 </div>
//               </div>
//             </div>
//           </motion.div>
//         </aside>

//         {/* Main content */}
//         <section className="flex-1">
//           <form onSubmit={handleSave} className="flex flex-col gap-6">
//             {/* Header (desktop) */}
//             <div className="hidden md:flex items-center justify-between gap-4">
//               <div>
//                 <h1 className="text-2xl font-bold text-slate-800">Profile</h1>
//                 <p className="text-sm text-slate-500 mt-1">
//                   Manage your boards, subjects and exam sessions.
//                 </p>
//               </div>

//               <div className="flex items-center gap-3">
//                 <Input
//                   value={name}
//                   onChange={(e) => setName(e.target.value)}
//                   className="max-w-sm"
//                   placeholder="Display name"
//                 />
//                 <Button
//                   onClick={(e) => void handleSave(e)}
//                   disabled={!dirty || saving}
//                   className="bg-blue-600 hover:bg-blue-700 text-white"
//                 >
//                   {saving ? "Saving..." : "Save Changes"}
//                 </Button>
//               </div>
//             </div>

//             {/* Subjects area */}
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//               {/* AS column */}
//               <div className="border rounded-lg p-4 bg-white">
//                 <div className="flex items-center justify-between mb-3">
//                   <h3 className="text-lg font-semibold text-slate-800">
//                     AS Level Subjects
//                   </h3>
//                   <div className="flex items-center gap-2">
//                     <Button
//                       onClick={() => setOpenASModal(true)}
//                       className="bg-blue-600 hover:bg-blue-700 text-white"
//                     >
//                       + Add AS Subjects
//                     </Button>
//                   </div>
//                 </div>

//                 {subjectsAS.length === 0 ? (
//                   <div className="text-sm text-slate-500">
//                     No AS subjects selected. Click “Add AS Subjects”.
//                   </div>
//                 ) : (
//                   <div className="space-y-2">
//                     {subjectsAS.map((key) => {
//                       const [board, code] = key.split("::");
//                       const subj = (SUBJECTS_BY_BOARD as any)[board]?.find(
//                         (s: any) => s.code === code
//                       );
//                       return (
//                         <div
//                           key={key}
//                           className="flex items-center justify-between p-2 rounded-md hover:bg-slate-50"
//                         >
//                           <div>
//                             <div className="text-sm font-medium text-slate-800">
//                               {subj?.name || code}
//                             </div>
//                             <div className="text-xs text-slate-500">
//                               {code} • {board}
//                             </div>
//                           </div>
//                           <div className="flex items-center gap-2">
//                             <Button
//                               variant="ghost"
//                               size="sm"
//                               onClick={() => handleRemoveAS(key)}
//                             >
//                               Remove
//                             </Button>
//                           </div>
//                         </div>
//                       );
//                     })}
//                   </div>
//                 )}
//               </div>

//               {/* A2 column */}
//               <div className="border rounded-lg p-4 bg-white">
//                 <div className="flex items-center justify-between mb-3">
//                   <h3 className="text-lg font-semibold text-slate-800">
//                     A2 Level Subjects
//                   </h3>
//                   <div className="flex items-center gap-2">
//                     <Button
//                       onClick={() => setOpenA2Modal(true)}
//                       className="bg-blue-600 hover:bg-blue-700 text-white"
//                     >
//                       + Add A2 Subjects
//                     </Button>
//                   </div>
//                 </div>

//                 {subjectsA2.length === 0 ? (
//                   <div className="text-sm text-slate-500">
//                     No A2 subjects selected. Click “Add A2 Subjects”.
//                   </div>
//                 ) : (
//                   <div className="space-y-2">
//                     {subjectsA2.map((key) => {
//                       const [board, code] = key.split("::");
//                       const subj = (SUBJECTS_BY_BOARD as any)[board]?.find(
//                         (s: any) => s.code === code
//                       );
//                       return (
//                         <div
//                           key={key}
//                           className="flex items-center justify-between p-2 rounded-md hover:bg-slate-50"
//                         >
//                           <div>
//                             <div className="text-sm font-medium text-slate-800">
//                               {subj?.name || code}
//                             </div>
//                             <div className="text-xs text-slate-500">
//                               {code} • {board}
//                             </div>
//                           </div>
//                           <div className="flex items-center gap-2">
//                             <Button
//                               variant="ghost"
//                               size="sm"
//                               onClick={() => handleRemoveA2(key)}
//                             >
//                               Remove
//                             </Button>
//                           </div>
//                         </div>
//                       );
//                     })}
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Sessions + Notifications */}
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//               <div className="border rounded-lg p-4 bg-white">
//                 <div className="flex items-center justify-between mb-2">
//                   <h3 className="text-lg font-semibold text-slate-800">
//                     Exam Sessions
//                   </h3>
//                   <Button
//                     onClick={() => setOpenSessionModal(true)}
//                     className="bg-blue-50 text-blue-700 hover:bg-blue-100"
//                   >
//                     Manage
//                   </Button>
//                 </div>

//                 {examSession.length === 0 ? (
//                   <div className="text-sm text-slate-500">
//                     No sessions selected.
//                   </div>
//                 ) : (
//                   <div className="flex flex-wrap gap-2 mt-2">
//                     {examSession.map((s) => (
//                       <span
//                         key={s}
//                         className="px-3 py-1 rounded-full bg-slate-100 text-sm text-slate-700"
//                       >
//                         {s.replace("::", " — ")}
//                       </span>
//                     ))}
//                   </div>
//                 )}
//               </div>

//               <div className="border rounded-lg p-4 bg-white md:col-span-2">
//                 <div className="flex items-center justify-between mb-2">
//                   <h3 className="text-lg font-semibold text-slate-800">
//                     Notifications
//                   </h3>
//                 </div>

//                 <div className="flex items-center gap-3">
//                   <Switch
//                     checked={receiveEmails}
//                     onCheckedChange={(v) => setReceiveEmails(!!v)}
//                   />
//                   <div>
//                     <div className="text-sm font-medium text-slate-800">
//                       Receive updates about new resources
//                     </div>
//                     <div className="text-xs text-slate-500">
//                       We will email you when new resources are added to your
//                       selected subjects.
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <div className="h-20" />
//             <div className="text-xs text-slate-400">
//               Profile last updated: {/* show timestamp if you have */}
//             </div>
//           </form>
//         </section>
//       </div>

//       {/* Sticky Save Bar */}
//       <div className="fixed left-0 right-0 bottom-4 flex justify-center pointer-events-none z-40">
//         <div className="max-w-7xl w-full px-4 sm:px-6 md:px-10">
//           <div className="bg-white/95 backdrop-blur border border-slate-200 rounded-2xl p-3 flex items-center justify-between gap-4 pointer-events-auto shadow-xl">
//             <div className="flex items-center gap-3">
//               {dirty ? (
//                 <div className="text-sm text-yellow-700">
//                   ⚠️ You have unsaved changes
//                 </div>
//               ) : (
//                 <div className="text-sm text-slate-600">All changes saved</div>
//               )}
//             </div>

//             <div className="flex items-center gap-2">
//               <Button variant="ghost" onClick={() => window.location.reload()}>
//                 Cancel
//               </Button>
//               <Button
//                 onClick={(e: any) => void handleSave(e)}
//                 disabled={!dirty || saving}
//                 className="bg-blue-600 hover:bg-blue-700 text-white"
//               >
//                 {saving ? "Saving..." : "Save Changes"}
//               </Button>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Modals */}
//       <SubjectPickerModal
//         open={openASModal}
//         onOpenChange={setOpenASModal}
//         subjects={availableSubjects}
//         onSave={handleAddSubjectsAS}
//         title="Add AS Subjects"
//       />
//       <SubjectPickerModal
//         open={openA2Modal}
//         onOpenChange={setOpenA2Modal}
//         subjects={availableSubjects}
//         onSave={handleAddSubjectsA2}
//         title="Add A2 Subjects"
//       />
//       <SessionPickerModal
//         open={openSessionModal}
//         onOpenChange={setOpenSessionModal}
//         options={sessionOptions}
//         current={examSession}
//         onSave={handleSaveSessions}
//       />
//     </main>
//   );
// }

/*  ---------------------------------------------------------
    PROFILE PAGE — WITH:
    • FIXED LEFT SIDEBAR
    • BOARDS MOVED TO MAIN PANEL (RIGHT SIDE)
    --------------------------------------------------------- */

"use client";

import PremiumSidebar from "@/components/PremiumSidebar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { AnimatePresence, motion } from "framer-motion";
import { HelpCircle, Menu, Plus, Search, Settings } from "lucide-react";
import { useClerk, useUser } from "@clerk/nextjs";
import Image from "next/image";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

import {
  BOARDS,
  SESSIONS_BY_BOARD,
  SUBJECTS_BY_BOARD,
} from "@/lib/exam-constants";

type BoardKey = "CAIE" | "Edexcel" | "Edexcel_IAL" | "AQA" | "OCR" | "WJEC";

interface UserPayload {
  name: string;
  redditUsername: string;
  discordUsername: string;
  email: string;
  boards?: BoardKey[];
  subjectsAS?: string[];
  subjectsA2?: string[];
  examSession?: string[];
  receiveEmails?: boolean;
}

function normalizeSubjects(arr?: string[] | null) {
  if (!arr) return [];
  return arr;
}

/* Small accessible IconButton */

function IconButton({
  title,
  onClick,
  children,
  className = "",
}: {
  title: any;
  onClick: any;
  children: any;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={title}
      title={title}
      className={
        "inline-flex items-center justify-center w-9 h-9 rounded-md hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-300 " +
        className
      }
    >
      {children}
    </button>
  );
}

/* Simple Tooltip (shows on hover/focus) */
function Tooltip({ children, tip }: { children: any; tip: any }) {
  return (
    <div className="relative group inline-block">
      {children}
      <div
        role="tooltip"
        className="pointer-events-none opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity text-xs bg-black text-white rounded-md px-2 py-1 absolute -top-8 right-0 whitespace-nowrap"
      >
        {tip}
      </div>
    </div>
  );
}

/* Popover - small accessible popover */
function Popover({ trigger, children }: { trigger: any; children: any }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onEsc);

    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  return (
    <div className="relative inline-block" ref={ref}>
      <div onClick={() => setOpen((o) => !o)}>{trigger({ open, setOpen })}</div>

      {open && (
        <div
          role="dialog"
          aria-modal="false"
          className="absolute top-full right-0 mt-2 w-80 bg-white border rounded-md shadow-lg p-3 text-sm z-30"
        >
          {children({ close: () => setOpen(false) })}
        </div>
      )}
    </div>
  );
}
/* -----------------------------------------------------------
   SUBJECT PICKER MODAL
----------------------------------------------------------- */
function SubjectPickerModal({
  open,
  onOpenChange,
  subjects,
  onSave,
  title,
}: any) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!open) {
      setQuery("");
      setSelected({});
    }
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return subjects;
    return subjects.filter((s: any) =>
      (s.name + " " + s.code).toLowerCase().includes(q)
    );
  }, [subjects, query]);

  function toggle(key: string) {
    setSelected((p) => ({ ...p, [key]: !p[key] }));
  }

  function handleAdd() {
    const picked = Object.keys(selected).filter((k) => selected[k]);
    onSave(picked);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-full">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          <div className="flex items-center gap-2 mb-3">
            <Search className="w-5 h-5 text-blue-400" />
            <Input
              value={query}
              onChange={(e: any) => setQuery(e.target.value)}
              placeholder="Search subjects..."
            />
          </div>

          <div className="max-h-[50vh] overflow-y-auto space-y-1">
            {filtered.length === 0 && (
              <div className="text-sm text-slate-500 p-6 text-center">
                No subjects found
              </div>
            )}

            {filtered.map((s: any) => (
              <label
                key={s.key}
                className="flex items-center gap-3 p-2 rounded-md hover:bg-slate-50 cursor-pointer"
              >
                <Checkbox
                  checked={!!selected[s.key]}
                  onCheckedChange={() => toggle(s.key)}
                />
                <div className="flex-1 text-sm">
                  <div className="font-medium text-slate-800">{s.name}</div>
                  <div className="text-xs text-slate-500">
                    {s.code} • {s.board}
                  </div>
                </div>
              </label>
            ))}
          </div>

          <DialogFooter className="mt-4 flex justify-between">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setSelected({})}>
                Clear
              </Button>
              <Button onClick={handleAdd}>
                Add Selected (
                {Object.keys(selected).filter((k) => selected[k]).length})
              </Button>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* -----------------------------------------------------------
   SESSION PICKER MODAL
----------------------------------------------------------- */
function SessionPickerModal({
  open,
  onOpenChange,
  options,
  current,
  onSave,
}: any) {
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (open) {
      const m: any = {};
      options.forEach((o: any) => (m[o.key] = current.includes(o.key)));
      setSelected(m);
    }
  }, [open, options, current]);

  function toggle(key: string) {
    setSelected((p) => ({ ...p, [key]: !p[key] }));
  }

  function handleSave() {
    onSave(Object.keys(selected).filter((k) => selected[k]));
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg w-full">
        <DialogHeader>
          <DialogTitle>Select Exam Sessions</DialogTitle>
        </DialogHeader>

        <div className="mt-4 max-h-[50vh] overflow-y-auto">
          {options.map((o: any) => (
            <label
              key={o.key}
              className="flex items-center gap-3 p-2 rounded-md hover:bg-slate-50 cursor-pointer"
            >
              <Checkbox
                checked={!!selected[o.key]}
                onCheckedChange={() => toggle(o.key)}
              />
              <div className="text-sm text-slate-800">{o.label}</div>
            </label>
          ))}
        </div>

        <DialogFooter className="mt-4 flex justify-end">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* -----------------------------------------------------------
   MAIN COMPONENT
----------------------------------------------------------- */
export default function ProfilePage() {
  const { user, isSignedIn } = useUser();
  const { signOut } = useClerk();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [boards, setBoards] = useState<BoardKey[]>([]);
  const [subjectsAS, setSubjectsAS] = useState<string[]>([]);
  const [subjectsA2, setSubjectsA2] = useState<string[]>([]);
  const [examSession, setExamSession] = useState<string[]>([]);
  const [receiveEmails, setReceiveEmails] = useState(false);
  const [name, setName] = useState("");
  const [redditUsername, setRedditUsername] = useState("");
  const [discordUsername, setDiscordUsername] = useState("");
  const [initialSnapshot, setInitialSnapshot] = useState("");

  const [openASModal, setOpenASModal] = useState(false);
  const [openA2Modal, setOpenA2Modal] = useState(false);
  const [openSessionModal, setOpenSessionModal] = useState(false);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const availableSubjects = useMemo(() => {
    const combined: any[] = [];
    boards.forEach((b) => {
      const list = (SUBJECTS_BY_BOARD as any)[b];
      (list || []).forEach((s: any) =>
        combined.push({
          key: `${b}::${s.code}::${s.name}`,
          board: b,
          code: s.code,
          name: s.name,
        })
      );
    });
    return combined;
  }, [boards]);

  async function handleSwitchAccount() {
    await signOut({ redirectUrl: "/sign-in" });
  }

  const sessionOptions = useMemo(() => {
    const out: any[] = [];
    boards.forEach((b) => {
      const arr = (SESSIONS_BY_BOARD as any)[b];
      arr?.forEach((s: any) =>
        out.push({ key: `${b}::${s}`, label: `${b} — ${s}` })
      );
    });
    return out;
  }, [boards]);

  function showT(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  /* LOAD USER ---------------------- */
  useEffect(() => {
    async function load() {
      const email = user?.primaryEmailAddress?.emailAddress;
      if (!email) return setLoading(false);

      try {
        const r = await fetch("/api/user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        const data = await r.json();

        const asNorm = normalizeSubjects(data.subjectsAS);
        const a2Norm = normalizeSubjects(data.subjectsA2);
        const sesNorm = Array.isArray(data.examSession)
          ? data.examSession
          : [data.examSession].filter(Boolean);

        const used = new Set<BoardKey>();
        [...asNorm, ...a2Norm, ...sesNorm].forEach((k: string) => {
          const bd = (k || "").split("::")[0] as BoardKey;
          if (BOARDS.some((x) => x.key === bd)) used.add(bd);
        });

        const boardArr = Array.from(used);

        // --- Set states ---
        setBoards(boardArr);
        setSubjectsAS(asNorm);
        setSubjectsA2(a2Norm);
        setExamSession(sesNorm);
        setReceiveEmails(!!data.receiveEmails);

        const reddit = data.redditUsername ?? "";
        const discord = data.discordUsername ?? "";

        setRedditUsername(reddit);
        setDiscordUsername(discord);

        const defaultName =
          data.name && data.name.trim().length > 0
            ? data.name
            : user?.fullName ?? "";

        setName(defaultName);

        // --- THE PERFECT SNAPSHOT ---
        setInitialSnapshot(
          JSON.stringify({
            name: defaultName,
            redditUsername: reddit,
            discordUsername: discord,
            boards: boardArr,
            subjectsAS: asNorm,
            subjectsA2: a2Norm,
            examSession: sesNorm,
            receiveEmails: !!data.receiveEmails,
          })
        );
      } catch {
        showT("Could not load profile");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [user?.primaryEmailAddress?.emailAddress]);

  useEffect(() => {
    if (!initialSnapshot) return;

    const current = JSON.stringify({
      name,
      redditUsername,
      discordUsername,
      boards,
      subjectsAS,
      subjectsA2,
      examSession,
      receiveEmails,
    });

    setDirty(current !== initialSnapshot);
  }, [
    name,
    redditUsername,
    discordUsername,
    boards,
    subjectsAS,
    subjectsA2,
    examSession,
    receiveEmails,
    initialSnapshot,
  ]);

  async function handleSave(e?: FormEvent) {
    if (e) e.preventDefault();
    const email = user?.primaryEmailAddress?.emailAddress;
    if (!email) return;

    setSaving(true);

    const payload: UserPayload = {
      name,
      email,
      redditUsername,
      discordUsername,
      boards,
      subjectsAS,
      subjectsA2,
      examSession,
      receiveEmails,
    };

    try {
      const res = await fetch("/api/user/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Save failed");

      showT("Profile saved");

      // Snapshot MUST include new fields
      const newSnapshot = JSON.stringify({
        name,
        redditUsername,
        discordUsername,
        boards,
        subjectsAS,
        subjectsA2,
        examSession,
        receiveEmails,
      });

      setInitialSnapshot(newSnapshot);
      setDirty(false);
    } catch {
      showT("Error saving");
    } finally {
      setSaving(false);
    }
  }

  // --------------------------------------------
  if (loading) return <div className="p-10 text-center">Loading...</div>;

  if (!isSignedIn) {
    return (
      <div className="p-10 text-center">
        Please sign in to view your profile.
      </div>
    );
  }

  /* ------------------------------------------------------------------------
     LAYOUT REWRITE:
     • LEFT SIDEBAR = FIXED
     • BOARDS SECTION MOVED TO MAIN PANEL
  ------------------------------------------------------------------------ */

  return (
    <main className="relative max-w-7xl mx-auto p-4 sm:p-6 md:p-10">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="fixed top-4 right-4 bg-blue-700 text-white px-4 py-2 rounded shadow z-50"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile top bar */}
      <div className="flex md:hidden items-center justify-between mb-4">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded bg-blue-50 text-blue-600"
        >
          <Menu />
        </button>

        <div className="text-lg font-semibold">Profile</div>

        <button
          onClick={() => handleSave()}
          disabled={!dirty}
          className={`px-3 py-1 rounded ${
            dirty ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-500"
          }`}
        >
          Save
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[20rem_1fr] gap-8">
        {/* ---------------- FIXED SIDEBAR (LEFT) ---------------- */}
        {/* <aside className="hidden md:block w-72">
          <div className="fixed w-72 top-24 left-[max(1rem,calc(50%-700px))] bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 rounded-full overflow-hidden border">
                <Image
                  src={session?.user?.image || "/default-avatar.png"}
                  alt="pfp"
                  width={56}
                  height={56}
                />
              </div>

              <div>
                <div className="text-sm font-semibold">{name}</div>
                <div className="text-xs text-slate-500">
                  Signed in with Google
                </div>
              </div>
            </div>

            <Button
              variant="ghost"
              onClick={() => signOut()}
              className="text-blue-700 mb-3"
            >
              Sign out
            </Button>

            <div
              className={`border rounded p-3 text-xs ${
                dirty
                  ? "bg-yellow-50 border-yellow-200 text-yellow-700"
                  : "bg-blue-50 border-blue-200 text-blue-700"
              }`}
            >
              {dirty ? "Unsaved changes" : "All changes saved"}
            </div>
          </div>
        </aside> */}

        <PremiumSidebar
          name={name}
          redditUsername={redditUsername}
          discordUsername={discordUsername}
          image={user?.imageUrl}
          boards={boards}
          subjectsAS={subjectsAS}
          subjectsA2={subjectsA2}
          examSession={examSession}
          receiveEmails={receiveEmails}
          onSwitchAccount={handleSwitchAccount}
          onToggleBoard={(b) =>
            setBoards((prev) =>
              prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b]
            )
          }
          onSignOut={() => signOut({ redirectUrl: "/sign-in" })}
          onUpgrade={() => alert("Nitro Coming Soon!")}
        />

        {/* ---------------- RIGHT PANEL ---------------- */}
        <section className="flex-1">
          <form onSubmit={handleSave} className="flex flex-col gap-8">
            {/* Header (Desktop) */}
            <div className="hidden md:flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-center">
              <div>
                <h1 className="text-2xl font-bold">Profile</h1>
                <p className="text-sm text-slate-500">
                  Manage your boards, subjects and exam sessions.
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  disabled={!dirty}
                  className="bg-blue-600 text-white hover:bg-blue-700"
                >
                  Save Changes
                </Button>
              </div>
            </div>

            {/* ---------------------------------
                BOARDS  (now inside main panel!)
            --------------------------------- */}
            <div className="border rounded-xl p-4 bg-white">
              <h2 className="text-lg font-semibold mb-3">Exam Boards</h2>

              <div className="flex flex-wrap gap-2">
                {BOARDS.map((b: any) => {
                  const active = boards.includes(b.key);
                  return (
                    <button
                      key={b.key}
                      type="button"
                      onClick={() =>
                        setBoards((prev) =>
                          prev.includes(b.key)
                            ? prev.filter((x) => x !== b.key)
                            : [...prev, b.key]
                        )
                      }
                      className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                        active
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 hover:bg-slate-200"
                      }`}
                    >
                      {b.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SUBJECTS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* AS */}
              <div className="border rounded-xl p-4 bg-white">
                <div className="flex justify-between mb-3">
                  <h3 className="text-lg font-semibold">AS Level Subjects</h3>
                </div>

                {subjectsAS.length === 0 ? (
                  <div className="text-sm text-slate-500">
                    No AS subjects selected.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {subjectsAS.map((k) => {
                      const [bd, code] = k.split("::");
                      const board = bd as BoardKey;
                      const subj = SUBJECTS_BY_BOARD[board]?.find(
                        (s: any) => s.code === code
                      );
                      return (
                        <div
                          key={k}
                          className="flex justify-between p-2 rounded hover:bg-slate-50"
                        >
                          <div>
                            <div className="font-medium">{subj?.name}</div>
                            <div className="text-xs text-slate-500">
                              {code} • {bd}
                            </div>
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setSubjectsAS((p) => p.filter((x) => x !== k))
                            }
                          >
                            Remove
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setOpenASModal(true)}
                  className="inline-flex w-full mt-4 items-center gap-2 px-3.5 py-2 rounded-lg bg-white border border-blue-100 shadow-sm hover:shadow-md transition text-blue-700"
                  aria-label="Add AS subjects"
                >
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-600 text-white">
                    <Plus className="w-4 h-4" />
                  </span>
                  <span className="text-sm font-medium">Add AS subjects</span>
                </button>
              </div>

              {/* A2 */}
              <div className="border rounded-xl p-4 bg-white">
                <div className="flex justify-between mb-3">
                  <h3 className="text-lg font-semibold">A2 Level Subjects</h3>
                </div>

                {subjectsA2.length === 0 ? (
                  <div className="text-sm text-slate-500">
                    No A2 subjects selected.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {subjectsA2.map((k) => {
                      const [bd, code] = k.split("::");
                      const board = bd as BoardKey;
                      const subj = SUBJECTS_BY_BOARD[board]?.find(
                        (s: any) => s.code === code
                      );
                      return (
                        <div
                          key={k}
                          className="flex justify-between p-2 rounded hover:bg-slate-50"
                        >
                          <div>
                            <div className="font-medium">{subj?.name}</div>
                            <div className="text-xs text-slate-500">
                              {code} • {bd}
                            </div>
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setSubjectsA2((p) => p.filter((x) => x !== k))
                            }
                          >
                            Remove
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setOpenA2Modal(true)}
                  className="inline-flex mt-4 items-center gap-2 px-3.5 py-2 rounded-lg w-full bg-white border border-blue-100 shadow-sm hover:shadow-md transition text-blue-700"
                  aria-label="Add A2 subjects"
                >
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-600 text-white">
                    <Plus className="w-4 h-4" />
                  </span>
                  <span className="text-sm font-medium">Add A2 subjects</span>
                </button>
              </div>
            </div>

            {/* Sessions + notifications */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="border rounded-xl p-4 bg-white">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold">Exam Sessions</h3>

                  <Tooltip tip="Manage exam sessions">
                    <IconButton
                      title="Manage exam sessions"
                      onClick={() => setOpenSessionModal(true)}
                    >
                      <Settings className="w-5 h-5 text-slate-600" />
                    </IconButton>
                  </Tooltip>
                </div>

                <div className="flex flex-wrap gap-2 mt-3">
                  {examSession.map((s) => (
                    <span
                      key={s}
                      className="px-3 py-1 rounded-full bg-slate-100 text-sm"
                    >
                      {s.replace("::", " — ")}
                    </span>
                  ))}
                </div>
              </div>

              {/* Notifications panel unchanged */}
              <div className="border rounded-xl p-4 bg-white md:col-span-2">
                <h3 className="text-lg font-semibold mb-2">Notifications</h3>

                <label className="flex items-center gap-3">
                  <Switch
                    checked={receiveEmails}
                    onCheckedChange={(v) => setReceiveEmails(!!v)}
                    className="data-[state=checked]:bg-blue-600 
           data-[state=unchecked]:bg-gray-300
           data-[state=checked]:border-blue-600 
           data-[state=unchecked]:border-gray-300"
                  />
                  <div>
                    <div className="font-medium">Receive updates</div>
                    <div className="text-xs text-slate-500">
                      We will notify you when new resources are added.
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* ---------- Profile Identity card (new) ---------- */}
            <div className="border rounded-xl p-6 bg-white">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Profile identity</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Set the names other users will see. Your display name
                    appears on the site, your Reddit and Discord usernames are
                    used for community features.
                  </p>
                </div>

                {/* Help popover */}
                <Popover
                  trigger={({ open }: { open: any }) => (
                    <Tooltip tip="How to find your Reddit / Discord username">
                      <button
                        type="button"
                        aria-expanded={open}
                        className="w-9 h-9 rounded-full border border-slate-200 bg-white 
                       flex items-center justify-center focus:ring-2 focus:ring-blue-300"
                      >
                        <HelpCircle className="w-5 h-5 text-slate-700" />
                      </button>
                    </Tooltip>
                  )}
                >
                  {({ close }: { close: any }) => (
                    <div className="text-sm text-slate-700">
                      <div className="font-medium mb-1">
                        How to find your username
                      </div>

                      <ul className="text-xs space-y-2">
                        <li>
                          <strong>Reddit:</strong> Visit{" "}
                          <span className="font-mono">reddit.com/prefs/</span>{" "}
                          or open your profile.
                        </li>
                        <li>
                          <strong>Discord:</strong>
                          Desktop: bottom-left → username. Mobile: tap profile →
                          displayed at top.
                        </li>
                      </ul>
                    </div>
                  )}
                </Popover>
              </div>

              {/* The rest of your identity form stays unchanged */}
              <div className="mt-5 grid gap-3">
                {/* Display name */}
                <label className="text-xs text-slate-500">Display name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="How should we call you?"
                  className="max-w-lg"
                />
                <p className="text-xs text-slate-400">
                  Visible on your profile and comments. Keep it friendly and
                  recognisable.
                </p>

                {/* Reddit */}
                <div className="mt-3">
                  <label className="text-xs text-slate-500">
                    Reddit username
                  </label>
                  <div className="flex gap-2 items-center mt-2 max-w-lg">
                    <div
                      className="w-9 h-9 rounded-md bg-white/60 border border-slate-100 
                        flex items-center justify-center"
                    >
                      <Image
                        src="/icons/reddit.svg"
                        alt="reddit"
                        width={20}
                        height={20}
                      />
                    </div>
                    <Input
                      value={redditUsername}
                      onChange={(e) => setRedditUsername(e.target.value)}
                      placeholder="your reddit username (e.g. u/yourname)"
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    We’ll display this next to your activity (optional).
                  </p>
                </div>

                {/* Discord */}
                <div className="mt-3">
                  <label className="text-xs text-slate-500">
                    Discord username
                  </label>
                  <div className="flex gap-2 items-center mt-2 max-w-lg">
                    <div
                      className="w-9 h-9 rounded-md bg-white/60 border border-slate-100 
                        flex items-center justify-center"
                    >
                      <Image
                        src="/icons/discord.svg"
                        alt="discord"
                        width={20}
                        height={20}
                      />
                    </div>
                    <Input
                      value={discordUsername}
                      onChange={(e) => setDiscordUsername(e.target.value)}
                      placeholder="Discord tag (e.g. name#1234)"
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Adds a quick contact reference on your profile (optional).
                  </p>
                </div>

                <div className="mt-4 text-xs text-slate-500">
                  Changes here are saved with the main “Save Changes” button.
                </div>
              </div>
            </div>

            <div className="text-xs text-slate-400">Profile last updated:</div>
          </form>
        </section>
      </div>

      {/* Sticky Save Bar */}
      {/* <div className="fixed bottom-4 left-0 right-0 flex justify-center pointer-events-none z-50">
        <div className="max-w-7xl w-full px-4 pointer-events-auto">
          <div className="bg-white border rounded-xl p-3 shadow flex justify-between items-center">
            <div className="text-sm">
              {dirty ? (
                <span className="text-yellow-700">Unsaved changes</span>
              ) : (
                <span className="text-slate-500">All changes saved</span>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => window.location.reload()}>
                Cancel
              </Button>
              <Button
                disabled={!dirty}
                onClick={(e) => handleSave(e)}
                className="bg-blue-600 text-white"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </div> */}

      {/* Sticky Save Bar */}
      {dirty && (
        <div className="fixed left-0 right-0 bottom-4 flex justify-center pointer-events-none z-50">
          <div className="max-w-7xl w-full px-6 md:px-10">
            <div
              className="
          pointer-events-auto
          rounded-2xl
          p-3
          flex items-center justify-between gap-4
          backdrop-blur
          bg-blue-50/80
          border border-blue-200
          shadow-[0_0_25px_rgba(59,130,246,0.25)]
          transition-all
        "
            >
              <div className="flex items-center gap-3 text-blue-800">
                ⚠️ You have unsaved changes
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => window.location.reload()}
                >
                  Cancel
                </Button>

                <Button
                  type="button"
                  disabled={saving}
                  onClick={() => handleSave()}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl shadow transition"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <SubjectPickerModal
        open={openASModal}
        onOpenChange={setOpenASModal}
        subjects={availableSubjects}
        onSave={(k: string[]) =>
          setSubjectsAS((p) => Array.from(new Set([...p, ...k])))
        }
        title="Add AS Subjects"
      />

      <SubjectPickerModal
        open={openA2Modal}
        onOpenChange={setOpenA2Modal}
        subjects={availableSubjects}
        onSave={(k: string[]) =>
          setSubjectsA2((p) => Array.from(new Set([...p, ...k])))
        }
        title="Add A2 Subjects"
      />

      <SessionPickerModal
        open={openSessionModal}
        onOpenChange={setOpenSessionModal}
        options={sessionOptions}
        current={examSession}
        onSave={(k: string[]) => setExamSession(k)}
      />
    </main>
  );
}
