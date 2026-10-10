/* ==========================================================================
   QUOTE FOLLOW-UP EMAIL
   Netlify runs this automatically after every verified form submission
   (the file name "submission-created" is what hooks it to that event;
   spam caught by the honeypot never reaches it). For the "quote" form it
   emails the visitor a thank-you with a link to the welcome package,
   sent through Brevo's transactional email API.

   Needs two environment variables in Netlify
   (Site configuration → Environment variables):
     BREVO_API_KEY       Brevo → SMTP & API → API keys
     BREVO_SENDER_EMAIL  a sender verified in Brevo, e.g. miguelle@migsflow.com
   Optional:
     BREVO_SENDER_NAME   defaults to "Miguelle at MigsFlow"
   ========================================================================== */

const SITE_URL = 'https://migsflow.com';
const PACKAGE_URL = `${SITE_URL}/downloads/migsflow-welcome-package.pdf`;

export const handler = async (event) => {
  const { payload } = JSON.parse(event.body || '{}');
  if (!payload || payload.form_name !== 'quote') return { statusCode: 200, body: 'Not the quote form' };

  const data = payload.data || {};
  const email = (data.email || '').trim();
  if (!email) return { statusCode: 200, body: 'No email address' };

  const { BREVO_API_KEY, BREVO_SENDER_EMAIL, BREVO_SENDER_NAME = 'Miguelle at MigsFlow' } = process.env;
  if (!BREVO_API_KEY || !BREVO_SENDER_EMAIL) {
    console.error('Missing BREVO_API_KEY or BREVO_SENDER_EMAIL');
    return { statusCode: 500, body: 'Email not configured' };
  }

  const firstName = (data.name || '').trim().split(/\s+/)[0] || 'there';
  const business = (data.businessName || '').trim();

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': BREVO_API_KEY, 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({
      sender: { name: BREVO_SENDER_NAME, email: BREVO_SENDER_EMAIL },
      to: [{ email, name: (data.name || '').trim() || undefined }],
      replyTo: { email: BREVO_SENDER_EMAIL, name: BREVO_SENDER_NAME },
      subject: `Thanks for reaching out, ${firstName}! Here's your MigsFlow welcome package`,
      htmlContent: html({ firstName, business }),
      textContent: text({ firstName, business }),
      tags: ['quote-follow-up'],
    }),
  });

  if (!response.ok) {
    console.error('Brevo error', response.status, await response.text());
    return { statusCode: 502, body: 'Email failed' };
  }
  return { statusCode: 200, body: 'Welcome email sent' };
};

/* ---------- Email content ---------- */

const escape = (value) =>
  String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function text({ firstName, business }) {
  return `Hi ${firstName},

Thank you for submitting your quote request${business ? ` for ${business}` : ''}! I review every submission personally, and I'll get back to you within the next 24–48 hours.

In the meantime, here's my welcome package. It's a quick 5-minute read covering who I am, services & pricing, how the process works, recent projects and common questions:
${PACKAGE_URL}

If anything comes to mind before then, just reply to this email.

Talk soon,
Miguelle
MigsFlow Web Design
${SITE_URL}`;
}

/* Table-based with inline styles so it holds up in Gmail, Outlook and
   Apple Mail. Dark, on-brand, with the download as the one big button. */
function html({ firstName, business }) {
  const name = escape(firstName);
  const forBusiness = business ? ` for <strong style="color:#ffffff;">${escape(business)}</strong>` : '';
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="dark light">
  <title>Your MigsFlow welcome package</title>
</head>
<body style="margin:0;padding:0;background-color:#05070f;">
  <div style="display:none;max-height:0;overflow:hidden;">I'll get back to you within 24–48 hours. Here's my welcome package in the meantime.</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#05070f;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#0b0f1c;border:1px solid #1c2a4a;border-radius:18px;">
          <tr>
            <td style="padding:32px 32px 8px;font-family:Arial,Helvetica,sans-serif;">
              <p style="margin:0;font-size:22px;color:#ffffff;letter-spacing:0.5px;"><span style="font-family:Georgia,'Times New Roman',serif;font-style:italic;">migs</span> <strong>flow</strong></p>
              <p style="margin:2px 0 0;font-size:10px;letter-spacing:2px;color:#8a93a8;">WEB DESIGN</p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px 0;font-family:Arial,Helvetica,sans-serif;color:#c9cfdc;font-size:16px;line-height:1.65;">
              <h1 style="margin:0 0 16px;font-size:24px;line-height:1.3;color:#ffffff;">Thanks for reaching out, ${name}!</h1>
              <p style="margin:0 0 16px;">Thank you for submitting your quote request${forBusiness}. I review every submission personally, and I'll get back to you within the next <strong style="color:#18c9ff;">24–48 hours</strong>.</p>
              <p style="margin:0 0 24px;">In the meantime, here's my welcome package. It's a quick 5-minute read covering who I am, services &amp; pricing, how the process works, recent projects and common questions.</p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:0 32px 28px;">
              <a href="${PACKAGE_URL}" style="display:inline-block;padding:14px 28px;border-radius:999px;background-color:#0b6bff;background-image:linear-gradient(90deg,#18c9ff,#0b3cff);color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:bold;text-decoration:none;">Download the Welcome Package</a>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 32px;font-family:Arial,Helvetica,sans-serif;color:#c9cfdc;font-size:16px;line-height:1.65;">
              <p style="margin:0 0 24px;">If anything comes to mind before then, just reply to this email.</p>
              <p style="margin:0;">Talk soon,<br><strong style="color:#ffffff;">Miguelle</strong><br><span style="color:#8a93a8;font-size:14px;">MigsFlow Web Design</span></p>
            </td>
          </tr>
          <tr>
            <td style="padding:18px 32px;border-top:1px solid #1c2a4a;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#8a93a8;">
              <a href="${SITE_URL}" style="color:#18c9ff;text-decoration:none;">migsflow.com</a> &nbsp;·&nbsp; You're receiving this because you requested a quote on migsflow.com.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
