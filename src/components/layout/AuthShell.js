"use client";

import { ShieldCheck, LayoutGrid, Compass, MessageCircle, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { useClerk, useAuth } from '@clerk/nextjs';

const features = [
  { icon: ShieldCheck, text: "Connect with Verified Students Only" },
  { icon: LayoutGrid, text: "For Every Campus Update, One Feed" },
  { icon: Compass, text: "Know Your Campus More Than You Ever Knew" },
  { icon: MessageCircle, text: "Talk to a Real Student, Before You Choose" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.6 // 0.6s delay between each line appearing
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.6, type: "spring", stiffness: 200, damping: 20 } 
  }
};

export default function AuthShell({ children }) {
  const { signOut } = useClerk();
  const { userId } = useAuth();

  return (
    <div 
      className="min-h-screen flex flex-col lg:flex-row relative bg-cover bg-bottom bg-fixed"
      style={{ backgroundImage: "url('/photos/bg.jpg')" }}
    >
      {/* Optional: Floating Sign Out Button for authenticated users stuck in onboarding */}
      {userId && (
        <button 
          onClick={() => signOut({ redirectUrl: '/sign-in' })}
          className="absolute top-6 right-6 lg:top-8 lg:right-12 z-50 flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-white/40 text-gray-700 font-bold text-sm rounded-xl hover:bg-white transition-all shadow-sm"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      )}

      {/* Left side - Branding / Hero */}
      <div className="w-full lg:w-[55%] flex flex-col justify-start pt-12 pb-8 px-8 sm:px-12 lg:px-16 lg:pt-20 xl:px-24 xl:pt-24 relative z-10">
        <div className="flex items-center mb-8 lg:mb-10 select-none">
          <img 
            src="/photos/full-logo.png" 
            alt="Campus Collab" 
            className="h-10 sm:h-12 lg:h-14 w-auto object-contain drop-shadow-sm"
          />
        </div>
        
        {/* Adjusted size and whitespace to ensure it stays on one line */}
        <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] xl:text-[3.75rem] font-extrabold text-[#0B1120] leading-[1.15] tracking-tight drop-shadow-sm mb-10">
          <span className="whitespace-nowrap">Meet Your <span className="bg-gradient-to-r from-[#5B35E8] via-[#8B5CF6] to-[#D946EF] bg-clip-text text-transparent">Campus.</span></span><br/>
          <span className="whitespace-nowrap">Build Your <span className="bg-gradient-to-r from-[#5B35E8] via-[#8B5CF6] to-[#D946EF] bg-clip-text text-transparent">Community.</span></span>
        </h1>

        {/* Stacking Animated Feature List */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-5 sm:gap-6 max-w-2xl"
        >
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.div 
                key={idx} 
                variants={itemVariants}
                className="flex items-center gap-4 sm:gap-5"
              >
                <div className="p-3 sm:p-3.5 rounded-full bg-white/60 backdrop-blur-md shadow-sm border border-white/50 shrink-0">
                  <Icon className="w-5 h-5 sm:w-7 sm:h-7 text-[#5B35E8]" strokeWidth={2.5} />
                </div>
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#17203D] leading-snug drop-shadow-sm">
                  {feature.text}
                </h3>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Right side - Login Card Container */}
      <div className="w-full lg:w-[45%] flex items-center justify-center p-4 sm:p-8 lg:p-12 relative z-10">
        <div className="w-full max-w-[560px] flex justify-center">
          {children}
        </div>
      </div>
    </div>
  );
}
