/**
 * Contact form delivery endpoint.
 *
 * POST /api/contact
 *   body: { name, email, message, company?, phone?, budget?, _honey? }
 *
 * Behaviour:
 *   - Server-side validation: name >= 2 chars, email matches a conservative
 *     regex, message >= 10 chars. Optional fields are coerced to strings and
 *     bounded by length to keep the email payload sane.
 *   - Honeypot anti-spam: a bot that fills the hidden `_honey` field is
 *     thanked with a 200 OK but the message is silently dropped.
 *   - In-memory rate limit: max 5 submissions per IP per minute. Good enough
 *     for a low-volume marketing site. Replace with Upstash / Redis if you
 *     ever scale beyond a single Node instance.
 *   - Same-origin guard: rejects requests whose Origin header doesn't match
 *     the configured site URL (when set) or the request Host.
 *   - Delivery:
 *       1. If `RESEND_API_KEY` is set → call https://api.resend.com/emails
 *          directly via fetch (no SDK dependency).
 *       2. Else → respond 503 with a clear error so the operator notices the
 *          missing configuration; the form surfaces the failure.
 *
 * No PII is logged. The endpoint is intentionally narrow so it's easy to swap
 * in nodemailer / SES / Postmark by replacing the `sendEmail` helper.
 */

import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ---------------------------------------------------------------------------
// Input validation
// ---------------------------------------------------------------------------

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
const MAX = {
  name: 120,
  company: 160,
  email: 200,
  phone: 40,
  budget: 60,
  message: 4000,
};

type ContactInput = {
  name: string;
  email: string;
  message: string;
  company?: string;
  phone?: string;
  budget?: string;
  _honey?: string;
};

type ValidationResult =
  | { ok: true; data: ContactInput }
  | { ok: false; field: keyof ContactInput | "_form"; error: string };

function clean(v: unknown, max: number): string {
  if (typeof v !== "string") return "";
  // Strip ASCII control chars (except tab/newline/CR) before trimming/capping.
  return v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").trim().slice(0, max);
}

function validate(raw: unknown): ValidationResult {
  if (!raw || typeof raw !== "object") {
    return { ok: false, field: "_form", error: "Invalid request body." };
  }
  const r = raw as Record<string, unknown>;
  const data: ContactInput = {
    name: clean(r.name, MAX.name),
    email: clean(r.email, MAX.email),
    message: clean(r.message, MAX.message),
    company: clean(r.company, MAX.company) || undefined,
    phone: clean(r.phone, MAX.phone) || undefined,
    budget: clean(r.budget, MAX.budget) || undefined,
    _honey: typeof r._honey === "string" ? r._honey : undefined,
  };
  if (data.name.length < 2) {
    return { ok: false, field: "name", error: "Please enter your name." };
  }
  if (!EMAIL_RE.test(data.email)) {
    return { ok: false, field: "email", error: "Please enter a valid email address." };
  }
  if (data.message.length < 10) {
    return { ok: false, field: "message", error: "Please share a few details about your campaign (10+ characters)." };
  }
  return { ok: true, data };
}

// ---------------------------------------------------------------------------
// In-memory rate limit (single Node process)
// ---------------------------------------------------------------------------

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;
const buckets = new Map<string, { count: number; reset: number }>();

function clientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}

function rateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const bucket = buckets.get(ip);
  if (!bucket || bucket.reset < now) {
    buckets.set(ip, { count: 1, reset: now + WINDOW_MS });
    return { allowed: true };
  }
  bucket.count += 1;
  if (bucket.count > MAX_PER_WINDOW) {
    return { allowed: false, retryAfter: Math.ceil((bucket.reset - now) / 1000) };
  }
  return { allowed: true };
}

// Periodically prune stale buckets so the map can't grow unbounded.
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [k, v] of buckets) {
      if (v.reset < now) buckets.delete(k);
    }
  }, WINDOW_MS).unref?.();
}

// ---------------------------------------------------------------------------
// Same-origin guard
// ---------------------------------------------------------------------------

function isSameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true; // some clients (e.g. curl) omit Origin entirely
  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    if (siteUrl) {
      const allowed = new URL(siteUrl).origin;
      if (origin === allowed) return true;
    }
    const host = req.headers.get("host");
    if (host && new URL(origin).host === host) return true;
  } catch {
    return false;
  }
  return false;
}

// ---------------------------------------------------------------------------
// Delivery (Resend HTTP API — no SDK)
// ---------------------------------------------------------------------------

function buildEmailBody(d: ContactInput): { html: string; text: string; subject: string } {
  const subject = `New enquiry from ${d.name}${d.company ? ` · ${d.company}` : ""}`;
  const lines = [
    `Name:    ${d.name}`,
    `Email:   ${d.email}`,
    d.company ? `Company: ${d.company}` : null,
    d.phone ? `Phone:   ${d.phone}` : null,
    d.budget ? `Budget:  ${d.budget}` : null,
    "",
    "Message:",
    d.message,
  ].filter(Boolean);
  const text = lines.join("\n");

  // Conservative HTML — every dynamic value is escaped.
  const esc = (s: string) =>
    s.replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
    );
  const row = (label: string, value?: string) =>
    value ? `<tr><td style="padding:4px 12px 4px 0;color:#666;font-family:system-ui">${label}</td><td style="padding:4px 0;font-family:system-ui">${esc(value)}</td></tr>` : "";
  const html = `<!doctype html><html><body style="font-family:system-ui,sans-serif;color:#111">
<h2 style="margin:0 0 16px">${esc(subject)}</h2>
<table style="border-collapse:collapse;font-size:14px">
${row("Name", d.name)}
${row("Email", d.email)}
${row("Company", d.company)}
${row("Phone", d.phone)}
${row("Budget", d.budget)}
</table>
<h3 style="margin:24px 0 8px;font-size:14px;color:#666">Message</h3>
<pre style="white-space:pre-wrap;font-family:system-ui;font-size:14px;line-height:1.5;margin:0">${esc(d.message)}</pre>
</body></html>`;

  return { html, text, subject };
}

async function sendEmail(d: ContactInput): Promise<{ ok: true } | { ok: false; error: string; status: number }> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL;
  if (!apiKey || !to || !from) {
    return {
      ok: false,
      status: 503,
      error: "Email delivery is not configured on the server. See EMAIL_SETUP.md.",
    };
  }

  const { html, text, subject } = buildEmailBody(d);
  const payload = {
    from,
    to: [to],
    reply_to: d.email,
    subject,
    text,
    html,
  };

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      // Resend returns { name, message } on errors; surface the message but
      // never expose the API key or internal details to the client.
      let detail = "";
      try {
        const body = (await res.json()) as { message?: string };
        if (body?.message) detail = `: ${body.message}`;
      } catch {
        // ignore
      }
      console.error("[contact] Resend rejected:", res.status, detail);
      return { ok: false, status: 502, error: `Email provider rejected the message${detail}` };
    }
    return { ok: true };
  } catch (err) {
    console.error("[contact] Resend fetch failed:", err);
    return { ok: false, status: 502, error: "Could not reach the email provider. Please try again shortly." };
  }
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ ok: false, error: "Forbidden." }, { status: 403 });
  }

  const ip = clientIp(req);
  const rl = rateLimit(ip);
  if (!rl.allowed) {
    return NextResponse.json(
      { ok: false, error: "Too many submissions. Please try again in a minute." },
      { status: 429, headers: rl.retryAfter ? { "Retry-After": String(rl.retryAfter) } : undefined },
    );
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON." }, { status: 400 });
  }

  const v = validate(raw);
  if (!v.ok) {
    return NextResponse.json({ ok: false, error: v.error, field: v.field }, { status: 400 });
  }

  // Honeypot — accept silently to not tip off bots.
  if (v.data._honey && v.data._honey.length > 0) {
    return NextResponse.json({ ok: true });
  }

  const sent = await sendEmail(v.data);
  if (!sent.ok) {
    return NextResponse.json({ ok: false, error: sent.error }, { status: sent.status });
  }

  return NextResponse.json({ ok: true });
}
