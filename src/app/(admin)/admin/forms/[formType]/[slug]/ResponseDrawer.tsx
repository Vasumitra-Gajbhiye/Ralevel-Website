"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  submission: any;
  form: any;
};

function formatDate(date: string) {
  return new Date(date).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ResponseDrawer({
  open,
  onOpenChange,
  submission,
  form,
}: Props) {
  if (!submission) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="flex items-center gap-3">
            Response
            <Badge variant="secondary">{submission.status}</Badge>
          </SheetTitle>

          <p className="text-sm text-muted-foreground">
            Submitted {formatDate(submission.submittedAt)}
          </p>
        </SheetHeader>

        {/* SECTIONS */}
        <div className="space-y-8">
          {form.sections.map((section: any) => {
            const sectionResponses = submission.responses[section.id];

            if (!sectionResponses) return null;

            return (
              <div key={section.id} className="space-y-3">
                <div>
                  <h3 className="font-semibold">{section.title}</h3>
                  {section.subtitle && (
                    <p className="text-sm text-muted-foreground">
                      {section.subtitle}
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  {section.fields.map((field: any) => {
                    const value = sectionResponses[field.id];
                    if (!value) return null;

                    return (
                      <div key={field.id}>
                        <p className="text-sm font-medium">{field.label}</p>

                        {field.type === "textarea" ? (
                          <p className="mt-1 whitespace-pre-wrap rounded-md bg-muted/40 px-3 py-2 text-sm">
                            {value}
                          </p>
                        ) : field.type === "url" ? (
                          <a
                            href={value}
                            target="_blank"
                            className="text-sm text-blue-600 underline"
                          >
                            {value}
                          </a>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            {value}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* ACTIONS */}
        <div className="mt-10 flex gap-3">
          <Button className="flex-1">Approve</Button>
          <Button variant="destructive" className="flex-1">
            Reject
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
