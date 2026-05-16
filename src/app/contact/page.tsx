
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
    <section className="relative overflow-hidden bg-[#07111f] py-32 text-white">
      {/* BACKGROUND */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.22),transparent_40%)]" />

        <div className="absolute bottom-0 left-0 right-0 h-[240px] bg-gradient-to-t from-[#05070d] to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 h-[160px] bg-[#0a0f18]" />

        {/* SKYLINE */}
        <div className="absolute bottom-0 left-0 right-0 flex items-end opacity-20">
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
    className="border border-white/10 bg-white/5"
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
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-500/10 px-5 py-2 text-sm font-semibold text-indigo-300">
              <Building2 className="h-4 w-4" />
              Let’s Build Your Next Campaign
            </div>

            <h2 className="max-w-xl text-5xl font-black leading-tight md:text-6xl">
              Own Attention.
              <br />
              Own The Skyline.
            </h2>

            <p className="mt-8 max-w-xl text-lg leading-relaxed text-slate-300">
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
            className="mt-12 space-y-5"
          >
            <div className="relative">
              <User className="absolute left-4 top-4 h-5 w-5 text-slate-500" />

              <input
                value={form.name}
                onChange={(e) =>
                  updateField("name", e.target.value)
                }
                placeholder="Your Name"
                className="w-full rounded-2xl border border-white/10 bg-white/5 py-4 pl-12 pr-4 text-white outline-none backdrop-blur-xl transition-all focus:border-indigo-400"
              />
            </div>

            <div className="relative">
              <Building2 className="absolute left-4 top-4 h-5 w-5 text-slate-500" />

              <input
                value={form.company}
                onChange={(e) =>
                  updateField("company", e.target.value)
                }
                placeholder="Brand / Company"
                className="w-full rounded-2xl border border-white/10 bg-white/5 py-4 pl-12 pr-4 text-white outline-none backdrop-blur-xl transition-all focus:border-indigo-400"
              />
            </div>

            <div className="relative">
              <Mail className="absolute left-4 top-4 h-5 w-5 text-slate-500" />

              <input
                value={form.email}
                onChange={(e) =>
                  updateField("email", e.target.value)
                }
                placeholder="Email Address"
                className="w-full rounded-2xl border border-white/10 bg-white/5 py-4 pl-12 pr-4 text-white outline-none backdrop-blur-xl transition-all focus:border-indigo-400"
              />
            </div>

            <textarea
              value={form.message}
              onChange={(e) =>
                updateField("message", e.target.value)
              }
              placeholder="Tell us about your campaign"
              rows={5}
              className="w-full rounded-2xl border border-white/10 bg-white/5 p-5 text-white outline-none backdrop-blur-xl transition-all focus:border-indigo-400"
            />

            <button
              type="submit"
              className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-8 py-4 font-semibold text-white transition hover:bg-indigo-500"
            >
              Launch Campaign
              <Send className="h-4 w-4" />
            </button>
          </motion.form>
        </div>

        {/* BILLBOARD EXPERIENCE */}
        <div className="relative flex min-h-[720px] items-end justify-center">
          {/* GROUND */}
          <div className="absolute bottom-0 h-[140px] w-full rounded-[100%] bg-[#101827] blur-2xl" />

          {/* BILLBOARD POLE */}
          <motion.div
            initial={{ y: -400, rotate: -10, opacity: 0 }}
            animate={billboardControls}
            className="absolute bottom-[110px] h-[380px] w-[24px] rounded-full bg-gradient-to-b from-slate-300 to-slate-700 shadow-2xl"
          />

          {/* BILLBOARD */}
          <motion.div
            initial={{ y: -500, rotate: -6, opacity: 0 }}
            animate={billboardControls}
            className="absolute bottom-[380px] h-[260px] w-[520px] overflow-hidden rounded-[32px] border border-white/10 bg-[#0b1220] shadow-[0_40px_120px_rgba(0,0,0,0.45)]"
          >
            {/* LIGHTS */}
            <AnimatePresence>
              {sent && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-[radial-gradient(circle,rgba(99,102,241,0.45),transparent_60%)]"
                />
              )}
            </AnimatePresence>

            {/* POSTER */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{
                scaleX: interactionStarted ? 1 : 0.08
              }}
              transition={{ duration: 1 }}
              className="absolute inset-5 origin-left rounded-[24px] bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500"
            />

            {/* CONTENT */}
            <div className="relative z-20 flex h-full flex-col justify-between p-8">
              {!sent ? (
                <>
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.4em] text-white/60">
                      LIVE CAMPAIGN PREVIEW
                    </p>

                    <h3 className="mt-6 text-5xl font-black leading-none text-white">
                      {form.company || "YOUR BRAND"}
                    </h3>

                    <p className="mt-6 max-w-sm text-lg leading-relaxed text-white/80">
                      {form.message ||
                        "Your campaign begins here."}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-white/50">
                        Powered By
                      </p>

                      <p className="mt-2 text-2xl font-black text-white">
                        FRIENDS ADV
                      </p>
                    </div>

                    <div className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-xl">
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

                  <p className="mt-8 text-6xl font-black text-white">
                    FRIENDS ADV
                  </p>

                  <p className="mt-4 text-2xl font-medium text-white/80">
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
                    <div className="absolute bottom-0 left-1/2 h-[180px] w-[10px] -translate-x-1/2 rounded-full bg-slate-300">
                      {Array.from({ length: 7 }).map((_, i) => (
                        <div
                          key={i}
                          className="absolute left-1/2 h-[4px] w-[34px] -translate-x-1/2 rounded-full bg-slate-400"
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
                          className="absolute -top-10 left-8 h-10 w-16 origin-left rounded-md border border-white/20 bg-white/70 backdrop-blur"
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
                          className="absolute -top-1 left-5 h-10 w-[5px] origin-bottom rounded-full bg-slate-200"
                        />

                        {/* HEAD */}
                        <div className="h-8 w-8 rounded-full bg-slate-100 shadow-md" />

                        {/* BODY */}
                        <div className="mt-1 h-14 w-10 rounded-t-full rounded-b-2xl bg-amber-400 shadow-lg" />

                        {/* LEGS */}
                        <div className="mt-1 flex gap-1">
                          <div className="h-8 w-[5px] rounded-full bg-slate-300" />
                          <div className="h-8 w-[5px] rounded-full bg-slate-300" />
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
              animate={{ opacity: [0.6, 0], scale: 2.2 }}
              transition={{ duration: 1.4 }}
              className="absolute bottom-[80px] h-[180px] w-[180px] rounded-full bg-white/10 blur-3xl"
            />
          )}
        </div>
      </div>
    </section>
  );
}

