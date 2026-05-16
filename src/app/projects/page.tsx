"use client";

import { motion } from "framer-motion";
import { MapPin, TrendingUp } from "lucide-react";

export default function ProjectsPage() {
  const projects = [
    {
      title: "Chowk Karjat Road, MH",
      desc: "40 x 20 Front and Back Display. Strategic placement capturing bidirectional traffic on the busy Chowk Karjat route.",
      size: "40x20",
    },
    {
      title: "Palaspe Phata, MH",
      desc: "Traffic from Karjat, Khopoli, Goa, Pune to Mumbai. A massive billboard ensuring maximum visibility for incoming city traffic.",
      size: "40x40",
    },
    {
      title: "Opp. Khidkaleshwar Mandir",
      desc: "From Kalyan to Vashi. High-impact square hoarding targeting daily commuters and local traffic.",
      size: "50x50",
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
          OUR <span className="text-[var(--neon-blue)] neon-text">PROJECTS</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto relative z-10"
        >
          Showcasing the power of our outdoor advertising services across key locations in Maharashtra.
        </motion.p>
      </section>

      {/* Projects Grid */}
      <section className="pb-16 px-4 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
        {projects.map((project, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="glass rounded-2xl overflow-hidden group border border-white/10"
          >
            {/* Placeholder for project image, could use a 3D generic billboard or standard image */}
            <div className="h-48 bg-[#111] relative flex items-center justify-center border-b border-white/10 overflow-hidden">
              <div className="absolute inset-0 bg-[var(--neon-purple)] opacity-10 group-hover:opacity-20 transition-opacity"></div>
              <MapPin className="w-12 h-12 text-gray-600 group-hover:text-[var(--neon-blue)] transition-colors" />
            </div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold">{project.title}</h3>
                <span className="text-xs font-mono bg-[var(--neon-blue)]/10 text-[var(--neon-blue)] px-2 py-1 rounded">
                  {project.size}
                </span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">{project.desc}</p>
            </div>
          </motion.div>
        ))}
      </section>

      {/* Success Story */}
      <section className="py-20 px-4 bg-black/50 border-t border-white/5 relative z-10">
        <div className="max-w-5xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass p-8 md:p-12 rounded-3xl border border-[var(--neon-purple)]/30 relative overflow-hidden"
          >
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-[var(--neon-purple)] rounded-full filter blur-[100px] opacity-20"></div>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-[var(--neon-purple)]/20 flex items-center justify-center text-[var(--neon-purple)]">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold">Featured Success Story</h2>
            </div>
            
            <h3 className="text-xl font-bold text-white mb-4">Retail Business – Increased Foot Traffic</h3>
            <p className="text-gray-300 leading-relaxed mb-6">
              A local retail business in Mumbai was struggling to stand out amidst fierce competition in a high-traffic area. We recommended a large-format flex board featuring a vibrant, attention-grabbing design. Installed at a prime location, the strategic placement worked wonders.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                "40% increase in foot traffic",
                "Boost in sales during promos",
                "Enhanced brand recognition"
              ].map((result, i) => (
                <div key={i} className="bg-black/50 p-4 rounded-xl border border-white/5 text-center text-sm font-medium text-[var(--neon-blue)]">
                  {result}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
