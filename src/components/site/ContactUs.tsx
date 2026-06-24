"use client";

import { cldImage } from "@/lib/cloudinary";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const MainContact = () => {
  const pathname = usePathname();

  const communityItems = [
    { title: "Discord", link: "https://discord.gg/vS7eTFKZfD" },
    { title: "Reddit", link: "https://www.reddit.com/r/alevel/" },
    {
      title: "r.alevelserver@gmail.com",
      link: "mailto:r.alevelserver@gmail.com",
    },
    { title: "Minecraft", link: "https://www.ralevel.com/minecraft-funding" },
  ];

  const navigationItems = [
    { title: "Certificates" },
    { title: "Resources" },
    { title: "Blogs" },
  ];

  const legalItems = [
    { title: "Privacy Policy", link: "/legal/privacy-policy" },
    { title: "Terms of Service", link: "/legal/terms-of-service" },
    { title: "Discord Regulations", link: "/legal/discord-regulations" },
  ];

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 md:gap-16 justify-items-center text-center sm:text-left font-light py-12 w-11/12 md:w-4/5 mt-8 border-t border-gray-200"
    >
      <motion.div variants={fadeUp} className="space-y-3">
        <h3 className="mb-5 font-semibold underline underline-offset-4 decoration-gray-400">
          Community
        </h3>
        <div className="flex flex-col space-y-2">
          {communityItems.map((item, i) => (
            <a
              key={i}
              href={item.link}
              target="_blank"
              rel="noreferrer"
              className="hover:translate-x-1 transition-all duration-300 hover:text-gray-600"
            >
              {item.title}
            </a>
          ))}
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="hidden md:block space-y-3">
        <h3 className="mb-5 font-semibold underline underline-offset-4 decoration-gray-400">
          Navigation
        </h3>
        <div className="flex flex-col space-y-2">
          <Link
            href="/"
            className={`transition-all duration-300 hover:text-gray-600 ${
              pathname === "/" ? "font-medium" : ""
            }`}
          >
            Home
          </Link>
          {navigationItems.map((item, i) => (
            <Link
              key={i}
              href={`/${item.title.toLowerCase()}`}
              className={`transition-all duration-300 hover:text-gray-600 ${
                pathname === `/${item.title.toLowerCase()}` ? "font-medium" : ""
              }`}
            >
              {item.title}
            </Link>
          ))}
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="space-y-3">
        <h3 className="mb-5 font-semibold underline underline-offset-4 decoration-gray-400">
          Legal
        </h3>
        <div className="flex flex-col space-y-2">
          {legalItems.map((item, i) => (
            <Link
              key={i}
              href={item.link}
              className={`transition-all duration-300 hover:text-gray-600 ${
                pathname === item.link ? "font-medium" : ""
              }`}
            >
              {item.title}
            </Link>
          ))}
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="space-y-3">
        <h3 className="mb-5 font-semibold underline underline-offset-4 decoration-gray-400">
          Talk to us
        </h3>
        <div className="flex flex-col space-y-2">
          {[
            {
              img: "/contact-us/discord-ic-b.png",
              text: "Vasumitra Gajbhiye",
              link: "https://discord.com/users/1058932081629069363",
            },
            {
              img: "/contact-us/discord-ic-b.png",
              text: "Jake Schwegler",
              link: "https://discord.com/users/503876266844356628",
            },
            {
              img: "/contact-us/reddit-ic-b.png",
              text: "Vasumitra Gajbhiye",
              link: "https://www.reddit.com/user/VasumitraGajbhiye/",
            },
            {
              img: "/contact-us/gmail-ic-b.png",
              text: "r.alevelserver@gmail.com",
              link: "mailto:r.alevelserver@gmail.com",
            },
          ].map((contact, i) => (
            <a
              key={i}
              href={contact.link}
              target="_blank"
              rel="noreferrer"
              className="flex gap-3 items-center justify-center sm:justify-start hover:translate-x-1 transition-all duration-300"
            >
              <img
                src={cldImage(contact.img)}
                alt="icon"
                className="w-4 opacity-80"
              />
              <span className="hover:text-gray-600">{contact.text}</span>
            </a>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

const Credit = () => (
  <motion.div
    variants={fadeUp}
    initial="hidden"
    whileInView="show"
    viewport={{ once: true }}
    className="text-sm flex-col items-center gap-2 mb-8 text-center flex"
  >
    <p className="hidden sm:block">
      Website designed & developed with{" "}
      <span className="animate-pulse">🖤</span> by{" "}
      <span className="font-medium">Vasumitra</span>
    </p>
    <p className="sm:hidden">
      Website designed & developed with{" "}
      <span className="animate-pulse">🖤</span> <br /> by{" "}
      <span className="font-medium">Vasumitra</span>
    </p>
    <p className="opacity-70">© 2025 r/alevel • All Rights Reserved</p>
  </motion.div>
);

export default function ContactUs() {
  return (
    <div className="bg-gray-100 overflow-hidden bg-no-repeat bg-cover flex flex-col justify-center items-center gap-10 text-gray-900 relative">
      <MainContact />
      <Credit />
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
    </div>
  );
}
