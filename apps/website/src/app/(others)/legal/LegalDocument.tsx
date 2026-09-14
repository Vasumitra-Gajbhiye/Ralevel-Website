import { BlockNoteViewer } from "@/components/blogs-v2";

export default function LegalDocument({
  title,
  lastPublishedLabel,
  lastPublishedDateTime,
  content,
}: {
  title: string;
  lastPublishedLabel: string;
  lastPublishedDateTime: string;
  content: unknown[];
}) {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      <div className="mx-auto max-w-4xl px-6 py-20">
        <header className="mb-10 text-center sm:text-left">
          <h1 className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-4xl font-extrabold leading-tight text-transparent sm:text-5xl">
            {title}
          </h1>
          <p className="mt-2 text-gray-600">
            Last updated:{" "}
            <time dateTime={lastPublishedDateTime}>{lastPublishedLabel}</time>
          </p>
        </header>

        <section className="rounded-2xl border border-gray-100 bg-white p-8 leading-relaxed shadow-sm">
          <div className="bn-notion-editor">
            <BlockNoteViewer initialContent={content} />
          </div>
        </section>
      </div>
    </main>
  );
}
