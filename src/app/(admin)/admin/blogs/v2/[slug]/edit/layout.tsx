export default function BlogEditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-[calc(100dvh-3.5rem)] md:h-screen bg-white">
      {children}
    </div>
  );
}
