export function confirmationEmail({
  name,
  formTitle,
}: {
  name?: string;
  formTitle: string;
}) {
  const websiteUrl = "https://ralevel.com";
  const logoUrl = "https://ralevel.com/ralevel_logo_png_white.png";

  return `
  <div style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
      <tr>
        <td align="center">

          <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;border:1px solid #e2e8f0;padding:32px;">
            
            <!-- Logo -->
            <tr>
              <td align="center" style="padding-bottom:24px;">
                <img src="${logoUrl}" alt="r/alevel" width="140" style="display:block;" />
              </td>
            </tr>

            <!-- Title -->
            <tr>
              <td style="font-size:22px;font-weight:700;color:#0f172a;padding-bottom:16px;">
                Application Received ✅
              </td>
            </tr>

            <!-- Greeting -->
            <tr>
              <td style="font-size:15px;color:#334155;padding-bottom:16px;">
                Hi ${name || "there"},
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="font-size:15px;color:#334155;padding-bottom:12px;">
                Thank you for submitting your application for:
              </td>
            </tr>

            <!-- Highlight Box -->
            <tr>
              <td style="padding:12px 16px;background:#f1f5f9;border-radius:8px;font-weight:600;color:#0f172a;margin-bottom:16px;">
                ${formTitle}
              </td>
            </tr>

            <tr>
              <td style="font-size:14px;color:#475569;padding-top:16px;">
                Our team will review your submission carefully and get back to you soon.
              </td>
            </tr>

            <!-- Divider -->
            <tr>
              <td style="padding:24px 0;">
                <hr style="border:none;border-top:1px solid #e2e8f0;">
              </td>
            </tr>

            <!-- CTA -->
            <tr>
              <td align="center" style="padding-bottom:20px;">
                <a href="${websiteUrl}" 
                   style="display:inline-block;padding:12px 20px;background:#0f172a;color:#ffffff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;">
                   Visit r/alevel
                </a>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="font-size:12px;color:#94a3b8;text-align:center;">
                This is an automated confirmation email.  
                If you did not submit this form, please ignore this message.
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
