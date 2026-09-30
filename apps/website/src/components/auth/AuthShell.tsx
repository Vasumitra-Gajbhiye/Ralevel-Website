import { cldImage } from "@/lib/cloudinary";
import { ArrowLeft, BookOpen, FileText, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const highlights = [
  {
    icon: BookOpen,
    title: "Free notes & resources",
    body: "Community-made notes written by top A Level students.",
  },
  {
    icon: FileText,
    title: "Past papers in one place",
    body: "Practise with papers and mark schemes, no paywalls.",
  },
  {
    icon: Users,
    title: "100k+ students",
    body: "Ask questions and swap advice with the r/alevel community.",
  },
];

// Shared entrance: short fade + rise with a soft ease-out. `fill-mode-both`
// keeps delayed items hidden until their turn.
const motion =
  "animate-in fade-in fill-mode-both ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:animate-none";
const enter = `${motion} duration-700`;
const rise = `${enter} slide-in-from-bottom-2`;

export default function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] bg-slate-50 tracking-normal">
      {/* Brand panel */}
      <aside className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-slate-950 p-12 text-white">
        <div
          className={`${motion} duration-1000 zoom-in-[1.04] absolute inset-0 bg-hero bg-cover bg-center`}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/90 via-blue-950/85 to-blue-800/80" />

        <Link href="/" className={`${enter} relative flex items-center gap-3 w-fit`}>
          <Image
            src={cldImage("/logo/Logo only.svg")}
            alt=""
            width={44}
            height={44}
          />
          <span className="text-lg font-semibold">r/alevel</span>
        </Link>

        <div className="relative max-w-md">
          <h2
            className={`${rise} delay-150 text-4xl font-semibold leading-tight`}
          >
            Study smarter with the r/alevel community.
          </h2>
          <ul className="mt-10 space-y-6">
            {highlights.map(({ icon: Icon, title, body }, i) => (
              <li
                key={title}
                className={`${rise} flex gap-4`}
                style={{ animationDelay: `${300 + i * 100}ms` }}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/15">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-medium">{title}</p>
                  <p className="text-sm text-blue-100/75">{body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className={`${enter} delay-700 relative text-sm text-blue-100/60`}>
          By Students. For Students.
        </p>
      </aside>

      {/* Form panel */}
      <main className="flex flex-col px-5 py-6 sm:px-8">
        <div className={`${enter} flex items-center justify-between`}>
          <Link
            href="/"
            className="group inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
            Back to home
          </Link>
          <Link href="/" className="flex items-center gap-2 lg:hidden">
            <Image
              src={cldImage("/logo/Logo only.svg")}
              alt=""
              width={32}
              height={32}
            />
            <span className="font-semibold text-slate-900">r/alevel</span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center py-10">
          <div className="flex w-full max-w-[26rem] justify-center">
            {children}
          </div>
        </div>

        <p className={`${enter} delay-500 text-center text-xs text-slate-400`}>
          By continuing you agree to our{" "}
          <Link
            href="/legal/terms-of-service"
            className="underline hover:text-slate-600"
          >
            Terms
          </Link>{" "}
          and{" "}
          <Link
            href="/legal/privacy-policy"
            className="underline hover:text-slate-600"
          >
            Privacy Policy
          </Link>
          .
        </p>
      </main>
    </div>
  );
}
