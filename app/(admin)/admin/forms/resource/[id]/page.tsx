"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useParams, useRouter } from "next/navigation";
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

export default function SubmissionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params as { id: string };

  const [submission, setSubmission] = useState<Submission | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [loading, setLoading] = useState(true);

  async function fetchSubmission() {
    const res = await fetch(`/api/admin/resource-submissions?query=${id}`);
    const result = await res.json();
    const data = result.data ?? result;

    if (!Array.isArray(data) || data.length === 0) {
      toast.error("Submission not found");
      router.push("/admin/forms/resource");
      return;
    }

    setSubmission(data[0]);
    setAdminNotes(data[0].adminNotes || "");
    setLoading(false);
  }

  useEffect(() => {
    fetchSubmission();
  }, []);

  async function updateSubmission(status: string) {
    if (!submission) return;

    const res = await fetch(
      `/api/admin/resource-submissions/${submission._id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, adminNotes }),
      }
    );

    if (res.ok) {
      toast.success("Submission updated");
      router.push("/admin/forms/resource");
    } else {
      toast.error("Update failed");
    }
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-8">
        <p className="text-muted-foreground">Loading submission...</p>
      </div>
    );
  }

  if (!submission) return null;

  return (
    <div className="max-w-5xl mx-auto p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Submission Review</h1>
          <p className="text-sm text-muted-foreground">ID: {submission._id}</p>
        </div>

        <Badge
          variant={
            submission.status === "approved"
              ? "default"
              : submission.status === "rejected"
              ? "destructive"
              : "secondary"
          }
        >
          {submission.status}
        </Badge>
      </div>

      {/* Contributor Info */}
      <Card className="p-6 space-y-2">
        <h2 className="font-semibold text-lg">Contributor</h2>
        <p>
          <strong>Name:</strong> {submission.contributorId.fullName}
        </p>
        <p>
          <strong>Email:</strong> {submission.contributorId.email}
        </p>
        <p>
          <strong>Discord/Reddit:</strong>{" "}
          {submission.contributorId.discordOrRedditId}
        </p>
      </Card>

      {/* Resources */}
      <div className="space-y-6">
        <h2 className="font-semibold text-lg">Resources</h2>

        {submission.resources.map((r, i) => (
          <Card key={i} className="p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">{r.title}</h3>
              <Badge variant="outline">{r.resourceType}</Badge>
            </div>

            {r.description && (
              <p className="text-sm text-muted-foreground">{r.description}</p>
            )}

            {/* Levels */}
            {r.levels?.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                  Level
                </p>
                <div className="flex flex-wrap gap-2">
                  {r.levels.map((lvl: string, idx: number) => (
                    <Badge key={idx} variant="secondary">
                      {lvl}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Boards */}
            {r.boards?.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                  Board
                </p>
                <div className="flex flex-wrap gap-2">
                  {r.boards.map((b: string, idx: number) => (
                    <Badge key={idx} variant="secondary">
                      {b}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Made by contributor */}
            {typeof r.madeByMe === "boolean" && (
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                  Authorship
                </p>
                <Badge variant={r.madeByMe ? "default" : "outline"}>
                  {r.madeByMe
                    ? "Created by contributor"
                    : "Third‑party resource"}
                </Badge>
              </div>
            )}

            {r.links?.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                  Links
                </p>
                {r.links.map((link: string, idx: number) => (
                  <a
                    key={idx}
                    href={link}
                    target="_blank"
                    className="text-blue-600 text-sm block hover:underline"
                  >
                    {link}
                  </a>
                ))}
              </div>
            )}

            {r.files?.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                  Files
                </p>
                {r.files.map((f: any, idx: number) => (
                  <a
                    key={idx}
                    href={f.url}
                    target="_blank"
                    className="text-green-600 text-sm block hover:underline"
                  >
                    {f.originalName}
                  </a>
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Admin Notes */}
      <Card className="p-6 space-y-4">
        <h2 className="font-semibold text-lg">Admin Notes</h2>
        <Textarea
          value={adminNotes}
          onChange={(e) => setAdminNotes(e.target.value)}
          placeholder="Internal notes..."
        />

        <div className="flex gap-4">
          <Button
            className="flex-1"
            onClick={() => updateSubmission("approved")}
          >
            Approve Submission
          </Button>

          <Button
            variant="destructive"
            className="flex-1"
            onClick={() => updateSubmission("rejected")}
          >
            Reject Submission
          </Button>
        </div>
      </Card>
    </div>
  );
}
