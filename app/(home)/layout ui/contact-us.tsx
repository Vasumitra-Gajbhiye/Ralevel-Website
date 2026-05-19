// "use client";

// import { link } from "fs";
// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import style from "@/app/(home)/layout ui/layout.module.css";
// import Image from "next/image";

// const MainContact = function () {
//   const pathname = usePathname();

//   const communityItems = [
//     { id: 1, title: "Discord", link: "/" },
//     { id: 1, title: "Reddit", link: "/" },
//     { id: 1, title: "r.alevelserver@gmail.com", link: "/" },
//   ];
//   const navigationItems = [
//     { id: 1, title: "Certificates" },
//     { id: 2, title: "Resources" },
//     { id: 3, title: "Blogs" },
//   ];

//   return (
//     <div
//       className={
//         style.contact +
//         " grid sm:grid-cols-2 xs:grid-row-2 md:grid-cols-3 justify-items-center align-top grid-x-8 md:grid-y-5 font-light py-8 w-3/4 xs:w-2/3 md:w-4/5 mt-10"
//       }
//     >
//       <div className="mb-12 md:mb-0">
//         <h3 className="mb-5 font-semibold underline mb:no-underline underline-offset-2">
//           Community
//         </h3>
//         <div className="flex flex-col">
//           {communityItems.map((item, index) => {
//             return (
//               <a href={`${item.link}`} key={`${index}`}>
//                 {item.title}
//               </a>
//             );
//           })}
//         </div>
//       </div>
//       <div className="hidden md:block">
//         <h3 className="mb-5 font-semibold  underline underline-offset-2">
//           Navigation
//         </h3>
//         <div>
//           <div>
//             <Link href={"/"} className={`${pathname === "/" ? "active" : ""}`}>
//               Home
//             </Link>
//           </div>
//           {navigationItems.map((item) => {
//             return (
//               <div key={item.id}>
//                 <Link
//                   href={`/${item.title.toLowerCase()}`}
//                   className={`${
//                     pathname === `/${item.title.toLowerCase}` ? "active" : ""
//                   }`}
//                 >
//                   {item.title}
//                 </Link>
//               </div>
//             );
//           })}
//         </div>
//       </div>
//       <div>
//         <h3 className="mb-5 font-semibold  underline mb:no-underline underline-offset-2">
//           Talk to us
//         </h3>
//         <div>
//           <div className="flex gap-1 items-center ">
//             <img src="/contact/discordLogo.png" alt="logo" className="w-4" />
//             <h4>_vasumitra</h4>
//           </div>
//           <div className="flex gap-1 items-center ">
//             <img src="/contact/discordLogo.png" alt="logo" className="w-4" />
//             <h4>s_kush</h4>
//           </div>
//           <div className="flex gap-1 items-center">
//             <img src="/contact/redditLogo.png" alt="logo" className="w-4" />

//             <h4>Vasumitra Gajbhiye</h4>
//           </div>
//           <div className="flex gap-1 items-center ">
//             <img src="/contact/gmailLogo.png" alt="logo" className="w-4" />

//             <h4>
//               <a href="mailto:r.alevelserver@gmail.com">
//                 r.alevelserver@gmail.com
//               </a>
//             </h4>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// const Credit = function () {
//   return (
//     <>
//       <div className="text-sm flex-col items-center gap-2 mb-5 text-center   flex ">
//         <h4 className="hidden xxs:block">
//           Website designed & developed with 🖤 by Vasumitra
//         </h4>
//         <h4 className="xxs:hidden block">
//           Website designed & developed with 🖤 <br></br> by Vasumitra
//         </h4>
//         <h4>© 2024 r/alevel  • All Rights Reserved</h4>
//       </div>
//     </>
//   );
// };

// export default function ContactUs() {
//   return (
//     <div
//       className="contact-bg  overflow-hidden bg-right
//       md:bg-center bg-scroll
//     bg-no-repeat bg-cover flex justify-center items-center flex-col gap-12 text-white"
//       style={{ backgroundImage: "url('../../../public/contact/contact.png')" }}
//     >
//       <MainContact />
//       <Credit />
//     </div>
//   );
// }

// ////////////////////////////////////////////////////////////////
// "use client";

// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import style from "@/app/(others)/layout ui/layout.module.css";
// import Image from "next/image";

// const MainContact = function () {
//   const pathname = usePathname();

//   const communityItems = [
//     { id: 1, title: "Discord", link: "https://discord.gg/vS7eTFKZfD" },
//     { id: 1, title: "Reddit", link: "https://www.reddit.com/r/alevel/" },
//     { id: 1, title: "r.alevelserver@gmail.com", link: "mailto:r.alevelserver@gmail.com" },
//   ];
//   const navigationItems = [
//     { id: 1, title: "Certificates" },
//     { id: 2, title: "Resources" },
//     { id: 3, title: "Blogs" },
//   ];

//   return (
//     <div
//       className={
//         " grid sm:grid-cols-2 xs:grid-row-2 md:grid-cols-3 justify-items-center align-top grid-x-8 md:grid-y-5 font-light py-8 w-5/6 xs:w-2/3 md:w-4/5 mt-10 border-b-2 border-gray-300"
//       }
//     >
//       <div className="mb-12 md:mb-0">
//         <h3 className="mb-5 font-semibold underline mb:no-underline underline-offset-2">
//           Community
//         </h3>
//         <div className="flex flex-col">
//           {communityItems.map((item, index) => {
//             return (
//               <a href={`${item.link}`} key={`${index}`}>
//                 {item.title}
//               </a>
//             );
//           })}
//         </div>
//       </div>
//       <div className="hidden md:block">
//         <h3 className="mb-5 font-semibold  underline underline-offset-2">
//           Navigation
//         </h3>
//         <div>
//           <div>
//             <Link href={"/"} className={`${pathname === "/" ? "active" : ""}`}>
//               Home
//             </Link>
//           </div>
//           {navigationItems.map((item) => {
//             return (
//               <div key={item.id}>
//                 <Link
//                   href={`/${item.title.toLowerCase()}`}
//                   className={`${
//                     pathname === `/${item.title.toLowerCase}` ? "active" : ""
//                   }`}
//                 >
//                   {item.title}
//                 </Link>
//               </div>
//             );
//           })}
//         </div>
//       </div>
//       <div>
//         <h3 className="mb-5 font-semibold  underline mb:no-underline underline-offset-2">
//           Talk to us
//         </h3>
//         <div>
//           <div className="flex gap-2 items-center ">
//             <img src="/contact/discord-ic-b.png" alt="logo" className="w-4" />

//             <a
//               href=" https://discord.com/users/1058932081629069363"
//               target="_blank"
//             >
//               Vasumitra Gajbhiye
//             </a>
//           </div>
//           <div className="flex gap-2 items-center ">
//             <img src="/contact/discord-ic-b.png" alt="logo" className="w-4" />

//             <h4>
//               <a
//                 href=" https://discord.com/users/503876266844356628"
//                 target="_blank"
//               >
//                 Jake Schwegler
//               </a>
//             </h4>
//           </div>
//           <div className="flex gap-2 items-center">
//             <img src="/contact/reddit-ic-b.png" alt="logo" className="w-4" />

//             <h4>
//               <a
//                 href="https://www.reddit.com/user/VasumitraGajbhiye/"
//                 target="_blank"
//               >
//                 Vasumitra Gajbhiye
//               </a>
//             </h4>
//           </div>
//           <div className="flex gap-2 items-center ">
//             <img src="/contact/gmail-ic-b.png" alt="logo" className="w-4" />

//             <h4>
//               <a href="mailto:r.alevelserver@gmail.com">
//                 r.alevelserver@gmail.com
//               </a>
//             </h4>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// const Credit = function () {
//   return (
//     <>
//       <div className="text-sm flex-col items-center gap-2 mb-5 text-center   flex ">
//         <h4 className="hidden xxs:block">
//           Website designed & developed with 🖤 by Vasumitra
//         </h4>
//         <h4 className="xxs:hidden block">
//           Website designed & developed with 🖤 <br></br> by Vasumitra
//         </h4>
//         <h4>© 2025 r/alevel  • All Rights Reserved</h4>
//       </div>
//     </>
//   );
// };

// export default function ContactUs() {
//   return (
//     <div
//       className=" bg-gray-100 overflow-hidden bg-right
//       md:bg-center bg-scroll
//     bg-no-repeat bg-cover flex justify-center items-center flex-col gap-12 text-gray-900"
//     >
//       <MainContact />
//       <Credit />
//     </div>
//   );
// }

// "use client";

// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import { motion } from "framer-motion";

// const fadeUp = {
//   hidden: { opacity: 0, y: 30 },
//   show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
// };

// const MainContact = () => {
//   const pathname = usePathname();

//   const communityItems = [
//     { title: "Discord", link: "https://discord.gg/vS7eTFKZfD" },
//     { title: "Reddit", link: "https://www.reddit.com/r/alevel/" },
//     { title: "r.alevelserver@gmail.com", link: "mailto:r.alevelserver@gmail.com" },
//   ];

//   const navigationItems = [
//     { title: "Certificates" },
//     { title: "Resources" },
//     { title: "Blogs" },
//   ];

//   return (
//     <motion.div
//       variants={fadeUp}
//       initial="hidden"
//       whileInView="show"
//       viewport={{ once: true }}
//       className="grid sm:grid-cols-2 md:grid-cols-3 gap-12 md:gap-16 justify-items-center font-light py-12 w-11/12 md:w-4/5 mt-8 border-t border-gray-200"
//     >
//       {/* Community */}
//       <motion.div variants={fadeUp} className="space-y-3">
//         <h3 className="mb-5 font-semibold underline underline-offset-4 decoration-gray-400">
//           Community
//         </h3>
//         <div className="flex flex-col space-y-2">
//           {communityItems.map((item, i) => (
//             <a
//               key={i}
//               href={item.link}
//               target="_blank"
//               className="hover:translate-x-1 transition-all duration-300 hover:text-gray-600"
//             >
//               {item.title}
//             </a>
//           ))}
//         </div>
//       </motion.div>

//       {/* Navigation */}
//       <motion.div variants={fadeUp} className="hidden md:block space-y-3">
//         <h3 className="mb-5 font-semibold underline underline-offset-4 decoration-gray-400">
//           Navigation
//         </h3>
//         <div className="flex flex-col space-y-2">
//           <Link
//             href="/"
//             className={`transition-all duration-300 hover:text-gray-600 ${
//               pathname === "/" ? "font-medium" : ""
//             }`}
//           >
//             Home
//           </Link>
//           {navigationItems.map((item, i) => (
//             <Link
//               key={i}
//               href={`/${item.title.toLowerCase()}`}
//               className={`transition-all duration-300 hover:text-gray-600 ${
//                 pathname === `/${item.title.toLowerCase()}` ? "font-medium" : ""
//               }`}
//             >
//               {item.title}
//             </Link>
//           ))}
//         </div>
//       </motion.div>

//       {/* Talk to us */}
//       <motion.div variants={fadeUp} className="space-y-3">
//         <h3 className="mb-5 font-semibold underline underline-offset-4 decoration-gray-400">
//           Talk to us
//         </h3>
//         <div className="flex flex-col space-y-2">
//           {[
//             {
//               img: "/contact/discord-ic-b.png",
//               text: "Vasumitra Gajbhiye",
//               link: "https://discord.com/users/1058932081629069363",
//             },
//             {
//               img: "/contact/discord-ic-b.png",
//               text: "Jake Schwegler",
//               link: "https://discord.com/users/503876266844356628",
//             },
//             {
//               img: "/contact/reddit-ic-b.png",
//               text: "Vasumitra Gajbhiye",
//               link: "https://www.reddit.com/user/VasumitraGajbhiye/",
//             },
//             {
//               img: "/contact/gmail-ic-b.png",
//               text: "r.alevelserver@gmail.com",
//               link: "mailto:r.alevelserver@gmail.com",
//             },
//           ].map((contact, i) => (
//             <a
//               key={i}
//               href={contact.link}
//               target="_blank"
//               className="flex gap-3 items-center hover:translate-x-1 transition-all duration-300"
//             >
//               <img src={contact.img} alt="icon" className="w-4 opacity-80" />
//               <span className="hover:text-gray-600">{contact.text}</span>
//             </a>
//           ))}
//         </div>
//       </motion.div>
//     </motion.div>
//   );
// };

// const Credit = () => (
//   <motion.div
//     variants={fadeUp}
//     initial="hidden"
//     whileInView="show"
//     viewport={{ once: true }}
//     className="text-sm flex-col items-center gap-2 mb-8 text-center flex"
//   >
//     <p className="hidden sm:block">
//       Website designed & developed with <span className="animate-pulse">🖤</span> by{" "}
//       <span className="font-medium">Vasumitra</span>
//     </p>
//     <p className="sm:hidden">
//       Website designed & developed with <span className="animate-pulse">🖤</span> <br /> by{" "}
//       <span className="font-medium">Vasumitra</span>
//     </p>
//     <p className="opacity-70">© 2025 r/alevel • All Rights Reserved</p>
//   </motion.div>
// );

// export default function ContactUs() {
//   return (
//     <div className="bg-gray-100 overflow-hidden bg-no-repeat bg-cover flex flex-col justify-center items-center gap-10 text-gray-900 relative">
//       <MainContact />
//       <Credit />
//       {/* Subtle gradient top border */}
//       <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
//     </div>
//   );
// }

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
      {/* Community */}
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
              className="hover:translate-x-1 transition-all duration-300 hover:text-gray-600"
            >
              {item.title}
            </a>
          ))}
        </div>
      </motion.div>

      {/* Navigation */}
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

      {/* Legal */}
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

      {/* Talk to us */}
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
          ].map((contact: any, i) => (
            <a
              key={i}
              href={contact.link}
              target="_blank"
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
      {/* Subtle gradient top border */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
    </div>
  );
}
