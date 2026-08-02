export type DecisionStatus = "accepted" | "rejected";

export type DecisionEmailTemplate = {
  subject: string;
  body: string;
};

export type DecisionEmailTemplates = {
  accepted: DecisionEmailTemplate;
  rejected: DecisionEmailTemplate;
};

export type DecisionEmailVars = {
  name?: string | null;
  email?: string | null;
  formTitle?: string | null;
  formType?: string | null;
  cycle?: string | number | null;
};

export const DECISION_EMAIL_VARIABLES = [
  "{name}",
  "{email}",
  "{formTitle}",
  "{formType}",
  "{cycle}",
] as const;

export const DEFAULT_DECISION_EMAILS: DecisionEmailTemplates = {
  accepted: {
    subject: "You're in — {formTitle}",
    body: `Hi {name},

Great news — we've accepted your application for {formTitle}.

We're excited to have you join the team. Someone from our side will follow up shortly with next steps.

Welcome aboard!

— The r/alevel team`,
  },
  rejected: {
    subject: "Update on your {formTitle} application",
    body: `Hi {name},

Thank you for applying for {formTitle} and for the time you put into your application.

After careful review, we won't be moving forward with your application this cycle. This was a competitive round, and the decision isn't a reflection of your potential.

We encourage you to apply again in a future cycle if the opportunity is still of interest.

Thank you again for your interest in r/alevel.

— The r/alevel team`,
  },
};

export function stripIntakeSuffix(title: string): string {
  return title.replace(/\s+Intake\s+\d+$/i, "").trim();
}

export function resolveDecisionEmailTemplates(
  stored?: Partial<DecisionEmailTemplates> | null,
): DecisionEmailTemplates {
  return {
    accepted: {
      subject:
        stored?.accepted?.subject?.trim() ||
        DEFAULT_DECISION_EMAILS.accepted.subject,
      body:
        stored?.accepted?.body?.trim() || DEFAULT_DECISION_EMAILS.accepted.body,
    },
    rejected: {
      subject:
        stored?.rejected?.subject?.trim() ||
        DEFAULT_DECISION_EMAILS.rejected.subject,
      body:
        stored?.rejected?.body?.trim() || DEFAULT_DECISION_EMAILS.rejected.body,
    },
  };
}

export function substituteDecisionVars(
  template: string,
  vars: DecisionEmailVars,
): string {
  return template
    .replaceAll("{name}", vars.name?.trim() || "there")
    .replaceAll("{email}", vars.email?.trim() || "")
    .replaceAll("{formTitle}", vars.formTitle?.trim() || "your application")
    .replaceAll("{formType}", vars.formType?.trim() || "")
    .replaceAll(
      "{cycle}",
      vars.cycle === null || vars.cycle === undefined
        ? ""
        : String(vars.cycle),
    );
}

export function escapeHtml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function plainTextToHtml(text: string): string {
  const escaped = escapeHtml(text);
  const paragraphs = escaped
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map(
      (block) =>
        `<p style="margin:0 0 14px 0;font-size:15px;line-height:1.6;color:#334155;">${block.replaceAll("\n", "<br/>")}</p>`,
    );

  return paragraphs.join("") || `<p style="margin:0;font-size:15px;line-height:1.6;color:#334155;"></p>`;
}

export function decisionEmailHtml({
  decision,
  body,
}: {
  decision: DecisionStatus;
  body: string;
}): string {
  const websiteUrl = "https://ralevel.com";
  const logoUrl = "https://ralevel.com/ralevel_logo_png_white.png";
  const title =
    decision === "accepted" ? "Application Accepted" : "Application Update";
  const titleColor = decision === "accepted" ? "#047857" : "#0f172a";
  const footerNote =
    decision === "accepted"
      ? "This is an automated decision email from r/alevel."
      : "This is an automated decision email from r/alevel. If you have questions, reply is not monitored — please reach out through our usual channels.";
  const bodyHtml = plainTextToHtml(body);

  return `
  <div style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;border:1px solid #e2e8f0;padding:32px;">
            <tr>
              <td align="center" style="padding-bottom:24px;">
                <img src="${logoUrl}" alt="r/alevel" width="140" style="display:block;" />
              </td>
            </tr>
            <tr>
              <td style="font-size:22px;font-weight:700;color:${titleColor};padding-bottom:16px;">
                ${title}
              </td>
            </tr>
            <tr>
              <td>
                ${bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:24px 0;">
                <hr style="border:none;border-top:1px solid #e2e8f0;">
              </td>
            </tr>
            <tr>
              <td align="center" style="padding-bottom:20px;">
                <a href="${websiteUrl}"
                   style="display:inline-block;padding:12px 20px;background:#0f172a;color:#ffffff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;">
                   Visit r/alevel
                </a>
              </td>
            </tr>
            <tr>
              <td style="font-size:12px;color:#94a3b8;text-align:center;">
                ${footerNote}
                <br/><br/>
                © ${new Date().getFullYear()} r/alevel
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>
  `;
}
