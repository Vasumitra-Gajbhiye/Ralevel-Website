// import { ReactSearchAutocomplete } from "react-search-autocomplete";

/* ---------------------------
  Data for search
--------------------------- */
// const uuid = [
//   { name: "2a00sg309itg", id: "2a00sg309itg" },
//   { name: "2g00of311lek", id: "2g00of311lek" },
//   { name: "2d00io308jke", id: "2d00io308jke" },
//   { name: "2h00vd310gdf", id: "2h00vd310gdf" },
//   { name: "2t00ml394ndi", id: "2t00ml394ndi" },
//   { name: "2f00bk313iru", id: "2f00bk313iru" },

//   { name: "2b00rk724vji", id: "2b00rk724vji" },
//   { name: "2c00dj713vra", id: "2c00dj713vra" },
//   { name: "2n00kp459twe", id: "2n00kp459twe" },
//   { name: "2m00tl648qpd", id: "2m00tl648qpd" },
//   { name: "2r00ml825hqi", id: "2r00ml825hqi" },
//   { name: "2t00gh312jln", id: "2t00gh312jln" },
//   { name: "2f00sn582yuk", id: "2f00sn582yuk" },
//   { name: "2s00bv970mdf", id: "2s00bv970mdf" },
//   { name: "2m00sd083ldf", id: "2m00sd083ldf" },
//   { name: "2k00kj872kjs", id: "2k00kj872kjs" },
//   { name: "2i00sd238bye", id: "2i00sd238bye" },
// ];

// const items = [
//   { name: "2a00sg309itg", searchId: 1, id: 1 },
//   // { name: "Martin Fernando Pramanik", searchId: 1, id: 2 },
//   { name: "2g00of311lek", searchId: 2, id: 3 },
//   // { name: "Abdur Rafay Khan", searchId: 2, id: 4 },
//   { name: "2d00io308jke", searchId: 3, id: 5 },
//   // { name: "Kyaw Nyi Nyi", searchId: 3, id: 6 },
//   { name: "2h00vd310gdf", searchId: 4, id: 7 },
//   // { name: "Syed Ibrahim Ali", searchId: 4, id: 8 },
//   { name: "2t00ml394ndi", searchId: 5, id: 9 },
//   // { name: "Molly Bonsall", searchId: 5, id: 10 },
//   { name: "2f00bk313iru", searchId: 6, id: 11 },
//   // { name: "Jake Schwegler", searchId: 6, id: 12 },
//   { name: "2b00rk724vji", searchId: 7, id: 13 },
//   // { name: "Muntasir Chowdhury", searchId: 7, id: 14 },
//   { name: "2c00dj713vra", searchId: 8, id: 15 },
//   // { name: "Syed Kashif", searchId: 8, id: 16 },
//   { name: "2n00kp459twe", searchId: 9, id: 17 },
//   // { name: "Soufian Ibrahim", searchId: 9, id: 18 },
//   { name: "2m00tl648qpd", searchId: 10, id: 19 },
//   // { name: "Aditya Kavthekar", searchId: 10, id: 20 },
//   { name: "2r00ml825hqi", searchId: 11, id: 21 },
//   // { name: "Elvin Varghese", searchId: 11, id: 22 },
//   { name: "2t00gh312jln", searchId: 12, id: 23 },
//   // { name: "Muhammad Awan", searchId: 12, id: 24 },
//   { name: "2f00sn582yuk", searchId: 13, id: 25 },
//   // { name: "Layal Alzuhair", searchId: 13, id: 26 },
//   { name: "2s00bv970mdf", searchId: 14, id: 28 },
//   // { name: "Mohid Sheraz", searchId: 14, id: 29 },
//   { name: "2m00sd083ldf", searchId: 15, id: 30 },
//   // { name: "Ayman Kazi", searchId: 15, id: 31 },
//   { name: "2k00kj872kjs", searchId: 16, id: 32 },
//   // { name: "Mohammad Touhid Hossain", searchId: 16, id: 33 },
//   { name: "2i00sd238bye", searchId: 17, id: 34 },
// ];

/* ---------------------------
  UI Components
--------------------------- */
/* Search Component */
// function AnimatedSearch({ onSelect }: { onSelect: (id: string) => void }) {
//   function formatResult(item: any) {
//     return (
//       <div className="p-2">
//         <div className="text-sm font-medium">{item.name}</div>
//       </div>
//     );
//   }

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: -8 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.45 }}
//       className="w-full max-w-xl"
//     >
//       <ReactSearchAutocomplete
//         items={items}
//         onSelect={(item) => {
//           const idx = item.searchId - 1;
//           console.log(item);
//           if (uuid[idx]) onSelect(uuid[idx].id);
//         }}
//         styling={{
//           // borderRadius: "999px",
//           boxShadow: "0 6px 18px rgba(15,23,42,0.06)",
//           height: "48px",
//           zIndex: 50,
//           fontSize: "15px",
//         }}
//         formatResult={formatResult}
//         maxResults={4}
//         placeholder="Search certificate ID or recipient name..."
//       />
//     </motion.div>
//   );
// }
"use client";

import { motion, Variants } from "framer-motion";
import { CheckCircle, Loader2, PenTool, Search, Share2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.15,
      duration: 0.6,
      ease: [0.25, 0.1, 0.25, 1], // use cubic-bezier instead of "easeOut"
    },
  }),
};

/* Certificate Section */
function CertificateBlock({
  icon: Icon,
  title,
  description,
  steps,
  actionLink,
  actionText,
  gradientFrom,
  gradientTo,
}: {
  icon: any;
  title: string;
  description: string;
  steps: { label: string; link?: string }[];
  actionLink?: string;
  actionText?: string;
  gradientFrom: string;
  gradientTo: string;
}) {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.4 }}
      className={`relative rounded-2xl p-8 overflow-hidden mb-20 bg-gradient-to-br ${gradientFrom} ${gradientTo} shadow-lg`}
    >
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
            <Icon className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-semibold text-white">
            {title} Certificate
          </h2>
        </div>

        <p className="text-white/90 mb-6 leading-relaxed text-lg max-w-2xl">
          {description}
        </p>

        <div className="space-y-3">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              custom={i}
              variants={fadeUp}
              className="flex items-start gap-3 text-white/95"
            >
              <div className="min-w-[1.75rem] h-[1.75rem] flex items-center justify-center rounded-full bg-white/30 text-white font-semibold">
                {i + 1}
              </div>
              {step.link ? (
                <a
                  href={step.link}
                  target="_blank"
                  rel="noreferrer"
                  className="underline hover:text-white transition"
                >
                  {step.label}
                </a>
              ) : (
                <span>{step.label}</span>
              )}
            </motion.div>
          ))}
        </div>

        {actionLink && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            viewport={{ once: true }}
            className="mt-6"
          >
            <a
              href={actionLink}
              target="_blank"
              rel="noreferrer"
              className="inline-block bg-white text-gray-900 px-6 py-2 rounded-full font-semibold shadow hover:scale-[1.03] transition"
            >
              {actionText ?? "Apply"}
            </a>
          </motion.div>
        )}
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
    </motion.section>
  );
}

function AnimatedSearch({ onSelect }: { onSelect: (id: string) => void }) {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);

  const isValid = (val: string) => /^[a-z0-9]{12}$/.test(val);

  const handleSubmit = () => {
    const formatted = value.trim().toLowerCase();

    if (!isValid(formatted)) return;

    setLoading(true);

    // slight delay for UX (feels intentional)
    setTimeout(() => {
      onSelect(formatted);
    }, 300);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="w-full max-w-xl"
    >
      <div className="flex items-center gap-3 px-4 py-3 rounded-full border border-gray-200 shadow-sm bg-white focus-within:ring-2 focus-within:ring-blue-500 transition">
        <Search className="w-5 h-5 text-gray-400" />

        <input
          type="text"
          value={value}
          autoFocus
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit();
          }}
          placeholder="Enter 12-character certificate ID..."
          className="w-full outline-none text-sm bg-transparent"
        />

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
        </button>
      </div>

      {/* Optional subtle validation hint */}
      {value.length > 0 && !isValid(value.trim().toLowerCase()) && (
        <p className="text-xs text-red-500 mt-2 ml-2">
          ID must be 12 characters (letters + numbers)
        </p>
      )}
    </motion.div>
  );
}

/* ---------------------------
  Main Page
--------------------------- */
export default function CertificatesPage() {
  const router = useRouter();
  const handleSelect = (id: string) => router.push(`/certificates/${id}`);

  return (
    <main className="min-h-screen flex flex-col items-center pt-24 pb-20">
      {/* Hero */}
      <header className="w-full mb-44 max-w-6xl px-6 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center"
        >
          <h1 className="text-6xl sm:text-7xl font-extrabold leading-tight mb-8 text-center max-md:text-5xl">
            Certificates
          </h1>
          <p className="max-w-2xl text-center text-gray-600 mb-8">
            Recognition for members who elevate r/alevel — through mentorship,
            writing, or sharing resources.
          </p>
          <AnimatedSearch onSelect={handleSelect} />
        </motion.div>
      </header>

      {/* Info Section */}
      <section className="w-full max-w-5xl px-6 sm:px-8 mt-14">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.05 }}
          transition={{ duration: 1, delay: 0.8 }}
        >
          <h3 className="text-3xl font-semibold mb-6">How certificates work</h3>
          <p className="text-gray-700 text-lg mb-16">
            Every r/alevel certificate celebrates genuine contribution — whether
            through solving doubts, writing insightful articles, or building
            resources that help thousands of students.
          </p>

          {/* NEW, MODERNIZED Certificate Sections */}
          <CertificateBlock
            icon={CheckCircle}
            title="Helper"
            description="For those who consistently make learning easier for others — guiding, solving, and encouraging peers across our community."
            gradientFrom="from-green-600"
            gradientTo="to-lime-300"
            steps={[
              {
                label: "Join Discord and Reddit",
                link: "https://discord.gg/r-alevel-1114437735692902481",
              },
              { label: "Answer questions and support peers regularly" },
              { label: "Earn 100 reputation points on Discord" },
              {
                label:
                  "Admins verify your impact before issuing the certificate",
              },
            ]}
            actionLink="http://ralevel.com/forms/helper-intake-1"
            actionText="Apply as Writer"
          />

          <CertificateBlock
            icon={PenTool}
            title="Writer"
            description="For authors who craft informative, accurate, and student-friendly blog posts — helping thousands through clarity and insight."
            gradientFrom="from-pink-500"
            gradientTo="to-rose-600"
            steps={[
              {
                label: "Join r/alevel community on Discord or Reddit",
                link: "https://discord.gg/r-alevel-1114437735692902481",
              },
              {
                label: "Apply as a writer via Google Form",
                link: "https://docs.google.com/forms/d/e/1FAIpQLSeQ7LAYUjRtWunMRPPwdZyAtBN1lCXZt2A-tbcz_psc-DTC8Q/viewform?usp=sf_link",
              },
              { label: "Publish 5 approved posts on r/alevel Blogs" },
              {
                label:
                  "Receive a Writer Certificate after your 5th publication",
              },
            ]}
            actionLink="https://docs.google.com/forms/d/e/1FAIpQLSeQ7LAYUjRtWunMRPPwdZyAtBN1lCXZt2A-tbcz_psc-DTC8Q/viewform?usp=sf_link"
            actionText="Apply as Writer"
          />

          <CertificateBlock
            icon={Share2}
            title="Resource Contributor"
            description="For contributors who share high-quality notes, guides, or interactive learning tools that uplift the entire student body."
            gradientFrom="from-indigo-500"
            gradientTo="to-sky-600"
            steps={[
              {
                label: "Join Discord and Reddit",
                link: "https://discord.gg/r-alevel-1114437735692902481",
              },
              {
                label: "Submit your resources using our official form",
                link: `/forms/resource`,
              },
              {
                label: "Wait for moderator approval.",
              },
              {
                label:
                  "Earn a Contributor Certificate for accepted submissions",
              },
            ]}
            actionLink={`/forms/resource`}
            actionText="Submit a Resource"
          />
        </motion.div>
      </section>

      {/* Final CTA */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-5xl px-6 sm:px-8 mt-12"
      >
        <div className="rounded-2xl p-8 bg-gradient-to-r from-blue-50 to-white border shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-semibold">
              Want a certificate but unsure where to start?
            </h3>
            <p className="text-gray-700 mt-2">
              Join Discord, help others, and apply for the role that fits you.
            </p>
          </div>

          <div className="flex gap-4 md:flex-col">
            <a
              href="https://discord.gg/r-alevel-1114437735692902481"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 text-center rounded-full bg-cy-600 text-white font-semibold hover:scale-110 bg-cy-700 transition"
            >
              Join Discord
            </a>
            <a
              href="/team"
              className="px-4 py-2 text-center rounded-full border border-gray-200 hover:bg-gray-50 transition"
            >
              Meet the Team
            </a>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
