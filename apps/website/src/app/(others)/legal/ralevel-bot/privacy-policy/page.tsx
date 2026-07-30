"use client";
import React from "react";

export default function Page() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      <div className="max-w-4xl mx-auto px-6 py-20">
        <header className="mb-10 text-center sm:text-left">
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">
            r/alevel Bot Privacy Policy
          </h1>
          <p className="mt-2 text-gray-600">
            Last updated: <time dateTime="2026-07-30">July 30, 2026</time>
          </p>
        </header>

        <section className="bg-white border border-gray-100 rounded-2xl shadow-sm p-8 leading-relaxed">
          <p className="text-lg text-gray-700 mb-8">
            This Privacy Policy explains how the{" "}
            <span className="font-semibold">r/alevel Bot</span> (“the Bot”)
            collects, uses, and protects personal information in the r/alevel
            Discord server. The Bot provides moderation, engagement, and
            community tools operated by the r/alevel team.
          </p>

          <nav
            aria-label="On-page table of contents"
            className="border border-blue-100 bg-blue-50/40 rounded-xl p-4 mb-10"
          >
            <h2 className="text-blue-700 font-semibold mb-2 text-sm uppercase tracking-wide">
              Quick Navigation
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              {[
                ["About the Bot", "#about"],
                ["Information we collect", "#info"],
                ["How we use data", "#use"],
                ["Data storage & security", "#security"],
                ["Third-party services", "#third-party"],
                ["Access & sharing", "#access"],
                ["Your rights", "#rights"],
                ["Children's privacy", "#children"],
                ["Changes", "#changes"],
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
            <section id="about">
              <h2 className="text-xl font-semibold text-blue-700 mb-3">
                1. About the Bot
              </h2>
              <p>
                The r/alevel Bot is the community Discord bot used for
                moderation, XP and ranks, reputation, certificates, confessions,
                polls, sticky messages, staff tasks, welcome messages, and
                related server tools. Some features may also be managed through
                an authorized staff dashboard.
              </p>
            </section>

            <hr className="border-gray-100" />

            <section id="info">
              <h2 className="text-xl font-semibold text-blue-700 mb-3">
                2. Information we collect
              </h2>
              <p>
                Depending on which features you use, we may process:
              </p>
              <ul className="list-disc pl-6 mt-3 space-y-2">
                <li>
                  <strong>Discord identifiers:</strong> user IDs, usernames or
                  tags (as available at the time), guild, channel, and message
                  IDs.
                </li>
                <li>
                  <strong>Activity & engagement:</strong> message counts, XP,
                  levels or rank roles, reputation totals, and related
                  leaderboard data.
                </li>
                <li>
                  <strong>Moderation records:</strong> warnings, notes,
                  kicks/bans/timeouts metadata, reasons, moderator IDs, and mod
                  logs.
                </li>
                <li>
                  <strong>Certificates:</strong> Discord identity, certificate
                  type/status, and — when you submit them — legal full name and
                  email for delivery.
                </li>
                <li>
                  <strong>Confessions:</strong> confession text, optional
                  attachments, and the author&apos;s Discord ID (kept for staff
                  review; not shown publicly as the author).
                </li>
                <li>
                  <strong>Polls:</strong> poll content and vote choices linked
                  to Discord user IDs.
                </li>
                <li>
                  <strong>Tasks, stickies, and helpers:</strong> staff-created
                  content, assignees, submission links, and related audit
                  metadata.
                </li>
                <li>
                  <strong>Message content (limited):</strong> the Bot may read
                  messages in real time for features such as reputation
                  detection or moderation. Ordinary chat content is generally
                  not stored long-term as full message history for XP; XP
                  systems primarily store counts and related stats.
                </li>
              </ul>
            </section>

            <hr className="border-gray-100" />

            <section id="use">
              <h2 className="text-xl font-semibold text-blue-700 mb-3">
                3. How we use your data
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Operate moderation and safety tools in the Discord server.</li>
                <li>
                  Power engagement systems such as XP, ranks, reputation, polls,
                  and tasks.
                </li>
                <li>
                  Process certificate applications and deliver certificates when
                  approved.
                </li>
                <li>
                  Review and publish confessions while keeping author identity
                  private from the public channel.
                </li>
                <li>
                  Maintain sticky messages, welcome messages, and other server
                  utilities.
                </li>
                <li>
                  Allow authorized staff to manage configuration and records via
                  Discord and/or the staff dashboard.
                </li>
              </ul>
            </section>

            <hr className="border-gray-100" />

            <section id="security">
              <h2 className="text-xl font-semibold text-blue-700 mb-3">
                4. Data storage and security
              </h2>
              <p>
                Durable bot data is stored in MongoDB. Short-lived activity data
                (for example pending XP counters) may be held in Redis. Some
                information also exists in Discord itself (messages, roles, DMs).
                We use standard security measures, though no online system is
                entirely risk-free. Certificate legal name and email are treated
                as sensitive and are intended for authorized staff workflows
                only.
              </p>
            </section>

            <hr className="border-gray-100" />

            <section id="third-party">
              <h2 className="text-xl font-semibold text-blue-700 mb-3">
                5. Third-party services
              </h2>
              <p>
                The Bot relies on third-party platforms with their own privacy
                policies:
              </p>
              <ul className="list-disc pl-6 mt-3 space-y-2">
                <li>
                  <strong>Discord</strong> — hosting the server, commands,
                  messages, and DMs
                </li>
                <li>
                  <strong>MongoDB Atlas</strong> — primary database hosting
                </li>
                <li>
                  <strong>Redis</strong> — short-term caching and counters
                </li>
                <li>
                  <strong>Clerk</strong> — authentication for the staff
                  dashboard (authorized operators only)
                </li>
                <li>
                  External appeal or form providers, if linked from the server
                  for specific workflows
                </li>
              </ul>
            </section>

            <hr className="border-gray-100" />

            <section id="access">
              <h2 className="text-xl font-semibold text-blue-700 mb-3">
                6. Access and sharing
              </h2>
              <p>
                Public-facing bot features may display limited information (for
                example XP or reputation leaderboards). Moderators and
                authorized staff can access moderation records, confession
                authorship, certificate details, and dashboard data as needed to
                run the community. We do not sell personal data.
              </p>
            </section>

            <hr className="border-gray-100" />

            <section id="rights">
              <h2 className="text-xl font-semibold text-blue-700 mb-3">
                7. Your rights
              </h2>
              <p>
                You may request access, correction, or deletion of personal data
                processed by the Bot by contacting us. We may need to verify
                your Discord identity. Some records (for example moderation
                history) may be retained where necessary for community safety or
                legal reasons. Leaving the server does not automatically erase
                all stored records.
              </p>
            </section>

            <hr className="border-gray-100" />

            <section id="children">
              <h2 className="text-xl font-semibold text-blue-700 mb-3">
                8. Children&apos;s privacy
              </h2>
              <p>
                The Bot is intended for users who meet Discord&apos;s age
                requirements (generally 13+). We do not knowingly collect
                personal data from children under 13. If you believe we have
                such data, contact us to request removal.
              </p>
            </section>

            <hr className="border-gray-100" />

            <section id="changes">
              <h2 className="text-xl font-semibold text-blue-700 mb-3">
                9. Changes to this policy
              </h2>
              <p>
                We may update this Privacy Policy from time to time. The “Last
                updated” date above will reflect changes. Continued use of the
                Bot after updates means you acknowledge the revised policy.
              </p>
            </section>

            <hr className="border-gray-100" />

            <section id="contact">
              <h2 className="text-xl font-semibold text-blue-700 mb-3">
                10. Contact
              </h2>
              <p>
                For privacy requests or questions about the r/alevel Bot,
                contact the r/alevel team:
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
                create legal rights beyond what is described here. See also our{" "}
                <a
                  href="/legal/privacy-policy"
                  className="text-blue-600 hover:underline"
                >
                  website Privacy Policy
                </a>
                .
              </p>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
