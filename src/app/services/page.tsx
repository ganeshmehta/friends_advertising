"use client";

import { motion } from "framer-motion";
import { Monitor, Image as ImageIcon, Zap, Flag, Truck, Building } from "lucide-react";

export default function ServicesPage() {
  const services = [
    {
      icon: ImageIcon,
      title: "Flex Board Printing & Installation",
      desc: "Boost Your Brand Visibility – On the Streets, Shops & Skylines! We design, print, and install high-quality flex boards that grab attention immediately.",
      color: "var(--neon-blue)"
    },
    {
      icon: Monitor,
      title: "Vinyl & Digital Printing",
      desc: "High-quality prints for promotional and branding purposes. Perfect for store fronts, glass facades, and indoor promotional campaigns.",
      color: "var(--neon-purple)"
    },
    {
      icon: Zap,
      title: "LED Sign Boards & Glow Signs",
      desc: "Our LED and glow sign boards provide round-the-clock visibility. Stand out even at night with energy-efficient and vibrant backlit boards.",
      color: "var(--neon-blue)"
    },
    {
      icon: Flag,
      title: "Event & Promotional Banners",
      desc: "Custom banners for events, exhibitions, and marketing campaigns. Quick turnaround times without compromising on print quality.",
      color: "var(--neon-purple)"
    },
    {
      icon: Truck,
      title: "Vehicle & Transit Advertising",
      desc: "Branding on cars, buses, and other transport mediums. Turn everyday vehicles into moving billboards that cover the entire city.",
      color: "var(--neon-blue)"
    },
    {
      icon: Building,
      title: "Corporate Branding & Indoor Displays",
      desc: "Office branding, standees, and custom indoor advertisements to enhance your corporate identity and wow your visitors.",
      color: "var(--neon-purple)"
    }
  ];

  return (
    <main className="relative min-h-screen pt-28 pb-20 bg-[var(--background)]">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Unified Header */}
        <div className="mb-20">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-[var(--neon-blue)] font-bold tracking-[0.4em] text-xs uppercase mb-4"
          >
            Capabilities
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-8xl font-black tracking-tight text-[#1d1d1f] mb-6"
          >
            OUR <span className="text-[var(--neon-purple)]">SERVICES</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-500 max-w-2xl leading-relaxed font-medium"
          >
            A comprehensive suite of outdoor and indoor advertising assets engineered for maximum brand penetration and memory recall.
          </motion.p>
        </div>

        {/* Unified Grid Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="group relative"
            >
              <div className="glass h-full p-10 rounded-[32px] border border-black/5 hover:border-black/10 hover:shadow-xl transition-all duration-500 overflow-hidden bg-white">
                <div 
                  className="absolute -right-10 -top-10 w-32 h-32 rounded-full blur-[60px] opacity-[0.04] group-hover:opacity-[0.08] transition-opacity"
                  style={{ backgroundColor: service.color }}
                ></div>
                
                <div className="relative z-10">
                  <div 
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-8 border border-black/5 group-hover:scale-105 transition-transform duration-500"
                    style={{ backgroundColor: `${service.color}08` }}
                  >
                    <service.icon 
                      className="w-8 h-8" 
                      style={{ color: service.color }} 
                    />
                  </div>
                  
                  <h3 className="text-2xl font-black mb-4 tracking-tight text-[#1d1d1f] group-hover:text-black transition-colors">
                    {service.title}
                  </h3>
                  
                  <p className="text-lg text-slate-500 leading-relaxed group-hover:text-slate-700 transition-colors">
                    {service.desc}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
}
