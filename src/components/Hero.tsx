import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative pt-16 md:pt-32 pb-24 overflow-hidden">
      {/* Professional Background Architecture */}
      <div className="absolute inset-0 -z-10 bg-background">
        {/* Animated Gradient Orbs - Simplified for Mobile */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div 
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[-10%] left-[-10%] w-[300px] md:w-[800px] h-[300px] md:h-[800px] bg-brand/30 blur-[80px] md:blur-[160px] rounded-full"
          />
          <motion.div 
            animate={{ 
              scale: [1.1, 1, 1.1],
              opacity: [0.05, 0.15, 0.05],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-[-10%] right-[-10%] w-[400px] md:w-[900px] h-[400px] md:h-[900px] bg-blue-500/10 blur-[100px] md:blur-[180px] rounded-full"
          />
          
          {/* Animated Light Sweep (Glass Effect) - Hidden on Mobile */}
          <motion.div
            animate={{ 
              translateX: ['-100%', '300%'],
              opacity: [0, 0.1, 0]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="hidden md:block absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent skew-x-[35deg] pointer-events-none"
          />

          {/* Floating Geometric Elements (Vertex Style) - Reduced count/complexity on mobile */}
          <motion.div
            animate={{ rotate: [0, 360], y: [0, -20, 0] }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            className="absolute top-[15%] left-[10%] opacity-[0.02] md:opacity-[0.03]"
          >
            <svg width="100" height="100" className="md:w-[200px] md:h-[200px]" viewBox="0 0 100 100">
              <path d="M20,20 L50,80 L80,20 Z" fill="white" stroke="white" strokeWidth="1" />
            </svg>
          </motion.div>
          <motion.div
            animate={{ rotate: [360, 0], x: [0, 20, 0] }}
            transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-[10%] right-[15%] opacity-[0.02] md:opacity-[0.03]"
          >
            <svg width="80" height="80" className="md:w-[150px] md:h-[150px]" viewBox="0 0 100 100">
              <path d="M0,50 L50,0 L100,50 L50,100 Z" fill="white" stroke="white" strokeWidth="1" />
            </svg>
          </motion.div>
        </div>

        {/* Technical Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ 
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px',
            maskImage: 'radial-gradient(circle at center, black, transparent 80%)'
          }}
        />

        {/* Refined Noise and Vignette */}
        <div className="absolute inset-0 bg-[#0d1117] [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] pointer-events-none" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] contrast-150 brightness-100 pointer-events-none" />
      </div>

      <div className="container mx-auto px-6 text-center relative z-10">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-5xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9]"
        >
          SMART JOB <br />
          <span className="text-brand italic glow-text">MATCHING.</span>
        </motion.h1>


        {/* Button removed as per user request */}
      </div>
    </section>
  );
}