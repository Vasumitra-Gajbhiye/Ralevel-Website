export const APPLICATION_BOT_PRIVACY_MARKDOWN = `This Privacy Policy explains how the **r/alevel Application Bot** (“the Bot”) collects, uses, and protects personal information. The Bot is a Discord service that notifies staff about website form applications and moderation appeals. It is operated by the r/alevel team.

## 1. About the Bot

The Application Bot posts staff application submissions and ban, warning, or timeout appeal submissions to Discord for review. It may send reminder pings to staff, process approve/reject actions, and send direct messages to applicants about status updates. It does not provide general community features such as XP, reputation, or confessions.

## 2. Information we collect

We process only the information needed to run applications and appeals:

- **Staff applications:** submitter name, email, form answers, and related review metadata (for example staff votes and reminder timestamps).
- **Moderation appeals:** Discord user ID, username, avatar, appeal type, free-text answers, review status, and reviewer Discord identifiers.
- **Staff contact data:** Discord user or role IDs used to notify people responsible for reviewing submissions.
- **Discord message metadata:** message IDs and channel references needed to update review posts.

## 3. How we use your data

- Notify staff of new applications and appeals in Discord.
- Support review workflows (reminders, approve/reject actions).
- Send status DMs to applicants when their submission is received or decided.
- Maintain records needed for moderation and staffing decisions.

## 4. Data storage and security

Application and appeal data is stored in our MongoDB database (shared with the r/alevel website). Review content may also appear in Discord channels and direct messages. We use standard security practices, but no online system is entirely risk-free.

## 5. Third-party services

The Bot relies on third-party platforms that have their own privacy policies:

- **Discord** — delivery of embeds, buttons, pings, and DMs
- **MongoDB Atlas** — database hosting for submissions and related records

## 6. Access and sharing

Submission details are visible to authorized r/alevel staff who review applications and appeals in Discord. We do not sell personal data. Information may be shared only as needed to operate the Bot, comply with law, or protect the community.

## 7. Your rights

You may request access, correction, or deletion of personal data related to applications or appeals by contacting us. We may need to verify your identity and may retain limited records where required for moderation or legal reasons.

## 8. Children's privacy

The Bot is intended for users who meet Discord's age requirements (generally 13+). We do not knowingly collect personal data from children under 13. If you believe we have such data, contact us to request removal.

## 9. Changes to this policy

We may update this Privacy Policy from time to time. The “Last updated” date above will reflect changes. Continued use of the Bot after updates means you acknowledge the revised policy.

## 10. Contact

For privacy requests or questions about the Application Bot, contact the r/alevel team:

- Email: [r.alevelserver@gmail.com](mailto:r.alevelserver@gmail.com)
- Discord: link available on our official website and server.

This Privacy Policy is for informational purposes and does not create legal rights beyond what is described here. See also our [website Privacy Policy](/legal/privacy-policy).
`;

export const APPLICATION_BOT_TOS_MARKDOWN = `These Terms of Service govern your use of the **r/alevel Application Bot** (“the Bot”). By submitting applications or appeals that are processed by the Bot, or by interacting with its Discord messages and controls, you agree to these Terms.

## 1. Introduction

These Terms apply specifically to the Application Bot. They work alongside our [website Terms of Service](/legal/terms-of-service), Discord's Terms of Service, and the r/alevel community rules. If you do not agree, do not use the Bot or submit forms processed by it.

## 2. About the Bot

The Application Bot is an internal Discord service used by r/alevel to:

- Notify staff when someone submits a staff application via the website
- Post and manage ban, warning, and timeout appeal reviews
- Send reminders and direct-message status updates related to those workflows

r/alevel is an independent educational community and is not affiliated with Cambridge International, Pearson Edexcel, or any official examination board.

## 3. Eligibility

- You must meet Discord's age requirements (generally 13+) and any applicable local laws.
- You must provide accurate information in applications and appeals.
- You must comply with Discord's Terms of Service and r/alevel community rules.

## 4. Acceptable Use

When using the Bot or related forms, you agree not to:

- Submit false, misleading, or abusive applications or appeals.
- Spam forms, review channels, or reminder workflows.
- Attempt to hack, overload, or interfere with the Bot or its connected systems.
- Impersonate other users, staff, or applicants.
- Use the Bot for any unlawful purpose.

We may reject submissions, ignore abusive requests, or restrict access when these rules are violated.

## 5. Applications and appeals

Submitting an application or appeal does not guarantee approval, a response within a particular timeframe, or any specific outcome. Staff decisions are discretionary and based on community needs, evidence, and moderation judgment. The Bot is a notification and review tool; it does not independently decide applications or appeals.

## 6. Disclaimer

The Bot is provided “as is” and “as available.” Service may be interrupted, delayed, or changed without notice. We do not guarantee that notifications, reminders, or DMs will always be delivered successfully.

## 7. Third-party services

The Bot depends on Discord and our database providers. r/alevel is not responsible for third-party outages, content, or policies. Please review Discord's own terms and privacy statements.

## 8. Termination

We may stop processing your submissions, revoke related Discord access, or discontinue the Bot at any time for misuse, policy violations, or operational reasons.

## 9. Limitation of liability

To the fullest extent allowed by law, r/alevel and its administrators are not liable for any indirect or consequential damages arising from use of the Bot, including missed notifications or application/appeal outcomes.

## 10. Modifications

We may update these Terms to reflect changes in how the Bot works. Updates are indicated by the “Last updated” date above. Continued use after changes means you accept the revised Terms.

## 11. Contact

For questions about these Terms, contact: [r.alevelserver@gmail.com](mailto:r.alevelserver@gmail.com) or via our official Discord server (linked on the website).
`;

export const RALEVEL_BOT_PRIVACY_MARKDOWN = `This Privacy Policy explains how the **r/alevel Bot** (“the Bot”) collects, uses, and protects personal information in the r/alevel Discord server. The Bot provides moderation, engagement, and community tools operated by the r/alevel team.

## 1. About the Bot

The r/alevel Bot is the community Discord bot used for moderation, XP and ranks, reputation, certificates, confessions, polls, sticky messages, staff tasks, welcome messages, and related server tools. Some features may also be managed through an authorized staff dashboard.

## 2. Information we collect

Depending on which features you use, we may process:

- **Discord identifiers:** user IDs, usernames or tags (as available at the time), guild, channel, and message IDs.
- **Activity & engagement:** message counts, XP, levels or rank roles, reputation totals, and related leaderboard data.
- **Moderation records:** warnings, notes, kicks/bans/timeouts metadata, reasons, moderator IDs, and mod logs.
- **Certificates:** Discord identity, certificate type/status, and — when you submit them — legal full name and email for delivery.
- **Confessions:** confession text, optional attachments, and the author's Discord ID (kept for staff review; not shown publicly as the author).
- **Polls:** poll content and vote choices linked to Discord user IDs.
- **Tasks, stickies, and helpers:** staff-created content, assignees, submission links, and related audit metadata.
- **Message content (limited):** the Bot may read messages in real time for features such as reputation detection or moderation. Ordinary chat content is generally not stored long-term as full message history for XP; XP systems primarily store counts and related stats.

## 3. How we use your data

- Operate moderation and safety tools in the Discord server.
- Power engagement systems such as XP, ranks, reputation, polls, and tasks.
- Process certificate applications and deliver certificates when approved.
- Review and publish confessions while keeping author identity private from the public channel.
- Maintain sticky messages, welcome messages, and other server utilities.
- Allow authorized staff to manage configuration and records via Discord and/or the staff dashboard.

## 4. Data storage and security

Durable bot data is stored in MongoDB. Short-lived activity data (for example pending XP counters) may be held in Redis. Some information also exists in Discord itself (messages, roles, DMs). We use standard security measures, though no online system is entirely risk-free. Certificate legal name and email are treated as sensitive and are intended for authorized staff workflows only.

## 5. Third-party services

The Bot relies on third-party platforms with their own privacy policies:

- **Discord** — hosting the server, commands, messages, and DMs
- **MongoDB Atlas** — primary database hosting
- **Redis** — short-term caching and counters
- **Clerk** — authentication for the staff dashboard (authorized operators only)
- External appeal or form providers, if linked from the server for specific workflows

## 6. Access and sharing

Public-facing bot features may display limited information (for example XP or reputation leaderboards). Moderators and authorized staff can access moderation records, confession authorship, certificate details, and dashboard data as needed to run the community. We do not sell personal data.

## 7. Your rights

You may request access, correction, or deletion of personal data processed by the Bot by contacting us. We may need to verify your Discord identity. Some records (for example moderation history) may be retained where necessary for community safety or legal reasons. Leaving the server does not automatically erase all stored records.

## 8. Children's privacy

The Bot is intended for users who meet Discord's age requirements (generally 13+). We do not knowingly collect personal data from children under 13. If you believe we have such data, contact us to request removal.

## 9. Changes to this policy

We may update this Privacy Policy from time to time. The “Last updated” date above will reflect changes. Continued use of the Bot after updates means you acknowledge the revised policy.

## 10. Contact

For privacy requests or questions about the r/alevel Bot, contact the r/alevel team:

- Email: [r.alevelserver@gmail.com](mailto:r.alevelserver@gmail.com)
- Discord: link available on our official website and server.

This Privacy Policy is for informational purposes and does not create legal rights beyond what is described here. See also our [website Privacy Policy](/legal/privacy-policy).
`;

export const RALEVEL_BOT_TOS_MARKDOWN = `These Terms of Service govern your use of the **r/alevel Bot** (“the Bot”) in the r/alevel Discord server. By using the Bot's commands, buttons, or related features, you agree to these Terms.

## 1. Introduction

These Terms apply specifically to the r/alevel Bot. They work alongside our [website Terms of Service](/legal/terms-of-service), [Discord Regulations](/legal/discord-regulations), Discord's Terms of Service, and the server rules. If you do not agree, do not use the Bot.

## 2. About the Bot

The Bot provides community tools in the r/alevel Discord server, including moderation commands, XP and ranks, reputation, certificates, confessions, polls, sticky messages, staff tasks, welcome messages, and related utilities. r/alevel is an independent educational community and is not affiliated with Cambridge International, Pearson Edexcel, or any official examination board.

## 3. Eligibility

- You must meet Discord's age requirements (generally 13+) and any applicable local laws.
- You must be a member of the r/alevel Discord server (or otherwise authorized) to use server features.
- You must comply with Discord's Terms of Service and r/alevel community rules.

## 4. Acceptable Use

When using the Bot, you agree not to:

- Abuse commands, spam interactions, or attempt to bypass cooldowns, role gates, or bans (including XP or reputation bans).
- Exploit XP, reputation, polls, tasks, or other systems for unfair advantage.
- Submit false certificate information or misuse certificate workflows.
- Use confessions or other channels to harass, dox, or break server rules while expecting anonymity to shield misconduct.
- Attempt to hack, overload, scrape, or interfere with the Bot or its connected systems.
- Impersonate users, moderators, or administrators.

Staff may restrict Bot access, reverse abusive gains, remove content, or take moderation action for violations.

## 5. Feature-specific rules

- **Confessions:** Public posts are anonymous to members, but staff may access author identity for safety and enforcement. Do not treat anonymity as permission to break rules.
- **Certificates:** Legal name and email you submit must be accurate. Providing false details may result in rejection or removal of certificate privileges.
- **Moderation:** Bot actions support staff decisions. Using the Bot does not create a right to any particular outcome in warnings, bans, appeals, or similar processes.
- **Engagement systems:** XP, ranks, reputation, and similar rewards may be adjusted, reset, or disabled at staff discretion.

## 6. Disclaimer

The Bot is provided “as is” and “as available.” Features may be unavailable, delayed, changed, or discontinued without notice. We do not guarantee uninterrupted uptime, perfect accuracy of XP/reputation counts, or delivery of DMs and automated messages.

## 7. Third-party services

The Bot depends on Discord and infrastructure providers such as database and cache hosts. r/alevel is not responsible for third-party outages, content, or policies. Please review Discord's own terms and privacy statements.

## 8. Termination

We may suspend or terminate your ability to use Bot features for violations of these Terms, Discord's rules, or community regulations. We may also discontinue the Bot or individual features at any time.

## 9. Limitation of liability

To the fullest extent allowed by law, r/alevel and its administrators are not liable for any indirect or consequential damages arising from use of the Bot, including loss of XP, reputation, certificates, confessions, or other virtual progress.

## 10. Modifications

We may update these Terms to reflect changes in how the Bot works. Updates are indicated by the “Last updated” date above. Continued use after changes means you accept the revised Terms.

## 11. Contact

For questions about these Terms, contact: [r.alevelserver@gmail.com](mailto:r.alevelserver@gmail.com) or via our official Discord server (linked on the website).
`;
