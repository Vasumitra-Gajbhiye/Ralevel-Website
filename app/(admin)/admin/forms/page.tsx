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
//                     /forms/{form.slug}
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
import connectDB from "@/lib/mongodb";
import FormIndex from "@/models/FormIndex";
import FormSubmission from "@/models/FormSubmission";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

export default async function AdminFormsPage() {
  await connectDB();

  const forms = await FormIndex.find().lean();

  const submissions = await FormSubmission.aggregate([
    {
      $group: {
        _id: "$formType",
        count: { $sum: 1 },
        lastSubmissionAt: { $max: "$submittedAt" },
      },
    },
  ]);

  const submissionMap = Object.fromEntries(submissions.map((s) => [s._id, s]));
  console.log(submissions);

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

          console.log(form);

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
                    /forms/{form.slug}
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
    </div>
  );
}
