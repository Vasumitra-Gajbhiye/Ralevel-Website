"use client";

import { cldImage } from "@/lib/cloudinary";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

export default function OurProgress() {
  type propType = {
    title: string;
    titleAlt?: string;
    data: string;
    subtitle: string;
  };

  const CardProgress = ({ title, titleAlt, data, subtitle }: propType) => {
    return (
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 30 },
          visible: { opacity: 1, y: 0 },
        }}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-white rounded-lg p-5 drop-shadow-md"
      >
        <h5 className="hidden lg:block text-cyan-700 font-bold text-base md:text-lg mb-1">
          {title}
        </h5>
        <h5 className="lg:hidden text-cyan-700 font-bold text-base md:text-lg mb-1">
          {titleAlt}
        </h5>
        <h3 className="md:text-3xl text-2xl font-semibold mb-3 text-gray-900">
          {data}
        </h3>
        <h6 className="text-sm md:text-base text-gray-700">{subtitle}</h6>
      </motion.div>
    );
  };
  // 👇 Increase threshold so animation triggers later
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.65, // only triggers when ~45% of section visible
  });

  return (
    <section
      ref={ref}
      className="bg-cy-200 flex flex-col items-center py-20 mb-52 overflow-hidden"
    >
      {/* Background image zooms in when visible */}
      <motion.div
        initial={{ scale: 1 }}
        animate={inView ? { scale: 1.05 } : { scale: 1 }}
        transition={{ duration: 2.5, ease: "easeOut" }}
        className="w-11/12 h-full md:max-h-96 overflow-hidden rounded-lg"
      >
        <img
          src={cldImage("/home_img/progress bannar.png")}
          // src={cloudImg}
          alt="background image"
          className="w-full object-cover"
        />
      </motion.div>

      {/* Title + Subtitle */}
      <motion.div
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        variants={{
          hidden: { opacity: 0, y: 30 },
          visible: { opacity: 1, y: 0 },
        }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex flex-col items-center -mt-20 xxs:-mt-24 xs:-mt-32 md2:-mt-36 md:-mt-48 gap-10 w-5/6 text-center"
      >
        <motion.div
          // 👇 stays visible permanently (doesn't re-hide)
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center gap-4 text-center leading-3 text-white"
        >
          <h1 className="font-extrabold text-2xl sm:text-3xl md2:text-4xl md:5xl z-50">
            Our Standout Progress
          </h1>
          <h4 className="hidden md:block md:text-xl text-base text-white/90 max-w-2xl z-50">
            From a very small and humble start about 10 years ago, we’ve created
            a community with passion to learn and help fellow members
          </h4>
        </motion.div>

        {/* Staggered Cards */}
        <motion.div
          variants={{
            hidden: {},
            visible: {
              transition: { staggerChildren: 0.2 },
            },
          }}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="grid grid-cols-1 xxs:grid-cols-2 md:grid-cols-4 gap-y-5 gap-x-5"
        >
          {[
            {
              title: "Reddit Members",
              titleAlt: "Reddit",
              data: "175k+",
              subtitle: "The number of members on our subreddit",
            },
            {
              title: "Discord Members",
              titleAlt: "Discord",
              data: "40k+",
              subtitle: "The number of members on our discord server",
            },
            {
              title: "Avg Views",
              titleAlt: "Avg Views",
              data: "3M+",
              subtitle: "The number of views on our subreddit per day",
            },
            {
              title: "Top",
              titleAlt: "Top",
              data: "2%",
              subtitle: "Our subreddit is among the top 2% subreddits by size",
            },
          ].map((item, i) => (
            <CardProgress key={i} {...item} />
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
