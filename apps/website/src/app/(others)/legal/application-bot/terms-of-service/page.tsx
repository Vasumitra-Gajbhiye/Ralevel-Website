"use client";
import React from "react";

export default function Page() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      <div className="max-w-4xl mx-auto px-6 py-20">
        <header className="mb-10 text-center sm:text-left">
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">
            Application Bot Terms of Service
          </h1>
          <p className="mt-2 text-gray-600">
            Last updated: <time dateTime="2026-07-30">July 30, 2026</time>
          </p>
        </header>

        <section className="bg-white border border-gray-100 rounded-2xl shadow-sm p-8 leading-relaxed">
          <p className="text-lg text-gray-700 mb-8">
            These Terms of Service govern your use of the{" "}
            <span className="font-semibold">r/alevel Application Bot</span>{" "}
            (“the Bot”). By submitting applications or appeals that are
            processed by the Bot, or by interacting with its Discord messages
            and controls, you agree to these Terms.
          </p>

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
                ["About the Bot", "#about"],
                ["Eligibility", "#eligibility"],
                ["Acceptable Use", "#use"],
                ["Applications & appeals", "#decisions"],
                ["Disclaimer", "#disclaimer"],
                ["Third-party services", "#third-party"],
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

          <div className="space-y-10">
            <section id="intro">
              <h2 className="text-xl font-semibold text-blue-700 mb-3">
                1. Introduction
              </h2>
              <p>
                These Terms apply specifically to the Application Bot. They
                work alongside our{" "}
                <a
                  href="/legal/terms-of-service"
                  className="text-blue-600 hover:underline"
                >
                  website Terms of Service
                </a>
                , Discord&apos;s Terms of Service, and the r/alevel community
                rules. If you do not agree, do not use the Bot or submit forms
                processed by it.
              </p>
            </section>

            <hr className="border-gray-100" />

            <section id="about">
              <h2 className="text-xl font-semibold text-blue-700 mb-3">
                2. About the Bot
              </h2>
              <p>
                The Application Bot is an internal Discord service used by
                r/alevel to:
              </p>
              <ul className="list-disc pl-6 mt-3 space-y-2">
                <li>
                  Notify staff when someone submits a staff application via the
                  website
                </li>
                <li>
                  Post and manage ban, warning, and timeout appeal reviews
                </li>
                <li>
                  Send reminders and direct-message status updates related to
                  those workflows
                </li>
              </ul>
              <p className="mt-3">
                r/alevel is an independent educational community and is not
                affiliated with Cambridge International, Pearson Edexcel, or any
                official examination board.
              </p>
            </section>

            <hr className="border-gray-100" />

            <section id="eligibility">
              <h2 className="text-xl font-semibold text-blue-700 mb-3">
                3. Eligibility
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  You must meet Discord&apos;s age requirements (generally 13+)
                  and any applicable local laws.
                </li>
                <li>
                  You must provide accurate information in applications and
                  appeals.
                </li>
                <li>
                  You must comply with Discord&apos;s Terms of Service and
                  r/alevel community rules.
                </li>
              </ul>
            </section>

            <hr className="border-gray-100" />

            <section id="use">
              <h2 className="text-xl font-semibold text-blue-700 mb-3">
                4. Acceptable Use
              </h2>
              <p>When using the Bot or related forms, you agree not to:</p>
              <ul className="list-disc pl-6 mt-3 space-y-2">
                <li>
                  Submit false, misleading, or abusive applications or appeals.
                </li>
                <li>
                  Spam forms, review channels, or reminder workflows.
                </li>
                <li>
                  Attempt to hack, overload, or interfere with the Bot or its
                  connected systems.
                </li>
                <li>
                  Impersonate other users, staff, or applicants.
                </li>
                <li>
                  Use the Bot for any unlawful purpose.
                </li>
              </ul>
              <p className="mt-3">
                We may reject submissions, ignore abusive requests, or restrict
                access when these rules are violated.
              </p>
            </section>

            <hr className="border-gray-100" />

            <section id="decisions">
              <h2 className="text-xl font-semibold text-blue-700 mb-3">
                5. Applications and appeals
              </h2>
              <p>
                Submitting an application or appeal does not guarantee approval,
                a response within a particular timeframe, or any specific
                outcome. Staff decisions are discretionary and based on
                community needs, evidence, and moderation judgment. The Bot is a
                notification and review tool; it does not independently decide
                applications or appeals.
              </p>
            </section>

            <hr className="border-gray-100" />

            <section id="disclaimer">
              <h2 className="text-xl font-semibold text-blue-700 mb-3">
                6. Disclaimer
              </h2>
              <p>
                The Bot is provided “as is” and “as available.” Service may be
                interrupted, delayed, or changed without notice. We do not
                guarantee that notifications, reminders, or DMs will always be
                delivered successfully.
              </p>
            </section>

            <hr className="border-gray-100" />

            <section id="third-party">
              <h2 className="text-xl font-semibold text-blue-700 mb-3">
                7. Third-party services
              </h2>
              <p>
                The Bot depends on Discord and our database providers. r/alevel
                is not responsible for third-party outages, content, or
                policies. Please review Discord&apos;s own terms and privacy
                statements.
              </p>
            </section>

            <hr className="border-gray-100" />

            <section id="termination">
              <h2 className="text-xl font-semibold text-blue-700 mb-3">
                8. Termination
              </h2>
              <p>
                We may stop processing your submissions, revoke related Discord
                access, or discontinue the Bot at any time for misuse, policy
                violations, or operational reasons.
              </p>
            </section>

            <hr className="border-gray-100" />

            <section id="liability">
              <h2 className="text-xl font-semibold text-blue-700 mb-3">
                9. Limitation of liability
              </h2>
              <p>
                To the fullest extent allowed by law, r/alevel and its
                administrators are not liable for any indirect or consequential
                damages arising from use of the Bot, including missed
                notifications or application/appeal outcomes.
              </p>
            </section>

            <hr className="border-gray-100" />

            <section id="modifications">
              <h2 className="text-xl font-semibold text-blue-700 mb-3">
                10. Modifications
              </h2>
              <p>
                We may update these Terms to reflect changes in how the Bot
                works. Updates are indicated by the “Last updated” date above.
                Continued use after changes means you accept the revised Terms.
              </p>
            </section>

            <hr className="border-gray-100" />

            <section id="contact">
              <h2 className="text-xl font-semibold text-blue-700 mb-3">
                11. Contact
              </h2>
              <p>
                For questions about these Terms, contact:
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
