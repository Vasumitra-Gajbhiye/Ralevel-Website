"use client";
import React from "react";

export default function Page() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      <div className="max-w-4xl mx-auto px-6 py-20">
        <header className="mb-10 text-center sm:text-left">
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">
            Application Bot Privacy Policy
          </h1>
          <p className="mt-2 text-gray-600">
            Last updated: <time dateTime="2026-07-30">July 30, 2026</time>
          </p>
        </header>

        <section className="bg-white border border-gray-100 rounded-2xl shadow-sm p-8 leading-relaxed">
          <p className="text-lg text-gray-700 mb-8">
            This Privacy Policy explains how the{" "}
            <span className="font-semibold">r/alevel Application Bot</span>{" "}
            (“the Bot”) collects, uses, and protects personal information. The
            Bot is a Discord service that notifies staff about website form
            applications and moderation appeals. It is operated by the r/alevel
            team.
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
                The Application Bot posts staff application submissions and
                ban, warning, or timeout appeal submissions to Discord for
                review. It may send reminder pings to staff, process
                approve/reject actions, and send direct messages to applicants
                about status updates. It does not provide general community
                features such as XP, reputation, or confessions.
              </p>
            </section>

            <hr className="border-gray-100" />

            <section id="info">
              <h2 className="text-xl font-semibold text-blue-700 mb-3">
                2. Information we collect
              </h2>
              <p>
                We process only the information needed to run applications and
                appeals:
              </p>
              <ul className="list-disc pl-6 mt-3 space-y-2">
                <li>
                  <strong>Staff applications:</strong> submitter name, email,
                  form answers, and related review metadata (for example staff
                  votes and reminder timestamps).
                </li>
                <li>
                  <strong>Moderation appeals:</strong> Discord user ID,
                  username, avatar, appeal type, free-text answers, review
                  status, and reviewer Discord identifiers.
                </li>
                <li>
                  <strong>Staff contact data:</strong> Discord user or role IDs
                  used to notify people responsible for reviewing submissions.
                </li>
                <li>
                  <strong>Discord message metadata:</strong> message IDs and
                  channel references needed to update review posts.
                </li>
              </ul>
            </section>

            <hr className="border-gray-100" />

            <section id="use">
              <h2 className="text-xl font-semibold text-blue-700 mb-3">
                3. How we use your data
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  Notify staff of new applications and appeals in Discord.
                </li>
                <li>
                  Support review workflows (reminders, approve/reject actions).
                </li>
                <li>
                  Send status DMs to applicants when their submission is
                  received or decided.
                </li>
                <li>
                  Maintain records needed for moderation and staffing decisions.
                </li>
              </ul>
            </section>

            <hr className="border-gray-100" />

            <section id="security">
              <h2 className="text-xl font-semibold text-blue-700 mb-3">
                4. Data storage and security
              </h2>
              <p>
                Application and appeal data is stored in our MongoDB database
                (shared with the r/alevel website). Review content may also
                appear in Discord channels and direct messages. We use standard
                security practices, but no online system is entirely risk-free.
              </p>
            </section>

            <hr className="border-gray-100" />

            <section id="third-party">
              <h2 className="text-xl font-semibold text-blue-700 mb-3">
                5. Third-party services
              </h2>
              <p>
                The Bot relies on third-party platforms that have their own
                privacy policies:
              </p>
              <ul className="list-disc pl-6 mt-3 space-y-2">
                <li>
                  <strong>Discord</strong> — delivery of embeds, buttons, pings,
                  and DMs
                </li>
                <li>
                  <strong>MongoDB Atlas</strong> — database hosting for
                  submissions and related records
                </li>
              </ul>
            </section>

            <hr className="border-gray-100" />

            <section id="access">
              <h2 className="text-xl font-semibold text-blue-700 mb-3">
                6. Access and sharing
              </h2>
              <p>
                Submission details are visible to authorized r/alevel staff who
                review applications and appeals in Discord. We do not sell
                personal data. Information may be shared only as needed to
                operate the Bot, comply with law, or protect the community.
              </p>
            </section>

            <hr className="border-gray-100" />

            <section id="rights">
              <h2 className="text-xl font-semibold text-blue-700 mb-3">
                7. Your rights
              </h2>
              <p>
                You may request access, correction, or deletion of personal data
                related to applications or appeals by contacting us. We may need
                to verify your identity and may retain limited records where
                required for moderation or legal reasons.
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
                For privacy requests or questions about the Application Bot,
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
