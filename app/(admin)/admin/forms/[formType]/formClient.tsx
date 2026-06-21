"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ListPagination } from "@/components/ui/list-pagination";
import { Switch } from "@/components/ui/switch";
import type { PaginationMeta } from "@/lib/pagination";
import { ArrowLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function FormClient({
  forms,
  formType,
  pagination,
}: {
  forms: any[];
  formType: string;
  pagination: PaginationMeta;
}) {
  const router = useRouter();
  const [localForms, setLocalForms] = useState(forms);
  //   const formType = forms.formType;
  const onToggle = async (formId: string) => {
    // Optimistic UI update
    setLocalForms((prev: any[]) =>
      prev.map((f) => {
        if (f._id !== formId) return f;

        if (f.status === "permanently-closed") return f;
        const newStatus = f.status === "open" ? "closed" : "open";

        return { ...f, status: newStatus };
      })
    );

    // Call backend
    try {
      const res = await fetch("/api/forms/toggle", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: formId }),
      });

      if (!res.ok) throw new Error("Failed");

      const data = await res.json();

      console.log(data);

      if (data.formStatus === "permanently-closed")
        toast.error("This Cycle is Permanently Closed and cannot be opened");
      else {
        toast.success(
          `Cycle successfully ${
            data.formStatus === "open" ? "opened" : "closed"
          }`
        );
        router.refresh();
      }
    } catch (err) {
      toast.error("Something went wrong.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
      {/* BACK */}
      <Link
        href="/admin/forms"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to forms
      </Link>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold capitalize">
          {formType} — Cycles
        </h1>

        <Link href={`/admin/forms/${formType}/create`}>
          <Button variant="default">+ New Cycle</Button>
        </Link>
      </div>
      <div className="space-y-6">
        {/* Header */}

        {/* Cycle list */}
        <div className="space-y-4">
          {localForms.map((form: any) => (
            <Card
              key={form._id}
              className="cursor-pointer transition hover:bg-muted/40"
            >
              <CardContent className="flex items-center justify-between p-4">
                <Link href={`/admin/forms/${formType}/${form.slug}`}>
                  {/* Left */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h2 className="font-medium">{form.title}</h2>
                    </div>

                    {/* <p className="text-sm text-muted-foreground">
                      Slug: {form.slug} · Cycle ID: {form.cycleId}
                    </p> */}
                  </div>
                </Link>

                {/* Right */}
                <div className="flex items-center gap-6">
                  {/* Submissions (dummy for now) */}
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">
                      {form.responseCount || 0}
                    </span>{" "}
                    submissions
                  </div>

                  <div
                    className="flex items-center gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className="text-sm text-muted-foreground">
                      {form.status === "open" ? "Open" : "Closed"}
                    </span>

                    <Switch
                      checked={
                        form.status === "closed" ||
                        form.status === "permanently-closed"
                      }
                      onCheckedChange={() => onToggle(form._id)}
                    />
                  </div>
                  <Link href={`/admin/forms/${formType}/${form.slug}`}>
                    <Button variant="ghost" size="sm" className="gap-1">
                      View
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}

          {localForms.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No cycles found for this form.
            </p>
          )}
        </div>

        <ListPagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={(nextPage) => {
            router.push(`/admin/forms/${formType}?page=${nextPage}`);
          }}
        />
      </div>
    </div>
  );
}
