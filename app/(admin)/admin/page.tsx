import { getAuthSession } from "@/lib/getAuthSession";

export default async function AdminPage() {
  const session = await getAuthSession();

  const roles = session?.userData?.roles;

  // ❌ No role → no admin access at all
  if (roles?.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-semibold mb-2">Access restricted</h1>
          <p className="text-sm text-gray-500 mb-6">
            You don't have access to the admin panel.
            <br />
            If you believe this is a mistake, please contact an administrator.
          </p>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-sm text-gray-600">
            Role required
          </div>
        </div>
      </div>
    );
  }

  // ✅ Has role → normal admin landing
  return <div className="text-gray-600">Select an item from the sidebar.</div>;
}
