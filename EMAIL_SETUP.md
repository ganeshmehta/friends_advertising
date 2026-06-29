# EMAIL_SETUP.md — wire the contact form to a real inbox

The contact form posts to **`/api/contact`**, which delivers the message via
[Resend](https://resend.com) (a modern transactional-email service that gives
you a free tier of 3,000 emails / month — more than enough for any marketing
site).

You can switch to SMTP / SES / Postmark later by replacing the `sendEmail`
helper inside [src/app/api/contact/route.ts](src/app/api/contact/route.ts) —
the rest of the route (validation, honeypot, rate limit, same-origin guard)
stays exactly the same.

---

## 1. Create a Resend account

1. Go to <https://resend.com> and sign up (free).
2. You start in **sandbox mode** — emails can only be sent to the address you
   signed up with. To deliver to anyone, verify a domain (step 3).

---

## 2. Generate an API key

1. Resend dashboard → **API Keys** → *Create API Key*.
2. Permission: **Sending access** is enough. Scope: *Full access* (default).
3. Copy the key — it starts with `re_…`. **You'll never see it again** — paste
   it straight into `.env.local`.

```dotenv
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxx
```

---

## 3. Verify your sending domain

Sending from `Friendsoutdoor@gmail.com` (or any address on your own domain)
requires Resend to verify you own it.

1. Resend dashboard → **Domains** → *Add Domain* → enter `friendsadv.in`.
2. Resend shows three DNS records to create. They look like:

   | Type  | Name            | Value                                            |
   | ----- | --------------- | ------------------------------------------------ |
   | MX    | `send`          | `feedback-smtp.us-east-1.amazonses.com` (priority 10) |
   | TXT   | `send`          | `v=spf1 include:amazonses.com ~all`              |
   | TXT   | `resend._domainkey` | `p=MIGfMA0GCSqG…` (long DKIM key)              |

3. Add those records inside your DNS host (Cloudflare, GoDaddy, Namecheap,
   AWS Route 53 — the field names are the same everywhere).
4. Back in Resend, click **Verify**. Propagation typically takes 5–15 min.
5. Once **Verified**, you can use any `*@friendsadv.in` address as the sender.

> If you don't own the domain yet, you can use Resend's `onboarding@resend.dev`
> address as a *temporary* sender — but emails will only be delivered to the
> address you signed up with. Fine for testing, not for production.

---

## 4. Wire up `.env.local`

In the project root:

```dotenv
NEXT_PUBLIC_SITE_URL=https://friendsadvertising.in
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxx
CONTACT_TO_EMAIL=Friendsoutdoor@gmail.com
CONTACT_FROM_EMAIL=Friends Advertising <Friendsoutdoor@gmail.com>
```

| Variable              | Purpose                                                                |
| --------------------- | ---------------------------------------------------------------------- |
| `RESEND_API_KEY`      | Authenticates the POST to Resend's REST API.                            |
| `CONTACT_TO_EMAIL`    | Where enquiries land. Can be a shared mailbox or your personal address. |
| `CONTACT_FROM_EMAIL`  | The `From:` header. Must be on a Resend-verified domain.                |
| `NEXT_PUBLIC_SITE_URL`| Used by the same-origin guard on `/api/contact`.                        |

Restart the dev server after editing `.env.local`:

```powershell
# Stop the running dev (Ctrl+C in the terminal), then:
npm run dev
```

Set the **same variables** in your hosting provider's dashboard (Vercel /
Netlify / your VM's `.env.local`).

---

## 5. End-to-end test

1. Open <http://localhost:3000/contact>.
2. Fill in: Name, Brand/Company, Email, Phone (optional), Budget, Message.
3. Click **Launch Campaign**.
4. The button shows a spinner and the label changes to **Sending…**.
5. A green confirmation banner appears: *"Thanks! Your brief is in our
   inbox — we'll reply within 4 hours."*
6. Check your inbox — the enquiry should arrive within seconds, with
   `Reply-To:` set to the sender's email so you can reply directly.

If the form errors out, the red banner shows the exact reason. Common ones:

| Banner text                                              | Fix                                          |
| -------------------------------------------------------- | -------------------------------------------- |
| *Email delivery is not configured on the server.*         | One of `RESEND_API_KEY` / `CONTACT_TO_EMAIL` / `CONTACT_FROM_EMAIL` is missing or the server hasn't been restarted. |
| *Could not reach the email provider.*                     | Outbound network blocked or Resend is down — retry. |
| *Email provider rejected the message: domain not verified*| Finish step 3 above.                          |
| *Too many submissions. Please try again in a minute.*    | Built-in rate limit: 5 / IP / 60 s. By design. |
| *Forbidden.*                                              | Same-origin guard: requests are only accepted from `NEXT_PUBLIC_SITE_URL` or the request `Host`. |

---

## 6. Switching providers (optional)

The route is intentionally swappable. To use **SMTP** instead of Resend:

```bash
npm install nodemailer
npm install -D @types/nodemailer
```

Then replace the body of `sendEmail` in
[src/app/api/contact/route.ts](src/app/api/contact/route.ts) with:

```ts
import nodemailer from "nodemailer";

async function sendEmail(d: ContactInput) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, CONTACT_TO_EMAIL, CONTACT_FROM_EMAIL } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !CONTACT_TO_EMAIL || !CONTACT_FROM_EMAIL) {
    return { ok: false as const, status: 503, error: "SMTP not configured." };
  }
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT ?? 587),
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  const { html, text, subject } = buildEmailBody(d);
  await transporter.sendMail({
    from: CONTACT_FROM_EMAIL,
    to: CONTACT_TO_EMAIL,
    replyTo: d.email,
    subject, text, html,
  });
  return { ok: true as const };
}
```

For Gmail SMTP specifically, generate an *App Password* (Google account →
Security → 2-Step Verification → App passwords) and use it as `SMTP_PASS`.
The standard Gmail account password will not work.

---

## 7. Security checklist

- [x] Submissions are validated server-side (length / regex) — never trust
      the browser.
- [x] A honeypot field silently drops obvious bots.
- [x] In-memory rate limit caps abuse at 5 requests / IP / 60 s.
- [x] Same-origin guard rejects cross-origin POSTs.
- [x] The Resend API key is **server-only** (no `NEXT_PUBLIC_` prefix) and
      never reaches the browser bundle.
- [x] HTML payload escapes every user-supplied value to prevent injected
      markup in the inbox preview.
- [x] No request body is logged. Errors are logged with `console.error` but
      omit form contents to keep server logs PII-free.
