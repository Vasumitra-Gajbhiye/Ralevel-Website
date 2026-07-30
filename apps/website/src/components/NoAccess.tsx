export default function NoAccess({ message }: { message?: string }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-semibold mb-2">Access restricted</h1>

        <p className="text-sm text-gray-500 mb-6">
          {message ?? "You don’t have permission to view this page."}
        </p>

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-sm text-gray-600">
          Insufficient permissions
        </div>
      </div>
    </div>
  );
}
