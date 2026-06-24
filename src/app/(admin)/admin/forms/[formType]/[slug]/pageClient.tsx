"use client";

import type { PaginationMeta } from "@/lib/pagination";
import { Badge } from "@/components/ui/badge";
import { ListPagination } from "@/components/ui/list-pagination";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { FormDocument } from "@/types/form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DiscordPings from "./DiscordPings";
import ResponsesTable from "./ResponsesTable";
import Summary from "./Summary";

type Props = {
  form: FormDocument;
  totalResponses: number;
  submissions: any[];
  summarySubmissions: any[];
  pagination: PaginationMeta;
};

export default function AdminFormPageClient({
  form,
  totalResponses,
  submissions,
  summarySubmissions,
  pagination,
}: Props) {
  const router = useRouter();
  const hasResponses = totalResponses > 0;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
      {/* BACK */}
      <Link
        href={`/admin/forms/${form.formType}`}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to {form.formType} forms
      </Link>

      {/* HEADER */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold">{form.title}</h1>
          <Badge variant={form.status === "open" ? "default" : "secondary"}>
            {form.status}
          </Badge>
        </div>

        <p className="text-sm text-muted-foreground">
          {totalResponses} responses
        </p>
      </div>

      {/* TABS */}
      <Tabs defaultValue={hasResponses ? "summary" : "discord-pings"}>
        <TabsList className="mb-6">
          {hasResponses && (
            <>
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="responses">Responses</TabsTrigger>
            </>
          )}
          <TabsTrigger value="discord-pings">Discord pings</TabsTrigger>
        </TabsList>

        {hasResponses && (
          <>
            <TabsContent value="summary">
              <Summary
                submissions={summarySubmissions}
                totalResponses={totalResponses}
              />
            </TabsContent>

            <TabsContent value="responses">
              <ResponsesTable
                form={form}
                formSlug={form.slug}
                submissions={submissions}
                formType={form.formType}
                totalResponses={totalResponses}
              />
              <ListPagination
                page={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={(nextPage) => {
                  router.push(
                    `/admin/forms/${form.formType}/${form.slug}?page=${nextPage}`,
                  );
                }}
              />
            </TabsContent>
          </>
        )}

        <TabsContent value="discord-pings">
          <DiscordPings
            formSlug={form.slug}
            initialUserIds={form.discordPingUserIds ?? []}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
