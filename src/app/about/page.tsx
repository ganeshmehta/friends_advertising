"use client";

import { motion } from "framer-motion";
import { Users, Target, Award, MapPin } from "lucide-react";

export default function AboutPage() {
  return (
    <main className="flex flex-col w-full overflow-hidden pt-10">
      {/* Hero Section */}
      <section className="relative px-4 py-20 text-center">
        <div className="absolute inset-0 z-0 opacity-40 pointer-events-none flex justify-center">
          <div className="w-[600px] h-[600px] bg-[var(--neon-purple)] rounded-full mix-blend-multiply filter blur-[128px] opacity-20"></div>
        </div>
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-7xl font-bold mb-6 tracking-tight relative z-10"
        >
          ABOUT <span className="text-[var(--neon-blue)] neon-text">US</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto relative z-10"
        >
          Welcome to Friends Advertising, a leading outdoor advertising company based in Mumbai and Satara. We specialize in designing, printing, and installing eye-catching hoardings that help businesses stand out.
        </motion.p>
      </section>

      {/* Content Section */}
      <section className="py-16 px-4 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="space-y-6"
        >
          <h2 className="text-3xl font-bold">The Complete Outdoor Solution</h2>
          <p className="text-gray-400 leading-relaxed">
            With a commitment to innovation and excellence, we provide customized advertising solutions for billboards, shop signage, promotional banners, event displays, and outdoor hoardings. 
          </p>
          <p className="text-gray-400 leading-relaxed">
            Our advanced printing technology and creative expertise ensure that every project leaves a lasting impression. At Friends Advertising, we believe in delivering affordable, effective, and impactful advertising. 
          </p>
          <p className="text-[var(--neon-blue)] font-medium text-lg mt-4">
            "Your Brand, Our Creativity – Let’s Make an Impact Together!"
          </p>
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
            <div key={i} className="glass p-6 rounded-2xl flex flex-col items-center justify-center text-center">
              <stat.icon className="w-8 h-8 text-[var(--neon-purple)] mb-4" />
              <div className="text-3xl font-black mb-1">{stat.value}</div>
              <div className="text-xs text-gray-500 uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </section>

    </main>
  );
}
