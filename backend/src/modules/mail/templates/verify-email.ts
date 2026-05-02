export function verifyEmailTemplate(data: {
  firstName: string;
  verifyUrl: string;
}): { html: string; text: string } {
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background-color:#f7f8f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" style="max-width:560px;background:#fff;border-radius:12px;padding:40px;">
        <tr><td style="background:#0C66E4;padding:24px;text-align:center;border-radius:12px 12px 0 0;">
          <strong style="color:#fff;font-size:20px;">TaskForge</strong>
        </td></tr>
        <tr><td style="padding:32px;">
          <p style="color:#172B4D;font-size:15px;line-height:1.6;margin:0 0 16px;">Hi ${data.firstName},</p>
          <p style="color:#172B4D;font-size:15px;line-height:1.6;margin:0 0 24px;">Verify your email to activate your workspace.</p>
          <a href="${data.verifyUrl}" style="display:inline-block;background:#0C66E4;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">Verify email</a>
          <p style="color:#626F86;font-size:13px;margin-top:24px;">This link expires in 24 hours.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
  const text = `Hi ${data.firstName},\n\nVerify your email: ${data.verifyUrl}\n\nThis link expires in 24 hours.`;
  return { html, text };
}
