// import { Badge } from "@/components/ui/badge";
// import connectDB from "@/libs/mongodb";
// import Form from "@/models/Form";
// import FormSubmission from "@/models/FormSubmission";
// import { ChevronRight } from "lucide-react";
// import Link from "next/link";

// export default async function AdminFormsPage() {
//   await connectDB();

//   const forms = await Form.find().lean();

//   // get response counts
//   const submissions = await FormSubmission.aggregate([
//     {
//       $group: {
//         _id: "$formSlug",
//         count: { $sum: 1 },
//         lastSubmissionAt: { $max: "$submittedAt" },
//       },
//     },
//   ]);

//   const submissionMap = Object.fromEntries(submissions.map((s) => [s._id, s]));

//   return (
//     <div className="max-w-6xl mx-auto px-6 py-10 space-y-6">
//       {/* HEADER */}
//       <div>
//         <h1 className="text-2xl font-semibold">Forms</h1>
//         <p className="text-muted-foreground">
//           View and manage form submissions
//         </p>
//       </div>

//       {/* LIST */}
//       <div className="space-y-3">
//         {forms.map((form: any) => {
//           const stats = submissionMap[form.slug];

//           return (
//             <Link
//               key={form._id}
//               href={`/admin/forms/${form.slug}`}
//               className="block"
//             >
//               <div className="flex items-center justify-between rounded-lg border px-5 py-4 hover:bg-muted/50 transition">
//                 {/* LEFT */}
//                 <div className="space-y-1">
//                   <h2 className="font-medium">{form.title}</h2>
//                   <p className="text-sm text-muted-foreground">
//                     /apply/{form.slug}
//                   </p>
//                 </div>

//                 {/* RIGHT */}
//                 <div className="flex items-center gap-6">
//                   <Badge
//                     variant={form.status === "open" ? "default" : "secondary"}
//                   >
//                     {form.status}
//                   </Badge>

//                   <div className="text-sm text-muted-foreground text-right">
//                     <div>{stats?.count ?? 0} responses</div>
//                     {stats?.lastSubmissionAt && (
//                       <div>
//                         Last:{" "}
//                         {new Date(stats.lastSubmissionAt).toLocaleDateString()}
//                       </div>
//                     )}
//                   </div>

//                   <ChevronRight className="h-4 w-4 text-muted-foreground" />
//                 </div>
//               </div>
//             </Link>
//           );
//         })}
//       </div>
//     </div>
//   );
// }
import { Badge } from "@/components/ui/badge";
import { ListPagination } from "@/components/ui/list-pagination";
import connectDB from "@/lib/mongodb";
import {
  buildPaginatedResponse,
  parsePaginationParams,
} from "@/lib/pagination";
import FormIndex from "@/models/FormIndex";
import FormSubmission from "@/models/FormSubmission";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

export default async function AdminFormsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await connectDB();

  const params = await searchParams;
  const { page, limit, skip } = parsePaginationParams(
    new URLSearchParams({ page: params.page ?? "1" })
  );

  const [forms, total, submissions] = await Promise.all([
    FormIndex.find().sort({ _id: -1 }).skip(skip).limit(limit).lean(),
    FormIndex.countDocuments(),
    FormSubmission.aggregate([
      {
        $group: {
          _id: "$formType",
          count: { $sum: 1 },
          lastSubmissionAt: { $max: "$submittedAt" },
        },
      },
    ]),
  ]);

  const pagination = buildPaginatedResponse(forms, total, page, limit).pagination;
  const submissionMap = Object.fromEntries(submissions.map((s) => [s._id, s]));

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold">Forms</h1>
        <p className="text-muted-foreground">
          View and manage form submissions
        </p>
      </div>

      {/* LIST */}
      <div className="space-y-3">
        {forms.map((form: any) => {
          const stats = submissionMap[form.slug];

          return (
            <Link
              key={form._id}
              href={`/admin/forms/${form.slug}`}
              className="block"
            >
              <div className="flex items-center justify-between rounded-lg border px-5 py-4 hover:bg-muted/50 transition">
                {/* LEFT */}
                <div className="space-y-1">
                  <h2 className="font-medium">{form.title}</h2>
                  <p className="text-sm text-muted-foreground">
                    /apply/{form.slug}
                  </p>
                </div>

                {/* RIGHT */}
                <div className="flex items-center gap-6">
                  <Badge
                    variant={form.status === "open" ? "default" : "secondary"}
                  >
                    {form.status}
                  </Badge>

                  <div className="text-sm text-muted-foreground text-right">
                    <div>{stats?.count ?? 0} responses</div>
                    {stats?.lastSubmissionAt && (
                      <div>
                        Last:{" "}
                        {new Date(stats.lastSubmissionAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between gap-4 pt-4">
          <p className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages}
          </p>
          <div className="flex items-center gap-2">
            {pagination.hasPrevPage && (
              <Link
                href={`/admin/forms?page=${pagination.page - 1}`}
                className="inline-flex h-8 items-center rounded-md border px-3 text-xs hover:bg-accent"
              >
                Previous
              </Link>
            )}
            {pagination.hasNextPage && (
              <Link
                href={`/admin/forms?page=${pagination.page + 1}`}
                className="inline-flex h-8 items-center rounded-md border px-3 text-xs hover:bg-accent"
              >
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
