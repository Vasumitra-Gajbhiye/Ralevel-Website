"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { csvTemplate, parseCsvRows, type CsvKind, type ParsedRow } from "@/lib/scholarships/csv";
import { cn } from "@/lib/utils";
import { Check, Upload, X } from "lucide-react";
import { useRouter } from "next/navigation";
import Papa from "papaparse";
import { useRef, useState } from "react";
import { toast } from "sonner";

const MAX_ROWS = 500;

export default function ImportDialog({ kind }: { kind: CsvKind }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [fileName, setFileName] = useState("");
  const [rows, setRows] = useState<ParsedRow[] | null>(null);
  const [importing, setImporting] = useState(false);

  const valid = rows?.filter((r): r is Extract<ParsedRow, { ok: true }> => r.ok) ?? [];
  const noun = kind === "scholarships" ? "scholarship" : "university";

  function resetState() {
    setRows(null);
    setFileName("");
    if (inputRef.current) inputRef.current.value = "";
  }

  function readFile(file: File) {
    setFileName(file.name);
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: "greedy",
      transformHeader: (h) => h.trim(),
      complete: (result) => {
        if (result.data.length > MAX_ROWS) {
          toast.error(`Import at most ${MAX_ROWS} rows at a time`);
          resetState();
          return;
        }
        setRows(parseCsvRows(kind, result.data));
      },
      error: () => {
        toast.error("Couldn't read that file");
        resetState();
      },
    });
  }

  function downloadTemplate() {
    const blob = new Blob([csvTemplate(kind)], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${kind}-template.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function runImport() {
    setImporting(true);
    try {
      const res = await fetch("/api/admin/scholarships/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, rows: valid.map((r) => r.input) }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || "Import failed");

      const summary = `${data.created} added, ${data.updated} updated`;
      if (data.errors?.length) {
        toast.warning(`${summary}. ${data.errors.length} failed: ${data.errors[0]}`);
      } else {
        toast.success(summary);
      }
      setOpen(false);
      resetState();
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Import failed");
    } finally {
      setImporting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) resetState();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Upload /> Import CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="tracking-normal sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Import {kind}</DialogTitle>
          <DialogDescription>
            New rows are added as drafts for checking. Rows whose slug already exists update that{" "}
            {noun} instead.{" "}
            <button type="button" onClick={downloadTemplate} className="font-medium text-blue-600 hover:text-blue-700">
              Download template
            </button>
          </DialogDescription>
        </DialogHeader>

        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && readFile(e.target.files[0])}
        />

        {!rows ? (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex h-32 w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 text-sm text-slate-500 hover:border-slate-400 hover:text-slate-700"
          >
            <Upload className="h-5 w-5" />
            Choose a CSV file
          </button>
        ) : (
          <div>
            <p className="mb-2 text-sm text-slate-600">
              <span className="font-medium text-slate-900">{fileName}</span> · {valid.length} of{" "}
              {rows.length} rows ready
            </p>
            <ul className="max-h-72 divide-y divide-slate-100 overflow-y-auto rounded-lg border border-slate-200">
              {rows.map((row, i) => (
                <li key={i} className="flex items-start gap-2 px-3 py-2 text-sm">
                  {row.ok ? (
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  ) : (
                    <X className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                  )}
                  <div className="min-w-0">
                    <p className={cn("truncate", row.ok ? "text-slate-800" : "text-slate-500")}>
                      <span className="text-slate-400">{i + 1}.</span> {row.label}
                    </p>
                    {!row.ok && <p className="text-xs text-red-600">{row.error}</p>}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        <DialogFooter>
          {rows && (
            <Button type="button" variant="ghost" onClick={resetState}>
              Choose another file
            </Button>
          )}
          <Button
            type="button"
            disabled={!valid.length || importing}
            onClick={runImport}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            {importing ? "Importing…" : `Import ${valid.length || ""} ${valid.length === 1 ? "row" : "rows"}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
