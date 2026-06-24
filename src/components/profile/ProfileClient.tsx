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
import { useClerk, useUser } from "@clerk/nextjs";
import { AnimatePresence, motion } from "framer-motion";
import { HelpCircle, Menu, Plus, Search, Settings } from "lucide-react";
import Image from "next/image";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

import type { UserProfile } from "@/lib/data/user-profile";
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
      (s.name + " " + s.code).toLowerCase().includes(q),
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

type ProfileClientProps = {
  initialProfile: UserProfile | null;
  userImageUrl?: string | null;
  userFullName?: string | null;
};

function buildSnapshot(profile: {
  name: string;
  redditUsername: string;
  discordUsername: string;
  boards: BoardKey[];
  subjectsAS: string[];
  subjectsA2: string[];
  examSession: string[];
  receiveEmails: boolean;
}) {
  return JSON.stringify(profile);
}

function profileToState(profile: UserProfile, fallbackName?: string | null) {
  const name =
    profile.name && profile.name.trim().length > 0
      ? profile.name
      : (fallbackName ?? "");

  return {
    name,
    redditUsername: profile.redditUsername,
    discordUsername: profile.discordUsername,
    boards: profile.boards,
    subjectsAS: normalizeSubjects(profile.subjectsAS),
    subjectsA2: normalizeSubjects(profile.subjectsA2),
    examSession: Array.isArray(profile.examSession)
      ? profile.examSession
      : [profile.examSession].filter(Boolean),
    receiveEmails: !!profile.receiveEmails,
    snapshot: buildSnapshot({
      name,
      redditUsername: profile.redditUsername,
      discordUsername: profile.discordUsername,
      boards: profile.boards,
      subjectsAS: normalizeSubjects(profile.subjectsAS),
      subjectsA2: normalizeSubjects(profile.subjectsA2),
      examSession: Array.isArray(profile.examSession)
        ? profile.examSession
        : [profile.examSession].filter(Boolean),
      receiveEmails: !!profile.receiveEmails,
    }),
  };
}

/* -----------------------------------------------------------
   MAIN COMPONENT
----------------------------------------------------------- */
export default function ProfileClient({
  initialProfile,
  userImageUrl,
  userFullName,
}: ProfileClientProps) {
  const initialState = initialProfile
    ? profileToState(initialProfile, userFullName)
    : null;

  const { user, isSignedIn } = useUser();
  const { signOut } = useClerk();
  const [loading, setLoading] = useState(!initialState);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [boards, setBoards] = useState<BoardKey[]>(initialState?.boards ?? []);
  const [subjectsAS, setSubjectsAS] = useState<string[]>(
    initialState?.subjectsAS ?? [],
  );
  const [subjectsA2, setSubjectsA2] = useState<string[]>(
    initialState?.subjectsA2 ?? [],
  );
  const [examSession, setExamSession] = useState<string[]>(
    initialState?.examSession ?? [],
  );
  const [receiveEmails, setReceiveEmails] = useState(
    initialState?.receiveEmails ?? false,
  );
  const [name, setName] = useState(initialState?.name ?? "");
  const [redditUsername, setRedditUsername] = useState(
    initialState?.redditUsername ?? "",
  );
  const [discordUsername, setDiscordUsername] = useState(
    initialState?.discordUsername ?? "",
  );
  const [initialSnapshot, setInitialSnapshot] = useState(
    initialState?.snapshot ?? "",
  );

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
        }),
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
        out.push({ key: `${b}::${s}`, label: `${b} — ${s}` }),
      );
    });
    return out;
  }, [boards]);

  function showT(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  /* LOAD USER (client fallback when server did not provide profile) */
  useEffect(() => {
    if (initialState) return;

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
            : (user?.fullName ?? "");

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
          }),
        );
      } catch {
        showT("Could not load profile");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [user?.primaryEmailAddress?.emailAddress, initialState]);

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
          image={userImageUrl ?? user?.imageUrl}
          boards={boards}
          subjectsAS={subjectsAS}
          subjectsA2={subjectsA2}
          examSession={examSession}
          receiveEmails={receiveEmails}
          onSwitchAccount={handleSwitchAccount}
          onToggleBoard={(b) =>
            setBoards((prev) =>
              prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b],
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
                            : [...prev, b.key],
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
                        (s: any) => s.code === code,
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
                        (s: any) => s.code === code,
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
