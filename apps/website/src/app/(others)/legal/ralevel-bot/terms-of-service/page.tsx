"use client";
import React from "react";

export default function Page() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      <div className="max-w-4xl mx-auto px-6 py-20">
        <header className="mb-10 text-center sm:text-left">
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">
            r/alevel Bot Terms of Service
          </h1>
          <p className="mt-2 text-gray-600">
            Last updated: <time dateTime="2026-07-30">July 30, 2026</time>
          </p>
        </header>

        <section className="bg-white border border-gray-100 rounded-2xl shadow-sm p-8 leading-relaxed">
          <p className="text-lg text-gray-700 mb-8">
            These Terms of Service govern your use of the{" "}
            <span className="font-semibold">r/alevel Bot</span> (“the Bot”) in
            the r/alevel Discord server. By using the Bot&apos;s commands,
            buttons, or related features, you agree to these Terms.
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
                ["Feature-specific rules", "#features"],
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
                These Terms apply specifically to the r/alevel Bot. They work
                alongside our{" "}
                <a
                  href="/legal/terms-of-service"
                  className="text-blue-600 hover:underline"
                >
                  website Terms of Service
                </a>
                ,{" "}
                <a
                  href="/legal/discord-regulations"
                  className="text-blue-600 hover:underline"
                >
                  Discord Regulations
                </a>
                , Discord&apos;s Terms of Service, and the server rules. If you
                do not agree, do not use the Bot.
              </p>
            </section>

            <hr className="border-gray-100" />

            <section id="about">
              <h2 className="text-xl font-semibold text-blue-700 mb-3">
                2. About the Bot
              </h2>
              <p>
                The Bot provides community tools in the r/alevel Discord server,
                including moderation commands, XP and ranks, reputation,
                certificates, confessions, polls, sticky messages, staff tasks,
                welcome messages, and related utilities. r/alevel is an
                independent educational community and is not affiliated with
                Cambridge International, Pearson Edexcel, or any official
                examination board.
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
                  You must be a member of the r/alevel Discord server (or
                  otherwise authorized) to use server features.
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
              <p>When using the Bot, you agree not to:</p>
              <ul className="list-disc pl-6 mt-3 space-y-2">
                <li>
                  Abuse commands, spam interactions, or attempt to bypass
                  cooldowns, role gates, or bans (including XP or reputation
                  bans).
                </li>
                <li>
                  Exploit XP, reputation, polls, tasks, or other systems for
                  unfair advantage.
                </li>
                <li>
                  Submit false certificate information or misuse certificate
                  workflows.
                </li>
                <li>
                  Use confessions or other channels to harass, dox, or break
                  server rules while expecting anonymity to shield misconduct.
                </li>
                <li>
                  Attempt to hack, overload, scrape, or interfere with the Bot
                  or its connected systems.
                </li>
                <li>
                  Impersonate users, moderators, or administrators.
                </li>
              </ul>
              <p className="mt-3">
                Staff may restrict Bot access, reverse abusive gains, remove
                content, or take moderation action for violations.
              </p>
            </section>

            <hr className="border-gray-100" />

            <section id="features">
              <h2 className="text-xl font-semibold text-blue-700 mb-3">
                5. Feature-specific rules
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Confessions:</strong> Public posts are anonymous to
                  members, but staff may access author identity for safety and
                  enforcement. Do not treat anonymity as permission to break
                  rules.
                </li>
                <li>
                  <strong>Certificates:</strong> Legal name and email you submit
                  must be accurate. Providing false details may result in
                  rejection or removal of certificate privileges.
                </li>
                <li>
                  <strong>Moderation:</strong> Bot actions support staff
                  decisions. Using the Bot does not create a right to any
                  particular outcome in warnings, bans, appeals, or similar
                  processes.
                </li>
                <li>
                  <strong>Engagement systems:</strong> XP, ranks, reputation,
                  and similar rewards may be adjusted, reset, or disabled at
                  staff discretion.
                </li>
              </ul>
            </section>

            <hr className="border-gray-100" />

            <section id="disclaimer">
              <h2 className="text-xl font-semibold text-blue-700 mb-3">
                6. Disclaimer
              </h2>
              <p>
                The Bot is provided “as is” and “as available.” Features may be
                unavailable, delayed, changed, or discontinued without notice.
                We do not guarantee uninterrupted uptime, perfect accuracy of
                XP/reputation counts, or delivery of DMs and automated messages.
              </p>
            </section>

            <hr className="border-gray-100" />

            <section id="third-party">
              <h2 className="text-xl font-semibold text-blue-700 mb-3">
                7. Third-party services
              </h2>
              <p>
                The Bot depends on Discord and infrastructure providers such as
                database and cache hosts. r/alevel is not responsible for
                third-party outages, content, or policies. Please review
                Discord&apos;s own terms and privacy statements.
              </p>
            </section>

            <hr className="border-gray-100" />

            <section id="termination">
              <h2 className="text-xl font-semibold text-blue-700 mb-3">
                8. Termination
              </h2>
              <p>
                We may suspend or terminate your ability to use Bot features for
                violations of these Terms, Discord&apos;s rules, or community
                regulations. We may also discontinue the Bot or individual
                features at any time.
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
                damages arising from use of the Bot, including loss of XP,
                reputation, certificates, confessions, or other virtual
                progress.
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
