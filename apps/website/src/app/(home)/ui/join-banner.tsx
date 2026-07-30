// export default function JoinBanner() {
//   return (
//     <div className="bg-join bg-no-repeat bg-cover text-white flex flex-col gap-4 items-center px-5 xs:px-16 py-10 ">
//       <h1 className="text-3xl xs:text-4xl font-bold">Join our team</h1>
//       <h4 className="text-center text-base xs:text-lg mb-6 hidden md:block">
//         We are always in search for passionate members to become part of our
//         team. Team members receive certificates that can be showcased while
//         applying to universities. Contact us via our email below.
//       </h4>
//       <h3 className="text-center text-lg mb-6 md:hidden">
//         We&apos;re seeking passionate members for our team. You&apos;ll receive
//         certificates for university applications. Contact us via email below.
//       </h3>
//       <div className="flex gap-4 flex-col sm:flex-row items-center">
//         <div className=" flex gap-2 bg-cy-100 w-max text-black justify-center items-center rounded-2xl  p-2">
//           <div className="xs:w-6 xs:h-6 w-4 h-4 bg-cy-300 rounded-full"></div>
//           <h5 className="text-lg xs:text-xl">r.alevelserver@gmail.com</h5>
//         </div>
//         <div className=" flex gap-2 bg-cy-100 w-max text-black justify-center items-center rounded-2xl  p-2">
//           <div className="xs:w-6 xs:h-6 w-4 h-4 bg-cy-300 rounded-full"></div>
//           <h4 className="text-lg xs:text-xl">
//             <a
//               href=" https://discord.com/users/1058932081629069363"
//               target="_blank"
//             >
//               Vasumitra
//             </a>
//           </h4>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import { easeInOut, motion, useAnimation } from "framer-motion";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";

export default function JoinBanner() {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.35, // triggers when ~35% visible
  });

  useEffect(() => {
    if (inView) controls.start("visible");
  }, [inView, controls]);

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (delay = 0) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay,
        duration: 0.8,
        ease: easeInOut,
      },
    }),
  };

  return (
    <div
      ref={ref}
      className="relative text-white flex flex-col gap-6 items-center px-6 xs:px-16 py-16 overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #1E88E5 0%, #1565C0 50%, #0D47A1 100%)",
      }}
    >
      {/* Animated background light sweep */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
        animate={{ x: ["-100%", "100%"] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Heading */}
      <motion.h1
        variants={fadeUp}
        initial="hidden"
        animate={controls}
        custom={0}
        className="text-4xl md:text-5xl font-extrabold text-center tracking-tight z-10"
      >
        Join <span className="text-cy-200">Our Team</span>
      </motion.h1>

      {/* Subheading */}
      <motion.p
        variants={fadeUp}
        initial="hidden"
        animate={controls}
        custom={0.2}
        className="text-center text-lg max-w-3xl text-white/90 z-10 leading-relaxed"
      >
        We’re always looking for passionate members to help our community grow.{" "}
        <span className="text-cy-200 font-semibold">
          Team members receive official certificates
        </span>{" "}
        that can strengthen your university applications. Contact us below to
        join our amazing team.
      </motion.p>

      {/* Contact bubbles */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate={controls}
        custom={0.4}
        className="flex gap-5 flex-col sm:flex-row items-center z-10 mt-4"
      >
        {/* Email bubble */}
        <motion.a
          whileHover={{ scale: 1.05, y: -2 }}
          transition={{ type: "spring", stiffness: 300 }}
          href="mailto:r.alevelserver@gmail.com"
          className="flex gap-3 bg-white/20 backdrop-blur-md border border-white/30 w-max text-white justify-center items-center rounded-full px-5 py-3 shadow-md hover:shadow-xl transition-all duration-300"
        >
          <div className="w-4 h-4 xs:w-5 xs:h-5 bg-cy-300 rounded-full shadow-sm"></div>
          <span className="text-base xs:text-lg font-medium">
            support@ralevel.com
          </span>
        </motion.a>

        {/* Discord bubble */}
        <motion.a
          whileHover={{ scale: 1.05, y: -2 }}
          transition={{ type: "spring", stiffness: 300 }}
          href="https://discord.com/users/1058932081629069363"
          target="_blank"
          className="flex gap-3 bg-white/20 backdrop-blur-md border border-white/30 w-max text-white justify-center items-center rounded-full px-5 py-3 shadow-md hover:shadow-xl transition-all duration-300"
        >
          <div className="w-4 h-4 xs:w-5 xs:h-5 bg-cy-300 rounded-full shadow-sm"></div>
          <span className="text-base xs:text-lg font-medium">Vasumitra</span>
        </motion.a>
      </motion.div>

      {/* Floating particles (subtle dots in background) */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(25)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/30 rounded-full"
            initial={{
              x: Math.random() * 100 + "%",
              y: Math.random() * 100 + "%",
              opacity: 0.4,
            }}
            animate={{
              y: ["0%", "-20%"],
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{
              duration: 6 + Math.random() * 4,
              repeat: Infinity,
              repeatType: "mirror",
              delay: Math.random() / 4,
            }}
          />
        ))}
      </div>
    </div>
  );
}
