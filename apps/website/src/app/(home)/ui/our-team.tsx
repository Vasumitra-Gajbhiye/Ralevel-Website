"use client";

import { easeInOut, motion, useAnimation } from "framer-motion";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";

// Role-based gradient background
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
  className,
  imgSrc,
}: {
  name: string;
  role: string;
  className?: string;
  imgSrc?: string;
}) {
  const gradient = getGradient(role);

  return (
    <motion.div
      variants={cardVariants}
      className={`flex-col flex bg-gradient-to-b ${gradient}
        p-8 max-lg:p-4 max-xxs:p-3 rounded-xl justify-center items-center 
        w-full max-h-72 shadow-sm hover:shadow-lg transition-all duration-300 ${className}`}
    >
      <div className="w-44 max-lg:w-32 max-xs:w-28 max-xl:w-36 mb-2 flex justify-center">
        <img
          src={`${
            imgSrc
              ? imgSrc
              : `https://api.dicebear.com/9.x/avataaars/svg?seed=encodeURIComponent(${name})`
          }`}
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

// --- Animation Variants ---
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

export default function OurTeam() {
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
      {/* Section Heading */}
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

      {/* First Row (3 Cards) */}
      <motion.div
        variants={containerVariants}
        className="w-4/5 max-xs:w-full max-lg:w-11/12 grid justify-items-center gap-y-5 gap-x-7 
          max-xxs:gap-y-3 max-lg:gap-x-5 max-xxs:grid-cols-1 max-md:grid-cols-2 grid-cols-3 
          mb-10 max-md:mb-5"
      >
        <CardInfo
          name="Vasumitra"
          role="Community Leader"
          imgSrc="https://api.dicebear.com/9.x/avataaars/svg?seed=Liam&flip=true&accessories=round&accessoriesColor=3c4f5c,25557c,262e33,b1e2ff,5199e4,65c9ff&accessoriesProbability=100&clothing=blazerAndShirt&clothingGraphic[]&eyebrows=raisedExcited&eyes=closed&facialHair[]&facialHairColor[]&hairColor=2c1b18&mouth=twinkle&skinColor=edb98a&top=shortRound"
        />
        <CardInfo
          name="Jake"
          role="Chief Administrator"
          imgSrc="https://api.dicebear.com/9.x/avataaars/svg?seed=Nolan&eyebrows=default,defaultNatural,flatNatural,raisedExcited,raisedExcitedNatural&eyes=closed,default,happy,side,squint,surprised,wink,winkWacky&mouth=default,eating,smile,tongue,twinkle&skinColor=d08b5b,edb98a,f8d25c,fd9841,ffdbb4,ae5d29"
        />
        <CardInfo
          name="Abu Bakar"
          role="Administrator"
          imgSrc="https://api.dicebear.com/9.x/avataaars/svg?seed=Sara&eyebrows=default,defaultNatural,flatNatural,raisedExcited,raisedExcitedNatural&eyes=closed,default,happy,side,squint,surprised,wink,winkWacky&mouth=default,eating,smile,tongue,twinkle&skinColor=d08b5b,edb98a,f8d25c,fd9841,ffdbb4,ae5d29"
        />
        <CardInfo
          className="max-md:flex hidden"
          name="Haz"
          role="Administrator"
          imgSrc="https://api.dicebear.com/9.x/avataaars/svg?seed=Mackenzie&eyebrows=default,defaultNatural,flatNatural,raisedExcited,raisedExcitedNatural&eyes=closed,default,happy,side,squint,surprised,wink,winkWacky&mouth=default,eating,smile,tongue,twinkle&skinColor=d08b5b,edb98a,f8d25c,fd9841,ffdbb4,ae5d29"
        />
      </motion.div>

      {/* Second Row (2 Cards) */}
      <motion.div
        variants={containerVariants}
        className="w-4/5 max-xs:w-full max-lg:w-4/5 grid justify-items-center gap-y-12 gap-x-7 
          max-lg:gap-x-3 max-md:grid-cols-1 grid-cols-2"
      >
        <CardInfo
          className="max-md:hidden flex"
          name="Haz"
          role="Administrator"
          imgSrc="https://api.dicebear.com/9.x/avataaars/svg?seed=Mackenzie&eyebrows=default,defaultNatural,flatNatural,raisedExcited,raisedExcitedNatural&eyes=closed,default,happy,side,squint,surprised,wink,winkWacky&mouth=default,eating,smile,tongue,twinkle&skinColor=d08b5b,edb98a,f8d25c,fd9841,ffdbb4,ae5d29"
        />
        <CardInfo
          name="Alen"
          role="Administrator"
          imgSrc="https://api.dicebear.com/9.x/avataaars/svg?seed=Sara&eyebrows=default,defaultNatural,flatNatural,raisedExcited,raisedExcitedNatural&eyes=closed,default,happy,side,squint,surprised,wink,winkWacky&mouth=default,eating,smile,tongue,twinkle&skinColor=d08b5b,edb98a,f8d25c,fd9841,ffdbb4,ae5d29&top=dreads01,dreads02,frida,frizzle,fro,froBand,hat,hijab,longButNotTooLong,miaWallace,shaggy,shaggyMullet,shavedSides,shortCurly,shortFlat,shortRound,shortWaved,sides,straight01,straight02,straightAndStrand,theCaesar,theCaesarAndSidePart,turban,winterHat02,winterHat03,winterHat04,winterHat1"
        />
      </motion.div>

      {/* View All Link */}
      <motion.div
        variants={textVariants}
        className="mt-10 text-blue-600 underline hover:text-purple-700 transition-colors"
      >
        <a href="/team">View all</a>
      </motion.div>
    </motion.div>
  );
}
