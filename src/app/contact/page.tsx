"use client";

import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send } from "lucide-react";

export default function ContactPage() {
  return (
    <main className="flex flex-col w-full overflow-hidden pt-10 min-h-screen">
      <section className="relative px-4 py-20 text-center">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-7xl font-bold mb-6 tracking-tight relative z-10"
        >
          CONTACT <span className="text-[var(--neon-blue)] neon-text">US</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto relative z-10"
        >
          Ready to elevate your brand visibility? Get in touch with us today for a customized quote.
        </motion.p>
      </section>

      <section className="pb-24 px-4 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
        {/* Contact Info */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="space-y-8"
        >
          <div className="glass p-8 rounded-3xl border border-white/5">
            <h2 className="text-2xl font-bold mb-8">Reach Out Directly</h2>
            
            <div className="space-y-6">
              <a href="mailto:friendsoutdoor@gmail.com" className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[var(--neon-purple)]/20 transition-colors">
                  <Mail className="w-5 h-5 text-gray-400 group-hover:text-[var(--neon-purple)]" />
                </div>
                <div>
                  <div className="text-sm text-gray-500 font-medium">Email Us</div>
                  <div className="text-lg text-white group-hover:text-[var(--neon-purple)] transition-colors">friendsoutdoor@gmail.com</div>
                </div>
              </a>

              <a href="tel:+919890311234" className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[var(--neon-blue)]/20 transition-colors">
                  <Phone className="w-5 h-5 text-gray-400 group-hover:text-[var(--neon-blue)]" />
                </div>
                <div>
                  <div className="text-sm text-gray-500 font-medium">Call Us</div>
                  <div className="text-lg text-white group-hover:text-[var(--neon-blue)] transition-colors">+91 98903 11234</div>
                </div>
              </a>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-gray-400" />
                </div>
                <div>
                  <div className="text-sm text-gray-500 font-medium">Office Address</div>
                  <div className="text-lg text-white">Navi Mumbai, Maharashtra, India</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Contact Form */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <form className="glass p-8 rounded-3xl border border-white/5 space-y-6" onSubmit={(e) => e.preventDefault()}>
            <h2 className="text-2xl font-bold mb-6">Send a Message</h2>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Your Name</label>
              <input type="text" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--neon-blue)] transition-colors" placeholder="John Doe" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Email Address</label>
              <input type="email" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--neon-blue)] transition-colors" placeholder="john@example.com" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Your Message</label>
              <textarea rows={4} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--neon-blue)] transition-colors" placeholder="How can we help you?"></textarea>
            </div>

            <button className="w-full group relative inline-flex items-center justify-center px-8 py-4 font-bold text-black transition-all duration-200 bg-[var(--neon-blue)] rounded-xl hover:shadow-[0_0_20px_rgba(0,243,255,0.4)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--neon-blue)] focus:ring-offset-black">
              Send Message
              <Send className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        </motion.div>
      </section>
    </main>
  );
}
