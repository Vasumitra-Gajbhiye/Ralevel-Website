"use client";

import type { TeamMember } from "@/lib/data/team";
import { motion, Variants } from "framer-motion";
import { FaDiscord, FaLinkedin } from "react-icons/fa";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: (i as number) * 0.08,
      duration: 0.6,
      ease: [0.25, 0.1, 0.25, 1],
    },
  }),
};

const getGradient = (title: string) => {
  const role = title.toLowerCase();
  if (role.includes("leader")) return "from-indigo-300 to-purple-200";
  if (role.includes("admin")) return "from-blue-200 to-cyan-100";
  if (role.includes("sr")) return "from-teal-200 to-emerald-100";
  if (role.includes("jr")) return "from-green-200 to-yellow-50";
  return "from-gray-100 to-blue-50";
};

const Profile = ({
  name,
  title,
  discordId,
  linkedin,
  imgSrc,
  i,
}: TeamMember & { i: number }) => {
  const gradient = getGradient(title);

  return (
    <motion.div
      custom={i}
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      whileHover={{ y: -6, transition: { duration: 0.3 } }}
      className={`relative flex flex-col items-center bg-gradient-to-b ${gradient} 
        p-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 w-[260px] overflow-hidden group`}
    >
      <motion.div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 blur-xl"
        style={{
          backgroundImage:
            "linear-gradient(120deg, rgba(255,255,255,0.2), transparent, rgba(255,255,255,0.1))",
          backgroundSize: "200% 200%",
        }}
        animate={{
          backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {Array.from({ length: 5 }).map((_, idx) => (
        <motion.span
          key={idx}
          className="absolute bg-white rounded-full opacity-60"
          style={{
            width: `${Math.random() * 3 + 2}px`,
            height: `${Math.random() * 3 + 2}px`,
            top: `${Math.random() * 90}%`,
            left: `${Math.random() * 90}%`,
            filter: "blur(0.5px)",
          }}
          animate={{
            y: [0, -8, 0],
            opacity: [0.3, 1, 0.3],
          }}
          transition={{
            duration: 3 + Math.random() * 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 2,
          }}
        />
      ))}

      <div className="relative mb-4 z-10">
        <img
          src={
            imgSrc
              ? imgSrc
              : `https://api.dicebear.com/9.x/avataaars/svg?seed=encodeURIComponent(${name})`
          }
          alt={name}
          className="w-32 h-32 rounded-full border-4 border-white/60 shadow-sm group-hover:scale-105 transition-transform duration-300"
        />

        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      <h2 className="text-lg font-semibold text-gray-800 z-10 text-center">
        {name}
      </h2>
      <h3 className="text-sm text-gray-700 mb-4 z-10 font-medium">{title}</h3>

      <div className="flex gap-3 z-10">
        <motion.a
          href={`https://discord.com/users/${discordId}`}
          target="_blank"
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.95 }}
          className="p-3 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 
                     text-white shadow-md hover:shadow-blue-400/50 transition-all duration-300"
        >
          <FaDiscord size={20} />
        </motion.a>

        {linkedin && (
          <motion.a
            href={linkedin}
            target="_blank"
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.95 }}
            className="p-3 rounded-full bg-gradient-to-br from-sky-500 to-blue-400 
                       text-white shadow-md hover:shadow-sky-300/50 transition-all duration-300"
          >
            <FaLinkedin size={18} />
          </motion.a>
        )}
      </div>

      <motion.div
        className="absolute inset-0"
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.div>
  );
};

export default function TeamClient({ members }: { members: TeamMember[] }) {
  return (
    <div className="my-24 px-10 md:px-16 relative">
      <h1 className="text-center text-5xl font-bold mb-14 bg-gradient-to-r from-blue-600 to-indigo-400 bg-clip-text text-transparent drop-shadow-sm">
        Our Team
      </h1>

      <div
        className="grid justify-items-center gap-y-12 gap-x-8"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))" }}
      >
        {members.map((member, i) => (
          <Profile
            key={`${member.discordId}-${i}`}
            name={member.name}
            title={member.title}
            discordId={member.discordId}
            linkedin={member.linkedin}
            imgSrc={member.imgSrc}
            i={i}
          />
        ))}
      </div>
    </div>
  );
}
