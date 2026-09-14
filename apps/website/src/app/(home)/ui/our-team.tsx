"use client";

import type { TeamMember } from "@/lib/data/team";
import { resolveTeamImage } from "@/lib/resolveTeamImage";
import { easeInOut, motion, useAnimation } from "framer-motion";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";

const getGradient = (role: string) => {
  const r = role.toLowerCase();
  if (r.includes("leader")) return "from-indigo-300 to-purple-200";
  if (r.includes("chief")) return "from-blue-200 to-cyan-100";
  if (r.includes("admin")) return "from-blue-200 to-cyan-100";
  return "from-gray-100 to-blue-50";
};

const CardInfo = function ({
  name,
  role,
  imgSrc,
}: {
  name: string;
  role: string;
  imgSrc?: string;
}) {
  const gradient = getGradient(role);

  return (
    <motion.div
      variants={cardVariants}
      className={`flex-col flex bg-gradient-to-b ${gradient}
        p-8 max-lg:p-4 max-xxs:p-3 rounded-xl justify-center items-center 
        w-full max-h-72 shadow-sm hover:shadow-lg transition-all duration-300`}
    >
      <div className="w-44 max-lg:w-32 max-xs:w-28 max-xl:w-36 mb-2 flex justify-center">
        <img
          src={resolveTeamImage(imgSrc, name)}
          alt={name}
          className="w-32 h-32 rounded-full border-4 border-white/60 shadow-sm group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="flex flex-col items-center">
        <div className="font-semibold text-lg max-xs:text-base text-gray-800">
          {name}
        </div>
        <div className="text-sm tracking-widest max-sm:tracking-wide text-gray-600 text-center">
          {role}
        </div>
      </div>
    </motion.div>
  );
};

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.2 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: easeInOut },
  },
};

const textVariants = {
  hidden: { opacity: 0, y: 25 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: easeInOut },
  },
};

export default function OurTeam({ members }: { members: TeamMember[] }) {
  const controls = useAnimation();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.2 });

  useEffect(() => {
    if (inView) controls.start("visible");
  }, [controls, inView]);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={containerVariants}
      className="flex flex-col items-center mb-52 px-5"
    >
      <motion.div
        variants={textVariants}
        className="flex flex-col items-center mb-20 text-center"
      >
        <h1 className="font-bold text-4xl text-gray-700 mb-2">
          Our Team Members
        </h1>
        <p className="text-gray-500 max-w-xl">
          This is our amazing team. They take care of the community to maintain
          a safe environment for learning and growth.
        </p>
      </motion.div>

      {members.length > 0 && (
        <motion.div
          variants={containerVariants}
          className="w-4/5 max-xs:w-full max-lg:w-11/12 grid justify-items-center gap-y-5 gap-x-7 max-xxs:gap-y-3 max-lg:gap-x-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        >
          {members.map((member) => (
            <CardInfo
              key={`${member.discordId}-${member.name}`}
              name={member.name}
              role={member.title}
              imgSrc={member.imgSrc}
            />
          ))}
        </motion.div>
      )}

      <motion.div
        variants={textVariants}
        className="mt-10 text-blue-600 underline hover:text-purple-700 transition-colors"
      >
        <a href="/team">View all</a>
      </motion.div>
    </motion.div>
  );
}
