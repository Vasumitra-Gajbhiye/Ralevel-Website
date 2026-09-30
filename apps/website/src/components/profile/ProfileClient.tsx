"use client";

import AddPicker, { type PickerGroup } from "@/components/profile/AddPicker";
import {
  NAME_MAX_LENGTH,
  SUBJECT_LEVELS,
  boardName,
  fixedLevel,
  formFromProfile,
  formatSession,
  normalizeReddit,
  parseSubjectKey,
  removeBoard,
  subjectKey,
  toPayload,
  upcomingSittings,
  type ProfileForm,
  type SubjectLevel,
} from "@/components/profile/profile-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import type { UserProfile } from "@/lib/data/user-profile";
import {
  BOARDS,
  SUBJECTS_BY_BOARD,
  type BoardKey,
} from "@/lib/exam-constants";
import { cn } from "@/lib/utils";
import { useClerk } from "@clerk/nextjs";
import { Check, LogOut, X } from "lucide-react";
import Image from "next/image";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type ProfileClientProps = {
  profile: UserProfile;
  imageUrl: string | null;
};

export default function ProfileClient({
  profile,
  imageUrl,
}: ProfileClientProps) {
  const { signOut } = useClerk();
  const [saved, setSaved] = useState(() => formFromProfile(profile));
  const [form, setForm] = useState(saved);
  const [saving, setSaving] = useState(false);

  const dirty = useMemo(
    () => JSON.stringify(form) !== JSON.stringify(saved),
    [form, saved],
  );
  const nameError = form.name.trim() ? null : "Display name can't be empty.";

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const activeBoards = useMemo(
    () => BOARDS.filter((b) => form.boards.includes(b.key)),
    [form.boards],
  );

  const subjectGroups: PickerGroup[] = useMemo(() => {
    const taken = new Set(form.subjects.map((s) => s.key));
    return activeBoards.map((b) => ({
      heading: b.label,
      options: SUBJECTS_BY_BOARD[b.key]
        .map((s) => ({ value: subjectKey(b.key, s), label: s.name, hint: s.code }))
        .filter((o) => !taken.has(o.value)),
    }));
  }, [activeBoards, form.subjects]);

  const sessionGroups: PickerGroup[] = useMemo(() => {
    const taken = new Set(form.examSession);
    return activeBoards.map((b) => ({
      heading: b.label,
      options: upcomingSittings(b.key)
        .filter((s) => !taken.has(s.key))
        .map((s) => ({ value: s.key, label: s.label })),
    }));
  }, [activeBoards, form.examSession]);

  function update<K extends keyof ProfileForm>(key: K, value: ProfileForm[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function toggleBoard(board: BoardKey) {
    setForm((f) =>
      f.boards.includes(board)
        ? removeBoard(f, board)
        : { ...f, boards: [...f.boards, board] },
    );
  }

  function addSubject(key: string) {
    setForm((f) => ({
      ...f,
      subjects: [...f.subjects, { key, level: fixedLevel(key) ?? "A Level" }],
    }));
  }

  function setSubjectLevel(key: string, level: SubjectLevel) {
    setForm((f) => ({
      ...f,
      subjects: f.subjects.map((s) => (s.key === key ? { ...s, level } : s)),
    }));
  }

  async function handleSave(e?: FormEvent) {
    e?.preventDefault();
    if (!dirty || saving || nameError) return;

    const submitted = form;
    const payload = toPayload(submitted);
    setSaving(true);

    try {
      const res = await fetch("/api/user/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error);

      const next: ProfileForm = {
        ...submitted,
        name: payload.name,
        redditUsername: payload.redditUsername,
        discordUsername: payload.discordUsername,
      };
      setSaved(next);
      // Keep anything typed while the request was in flight.
      setForm((current) => (current === submitted ? next : current));
      toast.success("Profile saved");
    } catch (err) {
      const message = err instanceof Error && err.message;
      toast.error(message || "Couldn't save your profile. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="mx-auto max-w-4xl px-4 pb-32 pt-8 tracking-normal sm:px-6 animate-in fade-in slide-in-from-bottom-2 duration-500 motion-reduce:animate-none">
        <header className="flex items-center gap-4 border-b border-slate-200 pb-8">
          <Avatar src={imageUrl} name={form.name} />
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-xl font-semibold text-slate-900">
              {form.name.trim() || "Your profile"}
            </h1>
            <p className="truncate text-sm text-slate-500">{profile.email}</p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => signOut({ redirectUrl: "/" })}
          >
            <LogOut />
            Sign out
          </Button>
        </header>
  
        <form
          id="profile-form"
          onSubmit={handleSave}
          className="divide-y divide-slate-200"
        >
          <Section
            title="Personal info"
            description="How you appear to others on r/alevel."
          >
            <Field
              label="Display name"
              htmlFor="name"
              error={nameError}
              hint="Shown across the site, including on blog posts you write."
            >
              <Input
                id="name"
                value={form.name}
                maxLength={NAME_MAX_LENGTH}
                autoComplete="name"
                aria-invalid={!!nameError}
                onChange={(e) => update("name", e.target.value)}
              />
            </Field>
  
            <Field
              label="Email"
              htmlFor="email"
              hint="Managed by your Google account."
            >
              <Input
                id="email"
                value={profile.email}
                readOnly
                className="bg-slate-50 text-slate-500"
              />
            </Field>
  
            <div className="grid gap-6 sm:grid-cols-2">
              <Field label="Reddit username" htmlFor="reddit" optional>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-slate-400">
                    u/
                  </span>
                  <Input
                    id="reddit"
                    value={form.redditUsername}
                    placeholder="username"
                    maxLength={40}
                    className="pl-7"
                    onChange={(e) => update("redditUsername", e.target.value)}
                    onBlur={(e) =>
                      update("redditUsername", normalizeReddit(e.target.value))
                    }
                  />
                </div>
              </Field>
              <Field label="Discord username" htmlFor="discord" optional>
                <Input
                  id="discord"
                  value={form.discordUsername}
                  placeholder="username"
                  maxLength={40}
                  onChange={(e) => update("discordUsername", e.target.value)}
                />
              </Field>
            </div>
          </Section>
  
          <Section
            title="Studies"
            description="What you're studying, so we can show you the right resources."
          >
            <Field label="Exam boards">
              <div className="flex flex-wrap gap-2">
                {BOARDS.map((b) => {
                  const on = form.boards.includes(b.key);
                  return (
                    <button
                      key={b.key}
                      type="button"
                      aria-pressed={on}
                      onClick={() => toggleBoard(b.key)}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300",
                        on
                          ? "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
                          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900",
                      )}
                    >
                      {on && <Check className="h-3.5 w-3.5" />}
                      {b.label}
                    </button>
                  );
                })}
              </div>
            </Field>
  
            <Field label="Subjects">
              {form.subjects.length > 0 && (
                <ul className="mb-3 divide-y divide-slate-100 rounded-lg border border-slate-200">
                  {form.subjects.map((s) => {
                    const { board, code, name } = parseSubjectKey(s.key);
                    return (
                      <li key={s.key} className="flex items-center gap-3 px-3 py-2.5">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-slate-900">
                            {name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {boardName(board)} · {code}
                          </p>
                        </div>
                        {!fixedLevel(s.key) && (
                          <LevelToggle
                            subject={name}
                            value={s.level}
                            onChange={(level) => setSubjectLevel(s.key, level)}
                          />
                        )}
                        <RemoveButton
                          label={`Remove ${name}`}
                          onClick={() =>
                            update(
                              "subjects",
                              form.subjects.filter((x) => x.key !== s.key),
                            )
                          }
                        />
                      </li>
                    );
                  })}
                </ul>
              )}
              <AddPicker
                label="Add subject"
                searchPlaceholder="Search by name or code"
                emptyText="No subjects found."
                groups={subjectGroups}
                disabled={activeBoards.length === 0}
                onSelect={addSubject}
              />
              {activeBoards.length === 0 && (
                <p className="mt-1.5 text-xs text-slate-500">
                  Choose an exam board first.
                </p>
              )}
            </Field>
  
            <Field label="Exam sessions">
              {form.examSession.length > 0 && (
                <ul className="mb-3 flex flex-wrap gap-2">
                  {form.examSession.map((key) => (
                    <li
                      key={key}
                      className="inline-flex items-center gap-1 rounded-full border border-slate-200 py-1 pl-3 pr-1 text-sm text-slate-700"
                    >
                      {formatSession(key)}
                      <RemoveButton
                        label={`Remove ${formatSession(key)}`}
                        onClick={() =>
                          update(
                            "examSession",
                            form.examSession.filter((x) => x !== key),
                          )
                        }
                      />
                    </li>
                  ))}
                </ul>
              )}
              <AddPicker
                label="Add session"
                searchPlaceholder="Search sessions"
                emptyText="No upcoming sessions."
                groups={sessionGroups}
                disabled={activeBoards.length === 0}
                onSelect={(key) =>
                  update("examSession", [...form.examSession, key])
                }
              />
            </Field>
          </Section>
  
          <Section title="Preferences" description="Choose what we send you.">
            <div className="flex items-start justify-between gap-6">
              <label htmlFor="receiveEmails" className="cursor-pointer">
                <span className="block text-sm font-medium text-slate-900">
                  Email updates
                </span>
                <span className="block text-sm text-slate-500">
                  Get an email when new resources are added.
                </span>
              </label>
              <Switch
                id="receiveEmails"
                checked={form.receiveEmails}
                onCheckedChange={(v) => update("receiveEmails", v)}
                className="mt-0.5 data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-slate-200"
              />
            </div>
          </Section>
        </form>
      </div>

      {/* Outside the animated wrapper: a transform there would make this
          bar position against the wrapper instead of the viewport. */}
      {dirty && (
        <div className="fixed inset-x-0 bottom-0 z-40 px-4 pb-4 tracking-normal animate-in fade-in slide-in-from-bottom-2 duration-300 motion-reduce:animate-none">
          <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white/95 px-4 py-3 shadow-lg backdrop-blur">
            <p className="text-sm text-slate-600">Unsaved changes</p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={saving}
                onClick={() => setForm(saved)}
              >
                Discard
              </Button>
              <Button
                type="submit"
                form="profile-form"
                size="sm"
                disabled={saving || !!nameError}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                {saving ? "Saving…" : "Save changes"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="grid gap-6 py-8 md:grid-cols-[13rem_minmax(0,1fr)] md:gap-10">
      <div>
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
      <div className="space-y-6">{children}</div>
    </section>
  );
}

function Field({
  label,
  htmlFor,
  hint,
  error,
  optional,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string | null;
  optional?: boolean;
  children: React.ReactNode;
}) {
  const labelClass = "mb-1.5 block text-sm font-medium text-slate-700";
  const labelContent = (
    <>
      {label}
      {optional && (
        <span className="ml-1.5 font-normal text-slate-400">Optional</span>
      )}
    </>
  );

  return (
    <div>
      {htmlFor ? (
        <label htmlFor={htmlFor} className={labelClass}>
          {labelContent}
        </label>
      ) : (
        <h3 className={labelClass}>{labelContent}</h3>
      )}
      {children}
      {error ? (
        <p className="mt-1.5 text-xs text-red-600">{error}</p>
      ) : (
        hint && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>
      )}
    </div>
  );
}

function LevelToggle({
  subject,
  value,
  onChange,
}: {
  subject: string;
  value: SubjectLevel;
  onChange: (level: SubjectLevel) => void;
}) {
  return (
    <div
      role="group"
      aria-label={`Level for ${subject}`}
      className="inline-flex shrink-0 rounded-md bg-slate-100 p-0.5"
    >
      {SUBJECT_LEVELS.map((level) => (
        <button
          key={level}
          type="button"
          aria-pressed={value === level}
          onClick={() => onChange(level)}
          className={cn(
            "rounded px-2 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300",
            value === level
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-800",
          )}
        >
          {level}
        </button>
      ))}
    </div>
  );
}

function RemoveButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="shrink-0 rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
    >
      <X className="h-3.5 w-3.5" />
    </button>
  );
}

function Avatar({ src, name }: { src: string | null; name: string }) {
  if (src) {
    return (
      <Image
        src={src}
        alt=""
        width={56}
        height={56}
        className="h-14 w-14 shrink-0 rounded-full object-cover ring-1 ring-slate-200"
      />
    );
  }

  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-50 text-lg font-semibold text-blue-700">
      {initials || "?"}
    </div>
  );
}
