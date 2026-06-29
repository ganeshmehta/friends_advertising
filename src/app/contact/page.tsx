"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AnimatePresence,
  motion,
  useAnimationControls
} from "framer-motion";
import {
  Building2,
  Mail,
  Phone,
  Send,
  User,
  CheckCircle2,
  MapPin,
  Clock,
  Sparkles,
  ArrowUpRight,
  Zap,
  IndianRupee,
  AlertCircle,
  Loader2
} from "lucide-react";

type SendStatus = "idle" | "sending" | "success" | "error";

const quickContacts = [
  {
    icon: Phone,
    label: "Call us",
    value: "+91 98765 43210",
    href: "tel:+919876543210",
    tint: "from-[#0071e3] to-[#5c60f5]"
  },
  {
    icon: Mail,
    label: "Email us",
    value: "Friendsoutdoor@gmail.com",
    href: "mailto:Friendsoutdoor@gmail.com",
    tint: "from-[#5c60f5] to-[#ff0055]"
  },
  {
    icon: MapPin,
    label: "Visit us",
    value: "Navi Mumbai · Satara",
    href: "#locations",
    tint: "from-[#0fc3cd] to-[#0071e3]"
  }
];

const budgetTiers = [
  "< ₹2L",
  "₹2L – ₹5L",
  "₹5L – ₹15L",
  "₹15L+"
];

const processSteps = [
  {
    n: "01",
    title: "Brief",
    body: "Tell us what you want the city to see."
  },
  {
    n: "02",
    title: "Plan",
    body: "We map every visible square foot — and price it."
  },
  {
    n: "03",
    title: "Launch",
    body: "Print, install, light. Your brand goes live."
  }
];

const trustStrip = [
  { value: "4 hrs", label: "Avg. response" },
  { value: "120+", label: "Active sites" },
  { value: "8M+", label: "Daily impressions" },
  { value: "85+", label: "Brand partners" }
];

const workers = [
  {
    id: 1,
    left: "16%",
    delay: 0
  },
  {
    id: 2,
    left: "42%",
    delay: 0.2
  },
  {
    id: 3,
    left: "72%",
    delay: 0.4
  }
];

export default function ContactSection() {
  const [started, setStarted] = useState(false);
  const [status, setStatus] = useState<SendStatus>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const sent = status === "success";

  const [form, setForm] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    budget: "",
    message: "",
    // Honeypot — kept blank by humans; bots fill every field.
    _honey: ""
  });

  const billboardControls = useAnimationControls();

  useEffect(() => {
    const timer = setTimeout(async () => {
      setStarted(true);

      await billboardControls.start({
        y: 0,
        rotate: 0,
        opacity: 1,
        transition: {
          duration: 1.4,
          type: "spring",
          stiffness: 110,
          damping: 12
        }
      });
    }, 400);

    return () => clearTimeout(timer);
  }, [billboardControls]);

  const interactionStarted = useMemo(() => {
    return (
      form.name.length > 0 ||
      form.company.length > 0 ||
      form.email.length > 0 ||
      form.message.length > 0
    );
  }, [form]);

  const updateField = (
    key: string,
    value: string
  ) => {
    const updateField = (key: string, value: string) => {
      setForm((prev) => ({
        ...prev,
        [key]: value,
      }));
};
  };

  const WEB3FORMS_KEY = "YOUR_WEB3FORMS_ACCESS_KEY";

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (status === "sending") return;

    setErrorMsg(null);
    setStatus("sending");

    try {
      // Placeholder mode (before Web3Forms is configured)
      if (WEB3FORMS_KEY === "YOUR_WEB3FORMS_ACCESS_KEY") {
        await new Promise((resolve) => setTimeout(resolve, 1200));

        setStatus("success");
        return;
      }

      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject: `New Lead from Friends Adv - ${form.company || form.name}`,
          from_name: "Friends Adv Website",

          name: form.name,
          company: form.company,
          email: form.email,
          phone: form.phone,
          budget: form.budget,
          message: form.message,

          botcheck: form._honey,
        }),
      });

      const body = await res.json();

      if (!res.ok || !body.success) {
        setErrorMsg(
          body.message ||
            "Something went wrong. Please try again later."
        );
        setStatus("error");
        return;
      }

      setStatus("success");

      setForm({
        name: "",
        company: "",
        email: "",
        phone: "",
        budget: "",
        message: "",
        _honey: "",
      });
    } catch {
      setErrorMsg("Network error. Please check your connection and try again.");
      setStatus("error");
    }
  };

  return (
    <main className="relative overflow-hidden bg-[var(--background)] py-16 md:py-32 text-[#1d1d1f]">
      {/* BACKGROUND */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,113,227,0.06),transparent_40%)]" />

        <div className="absolute bottom-0 left-0 right-0 h-[240px] bg-gradient-to-t from-slate-100 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 h-[160px] bg-[#f5f5f7]" />

        {/* SKYLINE (Sleek Silver Outline Blueprint) */}
        <div className="absolute bottom-0 left-0 right-0 flex items-end opacity-30">
          {[
            { w: 70, h: 180 },
            { w: 90, h: 240 },
            { w: 60, h: 140 },
            { w: 110, h: 260 },
            { w: 75, h: 210 },
            { w: 95, h: 280 },
            { w: 65, h: 170 },
            { w: 120, h: 300 },
            { w: 80, h: 220 },
            { w: 55, h: 160 },
            { w: 100, h: 250 },
            { w: 68, h: 190 },
            { w: 115, h: 320 },
            { w: 72, h: 200 },
            { w: 88, h: 240 },
            { w: 62, h: 150 }
          ].map((b, i) => (
            <div
              key={i}
              className="border border-black/5 bg-black/[0.01]"
              style={{
                width: `${b.w}px`,
                height: `${b.h}px`
              }}
            />
          ))}
        </div>
      </div>

      <div className="relative z-10 mx-auto grid max-w-7xl 2xl:max-w-[1480px] gap-12 lg:gap-20 px-6 lg:grid-cols-2 lg:px-10">
        {/* LEFT */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-5 py-2 text-sm font-semibold text-slate-600 shadow-sm backdrop-blur-md">
                <Building2 className="h-4 w-4 text-[var(--neon-blue)]" />
                Let&rsquo;s Build Your Next Campaign
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-700 shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                <Clock className="h-3 w-3" />
                Reply within 4 hrs
              </div>
            </div>

            <h1 className="max-w-xl text-4xl sm:text-5xl font-black leading-[1.02] lg:text-6xl text-[#1d1d1f] tracking-tight">
              Own Attention.
              <br />
              <span className="bg-gradient-to-r from-[#0071e3] via-[#5c60f5] to-[#ff0055] bg-clip-text text-transparent">
                Own The Skyline.
              </span>
            </h1>
            {/* Accent rule */}
            <div className="mt-6 h-1 w-24 rounded-full bg-gradient-to-r from-[#0071e3] via-[#5c60f5] to-[#ff0055]" />

            <p className="mt-8 max-w-xl text-lg leading-relaxed text-slate-500 font-medium">
              Launch premium outdoor campaigns across
              Maharashtra with strategically placed
              high-visibility billboards.
            </p>
          </motion.div>

          {/* QUICK CONTACT CARDS */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-10 grid gap-3 sm:grid-cols-3"
          >
            {quickContacts.map((c) => {
              const Icon = c.icon;
              return (
                <a
                  key={c.label}
                  href={c.href}
                  className="group relative overflow-hidden rounded-2xl border border-black/[0.06] bg-white/70 p-4 shadow-sm backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-black/15 hover:shadow-md"
                >
                  <div
                    className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${c.tint} text-white shadow-sm`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                    {c.label}
                  </p>
                  <p className="mt-1 flex items-center justify-between gap-2 text-sm font-semibold text-[#1d1d1f]">
                    <span className="truncate">{c.value}</span>
                    <ArrowUpRight className="h-3.5 w-3.5 flex-none text-slate-400 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#1d1d1f]" />
                  </p>
                </a>
              );
            })}
          </motion.div>

          {/* FORM */}
          <motion.form
            onSubmit={submit}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-10 space-y-5 animate-none"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="relative">
                <User className="absolute left-4 top-4 h-5 w-5 text-slate-400 transition-colors peer-focus:text-[var(--neon-blue)]" />
                <input
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="Your Name"
                  className="peer w-full rounded-2xl border border-black/10 bg-white/60 py-4 pl-12 pr-4 text-[#1d1d1f] outline-none backdrop-blur-xl transition-all focus:border-[var(--neon-blue)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(0,113,227,0.12)] font-medium"
                />
              </div>

              <div className="relative">
                <Building2 className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
                <input
                  value={form.company}
                  onChange={(e) => updateField("company", e.target.value)}
                  placeholder="Brand / Company"
                  className="w-full rounded-2xl border border-black/10 bg-white/60 py-4 pl-12 pr-4 text-[#1d1d1f] outline-none backdrop-blur-xl transition-all focus:border-[var(--neon-blue)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(0,113,227,0.12)] font-medium"
                />
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="relative">
                <Mail className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  placeholder="Email Address"
                  className="w-full rounded-2xl border border-black/10 bg-white/60 py-4 pl-12 pr-4 text-[#1d1d1f] outline-none backdrop-blur-xl transition-all focus:border-[var(--neon-blue)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(0,113,227,0.12)] font-medium"
                />
              </div>

              <div className="relative">
                <Phone className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  placeholder="Phone (optional)"
                  className="w-full rounded-2xl border border-black/10 bg-white/60 py-4 pl-12 pr-4 text-[#1d1d1f] outline-none backdrop-blur-xl transition-all focus:border-[var(--neon-blue)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(0,113,227,0.12)] font-medium"
                />
              </div>
            </div>

            {/* BUDGET CHIPS */}
            <div>
              <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                <IndianRupee className="h-3.5 w-3.5" />
                Estimated budget
              </p>
              <div className="flex flex-wrap gap-2">
                {budgetTiers.map((tier) => {
                  const active = form.budget === tier;
                  return (
                    <button
                      key={tier}
                      type="button"
                      onClick={() => updateField("budget", active ? "" : tier)}
                      className={`rounded-full border px-4 py-2 text-sm font-semibold transition-all ${
                        active
                          ? "border-transparent bg-[#1d1d1f] text-white shadow-sm"
                          : "border-black/10 bg-white/60 text-slate-600 hover:border-black/25 hover:text-[#1d1d1f]"
                      }`}
                    >
                      {tier}
                    </button>
                  );
                })}
              </div>
            </div>

            <textarea
              value={form.message}
              onChange={(e) => updateField("message", e.target.value)}
              placeholder="Tell us about your campaign \u2014 cities, dates, goals."
              rows={5}
              className="w-full rounded-2xl border border-black/10 bg-white/60 p-5 text-[#1d1d1f] outline-none backdrop-blur-xl transition-all focus:border-[var(--neon-blue)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(0,113,227,0.12)] font-medium"
            />

            {/* Honeypot — hidden from humans, irresistible to bots. */}
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                left: "-10000px",
                top: "auto",
                width: "1px",
                height: "1px",
                overflow: "hidden"
              }}
            >
              <label>
                Leave this field empty
                <input
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={form._honey}
                  onChange={(e) => updateField("_honey", e.target.value)}
                />
              </label>
            </div>

            {status === "error" && errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                role="alert"
                aria-live="polite"
                className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50/90 px-4 py-3 text-sm font-medium text-red-700"
              >
                <AlertCircle className="mt-0.5 h-5 w-5 flex-none" aria-hidden="true" />
                <span>{errorMsg}</span>
              </motion.div>
            )}

            {status === "success" && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                role="status"
                aria-live="polite"
                className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/90 px-4 py-3 text-sm font-semibold text-emerald-700"
              >
                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none" aria-hidden="true" />
                <span>Thanks! Your brief is in our inbox — we&rsquo;ll reply within 4 hours.</span>
              </motion.div>
            )}

            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="submit"
                disabled={status === "sending" || status === "success"}
                aria-busy={status === "sending"}
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-[#1d1d1f] px-8 py-4 font-semibold text-white shadow-[0_10px_30px_-12px_rgba(0,0,0,0.6)] transition-all hover:-translate-y-0.5 hover:bg-black hover:shadow-[0_18px_40px_-16px_rgba(0,0,0,0.7)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:bg-[#1d1d1f]"
              >
                {status === "sending" ? (
                  <Loader2 className="h-4 w-4 animate-spin text-[var(--neon-blue)]" aria-hidden="true" />
                ) : (
                  <Sparkles className="h-4 w-4 text-[var(--neon-blue)] transition-transform group-hover:rotate-12" aria-hidden="true" />
                )}
                {status === "sending"
                  ? "Sending…"
                  : status === "success"
                    ? "Brief Received"
                    : "Launch Campaign"}
                {status !== "sending" && (
                  <Send className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                )}
              </button>
              <p className="text-xs text-slate-500">
                Or write to{" "}
                <a
                  href="mailto:Friendsoutdoor@gmail.com"
                  className="font-semibold text-[#1d1d1f] underline decoration-slate-300 underline-offset-4 hover:decoration-[var(--neon-blue)]"
                >
                  Friendsoutdoor@gmail.com
                </a>
              </p>
            </div>
          </motion.form>

          {/* PROCESS TIMELINE */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="mt-14 grid gap-4 sm:grid-cols-3"
          >
            {processSteps.map((s, i) => (
              <div
                key={s.n}
                className="relative rounded-2xl border border-black/[0.06] bg-white/60 p-5 backdrop-blur-md"
              >
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl font-black tracking-tight text-[#1d1d1f]">
                    {s.n}
                  </span>
                  <span className="h-px flex-1 bg-gradient-to-r from-black/10 to-transparent" />
                  {i < processSteps.length - 1 && (
                    <Zap className="h-4 w-4 text-[var(--neon-blue)]" />
                  )}
                </div>
                <p className="mt-3 text-sm font-bold uppercase tracking-[0.16em] text-[#1d1d1f]">
                  {s.title}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                  {s.body}
                </p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* BILLBOARD EXPERIENCE */}
        <div className="relative flex min-h-[500px] md:min-h-[720px] items-end justify-center">
          <div className="absolute bottom-0 w-full flex justify-center origin-bottom scale-[0.65] sm:scale-[0.8] md:scale-100">
            {/* GROUND */}
            <div className="absolute bottom-0 h-[140px] w-full max-w-[800px] rounded-[100%] bg-black/10 blur-2xl" />

            {/* BILLBOARD POLE */}
            <motion.div
              initial={{ y: -400, rotate: -10, opacity: 0 }}
              animate={billboardControls}
              className="absolute bottom-[110px] h-[380px] w-[24px] rounded-full bg-gradient-to-b from-slate-200 via-slate-400 to-slate-600 shadow-xl"
            />

            {/* BILLBOARD */}
            <motion.div
              initial={{ y: -500, rotate: -6, opacity: 0 }}
              animate={billboardControls}
              className="absolute bottom-[380px] h-[260px] w-[520px] overflow-hidden rounded-[32px] border border-black/10 bg-[#ffffff] shadow-[0_30px_80px_rgba(0,0,0,0.15)]"
            >
            {/* LIGHTS */}
            <AnimatePresence>
              {sent && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-[radial-gradient(circle,rgba(0,113,227,0.2),transparent_60%)]"
                />
              )}
            </AnimatePresence>

            {/* POSTER (Apple Royal Gradient) */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{
                scaleX: interactionStarted ? 1 : 0.08
              }}
              transition={{ duration: 1 }}
              className="absolute inset-5 origin-left rounded-[24px] bg-gradient-to-br from-[#0071e3] via-[#5c60f5] to-[#ff0055]"
            />

            {/* CONTENT */}
            <div className="relative z-20 flex h-full flex-col justify-between p-8">
              {!sent ? (
                <>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.4em] text-white/70">
                      LIVE CAMPAIGN PREVIEW
                    </p>

                    <h3 className="mt-6 text-4xl font-black leading-none text-white tracking-tight">
                      {form.company || "YOUR BRAND"}
                    </h3>

                    <p className="mt-6 max-w-sm text-lg leading-relaxed text-white/95 font-medium">
                      {form.message ||
                        "Your campaign begins here."}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/60">
                        Powered By
                      </p>

                      <p className="mt-1 text-xl font-black text-white tracking-tight">
                        FRIENDS ADV
                      </p>
                    </div>

                    <div className="rounded-full border border-white/20 bg-white/25 px-4 py-2 text-xs font-bold text-white backdrop-blur-xl">
                      Premium OOH
                    </div>
                  </div>
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex h-full flex-col items-center justify-center text-center"
                >
                  <CheckCircle2 className="h-16 w-16 text-white" />

                  <p className="mt-8 text-5xl font-black text-white tracking-tight">
                    FRIENDS ADV
                  </p>

                  <p className="mt-4 text-xl font-bold text-white/90">
                    Own Every Glance
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* WORKERS */}
          <AnimatePresence>
            {interactionStarted && !sent && (
              <>
                {workers.map((worker) => (
                  <motion.div
                    key={worker.id}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{
                      opacity: 1,
                      y: [0, -8, 0]
                    }}
                    exit={{ opacity: 0 }}
                    transition={{
                      delay: worker.delay,
                      duration: 2,
                      repeat: Infinity
                    }}
                    style={{ left: worker.left }}
                    className="absolute bottom-[130px]"
                  >
                    {/* LADDER */}
                    <div className="absolute bottom-0 left-1/2 h-[180px] w-[10px] -translate-x-1/2 rounded-full bg-slate-400">
                      {Array.from({ length: 7 }).map((_, i) => (
                        <div
                           key={i}
                           className="absolute left-1/2 h-[4px] w-[34px] -translate-x-1/2 rounded-full bg-slate-300"
                           style={{ top: `${i * 24}px` }}
                        />
                      ))}
                    </div>

                    {/* WORKER */}
                    <motion.div
                      animate={{
                        y: [0, -5, 0],
                        rotate: [-1, 1, -1]
                      }}
                      transition={{
                        duration: 1.8,
                        repeat: Infinity
                      }}
                      className="absolute bottom-[110px] left-1/2 -translate-x-1/2"
                    >
                      <div className="relative flex flex-col items-center">
                        {/* POSTER PANEL */}
                        <motion.div
                          animate={{
                            scaleX: [0.92, 1, 0.92]
                          }}
                          transition={{
                            duration: 1.4,
                            repeat: Infinity
                          }}
                          className="absolute -top-1 left-8 h-10 w-16 origin-left rounded-md border border-black/10 bg-white/80 backdrop-blur"
                        />

                        {/* ARM */}
                        <motion.div
                          animate={{
                            rotate: [-30, -10, -30]
                          }}
                          transition={{
                            duration: 1.2,
                            repeat: Infinity
                          }}
                          className="absolute -top-1 left-5 h-10 w-[5px] origin-bottom rounded-full bg-slate-300"
                        />

                        {/* HEAD */}
                        <div className="h-8 w-8 rounded-full bg-slate-200 shadow-sm" />

                        {/* BODY */}
                        <div className="mt-1 h-14 w-10 rounded-t-full rounded-b-2xl bg-amber-400 shadow-md" />

                        {/* LEGS */}
                        <div className="mt-1 flex gap-1">
                          <div className="h-8 w-[5px] rounded-full bg-slate-400" />
                          <div className="h-8 w-[5px] rounded-full bg-slate-400" />
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                ))}
              </>
            )}
          </AnimatePresence>

          {/* DUST */}
          {started && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: [0.3, 0], scale: 2.2 }}
              transition={{ duration: 1.4 }}
              className="absolute bottom-[80px] h-[180px] w-[180px] rounded-full bg-black/5 blur-3xl"
            />
          )}
          </div>
        </div>
      </div>

      {/* TRUST STRIP */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative z-10 mx-auto mt-16 md:mt-24 max-w-7xl 2xl:max-w-[1480px] px-6 lg:px-10"
      >
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-black/[0.06] bg-black/5 shadow-[0_30px_80px_-50px_rgba(13,36,64,0.35)] md:grid-cols-4">
          {trustStrip.map((s) => (
            <div
              key={s.label}
              className="group relative bg-white/85 px-6 py-6 md:px-8 md:py-8 text-center backdrop-blur-md transition-colors hover:bg-white"
            >
              <p className="bg-gradient-to-br from-[#0071e3] via-[#5c60f5] to-[#ff0055] bg-clip-text text-3xl sm:text-4xl font-black tracking-tight text-transparent md:text-5xl">
                {s.value}
              </p>
              <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* OUR OFFICES */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className="relative z-10 mx-auto mt-16 md:mt-24 max-w-7xl 2xl:max-w-[1480px] px-6 lg:px-10"
      >
        <div className="rounded-3xl border border-black/[0.06] bg-white/85 backdrop-blur-md shadow-[0_30px_80px_-50px_rgba(13,36,64,0.35)] p-8 md:p-12">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-[#1d1d1f] mb-2">
            Visit Our Offices
          </h2>
          <p className="text-slate-600 mb-8 font-medium">
            Stop by and say hello. We'd love to discuss your next campaign.
          </p>
          
          <div className="grid md:grid-cols-2 gap-6">
            <a
              href="https://www.google.com/maps/search/Shop+No.+B-32,+Hiranandani+Crystal+Plaza+Premises,+2nd+Floor,+Sector+No.7+Kharghar,+Navi+Mumbai+-+410210"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative overflow-hidden rounded-2xl border border-black/[0.06] bg-gradient-to-br from-[#0071e3]/5 to-[#5c60f5]/5 p-6 hover:border-[var(--neon-blue)]/30 hover:shadow-lg transition-all duration-200"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-gradient-to-br from-[#0071e3] to-[#5c60f5] text-white shadow-sm">
                  <MapPin className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold uppercase tracking-[0.12em] text-[#1d1d1f] group-hover:text-[var(--neon-blue)] transition-colors">
                    Mumbai Office
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600 group-hover:text-slate-800 transition-colors">
                    Shop No. B-32, Hiranandani Crystal Plaza Premises, 2nd Floor, Sector No.7 Kharghar, Navi Mumbai - 410210
                  </p>
                  <p className="mt-3 text-xs font-semibold text-[var(--neon-blue)] flex items-center gap-1 group-hover:gap-2 transition-all">
                    Open in Google Maps <ArrowUpRight className="h-3 w-3" />
                  </p>
                </div>
              </div>
            </a>

            <a
              href="https://www.google.com/maps/search/Shop+No.+25/26,+Vijay+Heights,+Visaw+Naka,+Z.P.+Road,+Satara-415001"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative overflow-hidden rounded-2xl border border-black/[0.06] bg-gradient-to-br from-[#5c60f5]/5 to-[#ff0055]/5 p-6 hover:border-[var(--neon-blue)]/30 hover:shadow-lg transition-all duration-200"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-gradient-to-br from-[#5c60f5] to-[#ff0055] text-white shadow-sm">
                  <MapPin className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold uppercase tracking-[0.12em] text-[#1d1d1f] group-hover:text-[var(--neon-blue)] transition-colors">
                    Satara Office
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600 group-hover:text-slate-800 transition-colors">
                    Shop No. 25/26, Vijay Heights, Visaw Naka, Z.P. Road, Satara-415001
                  </p>
                  <p className="mt-3 text-xs font-semibold text-[var(--neon-blue)] flex items-center gap-1 group-hover:gap-2 transition-all">
                    Open in Google Maps <ArrowUpRight className="h-3 w-3" />
                  </p>
                </div>
              </div>
            </a>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
