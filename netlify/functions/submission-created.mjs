/* ==========================================================================
   FORM FOLLOW-UP EMAILS
   Netlify runs this automatically after every verified form submission
   (the file name "submission-created" is what hooks it to that event;
   spam caught by the honeypot never reaches it). Each form listed in
   EMAILS gets its own thank-you email with a packet to download, sent
   through Brevo's transactional email API. Other forms (e.g. "contact")
   are ignored.

     quote     → html/quote.html     → welcome package
     redesign  → html/redesign.html  → $80 homepage redesign packet

   Needs two environment variables in Netlify
   (Site configuration → Environment variables):
     BREVO_API_KEY       Brevo → SMTP & API → API keys
     BREVO_SENDER_EMAIL  a sender verified in Brevo, e.g. miguelle@migsflow.com
   Optional:
     BREVO_SENDER_NAME   defaults to "Miguelle at MigsFlow"
   ========================================================================== */

const SITE_URL = 'https://migsflow.com';

/* What each form's email says. {business} reads "for <business name>" when
   one was given. Paragraphs are plain text; the layout is shared below. */
const EMAILS = {
  quote: {
    tag: 'quote-follow-up',
    subject: (firstName) => `Thanks for reaching out, ${firstName}! Here's your MigsFlow welcome package`,
    preheader: "I'll get back to you within 24–48 hours. Here's my welcome package in the meantime.",
    heading: (firstName) => `Thanks for reaching out, ${firstName}!`,
    intro: "Thank you for submitting your quote request{business}. I review every submission personally, and I'll get back to you within the next **24–48 hours**.",
    body: "In the meantime, here's my welcome package. It's a quick 5-minute read covering who I am, services & pricing, how the process works, recent projects and common questions.",
    button: 'Download the Welcome Package',
    link: `${SITE_URL}/downloads/migsflow-welcome-package.pdf`,
    reason: 'You requested a quote on migsflow.com.',
  },
  redesign: {
    tag: 'redesign-application',
    subject: (firstName) => `Got your redesign application, ${firstName}! Here's how it works`,
    preheader: "If we're a good fit, I'll be in touch within 24–48 hours. Here's how the redesign works.",
    heading: (firstName) => `Thanks for applying, ${firstName}!`,
    intro: "Thank you for applying for a homepage redesign{business}. I review every application personally, and if we're a good fit, I'll be in touch within the next **24–48 hours** with next steps.",
    body: "In the meantime, the redesign packet walks you through how it works: what's included, what happens after you apply, and how your $80 is credited toward your website if you decide to move forward.",
    button: 'Read the Redesign Packet',
    link: `${SITE_URL}/downloads/migsflow-homepage-redesign-packet.pdf`,
    reason: 'You applied for a homepage redesign on migsflow.com.',
  },
};

export const handler = async (event) => {
  const { payload } = JSON.parse(event.body || '{}');
  const config = payload && EMAILS[payload.form_name];
  if (!config) return { statusCode: 200, body: 'No follow-up email for this form' };

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
      subject: config.subject(firstName),
      htmlContent: html(config, { firstName, business }),
      textContent: text(config, { firstName, business }),
      tags: [config.tag],
    }),
  });

  if (!response.ok) {
    console.error('Brevo error', response.status, await response.text());
    return { statusCode: 502, body: 'Email failed' };
  }
  return { statusCode: 200, body: `${payload.form_name} email sent` };
};

/* ---------- Email content ---------- */

const escape = (value) =>
  String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Plain-text version: "{business}" filled in, **bold** markers dropped
const plain = (line, business) => line.replace('{business}', business ? ` for ${business}` : '').replace(/\*\*/g, '');

// HTML version: escaped, business in white, **bold** in the accent blue
const rich = (line, business) =>
  escape(line)
    .replace('{business}', business ? ` for <strong style="color:#ffffff;">${escape(business)}</strong>` : '')
    .replace(/\*\*(.+?)\*\*/g, '<strong style="color:#18c9ff;">$1</strong>');

function text(config, { firstName, business }) {
  return `Hi ${firstName},

${plain(config.intro, business)}

${config.body}
${config.link}

If anything comes to mind before then, just reply to this email.

Talk soon,
Miguelle
MigsFlow Web Design
${SITE_URL}`;
}

/* Table-based with inline styles so it holds up in Gmail, Outlook and
   Apple Mail. Dark, on-brand, with the download as the one big button. */
function html(config, { firstName, business }) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="dark light">
  <title>${escape(config.button)}</title>
</head>
<body style="margin:0;padding:0;background-color:#05070f;">
  <div style="display:none;max-height:0;overflow:hidden;">${escape(config.preheader)}</div>
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
              <h1 style="margin:0 0 16px;font-size:24px;line-height:1.3;color:#ffffff;">${escape(config.heading(firstName))}</h1>
              <p style="margin:0 0 16px;">${rich(config.intro, business)}</p>
              <p style="margin:0 0 24px;">${rich(config.body, business)}</p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:0 32px 28px;">
              <a href="${config.link}" style="display:inline-block;padding:14px 28px;border-radius:999px;background-color:#0b6bff;background-image:linear-gradient(90deg,#18c9ff,#0b3cff);color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:bold;text-decoration:none;">${escape(config.button)}</a>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 32px;font-family:Arial,Helvetica,sans-serif;color:#c9cfdc;font-size:16px;line-height:1.65;">
              <p style="margin:0 0 24px;">If anything comes to mind before then, just reply to this email.</p>
              <!-- Sign-off with headshot (images/email/miguelle.png, transparent PNG) -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
                <tr>
                  <td style="padding-right:16px;vertical-align:middle;">
                    <img src="${SITE_URL}/images/email/miguelle.png" width="64" height="64" alt="Miguelle" style="display:block;width:64px;height:64px;border:0;border-radius:50%;">
                  </td>
                  <td style="vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.5;color:#c9cfdc;">
                    Talk soon,<br><strong style="color:#ffffff;">Miguelle</strong><br><span style="color:#8a93a8;font-size:14px;">MigsFlow Web Design</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:18px 32px;border-top:1px solid #1c2a4a;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#8a93a8;">
              <a href="${SITE_URL}" style="color:#18c9ff;text-decoration:none;">migsflow.com</a> &nbsp;·&nbsp; ${escape(config.reason)}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
