"use client";
import React from "react";

export default function Page() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      <div className="max-w-4xl mx-auto px-6 py-20">
        {/* HEADER */}
        <header className="mb-10 text-center sm:text-left">
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">
            Terms of Service
          </h1>
          <p className="mt-2 text-gray-600">
            Last updated: <time dateTime="2025-10-31">October 31, 2025</time>
          </p>
        </header>

        {/* MAIN SECTION */}
        <section className="bg-white border border-gray-100 rounded-2xl shadow-sm p-8 leading-relaxed">
          <p className="text-lg text-gray-700 mb-8">
            Welcome to <span className="font-semibold">r/alevel</span>. By using
            our website, Discord server, or related platforms, you agree to the
            following Terms of Service. Please read them carefully before
            continuing.
          </p>

          {/* QUICK NAVIGATION */}
          <nav
            aria-label="Quick navigation"
            className="border border-blue-100 bg-blue-50/40 rounded-xl p-4 mb-10"
          >
            <h2 className="text-blue-700 font-semibold mb-2 text-sm uppercase tracking-wide">
              Quick Navigation
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              {[
                ["Introduction", "#intro"],
                ["About r/alevel", "#about"],
                ["Eligibility", "#eligibility"],
                ["Acceptable Use", "#use"],
                ["Content Ownership", "#ownership"],
                ["Disclaimer", "#disclaimer"],
                ["Third-Party Links", "#third-party"],
                ["Termination", "#termination"],
                ["Liability", "#liability"],
                ["Modifications", "#modifications"],
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
            {/* 1 */}
            <section id="intro">
              <h2 className="text-xl font-semibold text-blue-700 mb-3">
                1. Introduction
              </h2>
              <p>
                Welcome to <strong>r/alevel</strong>. By accessing or using our
                website, Discord server, or any related platforms under the
                r/alevel name, you agree to comply with and be bound by these
                Terms of Service. If you do not agree to these terms, please do
                not use our services.
              </p>
            </section>

            <hr className="border-gray-100" />

            {/* 2 */}
            <section id="about">
              <h2 className="text-xl font-semibold text-blue-700 mb-3">
                2. About r/alevel
              </h2>
              <p>
                r/alevel is an independent educational community created by
                students, for students. Our goal is to provide academic
                resources, guidance, and a supportive environment for learners
                pursuing IGCSE, AS, and A Level qualifications. We are not
                affiliated with Cambridge International, Pearson Edexcel, or any
                official examination board.
              </p>
            </section>

            <hr className="border-gray-100" />

            {/* 3 */}
            <section id="eligibility">
              <h2 className="text-xl font-semibold text-blue-700 mb-3">
                3. Eligibility
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>You are at least 13 years old, or have guardian consent.</li>
                <li>
                  You will comply with all applicable local laws and community
                  rules.
                </li>
                <li>You will use our services for lawful, educational purposes only.</li>
              </ul>
            </section>

            <hr className="border-gray-100" />

            {/* 4 */}
            <section id="use">
              <h2 className="text-xl font-semibold text-blue-700 mb-3">
                4. Acceptable Use Policy
              </h2>
              <p>When using our services, you agree not to:</p>
              <ul className="list-disc pl-6 mt-3 space-y-2">
                <li>
                  Post or share content that is harassing, discriminatory,
                  illegal, or harmful.
                </li>
                <li>
                  Distribute pirated materials or copyrighted exam content.
                </li>
                <li>
                  Attempt to hack, overload, or disrupt the website or Discord
                  server.
                </li>
                <li>
                  Use bots, scrapers, or automated systems to collect data
                  without permission.
                </li>
                <li>Impersonate other users, moderators, or administrators.</li>
              </ul>
              <p className="mt-3">
                We reserve the right to remove content or suspend users who
                violate these guidelines.
              </p>
            </section>

            <hr className="border-gray-100" />

            {/* 5 */}
            <section id="ownership">
              <h2 className="text-xl font-semibold text-blue-700 mb-3">
                5. Content Ownership
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  All original materials on r/alevel (articles, resources,
                  visuals) are protected by copyright and belong to their
                  respective authors or to r/alevel.
                </li>
                <li>
                  You retain ownership of content you submit but grant us a
                  non-exclusive, royalty-free license to display it on our
                  platforms.
                </li>
                <li>
                  Community contributions (e.g., notes, guides, posts) may be
                  reused for educational purposes with credit.
                </li>
              </ul>
            </section>

            <hr className="border-gray-100" />

            {/* 6 */}
            <section id="disclaimer">
              <h2 className="text-xl font-semibold text-blue-700 mb-3">
                6. Disclaimer of Responsibility
              </h2>
              <p>
                r/alevel provides materials for general educational purposes
                only. While we make reasonable efforts to ensure accuracy, we do
                not guarantee all information is complete or error-free. We are
                not responsible for actions taken based on our content.
              </p>
            </section>

            <hr className="border-gray-100" />

            {/* 7 */}
            <section id="third-party">
              <h2 className="text-xl font-semibold text-blue-700 mb-3">
                7. Third-Party Links and Services
              </h2>
              <p>
                Our platforms may include links to external services such as
                Discord, Reddit, or analytics providers. r/alevel is not
                responsible for third-party content or policies. Please review
                their own terms and privacy statements.
              </p>
            </section>

            <hr className="border-gray-100" />

            {/* 8 */}
            <section id="termination">
              <h2 className="text-xl font-semibold text-blue-700 mb-3">
                8. Termination of Use
              </h2>
              <p>
                We may suspend or terminate user access for violations of these
                Terms or harmful behavior. Users may request account deletion or
                data removal by contacting our team.
              </p>
            </section>

            <hr className="border-gray-100" />

            {/* 9 */}
            <section id="liability">
              <h2 className="text-xl font-semibold text-blue-700 mb-3">
                9. Limitation of Liability
              </h2>
              <p>
                To the fullest extent allowed by law, r/alevel and its
                administrators are not liable for any indirect or consequential
                damages from using our services. All services are provided “as
                is” and “as available.”
              </p>
            </section>

            <hr className="border-gray-100" />

            {/* 10 */}
            <section id="modifications">
              <h2 className="text-xl font-semibold text-blue-700 mb-3">
                10. Modifications to the Terms
              </h2>
              <p>
                We may update these Terms to reflect changes in policies or
                operations. Updates will be reflected by revising the “Last
                Updated” date above. Continued use after updates means you
                accept the new Terms.
              </p>
            </section>

            <hr className="border-gray-100" />

            {/* 11 */}
            <section id="contact">
              <h2 className="text-xl font-semibold text-blue-700 mb-3">
                11. Contact Information
              </h2>
              <p>
                For questions or feedback, contact our team at:
                <br />
                <a
                  href="mailto:r.alevelserver@gmail.com"
                  className="text-blue-600 hover:underline"
                >
                  r.alevelserver@gmail.com
                </a>{" "}
                or via our official Discord server (linked on the website).
              </p>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}