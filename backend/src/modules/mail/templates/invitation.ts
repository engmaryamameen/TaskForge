interface InvitationTemplateData {
  recipientName?: string;
  organizationName: string;
  inviterName?: string;
  role: string;
  inviteUrl: string;
}

export function invitationTemplate(data: InvitationTemplateData): { html: string; text: string } {
  const greeting = data.recipientName ? `Hi ${data.recipientName},` : 'Hi there,';
  const inviter = data.inviterName ? `${data.inviterName} has` : 'You have been';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f7f8f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f7f8f9;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background-color:#0C66E4;padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.3px;">TaskForge</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <p style="margin:0 0 16px;color:#172B4D;font-size:15px;line-height:1.6;">${greeting}</p>
              <p style="margin:0 0 24px;color:#172B4D;font-size:15px;line-height:1.6;">
                ${inviter} invited you to join <strong>${data.organizationName}</strong> as a <strong>${data.role}</strong>.
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:8px 0 24px;">
                    <a href="${data.inviteUrl}" style="display:inline-block;background-color:#0C66E4;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:12px 32px;border-radius:8px;">
                      Accept Invitation
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 8px;color:#626F86;font-size:13px;line-height:1.5;">
                Or copy this link into your browser:
              </p>
              <p style="margin:0 0 24px;color:#0C66E4;font-size:13px;line-height:1.5;word-break:break-all;">
                ${data.inviteUrl}
              </p>
              <p style="margin:0;color:#8993A5;font-size:12px;line-height:1.5;">
                This invitation expires in 24 hours. If you didn't expect this email, you can safely ignore it.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;border-top:1px solid #DCDFE4;text-align:center;">
              <p style="margin:0;color:#8993A5;font-size:12px;">
                Sent by TaskForge &mdash; Multi-tenant project management
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = `${greeting}

${inviter} invited you to join ${data.organizationName} as a ${data.role}.

Accept the invitation: ${data.inviteUrl}

This invitation expires in 24 hours.

— TaskForge`;

  return { html, text };
}
