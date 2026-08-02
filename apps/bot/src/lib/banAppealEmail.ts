export function banAppealDecisionEmailHtml({
  name,
  approved,
  inviteUrl,
}: {
  name?: string | null;
  approved: boolean;
  inviteUrl?: string;
}) {
  const websiteUrl = "https://ralevel.com";
  const logoUrl = "https://ralevel.com/ralevel_logo_png_white.png";

  const title = approved ? "Ban Appeal Approved" : "Ban Appeal Rejected";
  const body = approved
    ? `Your ban appeal for the r/alevel Discord server has been approved.${
        inviteUrl
          ? ` You can rejoin the server using this invite link: <a href="${inviteUrl}" style="color:#0f172a;font-weight:600;">${inviteUrl}</a>`
          : ""
      }`
    : "Your ban appeal for the r/alevel Discord server has been rejected.";

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
              <td style="font-size:22px;font-weight:700;color:#0f172a;padding-bottom:16px;">
                ${title}
              </td>
            </tr>
            <tr>
              <td style="font-size:15px;color:#334155;padding-bottom:16px;">
                Hi ${name || "there"},
              </td>
            </tr>
            <tr>
              <td style="font-size:15px;color:#334155;padding-bottom:12px;">
                ${body}
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
                This is an automated decision email from r/alevel.
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
