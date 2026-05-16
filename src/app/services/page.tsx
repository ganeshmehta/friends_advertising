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
    <main className="flex flex-col w-full overflow-hidden pt-10 min-h-screen">
      <section className="relative px-4 py-20 text-center">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-7xl font-bold mb-6 tracking-tight relative z-10"
        >
          OUR <span className="text-[var(--neon-purple)] neon-text">SERVICES</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto relative z-10"
        >
          We Provide the Best Out-Of-Home (OOH) Assets For Your Business.
        </motion.p>
      </section>

      <section className="pb-24 px-4 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
        {services.map((service, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="glass p-8 rounded-2xl flex flex-col group hover:-translate-y-2 transition-all duration-300 relative overflow-hidden"
          >
            <div 
              className="absolute -right-10 -top-10 w-32 h-32 rounded-full blur-[50px] opacity-20 group-hover:opacity-40 transition-opacity"
              style={{ backgroundColor: service.color }}
            ></div>
            <service.icon 
              className="w-10 h-10 mb-6 transition-transform group-hover:scale-110" 
              style={{ color: service.color }} 
            />
            <h3 className="text-2xl font-bold mb-4">{service.title}</h3>
            <p className="text-gray-400 leading-relaxed flex-1">{service.desc}</p>
          </motion.div>
        ))}
      </section>
    </main>
  );
}
