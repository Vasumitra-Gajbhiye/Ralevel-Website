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
//         " relative z-50 min-h-8 lg:px-16 px-8 justify-between flex py-3 text-lg text-black items-center drop-shadow-md relative"
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
//           src="/home_img/hamburger.png"
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

// // "use client";

// // import Link from "next/link";
// // import Image from "next/image";
// // import { usePathname } from "next/navigation";
// // import logo from "@/public/logo/Logo only.svg";
// // import style from "@/app/(home)/layout ui/layout.module.css";
// // import { useState } from "react";

// // export default function Navigation() {
// //   const pathname = usePathname();
// //   const navListItems = [
// //     { id: 1, title: "Certificates" },
// //     { id: 2, title: "Resources" },
// //     { id: 3, title: "Blogs" },
// //     { id: 4, title: "Team" },
// //   ];

// //   const [isActive, setIsActive] = useState(false);

// //   const openNav = () => setIsActive(true);
// //   const closeNav = () => setIsActive(false);

// //   return (
// //     <nav
// //       className={
// //         style.navigation +
// //         " fixed top-0 left-0 right-0 z-40 bg-white min-h-8 lg:px-16 px-8 flex justify-between py-3 text-lg text-black items-center shadow-md"
// //       }
// //     >
// //       {/* Left side: Logo + Links */}
// //       <div className="flex justify-between lg:w-2/3 md:w-full items-center font-medium">
// //         <div>
// //           <Link href={"/"}>
// //             <Image src={logo} alt="Logo" width={70} />
// //           </Link>
// //         </div>

// //         {/* Desktop Navigation */}
// //         <div className="hidden md:flex justify-around w-full">
// //           <div className="hover:border-b-black transition-all border-b-2 border-b-transparent">
// //             <Link href="/" className={`${pathname === "/" ? "active" : ""}`}>
// //               Home
// //             </Link>
// //           </div>
// //           {navListItems.map((item) => (
// //             <div
// //               key={item.id}
// //               className="hover:border-b-black transition-all border-b-2 border-b-transparent"
// //             >
// //               <Link
// //                 href={`/${item.title.toLowerCase()}`}
// //                 className={`${
// //                   pathname === `/${item.title.toLowerCase()}` ? "active" : ""
// //                 }`}
// //               >
// //                 {item.title}
// //               </Link>
// //             </div>
// //           ))}
// //         </div>
// //       </div>

// //       {/* Join Button (Desktop only) */}
// //       <div className="hidden md:flex bg-cy-500 text-white font-bold px-4 py-1 rounded-full min-w-32 justify-center items-center hover:scale-105 transition-all cursor-pointer">
// //         <a href="https://www.reddit.com/r/alevel/" target="_blank">
// //           Join Now
// //         </a>
// //       </div>

// //       {/* Hamburger Button (Mobile) */}
// //       <div
// //         onClick={openNav}
// //         className="md:hidden cursor-pointer hover:bg-cy-100/[0.2] transition-all rounded-md p-1"
// //       >
// //         <img
// //           src="/home_img/hamburger.png"
// //           alt="hamburger"
// //           className={`w-9 ${isActive ? "hidden" : ""}`}
// //         />
// //       </div>

// //       {/* Mobile Overlay Menu */}
// //       {isActive && (
// //         <div className="fixed top-0 left-0 w-full h-screen z-50 text-white bg-black/80 flex flex-col items-center justify-center gap-10 text-4xl font-semibold">
// //           <a href="/" onClick={closeNav}>Home</a>
// //           <a href="/certificates" onClick={closeNav}>Certificates</a>
// //           <a href="/resources" onClick={closeNav}>Resources</a>
// //           <a href="/blogs" onClick={closeNav}>Blogs</a>
// //           <a href="/team" onClick={closeNav}>Team</a>

// //           <button
// //             onClick={closeNav}
// //             className="absolute top-4 right-8 text-5xl font-light"
// //           >
// //             &times;
// //           </button>
// //         </div>
// //       )}
// //     </nav>
// //   );
// // }

// "use client";

// import Link from "next/link";
// import Image from "next/image";
// import { usePathname } from "next/navigation";
// import { useState } from "react";
// import logo from "@/public/logo/Logo only.svg";
// import { Menu, X } from "lucide-react";

// export default function Navigation() {
//   const pathname = usePathname();
//   const [isActive, setIsActive] = useState(false);

//   const navListItems = [
//     { title: "Home", href: "/" },
//     { title: "Certificates", href: "/certificates" },
//     { title: "Resources", href: "/resources" },
//     { title: "Blogs", href: "/blogs" },
//     { title: "Team", href: "/team" },
//   ];

//   return (
//     <nav className="sticky top-0 z-50 bg-white/60 backdrop-blur-md border-b border-gray-200 shadow-sm">
//       <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
//         {/* Logo */}
//         <Link href="/" className="flex items-center gap-2">
//           <Image src={logo} alt="Logo" width={60} height={60} />
//           <span className="font-semibold text-lg tracking-wide text-gray-800 hidden sm:block">
//             r/alevel
//           </span>
//         </Link>

//         {/* Desktop Nav */}
//         <div className="hidden md:flex items-center gap-8 font-medium">
//           {navListItems.map((item) => {
//             const isCurrent = pathname === item.href;
//             return (
//               <Link
//                 key={item.title}
//                 href={item.href}
//                 className={`relative transition-colors hover:text-blue-600 ${
//                   isCurrent ? "text-blue-600" : "text-gray-700"
//                 }`}
//               >
//                 {item.title}
//                 <span
//                   className={`absolute left-0 -bottom-1 h-[2px] w-full bg-blue-600 transition-transform duration-300 ${
//                     isCurrent ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
//                   } origin-left`}
//                 ></span>
//               </Link>
//             );
//           })}
//         </div>

//         {/* Join Button */}
//         <a
//           href="https://www.reddit.com/r/alevel/"
//           target="_blank"
//           className="hidden md:inline-flex bg-blue-600 text-white font-semibold px-4 py-2 rounded-full shadow-md hover:bg-blue-700 transition-all"
//         >
//           Join Now
//         </a>

//         {/* Mobile Menu Button */}
//         <button
//           onClick={() => setIsActive((prev) => !prev)}
//           className="md:hidden p-2 rounded-md hover:bg-gray-100 transition"
//           aria-label="Toggle menu"
//         >
//           {isActive ? <X size={26} /> : <Menu size={26} />}
//         </button>
//       </div>

//       {/* Mobile Menu Overlay */}
//       <div
//         className={`fixed inset-0 bg-white/90 backdrop-blur-lg z-40 flex flex-col items-center justify-center gap-8 text-2xl font-semibold transition-all duration-500 ${
//           isActive ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-5 pointer-events-none"
//         }`}
//       >
//         {navListItems.map((item) => (
//           <Link
//             key={item.title}
//             href={item.href}
//             onClick={() => setIsActive(false)}
//             className={`transition-colors hover:text-blue-600 ${
//               pathname === item.href ? "text-blue-600" : "text-gray-800"
//             }`}
//           >
//             {item.title}
//           </Link>
//         ))}
//         <a
//           href="https://www.reddit.com/r/alevel/"
//           target="_blank"
//           onClick={() => setIsActive(false)}
//           className="bg-blue-600 text-white font-semibold px-6 py-2 rounded-full shadow-md hover:bg-blue-700 transition-all"
//         >
//           Join Now
//         </a>
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
//     if (isActive) {
//       document.body.style.overflow = "hidden";
//     } else {
//       document.body.style.overflow = "";
//     }
//     return () => {
//       document.body.style.overflow = "";
//     };
//   }, [isActive]);

//   // close menu when route changes
//   useEffect(() => {
//     setIsActive(false);
//   }, [pathname]);

//   const navListItems = [
//     { title: "Home", href: "/" },
//     { title: "Certificates", href: "/certificates" },
//     { title: "Resources", href: "/resources" },
//     { title: "Blogs", href: "/blogs" },
//     { title: "Team", href: "/team" },
//   ];

//   // Mobile overlay content — rendered into body via portal
//   const MobileOverlay = () => {
//     if (!mounted) return null;

//     return createPortal(
//       <div className="fixed inset-0 z-[9999]">
//         {/* dark overlay */}
//         <div
//           className="absolute inset-0 bg-black/60"
//           onClick={() => setIsActive(false)}
//           aria-hidden="true"
//         />

//         {/* panel */}
//         <div className="absolute inset-0 flex flex-col">
//           {/* top bar inside overlay */}
//           <div className="h-[72px] flex items-center justify-between px-4 border-b bg-white/90 backdrop-blur-sm z-10">
//             <Link href="/" onClick={() => setIsActive(false)} className="flex items-center gap-3">
//               <Image src={logo} alt="Logo" width={44} height={44} />
//               <span className="font-semibold text-gray-800">r/alevel</span>
//             </Link>

//             <button
//               onClick={() => {
//                 setIsActive(false);
//               }}
//               aria-label="Close menu"
//               className="p-2 rounded-md hover:bg-gray-100 transition"
//             >
//               <X size={24} />
//             </button>
//           </div>

//           <div className="overflow-auto flex-1 bg-white z-0">
//             <ul className="flex flex-col gap-2 p-6">
//               {navListItems.map((item) => (
//                 <li key={item.title}>
//                   <Link
//                     href={item.href}
//                     onClick={() => setIsActive(false)}
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
//                 onClick={() => setIsActive(false)}
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
//       <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
//         <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3">
//           {/* logo */}
//           <Link href="/" className="flex items-center gap-3">
//             <Image src={logo} alt="Logo" width={56} height={56} />
//             <span className="hidden sm:block font-semibold text-lg text-gray-800">r/alevel</span>
//           </Link>

//           {/* desktop nav */}
//           <div className="hidden md:flex items-center gap-8">
//             {navListItems.map((item) => {
//               const isCurrent = pathname === item.href;
//               return (
//                 <Link
//                   key={item.title}
//                   href={item.href}
//                   className={`relative px-1 py-1 text-sm font-medium transition-colors ${
//                     isCurrent ? "text-blue-600" : "text-gray-700 hover:text-blue-600"
//                   }`}
//                 >
//                   {item.title}
//                   <span
//                     className={`absolute left-0 -bottom-1 h-[2px] w-full bg-blue-600 transform origin-left transition-transform duration-300 ${
//                       isCurrent ? "scale-x-100" : "scale-x-0"
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
//             className="hidden md:inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-sm hover:bg-blue-700 transition"
//           >
//             Join Now
//           </a>

//           {/* mobile button */}
//           <button
//             onClick={() => {
//               // debug log so you can inspect console if it still fails
//               // eslint-disable-next-line no-console
//               console.log("hamburger clicked, opening mobile menu");
//               setIsActive(true);
//             }}
//             aria-label="Open menu"
//             className="md:hidden p-2 rounded-md hover:bg-gray-100 transition"
//           >
//             <Menu size={22} />
//           </button>
//         </div>
//       </nav>

//       {/* render the portal overlay only when active */}
//       {isActive && mounted && <MobileOverlay />}
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
//   const [showContent, setShowContent] = useState(false); // for animation

//   useEffect(() => setMounted(true), []);

//   // prevent body scroll
// useEffect(() => {
//   if (typeof window === "undefined") return;
//   document.body.style.overflow = isActive ? "hidden" : "";
//   return () => {
//     document.body.style.overflow = "";
//   };
// }, [isActive]);
//   // close menu when route changes
//   useEffect(() => {
//     setIsActive(false);
//   }, [pathname]);

//   const navListItems = [
//     { title: "Home", href: "/" },
//     { title: "Certificates", href: "/certificates" },
//     { title: "Resources", href: "/resources" },
//     { title: "Blogs", href: "/blogs" },
//     { title: "Team", href: "/team" },
//   ];

//   // mobile overlay animation logic
//   const MobileOverlay = () => {
//     if (!mounted) return null;

//     useEffect(() => {
//       const timer = setTimeout(() => setShowContent(true), 20);
//       return () => clearTimeout(timer);
//     }, []);

//     const handleClose = () => {
//       setShowContent(false);
//       setTimeout(() => setIsActive(false), 250); // wait for animation to finish
//     };

//     return createPortal(
//       <div className="fixed inset-0 z-[9999]">
//         {/* Dark background with fade-in */}
//         <div
//           onClick={handleClose}
//           aria-hidden="true"
//           className={`absolute inset-0 bg-black/60 transition-opacity duration-300 ${
//             showContent ? "opacity-100" : "opacity-0"
//           }`}
//         />

//         {/* Sliding panel */}
//         <div
//           className={`absolute inset-0 flex flex-col transform transition-transform duration-300 ease-out ${
//             showContent ? "translate-x-0" : "translate-x-full"
//           }`}
//         >
//           {/* Top bar inside overlay */}
//           <div className="h-[72px] flex items-center justify-between px-4 border-b bg-white/90 backdrop-blur-sm z-10">
//             <Link
//               href="/"
//               onClick={handleClose}
//               className="flex items-center gap-3"
//             >
//               <Image src={logo} alt="Logo" width={44} height={44} />
//               <span className="font-semibold text-gray-800">r/alevel</span>
//             </Link>

//             <button
//               onClick={handleClose}
//               aria-label="Close menu"
//               className="p-2 rounded-md hover:bg-gray-100 transition"
//             >
//               <X size={24} />
//             </button>
//           </div>

//           {/* Content fade-in */}
//           <div
//             className={`overflow-auto flex-1 bg-white transition-opacity duration-300 ${
//               showContent ? "opacity-100" : "opacity-0"
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
//       <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm transition-all duration-300">
//         <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3">
//           {/* logo */}
//           <Link href="/" className="flex items-center gap-3">
//             <Image src={logo} alt="Logo" width={56} height={56} />
//             <span className="hidden sm:block font-semibold text-lg text-gray-800">
//               r/alevel
//             </span>
//           </Link>

//           {/* desktop nav */}
//           <div className="hidden md:flex items-center gap-8">
//             {navListItems.map((item) => {
//               const isCurrent = pathname === item.href;
//               return (
//                 <Link
//                   key={item.title}
//                   href={item.href}
//                   className={`relative px-1 py-1 text-sm font-medium transition-all duration-300 ${
//                     isCurrent
//                       ? "text-blue-600"
//                       : "text-gray-700 hover:text-blue-600"
//                   }`}
//                 >
//                   {item.title}
//                   <span
//                     className={`absolute left-0 -bottom-1 h-[2px] w-full bg-blue-600 transform origin-left transition-transform duration-300 ${
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
//             className="hidden md:inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-sm hover:scale-105 hover:bg-blue-700 transition-all duration-300"
//           >
//             Join Now
//           </a>

//           {/* mobile button */}
//           <button
//             onClick={() => setIsActive(true)}
//             aria-label="Open menu"
//             className="md:hidden p-2 rounded-md hover:bg-gray-100 transition"
//           >
//             <Menu size={22} />
//           </button>
//         </div>
//       </nav>

//       {/* Mobile menu portal */}
//       {isActive && mounted && <MobileOverlay />}
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
//               <span className="font-semibold text-gray-800">r/alevel</span>
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
//       <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm transition-all duration-300">
//         <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3">
//           {/* logo */}
//           <Link href="/" className="flex items-center gap-3">
//             <Image src={logo} alt="Logo" width={56} height={56} />
//             <span className="hidden sm:block font-semibold text-lg text-gray-800">r/alevel</span>
//           </Link>

//           {/* desktop nav */}
//           <div className="hidden md:flex items-center gap-8">
//             {navListItems.map((item) => {
//               const isCurrent = pathname === item.href;
//               return (
//                 <Link
//                   key={item.title}
//                   href={item.href}
//                   className={`relative px-1 py-1 text-sm font-medium transition-all duration-300 ${
//                     isCurrent ? "text-blue-600" : "text-gray-700 hover:text-blue-600"
//                   }`}
//                 >
//                   {item.title}
//                   <span
//                     className={`absolute left-0 -bottom-1 h-[2px] w-full bg-blue-600 transform origin-left transition-transform duration-300 ${
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
//             className="hidden md:inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-sm hover:scale-105 hover:bg-blue-700 transition-all duration-300"
//           >
//             Join Now
//           </a>

//           {/* mobile button */}
//           <button
//             onClick={() => setIsActive(true)}
//             aria-label="Open menu"
//             className="md:hidden p-2 rounded-md hover:bg-gray-100 transition"
//           >
//             <Menu size={22} />
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

//   // ✅ FIXED: no conditional hook call
//   const MobileOverlay = ({ onClose }: { onClose: () => void }) => {
//     const [visible, setVisible] = useState(false);

//     useEffect(() => {
//       const t = setTimeout(() => setVisible(true), 20);
//       return () => clearTimeout(t);
//     }, []);

//     const handleClose = () => {
//       setVisible(false);
//       setTimeout(() => onClose(), 320);
//     };

//     // ✅ conditional return placed *after* hooks
//     if (!mounted) return null;

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
//               <span className="font-semibold text-gray-800">r/alevel</span>
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
//       <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm transition-all duration-300">
//         <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3">
//           {/* logo */}
//           <Link href="/" className="flex items-center gap-3">
//             <Image src={logo} alt="Logo" width={56} height={56} />
//             <span className="hidden sm:block font-semibold text-lg text-gray-800">r/alevel</span>
//           </Link>

//           {/* desktop nav */}
//           <div className="hidden md:flex items-center gap-8">
//             {navListItems.map((item) => {
//               const isCurrent = pathname === item.href;
//               return (
//                 <Link
//                   key={item.title}
//                   href={item.href}
//                   className={`relative px-1 py-1 text-sm font-medium transition-all duration-300 ${
//                     isCurrent ? "text-blue-600" : "text-gray-700 hover:text-blue-600"
//                   }`}
//                 >
//                   {item.title}
//                   <span
//                     className={`absolute left-0 -bottom-1 h-[2px] w-full bg-blue-600 transform origin-left transition-transform duration-300 ${
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
//             className="hidden md:inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-sm hover:scale-105 hover:bg-blue-700 transition-all duration-300"
//           >
//             Join Now
//           </a>

//           {/* mobile button */}
//           <button
//             onClick={() => setIsActive(true)}
//             aria-label="Open menu"
//             className="md:hidden p-2 rounded-md hover:bg-gray-100 transition"
//           >
//             <Menu size={22} />
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
// import { useSession, signIn, signOut } from "next-auth/react";
// import logo from "@/public/logo/Logo only.svg";
// import { Menu, X, LogIn, LogOut } from "lucide-react";

// export default function Navigation() {
//   const pathname = usePathname();
//   const [isActive, setIsActive] = useState(false);
//   const [mounted, setMounted] = useState(false);
//   const { data: session } = useSession();

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

//   const MobileOverlay = ({ onClose }: { onClose: () => void }) => {
//     const [visible, setVisible] = useState(false);

//     useEffect(() => {
//       const t = setTimeout(() => setVisible(true), 20);
//       return () => clearTimeout(t);
//     }, []);

//     const handleClose = () => {
//       setVisible(false);
//       setTimeout(() => onClose(), 320);
//     };

//     if (!mounted) return null;

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

//         {/* sliding panel */}
//         <div
//           className={`absolute inset-0 flex flex-col transform transition-transform duration-300 ease-out ${
//             visible ? "translate-x-0" : "translate-x-full"
//           }`}
//         >
//           {/* header */}
//           <div className="h-[72px] flex items-center justify-between px-4 border-b bg-white/90 backdrop-blur-sm z-10">
//             <Link href="/" onClick={handleClose} className="flex items-center gap-3">
//               <Image src={logo} alt="Logo" width={44} height={44} />
//               <span className="font-semibold text-gray-800">r/alevel</span>
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

//             {/* mobile footer */}
//             <div className="p-6 border-t flex flex-col gap-3">
//               <a
//                 href="https://www.reddit.com/r/alevel/"
//                 target="_blank"
//                 rel="noreferrer"
//                 onClick={handleClose}
//                 className="block w-full text-center bg-blue-600 text-white font-semibold py-3 rounded-full hover:bg-blue-700 transition"
//               >
//                 Join Now
//               </a>

//               {/* login/logout (mobile) */}
//               {session?.user ? (
//                 <button
//                   onClick={() => {
//                     signOut();
//                     handleClose();
//                   }}
//                   className="w-full text-center bg-gray-200 text-gray-800 font-semibold py-3 rounded-full hover:bg-gray-300 transition flex items-center justify-center gap-2"
//                 >
//                   <LogOut size={18} />
//                   Sign out
//                 </button>
//               ) : (
//                 <button
//                   onClick={() => {
//                     signIn("google");
//                     handleClose();
//                   }}
//                   className="w-full text-center bg-blue-500 text-white font-semibold py-3 rounded-full hover:bg-blue-600 transition flex items-center justify-center gap-2"
//                 >
//                   <LogIn size={18} />
//                   Sign in with Google
//                 </button>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>,
//       document.body
//     );
//   };

//   return (
//     <>
//       <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm transition-all duration-300">
//         <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3">
//           {/* logo */}
//           <Link href="/" className="flex items-center gap-3">
//             <Image src={logo} alt="Logo" width={56} height={56} />
//             <span className="hidden sm:block font-semibold text-lg text-gray-800">
//               r/alevel
//             </span>
//           </Link>

//           {/* desktop nav */}
//           <div className="hidden md:flex items-center gap-8">
//             {navListItems.map((item) => {
//               const isCurrent = pathname === item.href;
//               return (
//                 <Link
//                   key={item.title}
//                   href={item.href}
//                   className={`relative px-1 py-1 text-sm font-medium transition-all duration-300 ${
//                     isCurrent
//                       ? "text-blue-600"
//                       : "text-gray-700 hover:text-blue-600"
//                   }`}
//                 >
//                   {item.title}
//                   <span
//                     className={`absolute left-0 -bottom-1 h-[2px] w-full bg-blue-600 transform origin-left transition-transform duration-300 ${
//                       isCurrent ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
//                     }`}
//                   />
//                 </Link>
//               );
//             })}
//           </div>

//           {/* right-side buttons (desktop) */}
//           <div className="hidden md:flex items-center gap-3">
//             {/* login/logout button */}
//             {session?.user ? (
//               <button
//                 onClick={() => signOut()}
//                 className="flex items-center gap-2 bg-gray-100 text-gray-800 px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-200 transition-all duration-300 shadow-sm"
//               >
//                 <LogOut size={16} />
//                 <span>Sign out</span>
//               </button>
//             ) : (
//               <button
//                 onClick={() => signIn("google")}
//                 className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-600 transition-all duration-300 shadow-sm"
//               >
//                 <LogIn size={16} />
//                 <span>Sign in</span>
//               </button>
//             )}

//             {/* join button */}
//             <a
//               href="https://www.reddit.com/r/alevel/"
//               target="_blank"
//               rel="noreferrer"
//               className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-sm hover:scale-105 hover:bg-blue-700 transition-all duration-300"
//             >
//               Join Now
//             </a>
//           </div>

//           {/* mobile menu icon */}
//           <button
//             onClick={() => setIsActive(true)}
//             aria-label="Open menu"
//             className="md:hidden p-2 rounded-md hover:bg-gray-100 transition"
//           >
//             <Menu size={22} />
//           </button>
//         </div>
//       </nav>

//       {isActive && mounted && <MobileOverlay onClose={() => setIsActive(false)} />}
//     </>
//   );
// }

"use client";

import { cldImage } from "@/lib/cloudinary";
import { useUser } from "@clerk/nextjs";
import { LogIn, Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { isSignedIn, user } = useUser();
  const [isActive, setIsActive] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // lock body scroll when menu open
  useEffect(() => {
    if (typeof window === "undefined") return;
    document.body.style.overflow = isActive ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isActive]);

  const navListItems = [
    { title: "Home", href: "/" },
    { title: "Certificates", href: "/certificates" },
    { title: "Resources", href: "/resources" },
    { title: "Blogs", href: "/blogs" },
    { title: "Apply", href: "/apply" },
  ];

  // ✅ mobile overlay
  const MobileOverlay = ({ onClose }: { onClose: () => void }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
      const t = setTimeout(() => setVisible(true), 20);
      return () => clearTimeout(t);
    }, []);

    const handleClose = () => {
      setVisible(false);
      setTimeout(() => onClose(), 320);
    };

    if (!mounted) return null;

    return createPortal(
      <div className="fixed inset-0 z-[9999] pointer-events-auto">
        {/* backdrop */}
        <div
          onClick={handleClose}
          aria-hidden="true"
          className={`absolute inset-0 bg-black/60 transition-opacity duration-300 ${
            visible ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* sliding panel */}
        <div
          className={`absolute inset-0 flex flex-col transform transition-transform duration-300 ease-out ${
            visible ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* header */}
          <div className="h-[72px] flex items-center justify-between px-4 border-b bg-white/90 backdrop-blur-sm z-10">
            <Link
              href="/"
              onClick={handleClose}
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
              onClick={handleClose}
              aria-label="Close menu"
              className="p-2 rounded-md hover:bg-gray-100 transition"
            >
              <X size={24} />
            </button>
          </div>

          {/* content */}
          <div
            className={`overflow-auto flex-1 bg-white transition-opacity duration-300 ${
              visible ? "opacity-100" : "opacity-0"
            }`}
          >
            <ul className="flex flex-col gap-2 p-6">
              {navListItems.map((item) => (
                <li key={item.title}>
                  {/* <Link
                    href={item.href}
                    onClick={handleClose}
                    className={`block w-full text-lg font-semibold py-3 rounded-md px-3 transition-colors ${
                      pathname === item.href
                        ? "text-blue-600 bg-blue-50"
                        : "text-gray-800 hover:bg-gray-100"
                    }`}
                  >
                    {item.title}
                  </Link> */}
                  <Link
                    href={item.href}
                    onClick={handleClose}
                    className={`block w-full text-lg font-semibold py-3 rounded-md px-3 transition-colors ${
                      pathname === item.href
                        ? "text-blue-600 bg-blue-50"
                        : "text-gray-800 hover:bg-gray-100"
                    }`}
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
              {/* ✅ Profile link - visible only on mobile */}
              {isSignedIn && (
                <li>
                  <Link
                    href="/profile"
                    onClick={handleClose}
                    className={`block w-full text-lg font-semibold py-3 rounded-md px-3 transition-colors ${
                      pathname === "/profile"
                        ? "text-blue-600 bg-blue-50"
                        : "text-gray-800 hover:bg-gray-100"
                    }`}
                  >
                    Profile
                  </Link>
                </li>
              )}
            </ul>

            {/* mobile footer */}
            <div className="p-6 border-t flex flex-col gap-3">
              <a
                href="https://www.reddit.com/r/alevel/"
                target="_blank"
                rel="noreferrer"
                onClick={handleClose}
                className="block w-full text-center bg-blue-600 text-white font-semibold py-3 rounded-full hover:bg-blue-700 transition"
              >
                Join Now
              </a>

              {!isSignedIn && (
                <>
                  <Link
                    href="/sign-in"
                    onClick={handleClose}
                    className="block w-full text-center bg-blue-500 text-white font-semibold py-3 rounded-full hover:bg-blue-600 transition flex items-center justify-center gap-2"
                  >
                    <LogIn size={18} />
                    Sign in
                  </Link>
                  <Link
                    href="/sign-up"
                    onClick={handleClose}
                    className="block w-full text-center border border-blue-500 text-blue-600 font-semibold py-3 rounded-full hover:bg-blue-50 transition"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>,
      document.body
    );
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3">
          {/* logo */}
          <Link href="/" className="flex items-center gap-3">
            <Image
              src={cldImage("/logo/Logo only.svg")}
              alt="Logo"
              width={56}
              height={56}
            />
            <span className="hidden sm:block font-semibold text-lg text-gray-800">
              r/alevel
            </span>
          </Link>

          {/* desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {navListItems.map((item) => {
              const isCurrent = pathname === item.href;
              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className={`relative px-1 py-1 text-sm font-medium transition-all duration-300 ${
                    isCurrent
                      ? "text-blue-600"
                      : "text-gray-700 hover:text-blue-600"
                  }`}
                >
                  {item.title}
                  <span
                    className={`absolute left-0 -bottom-1 h-[2px] w-full bg-blue-600 transform origin-left transition-transform duration-300 ${
                      isCurrent
                        ? "scale-x-100"
                        : "scale-x-0 group-hover:scale-x-100"
                    }`}
                  />
                </Link>
              );
            })}
          </div>

          {/* right side buttons (desktop) */}
          <div className="hidden md:flex items-center gap-4">
            {isSignedIn ? (
              <div
                onClick={() => router.push("/profile")}
                className="w-9 h-9 rounded-full overflow-hidden border border-gray-300 hover:scale-105 transition-all relative cursor-pointer"
              >
                <Image
                  src={user?.imageUrl ?? "/default-avatar.png"}
                  alt="Profile"
                  fill
                  sizes="36px"
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/sign-in"
                  className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-600 transition-all duration-300 shadow-sm"
                >
                  <LogIn size={16} />
                  <span>Sign in</span>
                </Link>
                <Link
                  href="/sign-up"
                  className="flex items-center gap-2 border border-blue-500 text-blue-600 px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-50 transition-all duration-300"
                >
                  <span>Sign up</span>
                </Link>
              </div>
            )}

            {/* join button */}
            <a
              href="https://www.reddit.com/r/alevel/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-sm hover:scale-105 hover:bg-blue-700 transition-all duration-300"
            >
              Join Now
            </a>
          </div>

          {/* mobile menu icon */}
          <button
            onClick={() => setIsActive(true)}
            aria-label="Open menu"
            className="md:hidden p-2 rounded-md hover:bg-gray-100 transition"
          >
            <Menu size={22} />
          </button>
        </div>
      </nav>

      {isActive && mounted && (
        <MobileOverlay onClose={() => setIsActive(false)} />
      )}
    </>
  );
}
