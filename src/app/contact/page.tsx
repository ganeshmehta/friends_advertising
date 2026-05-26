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
  CheckCircle2
} from "lucide-react";

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
  const [mounted, setMounted] = useState(false);
  const [started, setStarted] = useState(false);
  const [sent, setSent] = useState(false);

  const [form, setForm] = useState({
    name: "",
    company: "",
    email: "",
    message: ""
  });

  const billboardControls = useAnimationControls();

  useEffect(() => {
    setMounted(true);

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
  }, []);

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
    setForm((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  const submit = async (e: any) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <section className="relative overflow-hidden bg-[var(--background)] py-32 text-[#1d1d1f]">
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

      <div className="relative z-10 mx-auto grid max-w-7xl gap-20 px-6 lg:grid-cols-2 lg:px-10">
        {/* LEFT */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-5 py-2 text-sm font-semibold text-slate-500 shadow-sm">
              <Building2 className="h-4 w-4 text-[var(--neon-blue)]" />
              Let’s Build Your Next Campaign
            </div>

            <h2 className="max-w-xl text-5xl font-black leading-tight md:text-6xl text-[#1d1d1f] tracking-tight">
              Own Attention.
              <br />
              Own The Skyline.
            </h2>

            <p className="mt-8 max-w-xl text-lg leading-relaxed text-slate-500 font-medium">
              Launch premium outdoor campaigns across
              Maharashtra with strategically placed
              high-visibility billboards.
            </p>
          </motion.div>

          {/* FORM */}
          <motion.form
            onSubmit={submit}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 space-y-5 animate-none"
          >
            <div className="relative">
              <User className="absolute left-4 top-4 h-5 w-5 text-slate-400" />

              <input
                value={form.name}
                onChange={(e) =>
                  updateField("name", e.target.value)
                }
                placeholder="Your Name"
                className="w-full rounded-2xl border border-black/10 bg-white/60 py-4 pl-12 pr-4 text-[#1d1d1f] outline-none backdrop-blur-xl transition-all focus:border-black/30 focus:bg-white font-medium"
              />
            </div>

            <div className="relative">
              <Building2 className="absolute left-4 top-4 h-5 w-5 text-slate-400" />

              <input
                value={form.company}
                onChange={(e) =>
                  updateField("company", e.target.value)
                }
                placeholder="Brand / Company"
                className="w-full rounded-2xl border border-black/10 bg-white/60 py-4 pl-12 pr-4 text-[#1d1d1f] outline-none backdrop-blur-xl transition-all focus:border-black/30 focus:bg-white font-medium"
              />
            </div>

            <div className="relative">
              <Mail className="absolute left-4 top-4 h-5 w-5 text-slate-400" />

              <input
                value={form.email}
                onChange={(e) =>
                  updateField("email", e.target.value)
                }
                placeholder="Email Address"
                className="w-full rounded-2xl border border-black/10 bg-white/60 py-4 pl-12 pr-4 text-[#1d1d1f] outline-none backdrop-blur-xl transition-all focus:border-black/30 focus:bg-white font-medium"
              />
            </div>

            <textarea
              value={form.message}
              onChange={(e) =>
                updateField("message", e.target.value)
              }
              placeholder="Tell us about your campaign"
              rows={5}
              className="w-full rounded-2xl border border-black/10 bg-white/60 p-5 text-[#1d1d1f] outline-none backdrop-blur-xl transition-all focus:border-black/30 focus:bg-white font-medium"
            />

            <button
              type="submit"
              className="flex items-center justify-center gap-2 rounded-full bg-black px-8 py-4 font-semibold text-white transition hover:bg-black/90 shadow-sm"
            >
              Launch Campaign
              <Send className="h-4 w-4" />
            </button>
          </motion.form>
        </div>

        {/* BILLBOARD EXPERIENCE */}
        <div className="relative flex min-h-[720px] items-end justify-center">
          {/* GROUND */}
          <div className="absolute bottom-0 h-[140px] w-full rounded-[100%] bg-black/10 blur-2xl" />

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
    </section>
  );
}
