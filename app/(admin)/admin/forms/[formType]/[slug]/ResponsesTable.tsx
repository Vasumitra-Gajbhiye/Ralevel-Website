// "use client";

// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { ChevronRight } from "lucide-react";
// import Link from "next/link";
// import { mockWriterSubmissions } from "./_mockSubmissions";

// function formatDate(date: string) {
//   return new Date(date).toLocaleDateString("en-GB", {
//     day: "2-digit",
//     month: "short",
//     year: "numeric",
//   });
// }

// export default function ResponsesTable({ formSlug }: { formSlug: string }) {
//   return (
//     <div className="space-y-4">
//       {/* HEADER */}
//       <div className="flex items-center justify-between">
//         <h2 className="text-lg font-semibold">
//           Responses ({mockWriterSubmissions.length})
//         </h2>

//         {/* Filters (UI only for now) */}
//         <div className="flex items-center gap-2 text-sm text-muted-foreground">
//           <span className="rounded-md border px-3 py-1">Date</span>
//           <span className="rounded-md border px-3 py-1">Status</span>
//         </div>
//       </div>

//       {/* TABLE */}
//       <div className="rounded-lg border">
//         <Table>
//           <TableHeader>
//             <TableRow>
//               <TableHead>Name</TableHead>
//               <TableHead>Email</TableHead>
//               <TableHead>Level</TableHead>
//               <TableHead>Submitted</TableHead>
//               <TableHead>Status</TableHead>
//               <TableHead />
//             </TableRow>
//           </TableHeader>

//           <TableBody>
//             {mockWriterSubmissions.map((submission) => {
//               const personal = submission.responses["personal-information"];
//               const academic = submission.responses["academic-background"];

//               return (
//                 <TableRow key={submission.id} className="hover:bg-muted/50">
//                   <TableCell className="font-medium">
//                     {personal.fullName}
//                   </TableCell>

//                   <TableCell>{personal.email}</TableCell>

//                   <TableCell>{academic.currentLevel}</TableCell>

//                   <TableCell>{formatDate(submission.submittedAt)}</TableCell>

//                   <TableCell>
//                     <Badge variant="secondary">{submission.status}</Badge>
//                   </TableCell>

//                   {/* ACTION */}
//                   <TableCell className="text-right">
//                     <Link
//                       href={`/admin/forms/${formSlug}/responses/${submission.id}`}
//                     >
//                       <Button variant="ghost" size="sm" className="gap-1">
//                         View
//                         <ChevronRight className="h-4 w-4" />
//                       </Button>
//                     </Link>
//                   </TableCell>
//                 </TableRow>
//               );
//             })}
//           </TableBody>
//         </Table>
//       </div>
//     </div>
//   );
// }

"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { ThumbsDown, ThumbsUp } from "lucide-react";

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

type Vote = {
  adminId: string;
  adminName: string;
  vote: 1 | -1;
};

type Submission = {
  _id: string;
  responses: Record<string, any>;
  createdAt: string;
  votes?: Vote[];
};

export default function ResponsesTable({
  form,
  formSlug,
  submissions,
  formType,
  totalResponses,
}: {
  form: any;
  formType: string;
  formSlug: string;
  submissions: Submission[];
  totalResponses: number;
}) {
  const firstSection = form?.sections?.[0];
  const previewFields = firstSection?.fields?.slice(0, 3) ?? [];

  if (!form?.sections?.length) {
    return <div>No sections found.</div>;
  }
  return (
    <div className="space-y-4">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          Responses ({totalResponses})
        </h2>

        {/* Filters (UI only for now) */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="rounded-md border px-3 py-1">Date</span>
          <span className="rounded-md border px-3 py-1">Status</span>
        </div>
      </div>

      {/* TABLE */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              {previewFields.map((field: any) => (
                <TableHead key={field.id}>{field.label}</TableHead>
              ))}
              <TableHead>Submitted</TableHead>
              <TableHead>Score</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>

          <TableBody>
            {submissions.map((submission) => {
              return (
                <TableRow key={submission._id} className="hover:bg-muted/50">
                  {previewFields.map((field: any) => {
                    const value =
                      submission.responses?.[firstSection.id]?.[field.id];

                    return (
                      <TableCell key={field.id} className="font-medium">
                        {Array.isArray(value) ? value.join(", ") : value ?? "-"}
                      </TableCell>
                    );
                  })}

                  <TableCell>{formatDate(submission.createdAt)}</TableCell>

                  <TableCell>
                    {(() => {
                      const votes = submission.votes ?? [];
                      const upvotes = votes.filter((v) => v.vote === 1);
                      const downvotes = votes.filter((v) => v.vote === -1);
                      const net = upvotes.length - downvotes.length;

                      return (
                        <HoverCard openDelay={150}>
                          <HoverCardTrigger asChild>
                            <button
                              className={`flex items-center gap-2 rounded-full border px-3 py-1 text-sm transition hover:bg-muted
              ${net > 0 ? "text-green-600" : ""}
              ${net < 0 ? "text-red-600" : ""}
            `}
                            >
                              <ThumbsUp className="h-4 w-4 text-green-600" />
                              <span>{upvotes.length}</span>

                              <ThumbsDown className="h-4 w-4 text-red-600 ml-2" />
                              <span>{downvotes.length}</span>
                            </button>
                          </HoverCardTrigger>

                          <HoverCardContent className="w-64 space-y-4">
                            {votes.length === 0 ? (
                              <p className="text-sm text-muted-foreground">
                                No moderation activity yet.
                              </p>
                            ) : (
                              <>
                                <div className="space-y-2">
                                  {upvotes.length > 0 && (
                                    <>
                                      <div className="text-xs uppercase text-muted-foreground">
                                        Approved
                                      </div>
                                      {upvotes.map((v) => (
                                        <div
                                          key={v.adminId}
                                          className="flex items-center gap-2 text-sm"
                                        >
                                          <ThumbsUp className="h-3 w-3 text-green-600" />
                                          <span>{v.adminName}</span>
                                        </div>
                                      ))}
                                    </>
                                  )}

                                  {downvotes.length > 0 && (
                                    <>
                                      <div className="text-xs uppercase text-muted-foreground pt-2">
                                        Rejected
                                      </div>
                                      {downvotes.map((v) => (
                                        <div
                                          key={v.adminId}
                                          className="flex items-center gap-2 text-sm"
                                        >
                                          <ThumbsDown className="h-3 w-3 text-red-600" />
                                          <span>{v.adminName}</span>
                                        </div>
                                      ))}
                                    </>
                                  )}
                                </div>
                              </>
                            )}
                          </HoverCardContent>
                        </HoverCard>
                      );
                    })()}
                  </TableCell>

                  <TableCell className="text-right">
                    <Link
                      href={`/admin/forms/${formType}/${formSlug}/responses/${submission._id}`}
                    >
                      <Button variant="ghost" size="sm" className="gap-1">
                        View
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
