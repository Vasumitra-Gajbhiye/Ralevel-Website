import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/** Plain, calm markdown for admin-written descriptions (raw HTML is not rendered). */
export default function Markdown({ children }: { children: string }) {
  return (
    <div className="space-y-3 text-[15px] leading-relaxed text-slate-700">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-blue-600 underline underline-offset-2 hover:text-blue-700"
            >
              {children}
            </a>
          ),
          ul: ({ children }) => <ul className="list-disc space-y-1 pl-5">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal space-y-1 pl-5">{children}</ol>,
          h1: ({ children }) => <p className="font-semibold text-slate-900">{children}</p>,
          h2: ({ children }) => <p className="font-semibold text-slate-900">{children}</p>,
          h3: ({ children }) => <p className="font-semibold text-slate-900">{children}</p>,
          strong: ({ children }) => <strong className="font-semibold text-slate-900">{children}</strong>,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
