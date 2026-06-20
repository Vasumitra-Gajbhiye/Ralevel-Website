// "use client";

// import Link from "next/link";
// import Image from "next/image";
// import { usePathname } from "next/navigation";
// import logo from "@/public/logo/Logo only.svg";
// import style from "@/app/(home)/layout ui/layout.module.css";
// import { useState } from "react";

// export default function Navigation() {
//   const pathname = usePathname();
//   const navListItems = [
//     { id: 1, title: "Certificates" },
//     { id: 2, title: "Resources" },
//     { id: 3, title: "Blogs" },
//     { id: 4, title: "Team" },
//   ];

//   const [isActive, setIsACtive] = useState(false);

//   const openNav = function () {
//     console.log("nav is open");
//     setIsACtive(true);
//   };

//   const closeNav = function () {
//     console.log("nav is close");
//     setIsACtive(false);
//   };

//   return (
//     <nav
//       className={
//         style.navigation +
//         " relative z-50 min-h-8 lg:px-16 px-8 justify-between flex py-3 text-lg text-white items-center drop-shadow-md "
//       }
//     >
//       <div className="flex justify-between lg:w-2/3 md:w-full items-center font-medium">
//         <div>
//           <Link href={"/"}>
//             <Image src={logo} alt="Logo" width={70} />
//           </Link>
//         </div>
//         <div className={`hidden md:flex justify-around w-full`}>
//           <div className="hover:border-b-white transition-all border-b-2 border-b-transparent">
//             <Link href="/" className={`${pathname === `/` ? "active" : ""}`}>
//               Home
//             </Link>
//           </div>
//           {navListItems.map((item, index) => {
//             return (
//               <div
//                 key={index}
//                 className="hover:border-b-white transition-all border-b-2 border-b-transparent"
//               >
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
//       <div className="hidden bg-cy-500 text-white font-bold px-3 py-1 rounded-full min-w-32 md:flex justify-center items-center hover:scale-105	 transition-all cursor-pointer	">
//         <a href="https://www.reddit.com/r/alevel/" target="_blank">
//           Join Now
//         </a>
//       </div>

//       <div
//         onClick={openNav}
//         className="md:hidden mobile-btn cursor-pointer hover:bg-cy-100/[0.2] transition-all rounded-md p-1 "
//       >
//         <img
//           src="/home_img/hamburger.svg"
//           alt="hamburger"
//           className={"w-9 " + `${isActive ? "hidden" : ""}`}
//         />
//       </div>

//       <div
//         className={
//           "w-full h-screen  z-10 text-white absolute top-0 left-0  bg-black/70 " +
//           `${isActive ? "" : "hidden"}`
//         }
//       >
//         <div className="flex flex-col items-center justify-center text-4xl gap-10 font-semibold h-full">
//           <a href="/">Home</a>
//           <a href="/certificates">Certificates</a>
//           <a href="/resources">Resources</a>
//           <a href="/blogs">Blogs</a>
//           <a href="/team">Team</a>
//         </div>
//         <div
//           onClick={closeNav}
//           className="absolute top-2 right-8 md:hidden mobile-btn cursor-pointer text-5xl text-white hover:bg-cy-100/[0.2] transition-all rounded-md p-1"
//         >
//           <h1>&times;</h1>
//         </div>
//       </div>
//     </nav>
//   );
// }

// "use client";

// import React, { useEffect, useState } from "react";
// import { createPortal } from "react-dom";
// import Link from "next/link";
// import Image from "next/image";
// import { usePathname } from "next/navigation";
// import logo from "@/public/logo/Logo only.svg";
// import { Menu, X } from "lucide-react";

// export default function Navigation() {
//   const pathname = usePathname();
//   const [isActive, setIsActive] = useState(false);
//   const [mounted, setMounted] = useState(false);

//   useEffect(() => setMounted(true), []);

//   // lock body scroll when menu open
//   useEffect(() => {
//     if (typeof window === "undefined") return;
//     document.body.style.overflow = isActive ? "hidden" : "";
//     return () => {
//       document.body.style.overflow = "";
//     };
//   }, [isActive]);

//   const navListItems = [
//     { title: "Home", href: "/" },
//     { title: "Certificates", href: "/certificates" },
//     { title: "Resources", href: "/resources" },
//     { title: "Blogs", href: "/blogs" },
//     { title: "Team", href: "/team" },
//   ];

//   // MobileOverlay now handles its own show/hide animation state, and calls onClose
//   const MobileOverlay = ({ onClose }: { onClose: () => void }) => {
//     if (!mounted) return null;

//     const [visible, setVisible] = useState(false);

//     useEffect(() => {
//       // enter animation: set visible shortly after mount so CSS transition runs
//       const t = setTimeout(() => setVisible(true), 20);
//       return () => clearTimeout(t);
//     }, []);

//     const handleClose = () => {
//       // play exit animation, then notify parent after animation duration
//       setVisible(false);
//       // match duration used in classes (300ms)
//       setTimeout(() => onClose(), 320);
//     };

//     return createPortal(
//       <div className="fixed inset-0 z-[9999] pointer-events-auto">
//         {/* backdrop */}
//         <div
//           onClick={handleClose}
//           aria-hidden="true"
//           className={`absolute inset-0 bg-black/60 transition-opacity duration-300 ${
//             visible ? "opacity-100" : "opacity-0"
//           }`}
//         />

//         {/* sliding panel (from right) */}
//         <div
//           className={`absolute inset-0 flex flex-col transform transition-transform duration-300 ease-out ${
//             visible ? "translate-x-0" : "translate-x-full"
//           }`}
//         >
//           {/* header */}
//           <div className="h-[72px] flex items-center justify-between px-4 border-b bg-white/90 backdrop-blur-sm z-10">
//             <Link href="/" onClick={handleClose} className="flex items-center gap-3">
//               <Image src={logo} alt="Logo" width={44} height={44} />
//               <span className="font-semibold text-grey-800">r/alevel</span>
//             </Link>

//             <button
//               onClick={handleClose}
//               aria-label="Close menu"
//               className="p-2 rounded-md hover:bg-gray-100 transition"
//             >
//               <X size={24} />
//             </button>
//           </div>

//           {/* content */}
//           <div className={`overflow-auto flex-1 bg-white transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0"}`}>
//             <ul className="flex flex-col gap-2 p-6">
//               {navListItems.map((item) => (
//                 <li key={item.title}>
//                   <Link
//                     href={item.href}
//                     onClick={handleClose}
//                     className={`block w-full text-lg font-semibold py-3 rounded-md px-3 transition-colors ${
//                       pathname === item.href ? "text-blue-600 bg-blue-50" : "text-gray-800 hover:bg-gray-100"
//                     }`}
//                   >
//                     {item.title}
//                   </Link>
//                 </li>
//               ))}
//             </ul>

//             <div className="p-6 border-t">
//               <a
//                 href="https://www.reddit.com/r/alevel/"
//                 target="_blank"
//                 rel="noreferrer"
//                 onClick={handleClose}
//                 className="block w-full text-center bg-blue-600 text-white font-semibold py-3 rounded-full hover:bg-blue-700 transition"
//               >
//                 Join Now
//               </a>
//             </div>
//           </div>
//         </div>
//       </div>,
//       document.body
//     );
//   };

//   return (
//     <>
//       <nav className="fixed top-0 left-0 right-0 z-50  backdrop-blur-md  shadow-sm transition-all duration-300">
//         <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3">
//           {/* logo */}
//           <Link href="/" className="flex items-center gap-3">
//             <Image src={logo} alt="Logo" width={56} height={56} />
//             <span className="hidden sm:block font-semibold text-lg text-white">r/alevel</span>
//           </Link>

//           {/* desktop nav */}
//           <div className="hidden lg2:flex items-center gap-8">
//             {navListItems.map((item) => {
//               const isCurrent = pathname === item.href;
//               return (
//                 <Link
//                   key={item.title}
//                   href={item.href}
//                   className={`relative px-1 py-1 text-sm font-medium transition-all duration-300 ${
//                     isCurrent ? "text-white" : "text-white hover:scale-110"
//                   }`}
//                 >
//                   {item.title}
//                   <span
//                     className={`absolute left-0 -bottom-1 h-[2px] w-full bg-white transform origin-left transition-transform duration-300 ${
//                       isCurrent ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
//                     }`}
//                   />
//                 </Link>
//               );
//             })}
//           </div>

//           {/* join button (desktop) */}
//           <a
//             href="https://www.reddit.com/r/alevel/"
//             target="_blank"
//             rel="noreferrer"
//             className="hidden lg2:inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-sm hover:scale-105 hover:bg-blue-700 transition-all duration-300"
//           >
//             Join Now
//           </a>

//           {/* mobile button */}
//           <button
//             onClick={() => setIsActive(true)}
//             aria-label="Open menu"
//             className="lg2:hidden p-2 rounded-md hover:bg-gray-100 transition"

//           >
//             <Menu size={22} color="#ffffff"/>
//           </button>
//         </div>
//       </nav>

//       {/* render overlay only when active & after mount */}
//       {isActive && mounted && <MobileOverlay onClose={() => setIsActive(false)} />}
//     </>
//   );
// }

// "use client";

// import React, { useEffect, useState } from "react";
// import { createPortal } from "react-dom";
// import Link from "next/link";
// import Image from "next/image";
// import { usePathname } from "next/navigation";
// import logo from "@/public/logo/Logo only.svg";
// import { Menu, X } from "lucide-react";

// export default function Navigation() {
//   const pathname = usePathname();
//   const [isActive, setIsActive] = useState(false);
//   const [mounted, setMounted] = useState(false);
//   const [scrolled, setScrolled] = useState(false);

//   useEffect(() => setMounted(true), []);

//   // Lock scroll when mobile menu is open
//   useEffect(() => {
//     if (typeof window === "undefined") return;
//     document.body.style.overflow = isActive ? "hidden" : "";
//     return () => {
//       document.body.style.overflow = "";
//     };
//   }, [isActive]);

//   // Detect scroll to toggle color
//   useEffect(() => {
//     const handleScroll = () => {
//       if (window.scrollY > window.innerHeight * 0.8) {
//         setScrolled(true);
//       } else {
//         setScrolled(false);
//       }
//     };

//     window.addEventListener("scroll", handleScroll);
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, []);

//   const navListItems = [
//     { title: "Home", href: "/" },
//     { title: "Certificates", href: "/certificates" },
//     { title: "Resources", href: "/resources" },
//     { title: "Blogs", href: "/blogs" },
//     { title: "Team", href: "/team" },
//   ];

//   const MobileOverlay = ({ onClose }: { onClose: () => void }) => {
//     if (!mounted) return null;

//     const [visible, setVisible] = useState(false);

//     useEffect(() => {
//       const t = setTimeout(() => setVisible(true), 20);
//       return () => clearTimeout(t);
//     }, []);

//     const handleClose = () => {
//       setVisible(false);
//       setTimeout(() => onClose(), 320);
//     };

//     return createPortal(
//       <div className="fixed inset-0 z-[9999] pointer-events-auto">
//         {/* backdrop */}
//         <div
//           onClick={handleClose}
//           aria-hidden="true"
//           className={`absolute inset-0 bg-black/60 transition-opacity duration-300 ${
//             visible ? "opacity-100" : "opacity-0"
//           }`}
//         />

//         {/* sliding panel (from right) */}
//         <div
//           className={`absolute inset-0 flex flex-col transform transition-transform duration-300 ease-out ${
//             visible ? "translate-x-0" : "translate-x-full"
//           }`}
//         >
//           {/* header */}
//           <div className="h-[72px] flex items-center justify-between px-4 border-b bg-white/90 backdrop-blur-sm z-10">
//             <Link href="/" onClick={handleClose} className="flex items-center gap-3">
//               <Image src={logo} alt="Logo" width={44} height={44} />
//               <span className="font-semibold text-grey-800">r/alevel</span>
//             </Link>

//             <button
//               onClick={handleClose}
//               aria-label="Close menu"
//               className="p-2 rounded-md hover:bg-gray-100 transition"
//             >
//               <X size={24} />
//             </button>
//           </div>

//           {/* content */}
//           <div
//             className={`overflow-auto flex-1 bg-white transition-opacity duration-300 ${
//               visible ? "opacity-100" : "opacity-0"
//             }`}
//           >
//             <ul className="flex flex-col gap-2 p-6">
//               {navListItems.map((item) => (
//                 <li key={item.title}>
//                   <Link
//                     href={item.href}
//                     onClick={handleClose}
//                     className={`block w-full text-lg font-semibold py-3 rounded-md px-3 transition-colors ${
//                       pathname === item.href
//                         ? "text-blue-600 bg-blue-50"
//                         : "text-gray-800 hover:bg-gray-100"
//                     }`}
//                   >
//                     {item.title}
//                   </Link>
//                 </li>
//               ))}
//             </ul>

//             <div className="p-6 border-t">
//               <a
//                 href="https://www.reddit.com/r/alevel/"
//                 target="_blank"
//                 rel="noreferrer"
//                 onClick={handleClose}
//                 className="block w-full text-center bg-blue-600 text-white font-semibold py-3 rounded-full hover:bg-blue-700 transition"
//               >
//                 Join Now
//               </a>
//             </div>
//           </div>
//         </div>
//       </div>,
//       document.body
//     );
//   };

//   return (
//     <>
//       <nav
//         className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-md shadow-sm transition-all duration-300 ${
//           scrolled ? "bg-white" : "bg-transparent"
//         }`}
//       >
//         <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3">
//           {/* logo */}
//           <Link href="/" className="flex items-center gap-3">
//             <Image src={logo} alt="Logo" width={56} height={56} />
//             <span
//               className={`hidden sm:block font-semibold text-lg transition-colors duration-300 ${
//                 scrolled ? "text-black" : "text-white"
//               }`}
//             >
//               r/alevel
//             </span>
//           </Link>

//           {/* desktop nav */}
//           <div className="hidden lg2:flex items-center gap-8">
//             {navListItems.map((item) => {
//               const isCurrent = pathname === item.href;
//               return (
//                 <Link
//                   key={item.title}
//                   href={item.href}
//                   className={`relative px-1 py-1 text-sm font-medium transition-all duration-300 ${
//                     isCurrent
//                       ? scrolled
//                         ? "text-blue-600"
//                         : "text-white"
//                       : scrolled
//                       ? "text-black hover:text-blue-600"
//                       : "text-white hover:scale-110"
//                   }`}
//                 >
//                   {item.title}
//                   <span
//                     className={`absolute left-0 -bottom-1 h-[2px] w-full transform origin-left transition-transform duration-300 ${
//                       scrolled ? "bg-blue-600" : "bg-white"
//                     } ${isCurrent ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`}
//                   />
//                 </Link>
//               );
//             })}
//           </div>

//           {/* join button (desktop) */}
//           <a
//             href="https://www.reddit.com/r/alevel/"
//             target="_blank"
//             rel="noreferrer"
//             className={`hidden lg2:inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold shadow-sm hover:scale-105 transition-all duration-300 ${
//               scrolled
//                 ? "bg-blue-600 text-white hover:bg-blue-700"
//                 : "bg-white/20 text-white hover:bg-white/30"
//             }`}
//           >
//             Join Now
//           </a>

//           {/* mobile button */}
//           <button
//             onClick={() => setIsActive(true)}
//             aria-label="Open menu"
//             className="lg2:hidden p-2 rounded-md hover:bg-gray-100 transition"
//           >
//             <Menu size={22} color={scrolled ? "#000000" : "#ffffff"} />
//           </button>
//         </div>
//       </nav>

//       {isActive && mounted && <MobileOverlay onClose={() => setIsActive(false)} />}
//     </>
//   );
// }

// "use client";

// import React, { useEffect, useState } from "react";
// import { createPortal } from "react-dom";
// import Link from "next/link";
// import Image from "next/image";
// import { usePathname } from "next/navigation";
// import logo from "@/public/logo/Logo only.svg";
// import { Menu, X } from "lucide-react";
// import { motion, AnimatePresence } from "framer-motion";

// export default function Navigation() {
//   const pathname = usePathname();
//   const [isActive, setIsActive] = useState(false);
//   const [mounted, setMounted] = useState(false);
//   const [scrolled, setScrolled] = useState(false);

//   useEffect(() => setMounted(true), []);

//   // Lock scroll when mobile menu is open
//   useEffect(() => {
//     if (typeof window === "undefined") return;
//     document.body.style.overflow = isActive ? "hidden" : "";
//     return () => {
//       document.body.style.overflow = "";
//     };
//   }, [isActive]);

//   // Detect scroll
//   useEffect(() => {
//     const handleScroll = () => setScrolled(window.scrollY > window.innerHeight * 0.8);
//     window.addEventListener("scroll", handleScroll);
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, []);

//   const navListItems = [
//     { title: "Home", href: "/" },
//     { title: "Certificates", href: "/certificates" },
//     { title: "Resources", href: "/resources" },
//     { title: "Blogs", href: "/blogs" },
//     { title: "Team", href: "/team" },
//   ];

//   const MobileOverlay = ({ onClose }: { onClose: () => void }) => {
//     if (!mounted) return null;

//     return createPortal(
//       <AnimatePresence>
//         <motion.div
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           exit={{ opacity: 0 }}
//           className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex flex-col"
//         >
//           <motion.div
//             initial={{ x: "100%" }}
//             animate={{ x: 0 }}
//             exit={{ x: "100%" }}
//             transition={{ duration: 0.3, ease: "easeOut" }}
//             className="bg-white flex flex-col flex-1"
//           >
//             {/* header */}
//             <div className="h-[72px] flex items-center justify-between px-4 border-b bg-white/90 backdrop-blur-sm">
//               <Link href="/" onClick={onClose} className="flex items-center gap-3">
//                 <Image src={logo} alt="Logo" width={44} height={44} />
//                 <span className="font-semibold text-gray-800">r/alevel</span>
//               </Link>
//               <button
//                 onClick={onClose}
//                 aria-label="Close menu"
//                 className="p-2 rounded-md hover:bg-gray-100 transition"
//               >
//                 <X size={24} />
//               </button>
//             </div>

//             <motion.ul
//               className="flex flex-col gap-2 p-6 flex-1 overflow-auto"
//               initial="hidden"
//               animate="visible"
//               variants={{
//                 hidden: {},
//                 visible: {
//                   transition: { staggerChildren: 0.08 },
//                 },
//               }}
//             >
//               {navListItems.map((item) => (
//                 <motion.li
//                   key={item.title}
//                   variants={{
//                     hidden: { opacity: 0, x: 40 },
//                     visible: { opacity: 1, x: 0 },
//                   }}
//                 >
//                   <Link
//                     href={item.href}
//                     onClick={onClose}
//                     className={`block text-lg font-semibold py-3 rounded-md px-3 transition-colors ${
//                       pathname === item.href
//                         ? "text-blue-600 bg-blue-50"
//                         : "text-gray-800 hover:bg-gray-100"
//                     }`}
//                   >
//                     {item.title}
//                   </Link>
//                 </motion.li>
//               ))}
//             </motion.ul>

//             <div className="p-6 border-t">
//               <motion.a
//                 whileHover={{ scale: 1.05 }}
//                 href="https://www.reddit.com/r/alevel/"
//                 target="_blank"
//                 rel="noreferrer"
//                 onClick={onClose}
//                 className="block w-full text-center bg-blue-600 text-white font-semibold py-3 rounded-full hover:bg-blue-700 transition"
//               >
//                 Join Now
//               </motion.a>
//             </div>
//           </motion.div>
//         </motion.div>
//       </AnimatePresence>,
//       document.body
//     );
//   };

//   return (
//     <>
//       {/* Navbar with entrance animation */}
//       <motion.nav
//         initial={{ y: -80, opacity: 0 }}
//         animate={{ y: 0, opacity: 1 }}
//         transition={{ duration: 0.3, ease: "easeOut" }}
//         className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-md shadow-sm transition-all duration-300 ${
//           scrolled
//             ? "bg-white shadow-lg scale-[1.01]"
//             : "bg-transparent shadow-none scale-100"
//         }`}
//       >
//         <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3">
//           {/* Logo */}
//           <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-3">
//             <Link href="/">
//               <Image src={logo} alt="Logo" width={56} height={56} />
//             </Link>
//             <span
//               className={`hidden sm:block font-semibold text-lg transition-colors duration-300 ${
//                 scrolled ? "text-black" : "text-white"
//               }`}
//             >
//               r/alevel
//             </span>
//           </motion.div>

//           {/* Desktop nav links */}
//           <div className="hidden lg2:flex items-center gap-8">
//             {navListItems.map((item, i) => {
//               const isCurrent = pathname === item.href;
//               return (
//                 <motion.div
//                   key={item.title}
//                   initial={{ opacity: 0, y: -20 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   transition={{ delay: i * 0.1 + 0.5 }}
//                 >
//                   <Link
//                     href={item.href}
//                     className={`relative px-1 py-1 text-sm font-medium transition-all duration-300 ${
//                       isCurrent
//                         ? scrolled
//                           ? "text-blue-600"
//                           : "text-white"
//                         : scrolled
//                         ? "text-black hover:text-blue-600"
//                         : "text-white hover:scale-110"
//                     }`}
//                   >
//                     {item.title}
//                     <motion.span
//                       layoutId={`underline-${item.title}`}
//                       className={`absolute left-0 -bottom-1 h-[2px] w-full ${
//                         scrolled ? "bg-blue-600" : "bg-white"
//                       }`}
//                       initial={{ scaleX: 0 }}
//                       whileHover={{ scaleX: 1 }}
//                       transition={{ duration: 0.3 }}
//                     />
//                   </Link>
//                 </motion.div>
//               );
//             })}
//           </div>

//           {/* Join button */}
//           <motion.a
//             whileHover={{ scale: 1.08 }}
//             href="https://www.reddit.com/r/alevel/"
//             target="_blank"
//             rel="noreferrer"
//             className={`hidden lg2:inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold shadow-sm transition-all duration-300 ${
//               scrolled
//                 ? "bg-blue-600 text-white hover:bg-blue-700"
//                 : "bg-white/20 text-white hover:bg-white/30"
//             }`}
//           >
//             Join Now
//           </motion.a>

//           {/* Mobile menu button */}
//           <motion.button
//             whileTap={{ scale: 0.9 }}
//             onClick={() => setIsActive(true)}
//             aria-label="Open menu"
//             className="lg2:hidden p-2 rounded-md hover:bg-gray-100 transition"
//           >
//             <Menu size={22} color={scrolled ? "#000000" : "#ffffff"} />
//           </motion.button>
//         </div>
//       </motion.nav>

//       {isActive && mounted && <MobileOverlay onClose={() => setIsActive(false)} />}
//     </>
//   );
// }
"use client";

import { cldImage } from "@/lib/cloudinary";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";

export default function Navigation() {
  const pathname = usePathname();
  const [isActive, setIsActive] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => setMounted(true), []);

  // Lock scroll when mobile menu is open
  useEffect(() => {
    if (typeof window === "undefined") return;
    document.body.style.overflow = isActive ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isActive]);

  // Detect scroll
  useEffect(() => {
    const handleScroll = () =>
      setScrolled(window.scrollY > window.innerHeight * 0.8);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navListItems = [
    { title: "Home", href: "/" },
    { title: "Certificates", href: "/certificates" },
    { title: "Resources", href: "/resources" },
    { title: "Blogs", href: "/blogs" },
    { title: "Apply", href: "/apply" },
  ];

  const MobileOverlay = ({ onClose }: { onClose: () => void }) => {
    if (!mounted) return null;

    return createPortal(
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex flex-col"
        >
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="bg-white flex flex-col flex-1"
          >
            {/* header */}
            <div className="h-[72px] flex items-center justify-between px-4 border-b bg-white/90 backdrop-blur-sm">
              <Link
                href="/"
                onClick={onClose}
                className="flex items-center gap-3"
              >
                <Image
                  src={cldImage("/logo/Logo only.svg")}
                  alt="Logo"
                  width={44}
                  height={44}
                />
                <span className="font-semibold text-gray-800">r/alevel</span>
              </Link>
              <button
                onClick={onClose}
                aria-label="Close menu"
                className="p-2 rounded-md hover:bg-gray-100 transition"
              >
                <X size={24} />
              </button>
            </div>

            {/* menu links */}
            <motion.ul
              className="flex flex-col gap-2 p-6 flex-1 overflow-auto"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.08 } },
              }}
            >
              {navListItems.map((item) => (
                <motion.li
                  key={item.title}
                  variants={{
                    hidden: { opacity: 0, x: 40 },
                    visible: { opacity: 1, x: 0 },
                  }}
                >
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={`block text-lg font-semibold py-3 rounded-md px-3 transition-colors ${
                      pathname === item.href
                        ? "text-blue-600 bg-blue-50"
                        : "text-gray-800 hover:bg-gray-100"
                    }`}
                  >
                    {item.title}
                  </Link>
                </motion.li>
              ))}

              {/* ✅ Profile link (mobile only) */}
              <motion.li
                key="Profile"
                variants={{
                  hidden: { opacity: 0, x: 40 },
                  visible: { opacity: 1, x: 0 },
                }}
              >
                <Link
                  href="/profile"
                  onClick={onClose}
                  className={`block text-lg font-semibold py-3 rounded-md px-3 transition-colors ${
                    pathname === "/profile"
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-800 hover:bg-gray-100"
                  }`}
                >
                  Profile
                </Link>
              </motion.li>
            </motion.ul>

            {/* footer button */}
            <div className="p-6 border-t">
              <motion.a
                whileHover={{ scale: 1.05 }}
                href="https://www.reddit.com/r/alevel/"
                target="_blank"
                rel="noreferrer"
                onClick={onClose}
                className="block w-full text-center bg-blue-600 text-white font-semibold py-3 rounded-full hover:bg-blue-700 transition"
              >
                Join Now
              </motion.a>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>,
      document.body
    );
  };

  return (
    <>
      {/* Navbar with entrance animation */}
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-md shadow-sm transition-all duration-300 ${
          scrolled
            ? "bg-white shadow-lg scale-[1.01]"
            : "bg-transparent shadow-none scale-100"
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-3"
          >
            <Link href="/">
              <Image
                src={cldImage("/logo/Logo only.svg")}
                alt="Logo"
                width={56}
                height={56}
              />
            </Link>
            <span
              className={`hidden sm:block font-semibold text-lg transition-colors duration-300 ${
                scrolled ? "text-black" : "text-white"
              }`}
            >
              r/alevel
            </span>
          </motion.div>

          {/* Desktop nav links */}
          <div className="hidden lg2:flex items-center gap-8">
            {navListItems.map((item, i) => {
              const isCurrent = pathname === item.href;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 + 0.5 }}
                >
                  <Link
                    href={item.href}
                    className={`relative px-1 py-1 text-sm font-medium transition-all duration-300 ${
                      isCurrent
                        ? scrolled
                          ? "text-blue-600"
                          : "text-white"
                        : scrolled
                        ? "text-black hover:text-blue-600"
                        : "text-white hover:scale-110"
                    }`}
                  >
                    {item.title}
                    <motion.span
                      layoutId={`underline-${item.title}`}
                      className={`absolute left-0 -bottom-1 h-[2px] w-full ${
                        scrolled ? "bg-blue-600" : "bg-white"
                      }`}
                      initial={{ scaleX: 0 }}
                      whileHover={{ scaleX: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {/* Join button */}
          <motion.a
            whileHover={{ scale: 1.08 }}
            href="https://www.reddit.com/r/alevel/"
            target="_blank"
            rel="noreferrer"
            className={`hidden lg2:inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold shadow-sm transition-all duration-300 ${
              scrolled
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-white/20 text-white hover:bg-white/30"
            }`}
          >
            Join Now
          </motion.a>

          {/* Mobile menu button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsActive(true)}
            aria-label="Open menu"
            className="lg2:hidden p-2 rounded-md hover:bg-gray-100 transition"
          >
            <Menu size={22} color={scrolled ? "#000000" : "#ffffff"} />
          </motion.button>
        </div>
      </motion.nav>

      {isActive && mounted && (
        <MobileOverlay onClose={() => setIsActive(false)} />
      )}
    </>
  );
}
