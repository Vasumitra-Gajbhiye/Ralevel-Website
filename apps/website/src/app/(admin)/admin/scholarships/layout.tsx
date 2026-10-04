import connectDB from "@/lib/mongodb";
import { getAuthSession } from "@/lib/getAuthSession";
import { canManageScholarshipAccess } from "@/lib/roles";
import ScholarshipSubmission from "@/models/scholarshipSubmission";
import AdminTabs from "./_components/AdminTabs";

export default async function ScholarshipAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAuthSession();
  await connectDB();
  const pending = await ScholarshipSubmission.countDocuments({ status: "pending" });

  return (
    <div className="mx-auto max-w-5xl tracking-normal">
      <AdminTabs
        pendingSubmissions={pending}
        showTeam={canManageScholarshipAccess(session?.userData.roles)}
      />
      <div className="mt-6">{children}</div>
    </div>
  );
}
