import { Resend } from 'resend'

let resend: Resend | null = null

function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null
  if (!resend) resend = new Resend(process.env.RESEND_API_KEY)
  return resend
}

const FROM_EMAIL = process.env.EMAIL_FROM || 'Welp <notifications@alliswelp.com>'

interface SendEmailOptions {
  to: string
  subject: string
  html: string
}

async function sendEmail({ to, subject, html }: SendEmailOptions): Promise<boolean> {
  const client = getResend()
  if (!client) {
    console.error('Email not configured: RESEND_API_KEY missing')
    return false
  }

  try {
    await client.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    })
    return true
  } catch (err) {
    console.error('Failed to send email:', err)
    return false
  }
}

// ─── Email templates ────────────────────────────────────────

function baseTemplate(content: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
    </head>
    <body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
      <div style="max-width:560px;margin:0 auto;padding:40px 20px;">
        <div style="background:white;border-radius:12px;border:1px solid #e2e8f0;overflow:hidden;">
          <!-- Header -->
          <div style="padding:24px 32px;border-bottom:1px solid #f1f5f9;">
            <span style="font-size:24px;font-weight:900;color:#0f172a;letter-spacing:-0.5px;">welp.</span>
          </div>
          <!-- Content -->
          <div style="padding:32px;">
            ${content}
          </div>
        </div>
        <div style="text-align:center;padding:24px 0;color:#94a3b8;font-size:12px;">
          &copy; ${new Date().getFullYear()} Welp &mdash; Registry for Fresh Starts
        </div>
      </div>
    </body>
    </html>
  `
}

// ─── Contribution notification (to registry owner) ──────────

export async function sendContributionNotification({
  ownerEmail,
  ownerName,
  contributorName,
  amount,
  fundTitle,
  message,
  registrySlug,
}: {
  ownerEmail: string
  ownerName: string
  contributorName: string
  amount: string
  fundTitle: string
  message?: string
  registrySlug: string
}) {
  const html = baseTemplate(`
    <h2 style="margin:0 0 8px;font-size:20px;color:#0f172a;">You got a contribution!</h2>
    <p style="margin:0 0 24px;color:#64748b;font-size:14px;line-height:1.5;">
      Hey ${ownerName}, someone just helped you get back on your feet.
    </p>
    <div style="background:#fff1f2;border-radius:8px;padding:20px;margin-bottom:24px;">
      <div style="font-size:28px;font-weight:700;color:#e11d48;margin-bottom:4px;">${amount}</div>
      <div style="font-size:14px;color:#64748b;">
        from <strong style="color:#0f172a;">${contributorName}</strong>
        toward <strong style="color:#0f172a;">${fundTitle}</strong>
      </div>
    </div>
    ${message ? `
      <div style="background:#f8fafc;border-radius:8px;padding:16px;margin-bottom:24px;border-left:3px solid #e11d48;">
        <p style="margin:0;font-size:14px;color:#475569;font-style:italic;">"${message}"</p>
      </div>
    ` : ''}
    <a href="https://alliswelp.com/dashboard" style="display:inline-block;padding:12px 24px;background:#e11d48;color:white;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px;">
      View Your Dashboard
    </a>
  `)

  return sendEmail({
    to: ownerEmail,
    subject: `${contributorName} contributed ${amount} to your ${fundTitle} fund`,
    html,
  })
}

// ─── New encouragement notification (to registry owner) ─────

export async function sendEncouragementNotification({
  ownerEmail,
  ownerName,
  authorName,
  message,
  registrySlug,
}: {
  ownerEmail: string
  ownerName: string
  authorName: string
  message: string
  registrySlug: string
}) {
  const html = baseTemplate(`
    <h2 style="margin:0 0 8px;font-size:20px;color:#0f172a;">New message of support</h2>
    <p style="margin:0 0 24px;color:#64748b;font-size:14px;line-height:1.5;">
      Hey ${ownerName}, someone left you a kind word.
    </p>
    <div style="background:#f8fafc;border-radius:8px;padding:20px;margin-bottom:24px;border-left:3px solid #e11d48;">
      <div style="font-size:13px;font-weight:600;color:#0f172a;margin-bottom:8px;">${authorName}</div>
      <p style="margin:0;font-size:14px;color:#475569;line-height:1.5;">"${message}"</p>
    </div>
    <a href="https://alliswelp.com/dashboard" style="display:inline-block;padding:12px 24px;background:#e11d48;color:white;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px;">
      View Your Dashboard
    </a>
  `)

  return sendEmail({
    to: ownerEmail,
    subject: `${authorName} left you a message on Welp`,
    html,
  })
}

// ─── Proxy registry created notification (to recipient) ─────

export async function sendProxyCreatedNotification({
  recipientEmail,
  recipientName,
  advocateName,
  relationship,
  registrySlug,
  claimToken,
}: {
  recipientEmail: string
  recipientName: string
  advocateName: string
  relationship: string
  registrySlug: string
  claimToken: string
}) {
  const html = baseTemplate(`
    <h2 style="margin:0 0 8px;font-size:20px;color:#0f172a;">Someone created a registry for you</h2>
    <p style="margin:0 0 24px;color:#64748b;font-size:14px;line-height:1.5;">
      Hey ${recipientName}, ${advocateName} (your ${relationship}) just did something amazing. They
      created a Welp registry to help you get back on your feet.
    </p>
    <p style="margin:0 0 24px;color:#64748b;font-size:14px;line-height:1.5;">
      You can view it now &mdash; and when you&apos;re ready, you can take it over and make it yours.
    </p>
    <div style="margin-bottom:16px;">
      <a href="https://alliswelp.com/${registrySlug}" style="display:inline-block;padding:12px 24px;background:#e11d48;color:white;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px;">
        View Your Registry
      </a>
    </div>
    <div>
      <a href="https://alliswelp.com/claim/${claimToken}" style="display:inline-block;padding:12px 24px;background:#f1f5f9;color:#475569;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px;">
        Claim &amp; Take Ownership
      </a>
    </div>
  `)

  return sendEmail({
    to: recipientEmail,
    subject: `${advocateName} created a Welp registry for you`,
    html,
  })
}
