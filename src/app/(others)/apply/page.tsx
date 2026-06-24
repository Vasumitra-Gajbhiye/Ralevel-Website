// import { BookOpen, LifeBuoy, Palette, PenLine, Shield } from "lucide-react";
// import Image from "next/image";

// type FormCard = {
//   id: string;
//   title: string;
//   description: string;
//   status: "open" | "soon";
//   gradient: string;
//   logo?: string;
//   icon?: any;
//   steps: string[];
//   cta: string;
// };

// const forms: FormCard[] = [
//   {
//     id: "reddit-mod",
//     title: "Reddit Moderator Application",
//     description:
//       "Help moderate r/alevel and keep the community helpful, safe, and high-quality.",
//     status: "open",
//     gradient: "from-orange-400 to-orange-500",
//     // logo: "/logo/reddit.svg",
//     icon: Shield,
//     steps: [
//       "Be active on r/alevel",
//       "Understand Reddit rules and moderation tools",
//       "Be able to moderate consistently",
//     ],
//     cta: "Apply as Reddit Moderator",
//   },
//   {
//     id: "discord-mod",
//     title: "Discord Moderator Application",
//     description: "Join the moderation team of the r/alevel Discord server.",
//     status: "open",
//     gradient: "from-indigo-400 to-violet-600",
//     icon: Shield,
//     steps: [
//       "Be active on the Discord server",
//       "Communicate clearly and respectfully",
//       "Handle conflicts calmly",
//     ],
//     cta: "Apply as Discord Moderator",
//   },
//   {
//     id: "writer",
//     title: "Writer Application",
//     description:
//       "Write short blogs, guides, and helpful content for A-level students.",
//     status: "open",
//     gradient: "from-sky-500 to-blue-600",
//     icon: PenLine,
//     steps: [
//       "Join the r/alevel community",
//       "Apply as a writer through this form",
//       "Publish approved posts regularly",
//     ],
//     cta: "Apply as Writer",
//   },
//   {
//     id: "resource",
//     title: "Resource Contributor",
//     description:
//       "Submit notes, PDFs, links, and other study resources for the community.",
//     status: "open",
//     gradient: "from-pink-500 to-rose-600",
//     icon: BookOpen,
//     steps: [
//       "Prepare original or credited resources",
//       "Submit them using the official form",
//       "Wait for moderator approval",
//     ],
//     cta: "Submit a Resource",
//   },
//   {
//     id: "helper",
//     title: "Helper Application",
//     description:
//       "Help students by answering questions and guiding them academically.",
//     status: "open",
//     gradient: "from-emerald-500 to-green-600",
//     icon: LifeBuoy,
//     steps: [
//       "Be active in helping students",
//       "Answer doubts regularly",
//       "Maintain respectful conduct",
//     ],
//     cta: "Apply as Helper",
//   },
//   {
//     id: "graphic",
//     title: "Graphic Designer Application",
//     description:
//       "Design banners, thumbnails, and visuals for r/alevel platforms.",
//     status: "soon",
//     gradient: "from-yellow-400 to-amber-500",
//     icon: Palette,
//     steps: [
//       "Have basic design experience",
//       "Be comfortable with Canva or Figma",
//       "Deliver simple designs on time",
//     ],
//     cta: "Coming Soon",
//   },
// ];

// export default function FormsPage() {
//   return (
//     <div className="mx-auto max-w-6xl px-4 py-20 space-y-12">
//       {/* HEADER */}
//       <div className="space-y-3">
//         <h1 className="text-4xl font-semibold tracking-tight">
//           r/alevel Applications & Submissions
//         </h1>
//         <p className="max-w-3xl text-muted-foreground">
//           Apply to contribute to the r/alevel community or submit high-quality
//           academic resources.
//         </p>
//       </div>

//       {/* FORM CARDS */}
//       <div className="space-y-12">
//         {forms.map((form) => {
//           const Icon = form.icon;

//           return (
//             <div
//               key={form.id}
//               className={`rounded-2xl bg-gradient-to-r ${form.gradient} p-8 text-white shadow-lg`}
//             >
//               {/* HEADER */}
//               <div className="mb-6 space-y-4">
//                 <div className="flex items-center justify-between gap-6">
//                   <div className="flex items-center gap-4">
//                     <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
//                       {form.logo ? (
//                         <Image
//                           src={form.logo}
//                           alt={`${form.title} logo`}
//                           width={28}
//                           height={28}
//                         />
//                       ) : (
//                         <Icon size={26} />
//                       )}
//                     </div>

//                     <h2 className="text-xl font-semibold">{form.title}</h2>
//                   </div>

//                   {/* STATUS */}
//                   <span
//                     className={`rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-sm
//                     ${
//                       form.status === "open"
//                         ? "bg-white/25 text-white"
//                         : "bg-black/20 text-white/80"
//                     }
//                   `}
//                   >
//                     {form.status === "open" ? "Open" : "Coming Soon"}
//                   </span>
//                 </div>

//                 <p className="text-sm text-white/90 max-w-3xl">
//                   {form.description}
//                 </p>
//               </div>

//               {/* STEPS */}
//               <div className="space-y-3 mb-8">
//                 {form.steps.map((step, i) => (
//                   <div key={i} className="flex items-start gap-3">
//                     <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/25 text-sm font-semibold">
//                       {i + 1}
//                     </div>
//                     <p className="text-sm text-white/95">{step}</p>
//                   </div>
//                 ))}
//               </div>

//               {/* CTA */}
//               <div className="flex">
//                 <a href={`/forms/${form.id}`}>
//                   <button
//                     disabled={form.status !== "open"}
//                     className={`rounded-lg px-6 py-2.5 text-sm  transition
//                   ${
//                     form.status === "open"
//                       ? "bg-white text-black hover:bg-white/90"
//                       : "bg-white/40 text-black/60 cursor-not-allowed"
//                   }
//                 `}
//                   >
//                     {form.cta}
//                   </button>
//                 </a>
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// }

// app/apply/page.tsx
import connectDB from "@/lib/mongodb";
import FormIndex from "@/models/FormIndex";
import {
  BookOpen,
  FileText,
  LifeBuoy,
  Palette,
  PenLine,
  Shield,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";

const FORM_ICONS: Record<string, LucideIcon> = {
  Shield,
  PenLine,
  BookOpen,
  LifeBuoy,
  Palette,
  FileText,
};

export default async function FormsPage() {
  await connectDB();

  const forms = await FormIndex.find({}).sort({ order: 1 }).lean();

  return (
    <div className="mx-auto max-w-6xl px-4 py-20 space-y-12">
      {/* HEADER */}
      <div className="space-y-3">
        <h1 className="text-4xl font-semibold tracking-tight">
          r/alevel Applications & Submissions
        </h1>
        <p className="max-w-3xl text-muted-foreground">
          Apply to contribute to the r/alevel community or submit high-quality
          academic resources.
        </p>
      </div>

      {/* FORM CARDS */}
      <div className="space-y-12">
        {forms.map((form: any) => {
          const Icon = FORM_ICONS[form.icon] ?? FileText;
          let herf;
          herf =
            form.slug === "resource"
              ? `/apply/resource`
              : `/apply/${form.slug}-intake-${form.activeCycleId}`;
          return (
            <div
              key={form.slug}
              className={`rounded-2xl bg-gradient-to-r ${form.gradient} p-8 text-white shadow-lg`}
            >
              {/* HEADER */}
              <div className="mb-6 space-y-4">
                <div className="flex items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
                      {form.logo ? (
                        <Image
                          src={form.logo}
                          alt={`${form.title} logo`}
                          width={28}
                          height={28}
                        />
                      ) : (
                        <Icon size={26} />
                      )}
                    </div>

                    <h2 className="text-xl font-semibold">{form.title}</h2>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold
                      ${
                        form.status === "open"
                          ? "bg-white/25"
                          : "bg-black/20 text-white/80"
                      }
                    `}
                  >
                    {form.status === "open" ? "Open" : "Coming Soon"}
                  </span>
                </div>

                <p className="text-sm text-white/90 max-w-3xl">
                  {form.description}
                </p>
              </div>

              {/* STEPS */}
              <div className="space-y-3 mb-8">
                {form.steps.map((step: string, i: number) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/25 text-sm font-semibold">
                      {i + 1}
                    </div>
                    <p className="text-sm text-white/95">{step}</p>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <a href={herf}>
                <button
                  disabled={form.status !== "open"}
                  className={`rounded-lg px-6 py-2.5 text-sm transition
                    ${
                      form.status === "open"
                        ? "bg-white text-black hover:bg-white/90"
                        : "bg-white/40 text-black/60 cursor-not-allowed"
                    }
                  `}
                >
                  {form.ctaText}
                </button>
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}
