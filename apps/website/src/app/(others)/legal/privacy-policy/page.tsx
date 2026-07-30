// // app/(others)/legal/privacy-policy/page.tsx
// import React from "react";

// export default function Page() {
//   return (
//     <main className="min-h-screen bg-white text-gray-900">
//       <div className="max-w-4xl mx-auto px-6 py-20">
//         <header className="mb-8">
//           <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">
//             Privacy Policy
//           </h1>
//           <p className="mt-3 text-gray-600">
//             Last updated: <time dateTime="2025-10-31">October 31, 2025</time>
//           </p>
//         </header>

//         <section className="bg-white border border-gray-100 rounded-2xl shadow-sm p-8">
//           <p className="text-lg text-gray-700 mb-6 leading-relaxed">
//             Welcome to <span className="font-semibold">r/alevel</span>. We
//             respect your privacy and are committed to protecting your personal
//             information. This Privacy Policy explains what data we collect, why
//             we collect it, how we use it, and the choices you have.
//           </p>

//           <nav aria-label="On-page table of contents" className="mb-6">
//             <ul className="flex gap-4 flex-wrap text-sm">
//               <li>
//                 <a href="#info" className="text-blue-600 hover:underline">
//                   Information we collect
//                 </a>
//               </li>
//               <li>
//                 <a href="#use" className="text-blue-600 hover:underline">
//                   How we use data
//                 </a>
//               </li>
//               <li>
//                 <a href="#cookies" className="text-blue-600 hover:underline">
//                   Cookies & local storage
//                 </a>
//               </li>
//               <li>
//                 <a href="#security" className="text-blue-600 hover:underline">
//                   Security & storage
//                 </a>
//               </li>
//               <li>
//                 <a href="#third-party" className="text-blue-600 hover:underline">
//                   Third-party services
//                 </a>
//               </li>
//               <li>
//                 <a href="#rights" className="text-blue-600 hover:underline">
//                   Your rights
//                 </a>
//               </li>
//               <li>
//                 <a href="#contact" className="text-blue-600 hover:underline">
//                   Contact
//                 </a>
//               </li>
//             </ul>
//           </nav>

//           <article className="prose prose-lg prose-slate">
//             <h2 id="info">1. Information we collect</h2>
//             <p>
//               We collect only the information necessary to run the website,
//               deliver community services, and improve the experience for our
//               users.
//             </p>
//             <ul>
//               <li>
//                 <strong>Information you provide:</strong> account identifiers
//                 (username, email) when you register or authenticate, messages,
//                 form submissions, and content you post.
//               </li>
//               <li>
//                 <strong>Automatically collected data:</strong> usage metrics
//                 (pages visited, clicks), device/browser metadata, and anonymized
//                 location via IP.
//               </li>
//               <li>
//                 <strong>Local data:</strong> progress, preferences, and other
//                 non-sensitive state may be stored in your browser localStorage.
//               </li>
//             </ul>

//             <h2 id="use">2. How we use your data</h2>
//             <p>
//               We use collected data to operate the community and improve the
//               service:
//             </p>
//             <ul>
//               <li>Personalize and remember your progress and preferences.</li>
//               <li>Maintain, moderate, and secure the community (Discord/Reddit).</li>
//               <li>Analyze site performance and improve features.</li>
//               <li>Send important updates if you opt to receive them.</li>
//             </ul>

//             <h2 id="cookies">3. Cookies and local storage</h2>
//             <p>
//               We use cookies and local storage for sessions, preferences, and
//               non-personal analytics. You can disable cookies in your browser,
//               but some features may stop working as expected.
//             </p>

//             <h2 id="security">4. Data storage and security</h2>
//             <p>
//               We store data using secure, reputable providers (for example,
//               MongoDB Atlas). We implement standard security measures to protect
//               data, but no system is completely risk free.
//             </p>

//             <h2 id="third-party">5. Third-party services</h2>
//             <p>
//               We integrate with third-party platforms for community and
//               authentication. These providers have their own privacy policies:
//             </p>
//             <ul>
//               <li>Discord (community & identity)</li>
//               <li>Reddit (subreddit management)</li>
//               <li>Analytics providers (if enabled) — for aggregated metrics</li>
//             </ul>

//             <h2 id="retention">6. Data retention & deletion</h2>
//             <p>
//               We retain personal data only as long as it is necessary to
//               provide services. You may request deletion of your data by
//               contacting us; we will remove it after verification and a short
//               processing period.
//             </p>

//             <h2 id="rights">7. Your rights</h2>
//             <p>
//               Depending on where you are located, you may have rights to access,
//               correct, or delete personal data. To exercise any right, contact
//               the team using the details below.
//             </p>

//             <h2 id="children">8. Children&apos;s privacy</h2>
//             <p>
//               This service is intended for users aged 13 and above. We do not
//               knowingly collect personal data from children under 13. If you
//               believe we have such data, please contact us to request its
//               removal.
//             </p>

//             <h2 id="changes">9. Changes to this policy</h2>
//             <p>
//               We may update this policy occasionally. The &quot;Last updated&quot;
//               date at the top will reflect any change. Please check back
//               periodically.
//             </p>

//             <h2 id="contact">10. Contact</h2>
//             <p>
//               For privacy requests or questions, reach out to the r/alevel team:
//             </p>
//             <ul>
//               <li>
//                 Email:{" "}
//                 <a
//                   href="mailto:r.alevelserver@gmail.com"
//                   className="text-blue-600 hover:underline"
//                 >
//                   r.alevelserver@gmail.com
//                 </a>
//               </li>
//               <li>
//                 Discord: link available on the website and server description.
//               </li>
//             </ul>

//             <p className="mt-6 text-sm text-gray-500">
//               This Privacy Policy is for informational purposes and does not
//               create legal rights beyond what is described here. If you need a
//               formal data-deletion or privacy request, email the team and we
//               will respond promptly.
//             </p>
//           </article>
//         </section>
//       </div>
//     </main>
//   );
// }

"use client";
import React from "react";

export default function Page() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      <div className="max-w-4xl mx-auto px-6 py-20">
        {/* HEADER */}
        <header className="mb-10 text-center sm:text-left">
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">
            Privacy Policy
          </h1>
          <p className="mt-2 text-gray-600">
            Last updated: <time dateTime="2025-10-31">October 31, 2025</time>
          </p>
        </header>

        {/* MAIN SECTION */}
        <section className="bg-white border border-gray-100 rounded-2xl shadow-sm p-8 leading-relaxed">
          <p className="text-lg text-gray-700 mb-8">
            Welcome to <span className="font-semibold">r/alevel</span>. We
            respect your privacy and are committed to protecting your personal
            information. This Privacy Policy explains what data we collect, why
            we collect it, how we use it, and the choices you have.
          </p>

          {/* TABLE OF CONTENTS */}
          <nav
            aria-label="On-page table of contents"
            className="border border-blue-100 bg-blue-50/40 rounded-xl p-4 mb-10"
          >
            <h2 className="text-blue-700 font-semibold mb-2 text-sm uppercase tracking-wide">
              Quick Navigation
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              {[
                ["Information we collect", "#info"],
                ["How we use data", "#use"],
                ["Cookies & local storage", "#cookies"],
                ["Security & storage", "#security"],
                ["Third-party services", "#third-party"],
                ["Your rights", "#rights"],
                ["Contact", "#contact"],
              ].map(([label, href]) => (
                <li key={href}>
                  <a
                    href={href}
                    className="text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    • {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* CONTENT */}
          <div className="space-y-10">
            {/* SECTION 1 */}
            <section id="info">
              <h2 className="text-xl font-semibold text-blue-700 mb-3">
                1. Information we collect
              </h2>
              <p>
                We collect only the information necessary to operate the
                website, deliver community services, and improve your
                experience.
              </p>
              <ul className="list-disc pl-6 mt-3 space-y-2">
                <li>
                  <strong>Information you provide:</strong> account identifiers
                  (username, email) when you register or authenticate, messages,
                  form submissions, and content you post.
                </li>
                <li>
                  <strong>Automatically collected data:</strong> usage metrics
                  (pages visited, clicks), device/browser metadata, and
                  anonymized location via IP.
                </li>
                <li>
                  <strong>Local data:</strong> progress, preferences, and other
                  non-sensitive state stored in your browser localStorage.
                </li>
              </ul>
            </section>

            <hr className="border-gray-100" />

            {/* SECTION 2 */}
            <section id="use">
              <h2 className="text-xl font-semibold text-blue-700 mb-3">
                2. How we use your data
              </h2>
              <p>
                The data we collect helps us maintain and improve the community
                experience.
              </p>
              <ul className="list-disc pl-6 mt-3 space-y-2">
                <li>Personalize and remember your progress and preferences.</li>
                <li>
                  Maintain, moderate, and secure the community (Discord/Reddit).
                </li>
                <li>Analyze site performance and improve features.</li>
                <li>Send updates only if you have opted to receive them.</li>
              </ul>
            </section>

            <hr className="border-gray-100" />

            {/* SECTION 3 */}
            <section id="cookies">
              <h2 className="text-xl font-semibold text-blue-700 mb-3">
                3. Cookies and local storage
              </h2>
              <p>
                We use cookies and local storage for sessions, preferences, and
                analytics. You can disable cookies in your browser, but some
                features may not function as intended.
              </p>
            </section>

            <hr className="border-gray-100" />

            {/* SECTION 4 */}
            <section id="security">
              <h2 className="text-xl font-semibold text-blue-700 mb-3">
                4. Data storage and security
              </h2>
              <p>
                Data is stored using secure providers such as MongoDB Atlas. We
                use standard security measures, though no online system is
                entirely risk-free.
              </p>
            </section>

            <hr className="border-gray-100" />

            {/* SECTION 5 */}
            <section id="third-party">
              <h2 className="text-xl font-semibold text-blue-700 mb-3">
                5. Third-party services
              </h2>
              <p>
                We integrate with trusted third-party platforms for community
                and authentication. These services maintain their own privacy
                policies:
              </p>
              <ul className="list-disc pl-6 mt-3 space-y-2">
                <li>Discord — community & identity management</li>
                <li>Reddit — subreddit operations</li>
                <li>
                  Analytics providers — anonymous traffic and engagement
                  insights
                </li>
              </ul>
            </section>

            <hr className="border-gray-100" />

            {/* SECTION 6 */}
            <section id="rights">
              <h2 className="text-xl font-semibold text-blue-700 mb-3">
                6. Your rights
              </h2>
              <p>
                You may request access, correction, or deletion of your
                information. For any privacy-related request, please contact us
                through the details below.
              </p>
            </section>

            <hr className="border-gray-100" />

            {/* SECTION 7 */}
            <section id="contact">
              <h2 className="text-xl font-semibold text-blue-700 mb-3">
                7. Contact
              </h2>
              <p>
                For privacy requests or questions, reach out to the r/alevel
                team:
              </p>
              <ul className="list-disc pl-6 mt-3">
                <li>
                  Email:{" "}
                  <a
                    href="mailto:r.alevelserver@gmail.com"
                    className="text-blue-600 hover:underline"
                  >
                    r.alevelserver@gmail.com
                  </a>
                </li>
                <li>
                  Discord: link available on our official website and server.
                </li>
              </ul>
              <p className="mt-6 text-sm text-gray-500">
                This Privacy Policy is for informational purposes and does not
                create legal rights beyond what is described here.
              </p>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}