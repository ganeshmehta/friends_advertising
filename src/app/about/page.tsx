"use client";

import { motion } from "framer-motion";
import { Users, Target, Award, MapPin, Quote, Building2, Briefcase, Handshake } from "lucide-react";

const testimonials = [
  {
    name: "ABP Majha",
    quote: "Friends Advertising has been instrumental in enhancing our visibility in Maharashtra. Their strategic hoarding placements and professional execution have helped us reach our target audience effectively.",
    role: "Media Partner"
  },
  {
    name: "PVR Cinemas",
    quote: "We partnered with Friends Advertising for outdoor advertising to promote our new cinema releases. Their attention to detail and high-quality printing made our campaigns truly stand out.",
    role: "Entertainment Partner"
  },
  {
    name: "Metro Group",
    quote: "At Metro Group, we believe in building iconic structures, and Friends Advertising helped us do just that through their creative and high-impact signage solutions.",
    role: "Real Estate Partner"
  },
  {
    name: "Copper Corp",
    quote: "We've been working with Friends Advertising for years, and their expertise in creating large-scale signage and promotional banners has always exceeded our expectations.",
    role: "Industrial Partner"
  }
];

const partners = [
  "Aaj Tak", "Zee 24 Taas", "Lok Shahi", "ABP Majha", "Star Pravah",
  "Le Meridien", "Keys Prima Hotels", "PNB", "Canara Bank",
  "Tata Motors", "PVR Cinemas", "Nyati", "Square Circle Outdoors"
];

const realEstateClients = [
  "Metro Group", "Satyam Developers", "Paradise Group", "Raheja Universal",
  "Arihant Superstructures", "Goel Ganga", "Juhi Developers", "S.M. Hitech",
  "Sai Yogi", "Gajra", "Gami Tiara", "GEECEE", "Kamdhenu", "Mahaavir",
  "Today Group", "HP (Hindustan Petroleum)"
];

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 }
};

export default function AboutPage() {
  return (
    <main className="flex flex-col w-full overflow-hidden pt-10 pb-20 bg-[var(--background)]">
      {/* Hero Section */}
      <section className="relative px-4 py-20 text-center">
        <div className="absolute inset-0 z-0 opacity-40 pointer-events-none flex justify-center">
          <div className="w-[600px] h-[600px] bg-[var(--neon-purple)] rounded-full mix-blend-multiply filter blur-[128px] opacity-[0.05]"></div>
        </div>
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-7xl font-black mb-6 tracking-tight relative z-10 text-[#1d1d1f]"
        >
          ABOUT <span className="text-[var(--neon-blue)]">US</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-lg md:text-xl text-slate-500 max-w-3xl mx-auto relative z-10 font-medium"
        >
          Welcome to Friends Advertising, a leading outdoor advertising company based in Mumbai and Satara. We specialize in designing, printing, and installing eye-catching hoardings that help businesses stand out.
        </motion.p>
      </section>

      {/* Content Section */}
      <section className="py-16 px-4 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
        <motion.div 
          {...fadeInUp}
          className="space-y-6"
        >
          <h2 className="text-3xl font-black flex items-center gap-3 text-[#1d1d1f] tracking-tight">
            <Target className="text-[var(--neon-blue)]" />
            The Complete Outdoor Solution
          </h2>
          <p className="text-slate-500 leading-relaxed font-medium">
            With a commitment to innovation and excellence, we provide customized advertising solutions for billboards, shop signage, promotional banners, event displays, and outdoor hoardings. 
          </p>
          <p className="text-slate-500 leading-relaxed font-medium">
            Our advanced printing technology and creative expertise ensure that every project leaves a lasting impression. At Friends Advertising, we believe in delivering affordable, effective, and impactful advertising. 
          </p>
          <div className="p-5 rounded-2xl border-l-4 border-[var(--neon-blue)] bg-slate-50">
            <p className="text-[var(--neon-blue)] font-bold text-lg italic">
              "Your Brand, Our Creativity – Let’s Make an Impact Together!"
            </p>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 gap-4"
        >
          {[
            { icon: Users, label: "Associated Brands", value: "250+" },
            { icon: Target, label: "Campaigns", value: "5000+" },
            { icon: Award, label: "Awards Achieved", value: "12" },
            { icon: MapPin, label: "Team Members", value: "50+" }
          ].map((stat, i) => (
            <div key={i} className="glass p-6 rounded-2xl flex flex-col items-center justify-center text-center hover:border-black/15 hover:shadow-md transition-all duration-300">
              <stat.icon className="w-8 h-8 text-[var(--neon-purple)] mb-4" />
              <div className="text-3xl font-black mb-1 text-[#1d1d1f]">{stat.value}</div>
              <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="text-4xl font-black mb-4 text-[#1d1d1f] tracking-tight">CLIENT <span className="text-[var(--neon-purple)]">TESTIMONIALS</span></h2>
            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-[var(--neon-purple)] to-transparent mx-auto"></div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((t, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass p-8 rounded-[32px] relative overflow-hidden group hover:border-black/15 hover:shadow-lg transition-all duration-500"
              >
                <Quote className="absolute -top-4 -right-4 w-24 h-24 text-black/[0.01] group-hover:text-[var(--neon-purple)]/[0.04] transition-colors" />
                <p className="text-slate-600 italic mb-6 relative z-10 leading-relaxed text-lg font-medium">
                  "{t.quote}"
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--neon-blue)] to-[var(--neon-purple)] flex items-center justify-center font-bold text-xl text-white">
                    {t.name[0]}
                  </div>
                  <div>
                    <h4 className="font-bold text-[#1d1d1f]">{t.name}</h4>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="text-4xl font-black mb-4 flex items-center justify-center gap-3 text-[#1d1d1f] tracking-tight">
              <Handshake className="text-[var(--neon-blue)]" />
              OUR <span className="text-[var(--neon-blue)]">PARTNERS</span>
            </h2>
            <p className="text-slate-400 font-medium">Trusted by leading media houses and hospitality brands</p>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-4">
            {partners.map((partner, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="px-6 py-3 rounded-full glass border border-black/5 text-sm font-semibold hover:bg-slate-100 hover:border-black/10 transition-all cursor-default text-[#1d1d1f]"
              >
                {partner}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Real Estate Section */}
      <section className="py-20 px-4 relative">
        <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-[var(--neon-blue)] rounded-full filter blur-[160px]"></div>
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="text-4xl font-black mb-4 flex items-center justify-center gap-3 text-[#1d1d1f] tracking-tight">
              <Building2 className="text-[var(--neon-purple)]" />
              REAL ESTATE <span className="text-[var(--neon-purple)]">PORTFOLIO</span>
            </h2>
            <p className="text-slate-400 font-medium">Empowering the skyline with iconic outdoor presence</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {realEstateClients.map((client, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.03 }}
                className="aspect-square flex items-center justify-center text-center p-4 glass rounded-2xl text-[10px] md:text-xs font-bold uppercase tracking-tighter hover:border-black/15 hover:shadow-md hover:scale-105 transition-all group"
              >
                <span className="group-hover:text-[var(--neon-blue)] transition-colors text-[#1d1d1f]">{client}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-4 text-center">
        <motion.div 
          {...fadeInUp}
          className="max-w-3xl mx-auto glass p-12 rounded-[3rem] border border-black/5 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--neon-blue)]/[0.02] to-[var(--neon-purple)]/[0.02]"></div>
          <h2 className="text-3xl md:text-4xl font-black mb-6 relative z-10 text-[#1d1d1f] tracking-tight">READY TO <span className="text-[var(--neon-blue)]">STAND OUT?</span></h2>
          <p className="text-slate-500 mb-8 relative z-10 font-medium">Let's discuss your next campaign and make your brand unforgettable.</p>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-8 py-4 bg-black rounded-full font-bold text-white relative z-10 shadow-sm hover:bg-black/90 tracking-wide text-sm"
          >
            GET IN TOUCH
          </motion.button>
        </motion.div>
      </section>
    </main>
  );
}
