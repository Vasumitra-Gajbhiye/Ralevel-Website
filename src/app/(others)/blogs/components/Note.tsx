export default function Note({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-6 px-4 py-2 bg-sky-50 border border-sky-100 text-sky-800 rounded-md text-sm">
      {children}
    </div>
  );
}