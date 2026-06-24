// app/discord-regulations/page.tsx
import Link from "next/link";
import React from "react";

export const metadata = {
  title: "Discord Regulations | r/alevel",
};

export default function DiscordRegulationsPage() {
  return (
    <main className="w-full flex justify-center px-6 py-20">
      <div className="max-w-4xl w-full">
        {/* Page Header */}
        <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight text-transparent bg-clip-text h-16 bg-gradient-to-r from-blue-600 to-indigo-500">
          Discord Regulations
        </h1>
        <p className="text-gray-600 mt-2">Last updated: December 2025</p>

        {/* Container Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mt-8 p-6 md:p-8">
          {/* Intro */}
          <p className="text-gray-700 leading-relaxed">
            Welcome to the official{" "}
            <span className="font-semibold">r/alevel Discord server</span> — a
            communal extension of the r/alevel Reddit community.
            <br />
            <br />
            <span className="font-semibold">
              By being a member of this server, you agree to all regulations
              listed below.
            </span>
          </p>

          {/* Quick Navigation */}
          {/* <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 my-8">
            <h2 className="font-semibold text-blue-900 mb-2">
              QUICK NAVIGATION
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-blue-700 text-sm">
              <a href="#general" className="hover:underline">
                • General Regulations
              </a>
              <a href="#important" className="hover:underline">
                • Important
              </a>
              <a href="#links" className="hover:underline">
                • Links
              </a>
              <a href="#disclaimer" className="hover:underline">
                • Disclaimer
              </a>
              <a href="#advisory" className="hover:underline">
                • Advisory Notice
              </a>
              <a href="#section1" className="hover:underline">
                • Section 1 — Cheating
              </a>
              <a href="#section2" className="hover:underline">
                • Section 2 — Reputation
              </a>
              <a href="#section3" className="hover:underline">
                • Section 3 — Language & Behaviour
              </a>
              <a href="#section4" className="hover:underline">
                • Section 4 — Mentions
              </a>
              <a href="#section5" className="hover:underline">
                • Section 5 — Discussion
              </a>
              <a href="#section6" className="hover:underline">
                • Section 6 — Advertising
              </a>
              <a href="#section7" className="hover:underline">
                • Section 7 — Nicknames
              </a>
              <a href="#section8" className="hover:underline">
                • Section 8 — Regulation Bypass
              </a>
              <a href="#section9" className="hover:underline">
                • Section 9 — Spam
              </a>
            </div>
          </div> */}

          <div className="bg-blue-50/40 border border-blue-200 rounded-xl p-6 my-8">
            <h2 className="font-semibold text-blue-800 text-lg mb-2 tracking-wide">
              QUICK NAVIGATION
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-blue-700 text-sm">
              <a href="#general" className="hover:underline">
                • General Regulations
              </a>
              <a href="#important" className="hover:underline">
                • Important
              </a>
              <a href="#links" className="hover:underline">
                • Links
              </a>
              <a href="#disclaimer" className="hover:underline">
                • Disclaimer
              </a>
              <a href="#advisory" className="hover:underline">
                • Advisory Notice
              </a>
              <a href="#section1" className="hover:underline">
                • Section 1 — Cheating
              </a>
              <a href="#section2" className="hover:underline">
                • Section 2 — Reputation
              </a>
              <a href="#section3" className="hover:underline">
                • Section 3 — Language & Behaviour
              </a>
              <a href="#section4" className="hover:underline">
                • Section 4 — Mentions
              </a>
              <a href="#section5" className="hover:underline">
                • Section 5 — Discussion
              </a>
              <a href="#section6" className="hover:underline">
                • Section 6 — Advertising
              </a>
              <a href="#section7" className="hover:underline">
                • Section 7 — Nicknames
              </a>
              <a href="#section8" className="hover:underline">
                • Section 8 — Regulation Bypass
              </a>
              <a href="#section9" className="hover:underline">
                • Section 9 — Spam
              </a>
            </div>
          </div>

          {/* ----- GENERAL REGULATIONS ----- */}
          <Section
            id="general"
            title="General Regulations"
            items={[
              "You admit to being at least 13 years old, per Discord's minimum age requirement.",
              <>
                You agree to follow all of Discord&apos;s platform-wide{" "}
                <Link
                  className="text-blue-600 underline"
                  href="https://discord.com/terms"
                  target="_blank"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  className="text-blue-600 underline"
                  href="https://discord.com/guidlines"
                  target="_blank"
                >
                  Community Guidelines
                </Link>
                .
              </>,
              "You agree to utilise this server for the following purposes: to socialise, educate, learn, share, and have fun",
            ]}
          />

          {/* ----- IMPORTANT ----- */}
          <Section
            id="important"
            title="Important"
            items={[
              <>
                If you wish to submit a report or open a ticket, you may do so{" "}
                <Link
                  className="text-blue-600 underline"
                  href="https://discord.com/channels/1114437735692902481/1325384293970870292"
                  target="_blank"
                >
                  here
                </Link>
                .
              </>,
              <>
                If you seek an appeal (ban/penalty), submit it{" "}
                <Link
                  className="text-blue-600 underline"
                  href="https://formcord.app/alevel/g3wRLtxeHP"
                  target="_blank"
                >
                  here
                </Link>
                .
              </>,
              "Cases that do not align with an already specified penalty can be determined upon by a Staff member where appropriate",
            ]}
          />

          {/* ----- LINKS ----- */}
          <Section
            id="links"
            title="Links"
            items={[
              <Link
                key={1}
                className="text-blue-600 underline"
                href="https://ralevel.com/"
                target="_blank"
              >
                r/alevel Website
              </Link>,
              <Link
                key={2}
                className="text-blue-600 underline"
                href="https://www.reddit.com/r/alevel/"
                target="_blank"
              >
                r/alevel Reddit
              </Link>,
            ]}
          />

          {/* ----- DISCLAIMER ----- */}
          <Section
            id="disclaimer"
            title="Disclaimer"
            items={[
              "By being a member of the r/alevel Discord server, you agree to use this server at your own risk and will be responsible for your own actions and content.",
              "The r/alevel Moderation team and Administration team are not liable for any user content or disputes.",
              "Our actions remain limited to regulation enforcement, and therefore shall not be held accountable for any damages, conflicts, or unforeseen scenarios.",
              "The r/alevel Moderation team and Administrative team withhold the right to determine the severity of a situation and its aligned level of repercussion in accordance with common practice.",
            ]}
          />

          {/* ----- ADVISORY NOTICE ----- */}
          <Section
            id="advisory"
            title="Advisory Notice"
            items={[
              "The r/alevel Moderation and Administration team do not ban upon request.",
              "If you are asking to be banned, kicked, muted, etc. for whatever reason, i.e. academic focus, distractions, your request will not be granted.",
            ]}
          />

          {/* All major sections composed below */}
          <MajorSection
            id="section1"
            title="Section 1 — General Cheating"
            groups={[
              {
                subtitle: "1.1 Paper Sharing",
                text: "Refrain from, in any form, sharing or requesting leaked papers, or other information that predates an examination which may risk the gaining of an unfair advantage.",
              },
              {
                subtitle: "1.2 Paper Rumours",
                text: "The spreading of leaked paper-associated rumours is forbidden. If you hear a rumour that a paper has been leaked, please do not encourage or participate in any discussion.",
              },
              {
                subtitle: "1.3 Plagiarism",
                text: "This server is a safe space to share work amongst others. The act of stealing/plagiarising others' work without their consent is strictly forbidden.",
              },
              {
                subtitle: "1.4 Cheating Services",
                text: "The creation, advertisement, and spread of cheating services, paid and unpaid, that offer the completion of assignments, essays, coursework, etc. is not permitted.",
              },
              {
                subtitle: "1.5 Examination Assistance",
                text: "Refrain from asking for, or providing real-time responses to candidates undertaking an ongoing examination or timed assessment.",
              },
              {
                subtitle: "1.6 Examination Discussion",
                text: "Channels are locked on average 30 minutes before and during an examination. Discussing the topics of a subject within this timeframe is prohibited until all variants have been completed.",
              },
            ]}
          />

          <MajorSection
            id="section2"
            title="Section 2 — Reputation Farming"
            groups={[
              {
                subtitle: "2.1 Spam Contributions",
                text: "It is forbidden to provide low-quality, incorrect, and even entirely irrelevant answers for the purpose of gaining reputation",
              },
              {
                subtitle: "2.2 Fake Contributions",
                text: "Refrain from, on your own or with peers, spamming appreciative remarks without actually providing genuine academic assistance, for the sole purpose of farming reputation.",
              },
              {
                subtitle: "2.3 Answer Splitting",
                text: "Please do not actively attempt to break a singular, small answer into multiple, individual answers to maximise the number of appreciative remarks to yield reputation.",
              },
            ]}
          />

          <MajorSection
            id="section3"
            title="Section 3 — Language & Behaviour"
            groups={[
              {
                subtitle: "3.1 Derogatory Language/Hate Speech",
                text: "The usage of language that discriminates against one's self or a known/unknown peer, is heavily forbidden. This includes but is not limited to, transphobia, ableism, racism, homophobia, anti-semitism, sexism, xenophobia, classism, chauvinism, or any other form of attack that demeans a group or an individual. Any form of derogatory stereotype or slur falls under this regulation.",
              },
              {
                subtitle: "3.2 NSFW & Shock Content",
                text: "The posting/sharing of any Not Safe For Work content will not be tolerated. This includes but is not limited graphic violence, gore, sexually explicit content, harmful or illegal activities, exploitative content, bestiality, hate symbols, scatological content, and extreme body modifications. Such content is barred, regardless of its form of submission, i.e. links, images, descriptions, videos, audio, code, etc.",
              },
              {
                subtitle: "3.3 Harassment & Trolling",
                text: "The act of direct/indirect bullying, intimidation, or harassment will not be permitted. This involves the deliberate spread of off-topic, inflammatory statements with the purpose of provoking others into an emotional response, oftentimes disrupting on-topic discussion, either via public channels or DM's.",
              },
              {
                subtitle: "3.4 Argumentative Statements",
                text: "Please ensure to remain respective to others, even during disagreements. Acts of excessive hostility or insults will not be tolerated. It is encouraged to engage in healthy, proactive debate. Debates that become argumentative and disruptive should be dropped or taken to DMs.",
              },
              {
                subtitle: "3.5 General Disruptive Behaviour",
                text: "Please avoid any act of deliberate disruptive behaviour. If an act is not specified in the regulations, but it still holds a disruptive or derogatory intention, then it's best to keep it to yourself. Please ensure to refrain from derailing any ongoing discussions or debates between others.",
              },
              {
                subtitle: "3.6 Language Usage",
                text: "It is required that English is used throughout the server. If you wish to use another language, please direct your attention to a language-specific channel. If your specific language channel is unavailable, please open a Support ticket.",
              },
              {
                subtitle: "3.7 Dating",
                text: "Refrain from engaging in any form of digital intimacy, otherwise known as 'e-dating'. This includes but is not limited to sexual affirmations, roleplay, and scenarios.",
              },
            ]}
          />

          <MajorSection
            id="section4"
            title="Section 4 — Mentioning"
            groups={[
              {
                subtitle: "4.1 Relevant Mentions",
                text: "Please ensure to only mention others when it is relevant and requires their direct attention. Refrain from unnecessarily involving others in a situation that does not concern them.",
              },
              {
                subtitle: "4.2 Mention Spam",
                text: "Refrain from excessively or purposely spamming peers/roles in quick succession.",
              },
              {
                subtitle: "4.3 Status Respect",
                text: "Please ensure to respect the status of the person(s) you intend to ping. If they are on Do Not Disturb, they may prefer you not to ping them.",
              },
              {
                subtitle: "4.4 Restricted Role Mentions",
                text: "If you possess the permissions, the usage of @everyone and @here mentions, along with other, mass-possessed roles, should not be pinged without proper permission. If you have the ability to ping a role that you feel you shouldn't be able to ping, please inform the Administrative team immediately.",
              },
            ]}
          />

          <MajorSection
            id="section5"
            title="Section 5 — Discussion Topics"
            groups={[
              {
                subtitle: "5.1 Channel Relevance",
                text: "Ensure to keep discussions relevant to the designated purpose of each channel. For example, utilise subject channels for subject discussion, i.e. discuss Physics in the Physics channel and Biology in the Biology channel. For any miscellaneous or general discussion, utilise the General channels.",
              },
              {
                subtitle: "5.2 Academic Focus",
                text: "Given we're an A-Level Discord, it is preferred that the majority of discussions relate to A-Level progression. This regulation is lenient depending on the purpose of a channel. As always, discussions regarding study methods, subject content, exam preparation, university applications, syllabus info, and academic resources are encouraged.",
              },
              {
                subtitle: "5.3 Sensitive Topics",
                text: "In accordance with Reg. 3.1.-3.3., discussions on inappropriate or harmful topics are restricted.",
              },
              {
                subtitle: "5.4 Privacy",
                text: "The non-consensual sharing/posting of personal/private information about yourself or peers will not be permitted. Please refrain from intimidating or pressuring others to share their own details.",
              },
            ]}
          />

          <MajorSection
            id="section6"
            title="Section 6 — Advertisement"
            groups={[
              {
                subtitle: "6.1 General Advertising",
                text: "It is prohibited to post advertisements to services, social media channels, products, and companies without prior approval from a member of the Administrative team. This restriction includes any form of link, text, image, embedded content, descriptions, videos, etc. Server Boosters may advertise after discussing it with a member of the Administrative team.",
              },
              {
                subtitle: "6.2 Discord Invites",
                text: "Refrain from sharing invite links to other Discord servers via server channels or DM's. Please seek permission from a member of the Administrative team.",
              },
              {
                subtitle: "6.3 DM Advertising",
                text: "Sending advertisements or recruitment forms via DM's is prohibited. Members of the r/alevel community maintain the right to open a support ticket if they receive an advertisement via DM's.",
              },
              {
                subtitle: "6.4 Leniency",
                text: "It is permitted to share links to academic resources, educational videos, articles, tools, and websites, so long as it is relevant to ongoing discussion and is expressed as support rather than advertisement. Leniency should not be exploited to increase click traffic, especially if you are found to be affiliated with the advertisement.",
              },
            ]}
          />

          <MajorSection
            id="section7"
            title="Section 7 — Nicknames & Profile Pictures"
            groups={[
              {
                subtitle: "7.1 Appropriateness",
                text: "All nicknames and profile pictures should serve in accordance with Reg 3.1.- 3.3. to ensure user safety. Usernames and profile pictures that are discriminatory, sexually suggestive, depicting graphic violence/gore, or promote illegal activities, etc. are not permitted.",
              },
              {
                subtitle: "7.2 Impersonation",
                text: "Please refrain from utilising nicknames or profile pictures that intentionally attempt to copy/impersonate the identity or actions of another. Regardless of whether it is an attempt to non-consensually impersonate a peer, staff member, educator, Cambridge official, or public figure.",
              },
              {
                subtitle: "7.3 Readability & Mentionability",
                text: "Although this regulation remains lenient, it is preferred that nicknames remain readable and mentionable by peers. This involves limiting the usage of special characters, symbols, emojis, and hidden text.",
              },
              {
                subtitle: "7.4 Advertisement",
                text: "In accordance with Section 6, advertisement through nicknames and profile pictures too is prohibited. This includes the inclusion of nicknames, logos, etc. in nicknames and profile pictures.",
              },
              {
                subtitle: "7.5 Nickname Changing",
                text: "If your nickname is changed to a set of hashtags or a statement suggesting you to change your username, please ask an available Moderator to change your nickname to whatever you request. Non-compliance will result in your removal.",
              },
            ]}
          />

          <MajorSection
            id="section8"
            title="Section 8 — Regulation Bypass"
            groups={[
              {
                subtitle: "8.1 Filter Evasion",
                text: "Filtered and blocked terms/phrases are automatically restricted for a reason. Please refrain from attempting to bypass the filter by any form, including but not limited to, misspelling the term/phrase, sending an image of the blocked term, or using TeXit. If there is a discrepancy in the filtering system where a permitted term/phrase is being blocked, you may bypass the filter. Please ensure to inform a member of the Administrative team about the bug.",
              },
              {
                subtitle: "8.2 Technical Bypass",
                text: "Please refrain from exploiting system errors/vulnerabilities. This includes but is not limited to exploiting bot issues, channel/role permissions, or utilising external tools to circumvent systems. If you see a bug within the system, we'd appreciate you coming forward and informing us.",
              },
              {
                subtitle: "8.3 Bypass Encouragement",
                text: "Refrain from assisting, teaching, or encouraging peers to bypass regulations or system vulnerabilities, whether it be technical vulnerabilities or faulty filter systems.",
              },
              {
                subtitle: "8.4 Malicious Compliance",
                text: "Utilising perception and loopholes within the regulations is prohibited and is a violation of the purpose and moral intention of these regulations. Arguing semantics, definition, relevance, etc. to justify inappropriate or disruptive conduct will not be tolerated. Moderators maintain the final say when determining repercussions and acts of inappropriacy.",
              },
            ]}
          />

          <MajorSection
            id="section9"
            title="Section 9 — Spam"
            groups={[
              {
                subtitle: "9.1 Message Spam",
                text: "It is vital that no one engages in, or encourages message flooding in rapid succession, particularly if they present irrelevant or meaningless content. Excessively long texts, rapid small text, identical messages, images, and emojis, are all examples of text spam that disrupt readability.",
              },
              {
                subtitle: "9.2 Command Spam",
                text: "Commands are to be utilised for effective and reasonable usage. Continuous and excessive spamming of commands are considered a disruptive and a nuisance.",
              },
              {
                subtitle: "9.3 Media Spam",
                text: "Please be mindful when sending images, gifs, and all other forms of media. Whilst ensuring they abide by regulations, also ensure they are not repeatedly and excessively re-sent with the intention of disruptive conversation.",
              },
            ]}
          />
        </div>
      </div>
    </main>
  );
}

/* -------------------------------
   REUSABLE COMPONENTS
--------------------------------*/

function Section({
  id,
  title,
  items,
}: {
  id: string;
  title: string;
  items: React.ReactNode[];
}) {
  return (
    <section
      id={id}
      className="mt-12 p-6 rounded-xl bg-gradient-to-br from-blue-50/50 to-white border border-blue-100 shadow-sm"
    >
      <h2 className="text-2xl font-semibold text-blue-900">{title}</h2>

      <ul className="mt-3 space-y-2 pl-1">
        {items.map((item, i) => (
          <li className="flex items-start gap-3" key={i}>
            <span className="shrink-0 mt-[0.45rem] h-2 w-2 bg-blue-500 rounded-full"></span>
            <span className="leading-relaxed text-gray-700">{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
function MajorSection({
  id,
  title,
  groups,
}: {
  id: string;
  title: string;
  groups: { subtitle: string; text: string }[];
}) {
  return (
    <section id={id} className="mt-16">
      <h2 className="text-3xl font-bold text-gray-900 mb-6 border-l-4 border-blue-500 pl-3">
        {title}
      </h2>

      <div className="grid gap-6">
        {groups.map((g, i) => (
          <div
            key={i}
            className="p-5 rounded-lg bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
          >
            <h3 className="font-semibold text-gray-900 text-lg mb-1">
              {g.subtitle}
            </h3>
            <p className="text-gray-700 leading-relaxed">{g.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
