// "use client";

// import posthog from "posthog-js";
// import ResourceTable from "@/components/resources/ResourceTable";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Separator } from "@/components/ui/separator";
// import { Loader2 } from "lucide-react";
// import { useState } from "react";
// import { toast } from "sonner";
// type Resource = {
//   id: string;
//   title: string;
//   description: string;
//   levels: string[];
//   boards: string[];
//   madeByMe: boolean;
//   links: string[];
//   files: File[];
// };

// export default function ResourceFormPageClient() {
//   const [fullName, setFullName] = useState("");
//   const [email, setEmail] = useState("");
//   const [discordOrRedditId, setDiscordOrRedditId] = useState("");
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [resources, setResources] = useState<Resource[]>([
//     {
//       id: crypto.randomUUID(),
//       title: "",
//       description: "",
//       levels: [],
//       boards: [],
//       madeByMe: false,
//       links: [],
//       files: [],
//     },
//   ]);

//   const onSubmit = async () => {
//     try {
//       if (!resources.length) {
//         toast.error("Please add at least one resource");
//         return;
//       }

//       if (!fullName || !email || !discordOrRedditId) {
//         toast.error("Please fill contributor information");
//         return;
//       }

//       setIsSubmitting(true);

//       const formData = new FormData();

//       // =============================
//       // Contributor
//       // =============================
//       formData.append("fullName", fullName);
//       formData.append("email", email);
//       formData.append("discordOrRedditId", discordOrRedditId);

//       // =============================
//       // Resources (MULTI SUPPORT)
//       // =============================]
//       let validIndex = 0;

//       for (const resource of resources) {
//         if (!resource.title || !resource.title.trim()) {
//           toast.error(`Resource ${validIndex + 1}: Please add a title.`);
//           setIsSubmitting(false);
//           return;
//         }

//         const rawLinks = Array.isArray(resource.links) ? resource.links : [];

//         const cleanedLinks = rawLinks
//           .map((l) => (typeof l === "string" ? l.trim() : ""))
//           .filter((l) => l.length > 0 && /^https?:\/\//i.test(l));
//         const files = resource.files || [];

//         // Require at least one link or file
//         if (cleanedLinks.length === 0 && files.length === 0) {
//           toast.error(
//             `Resource "${resource.title}" must include at least one link or file.`
//           );
//           setIsSubmitting(false);
//           return;
//         }

//         formData.append(`resources[${validIndex}][title]`, resource.title);

//         // Levels
//         for (const level of resource.levels || []) {
//           formData.append(`resources[${validIndex}][levels][]`, level);
//         }

//         // Boards
//         for (const board of resource.boards || []) {
//           formData.append(`resources[${validIndex}][boards][]`, board);
//         }

//         // Made by me flag
//         formData.append(
//           `resources[${validIndex}][madeByMe]`,
//           resource.madeByMe ? "true" : "false"
//         );

//         formData.append(
//           `resources[${validIndex}][description]`,
//           resource.description || ""
//         );

//         const resourceType =
//           files.length && cleanedLinks.length
//             ? "Files + Links"
//             : files.length
//             ? "Files"
//             : "Links";

//         formData.append(`resources[${validIndex}][resourceType]`, resourceType);

//         cleanedLinks.forEach((link) => {
//           formData.append(`resources[${validIndex}][links][]`, link);
//         });

//         for (const file of files) {
//           formData.append(`resources[${validIndex}][files][]`, file);
//         }

//         validIndex++;
//       }

//       const res = await fetch("/api/resources/submit", {
//         method: "POST",
//         body: formData,
//       });

//       const json = await res.json();

//       if (!res.ok) {
//         toast.error(json.error || "Submission failed");
//         setIsSubmitting(false);
//         return;
//       }

//       toast.success("Resources submitted successfully");
//       posthog.capture("resource_submitted", {
//         resource_count: validIndex,
//       });

//       // Optional reset
//       setResources([
//         {
//           id: crypto.randomUUID(),
//           title: "",
//           description: "",
//           levels: [],
//           boards: [],
//           madeByMe: false,
//           links: [],
//           files: [],
//         },
//       ]);

//       setIsSubmitting(false);
//     } catch (err) {
//       console.error(err);
//       posthog.captureException(err);
//       toast.error("Something went wrong");
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div className="mx-auto max-w-5xl px-4 py-16">
//       <Card className="overflow-hidden shadow-2xl border-none">
//         {/* 🔶 TOP BANNER */}
//         <div className="h-36 bg-gradient-to-r from-pink-500 to-rose-600" />

//         <CardContent className="px-10 py-8 space-y-10">
//           {/* 🔷 HEADER */}
//           <div className="space-y-3">
//             <h1 className="text-3xl font-semibold tracking-tight">
//               Resource Submission
//             </h1>

//             <div className="rounded-lg border bg-muted/40 px-5 py-4 text-sm text-muted-foreground space-y-3">
//               <p>
//                 Use this form to submit study resources such as notes, PDFs,
//                 slides, links, or other helpful materials for A-level students.
//               </p>
//               <ul className="list-disc pl-5 space-y-1">
//                 <li>Only submit content you own or have permission to share</li>
//                 <li>Low-quality or spam submissions will be rejected</li>
//                 <li>Approved contributors may receive certificates</li>
//               </ul>
//             </div>
//           </div>

//           <Separator />

//           {/* 🧑 CONTRIBUTOR INFORMATION */}
//           <section className="space-y-6">
//             <div className="space-y-1">
//               <h2 className="text-lg font-semibold">Contributor Information</h2>
//               <p className="text-sm text-muted-foreground">
//                 Basic details to identify and credit you.
//               </p>
//             </div>

//             <div className="grid grid-cols-1 gap-4">
//               <div className="space-y-2">
//                 <Label>
//                   Full Name <span className="text-red-500">*</span>
//                 </Label>
//                 <Input
//                   placeholder="First and last name"
//                   value={fullName}
//                   onChange={(e) => setFullName(e.target.value)}
//                 />
//               </div>

//               <div className="space-y-2">
//                 <Label>
//                   Email Address <span className="text-red-500">*</span>
//                 </Label>
//                 <Input
//                   type="email"
//                   placeholder="you@example.com"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                 />
//               </div>

//               <div className="space-y-2">
//                 <Label>
//                   Discord / Reddit ID <span className="text-red-500">*</span>
//                 </Label>
//                 <Input
//                   placeholder="Discord preferred"
//                   value={discordOrRedditId}
//                   onChange={(e) => setDiscordOrRedditId(e.target.value)}
//                 />
//               </div>
//             </div>
//           </section>

//           <Separator />

//           {/* 📚 RESOURCE SECTION (placeholder for next step) */}
//           <section className="space-y-4">
//             <ResourceTable resources={resources} setResources={setResources} />
//           </section>

//           {/* 🚀 SUBMIT */}
//           <div className="pt-6">
//             <Button
//               size="lg"
//               onClick={onSubmit}
//               disabled={isSubmitting}
//               className="w-full bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 flex items-center justify-center gap-2"
//             >
//               {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
//               {isSubmitting ? "Submitting..." : "Submit Resource"}
//             </Button>

//             <p className="mt-3 text-center text-sm text-muted-foreground">
//               All submissions are reviewed before publishing.
//             </p>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

"use client";

import ResourceTable from "@/components/resources/ResourceTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";
import posthog from "posthog-js";
import { useState } from "react";
import { toast } from "sonner";

type Resource = {
  id: string;
  title: string;
  description: string;
  levels: string[];
  boards: string[];
  madeByMe: boolean;
  links: string[];
  files: File[];
};

export default function ResourceFormPageClient() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [discordOrRedditId, setDiscordOrRedditId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resources, setResources] = useState<Resource[]>([
    {
      id: crypto.randomUUID(),
      title: "",
      description: "",
      levels: [],
      boards: [],
      madeByMe: false,
      links: [],
      files: [],
    },
  ]);

  const onSubmit = async () => {
    try {
      if (!resources.length) {
        toast.error("Please add at least one resource");
        return;
      }

      if (!fullName || !email || !discordOrRedditId) {
        toast.error("Please fill contributor information");
        return;
      }

      setIsSubmitting(true);

      const formData = new FormData();

      // =============================
      // Contributor
      // =============================
      formData.append("fullName", fullName);
      formData.append("email", email);
      formData.append("discordOrRedditId", discordOrRedditId);

      // =============================
      // Resources (MULTI SUPPORT)
      // =============================]
      let validIndex = 0;

      for (const resource of resources) {
        if (!resource.title || !resource.title.trim()) {
          toast.error(`Resource ${validIndex + 1}: Please add a title.`);
          setIsSubmitting(false);
          return;
        }

        const rawLinks = Array.isArray(resource.links) ? resource.links : [];

        const cleanedLinks = rawLinks
          .map((l) => (typeof l === "string" ? l.trim() : ""))
          .filter((l) => l.length > 0 && /^https?:\/\//i.test(l));
        const files = resource.files || [];

        // Require at least one link or file
        if (cleanedLinks.length === 0 && files.length === 0) {
          toast.error(
            `Resource "${resource.title}" must include at least one link or file.`
          );
          setIsSubmitting(false);
          return;
        }

        formData.append(`resources[${validIndex}][title]`, resource.title);

        // Levels
        for (const level of resource.levels || []) {
          formData.append(`resources[${validIndex}][levels][]`, level);
        }

        // Boards
        for (const board of resource.boards || []) {
          formData.append(`resources[${validIndex}][boards][]`, board);
        }

        // Made by me flag
        formData.append(
          `resources[${validIndex}][madeByMe]`,
          resource.madeByMe ? "true" : "false"
        );

        formData.append(
          `resources[${validIndex}][description]`,
          resource.description || ""
        );

        const resourceType =
          files.length && cleanedLinks.length
            ? "Files + Links"
            : files.length
            ? "Files"
            : "Links";

        formData.append(`resources[${validIndex}][resourceType]`, resourceType);

        cleanedLinks.forEach((link) => {
          formData.append(`resources[${validIndex}][links][]`, link);
        });

        for (const file of files) {
          formData.append(`resources[${validIndex}][files][]`, file);
        }

        validIndex++;
      }

      const res = await fetch("/api/resources/submit", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error || "Submission failed");
        setIsSubmitting(false);
        return;
      }

      toast.success("Resources submitted successfully");
      posthog.capture("resource_submitted", {
        resource_count: validIndex,
      });

      // Optional reset
      setResources([
        {
          id: crypto.randomUUID(),
          title: "",
          description: "",
          levels: [],
          boards: [],
          madeByMe: false,
          links: [],
          files: [],
        },
      ]);

      setIsSubmitting(false);
    } catch (err) {
      console.error(err);
      posthog.captureException(err);
      toast.error("Something went wrong");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:py-16">
      <Card className="overflow-hidden shadow-2xl border-none">
        {/* 🔶 TOP BANNER */}
        <div className="h-24 md:h-36 bg-gradient-to-r from-pink-500 to-rose-600" />

        <CardContent className="px-4 sm:px-6 md:px-10 py-6 md:py-8 space-y-8 md:space-y-10">
          {/* 🔷 HEADER */}
          <div className="space-y-3">
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
              Resource Submission
            </h1>

            <div className="rounded-lg border bg-muted/40 px-4 py-3 md:px-5 md:py-4 text-sm text-muted-foreground space-y-3">
              <p>
                Use this form to submit study resources such as notes, PDFs,
                slides, links, or other helpful materials for A-level students.
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Only submit content you own or have permission to share</li>
                <li>Low-quality or spam submissions will be rejected</li>
                <li>Approved contributors may receive certificates</li>
              </ul>
            </div>
          </div>

          <Separator />

          {/* 🧑 CONTRIBUTOR INFORMATION */}
          <section className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold">Contributor Information</h2>
              <p className="text-sm text-muted-foreground">
                Basic details to identify and credit you.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label>
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="First and last name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>
                  Email Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>
                  Discord / Reddit ID <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="Discord preferred"
                  value={discordOrRedditId}
                  onChange={(e) => setDiscordOrRedditId(e.target.value)}
                />
              </div>
            </div>
          </section>

          <Separator />

          {/* 📚 RESOURCE SECTION */}
          <section className="space-y-4">
            {/* Added an optional overflow-x-auto wrapper to ensure the inner table doesn't break mobile bounds */}
            <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
              <ResourceTable
                resources={resources}
                setResources={setResources}
              />
            </div>
          </section>

          {/* 🚀 SUBMIT */}
          <div className="pt-2 md:pt-6">
            <Button
              size="lg"
              onClick={onSubmit}
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 flex items-center justify-center gap-2"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSubmitting ? "Submitting..." : "Submit Resource"}
            </Button>

            <p className="mt-3 text-center text-sm text-muted-foreground">
              All submissions are reviewed before publishing.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
