"use client";
import { motion, Variants } from "framer-motion";
import Link from "next/link";

// Floating card animation
const floating: Variants = {
  rest: { y: 0 },
  float: {
    y: [-8, 6, -6, 8, 0],
    transition: {
      duration: 12,
      ease: "easeInOut",
      repeat: Infinity,
      repeatType: "loop" as const,
    },
  },
};

// Button pulse animation
const pulse: Variants = {
  rest: { scale: 1 },
  pulse: {
    scale: [1, 1.05, 0.98, 1],
    transition: {
      duration: 2.5,
      ease: "easeInOut",
      repeat: Infinity,
      repeatType: "loop" as const,
    },
  },
};

// Slow orbiting background orbs
const slowSpin: Variants = {
  animate: {
    rotate: [0, 360],
    transition: {
      duration: 60,
      ease: "linear",
      repeat: Infinity,
    },
  },
};

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-[#081227] via-[#091b3a] to-[#0b1730] relative overflow-hidden text-white">
      {/* Background motion layer */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        variants={slowSpin}
        animate="animate"
      >
        {/* left orb */}
        <div
          className="absolute -top-24 -left-32 w-[520px] h-[520px] rounded-full opacity-30 blur-3xl"
          style={{
            background: "linear-gradient(135deg,#6b4cff,#1fa6a6)",
          }}
        />
        {/* right orb */}
        <div
          className="absolute bottom-0 -right-24 w-[400px] h-[400px] rounded-full opacity-25 blur-2xl"
          style={{
            background: "linear-gradient(180deg,#b46cff,#1fa6a6)",
          }}
        />
      </motion.div>

      {/* Floating hero card */}
      <motion.div
        className="relative z-10 w-[min(90%,700px)] px-8 py-14 rounded-3xl backdrop-blur-[10px] 
                   bg-[rgba(6,18,36,0.52)] border border-[rgba(255,255,255,0.08)] 
                   shadow-[0_20px_60px_rgba(3,8,20,0.6)] flex flex-col items-center text-center"
        variants={floating}
        initial="rest"
        animate="float"
      >
        {/* Large glowing 404 text */}
        <motion.h1
          className="text-[clamp(56px,10vw,100px)] font-extrabold leading-none tracking-tight"
          style={{
            textShadow: "0 0 20px rgba(31,166,166,0.35)",
            fontFamily:
              "'Poppins', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
          }}
        >
          404
        </motion.h1>

        <h2 className="mt-4 text-2xl font-semibold tracking-tight text-white/95">
          Page Not Found
        </h2>

        <p className="mt-3 text-base text-slate-300/90 max-w-md leading-relaxed">
          Seems like you took a wrong turn — but don’t worry! Even A Level
          students get lost sometimes. Let’s get you back on track.
        </p>

        <motion.div
          className="mt-8"
          variants={pulse}
          initial="rest"
          animate="pulse"
          whileHover={{ scale: 1.08 }}
        >
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold 
                       text-white text-sm bg-gradient-to-b from-[#1fa6a6]/95 to-[#168c8c]/95 
                       shadow-lg hover:brightness-110 transition"
          >
            ← Go Back Home
          </Link>
        </motion.div>

        {/* playful floating notebook */}
        <motion.div
          className="absolute -bottom-10 right-10"
          initial={{ rotate: -6 }}
          animate={{
            rotate: [-6, -3, -8, -4, -6],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        >
          <div
            className="w-36 h-28 rounded-xl border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.03)] 
                          shadow-[0_8px_24px_rgba(6,18,36,0.5)] flex items-center justify-center"
          >
            <svg
              width="42"
              height="42"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <rect
                x="3"
                y="7"
                width="14"
                height="12"
                rx="2"
                stroke="rgba(255,255,255,0.85)"
                strokeWidth="1.2"
              />
              <path
                d="M7 7V5a4 4 0 018 0v2"
                stroke="rgba(255,255,255,0.85)"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle
                cx="18.2"
                cy="9.8"
                r="0.9"
                fill="rgba(255,255,255,0.85)"
              />
            </svg>
          </div>
        </motion.div>
      </motion.div>

      {/* Subtext footer */}
      <div className="absolute bottom-6 w-full flex justify-center">
        <p className="text-sm text-slate-400/60">
          Can’t find what you’re looking for?{" "}
          <Link
            href="/resources"
            className="underline decoration-teal-400/40 hover:text-teal-300"
          >
            Explore our resources
          </Link>
        </p>
      </div>
    </div>
  );
}
