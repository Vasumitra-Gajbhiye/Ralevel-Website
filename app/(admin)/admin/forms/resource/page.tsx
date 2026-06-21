"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ListPagination } from "@/components/ui/list-pagination";
import type { PaginationMeta } from "@/lib/pagination";
import Link from "next/link";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type Submission = {
  _id: string;
  contributorId: {
    _id: string;
    fullName: string;
    email: string;
    discordOrRedditId: string;
  };
  resources: any[];
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  adminNotes?: string;
};

export default function AdminResourcePage() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [selected, setSelected] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");

  async function fetchSubmissions(currentPage = page) {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("page", String(currentPage));
    params.set("limit", "50");
    if (query) params.append("query", query);
    if (statusFilter && statusFilter !== "all") {
      params.append("status", statusFilter);
    }

    const res = await fetch(
      `/api/admin/resource-submissions?${params.toString()}`
    );
    const result = await res.json();
    setSubmissions(result.data ?? []);
    setPagination(result.pagination ?? pagination);
    setLoading(false);
  }

  useEffect(() => {
    fetchSubmissions(page);
  }, [page]);

  async function updateSubmission(status: string) {
    if (!selected) return;

    const res = await fetch(`/api/admin/resource-submissions/${selected._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, adminNotes }),
    });

    if (res.ok) {
      toast.success("Updated successfully");
      fetchSubmissions();
      setSelected(null);
    } else {
      toast.error("Update failed");
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl">Resource Submissions</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Review and moderate contributor submissions
            </p>
          </div>

          <Badge variant="secondary">{pagination.total} results</Badge>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* 🔍 Search + Filter */}
          <div className="flex gap-4 items-center">
            <Input
              placeholder="Search by submission ID, email, name..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="max-w-md"
            />

            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v)}
            >
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={() => fetchSubmissions(1)} disabled={loading}>
              {loading ? "Searching..." : "Search"}
            </Button>
          </div>

          {/* 📊 Table */}
          <div className="rounded-md border">
            <div className="grid grid-cols-6 p-4 font-medium text-sm bg-muted">
              <div>ID</div>
              <div>Name</div>
              <div>Email</div>
              <div>Resources</div>
              <div>Status</div>
              <div></div>
            </div>

            {submissions.map((s) => (
              <div
                key={s._id}
                className="grid grid-cols-6 p-4 text-sm border-t items-center"
              >
                <div className="truncate">{s._id}</div>
                <div>{s.contributorId?.fullName}</div>
                <div>{s.contributorId?.email}</div>
                <div>{s.resources.length}</div>
                <div>
                  <Badge
                    variant={
                      s.status === "approved"
                        ? "default"
                        : s.status === "rejected"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {s.status}
                  </Badge>
                </div>
                <div>
                  <Link href={`/admin/forms/resource/${s._id}`}>
                    <Button size="sm" variant="outline">
                      Review
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <ListPagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={setPage}
          />
        </CardContent>
      </Card>

      {/* 📂 Detail Drawer */}
    </div>
  );
}
