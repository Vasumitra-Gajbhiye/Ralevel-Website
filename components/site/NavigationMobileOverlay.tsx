"use client";

import { cldImage } from "@/lib/cloudinary";
import { AnimatePresence, motion } from "framer-motion";
import { LogIn, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { navListItems } from "./navigation-data";

type NavigationMobileOverlayProps = {
  variant: "hero" | "default";
  pathname: string;
  mounted: boolean;
  isSignedIn: boolean;
  onClose: () => void;
};

function MobileAuthFooter({
  isSignedIn,
  onClose,
}: {
  isSignedIn: boolean;
  onClose: () => void;
}) {
  return (
    <div className="p-6 border-t flex flex-col gap-3">
      <a
        href="https://www.reddit.com/r/alevel/"
        target="_blank"
        rel="noreferrer"
        onClick={onClose}
        className="block w-full text-center bg-blue-600 text-white font-semibold py-3 rounded-full hover:bg-blue-700 transition"
      >
        Join Now
      </a>
      {!isSignedIn && (
        <>
          <Link
            href="/sign-in"
            onClick={onClose}
            className="block w-full text-center bg-blue-500 text-white font-semibold py-3 rounded-full hover:bg-blue-600 transition flex items-center justify-center gap-2"
          >
            <LogIn size={18} />
            Sign in
          </Link>
          <Link
            href="/sign-up"
            onClick={onClose}
            className="block w-full text-center border border-blue-500 text-blue-600 font-semibold py-3 rounded-full hover:bg-blue-50 transition"
          >
            Sign up
          </Link>
        </>
      )}
    </div>
  );
}

function HeroMobileOverlay({
  pathname,
  mounted,
  isSignedIn,
  onClose,
}: {
  pathname: string;
  mounted: boolean;
  isSignedIn: boolean;
  onClose: () => void;
}) {
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
            {isSignedIn && (
              <motion.li
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
            )}
          </motion.ul>

          <MobileAuthFooter isSignedIn={isSignedIn} onClose={onClose} />
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}

function DefaultMobileOverlay({
  pathname,
  mounted,
  isSignedIn,
  onClose,
}: {
  pathname: string;
  mounted: boolean;
  isSignedIn: boolean;
  onClose: () => void;
}) {
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
      <div
        onClick={handleClose}
        aria-hidden="true"
        className={`absolute inset-0 bg-black/60 transition-opacity duration-300 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      />
      <div
        className={`absolute inset-0 flex flex-col transform transition-transform duration-300 ease-out ${
          visible ? "translate-x-0" : "translate-x-full"
        }`}
      >
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

        <div
          className={`overflow-auto flex-1 bg-white transition-opacity duration-300 ${
            visible ? "opacity-100" : "opacity-0"
          }`}
        >
          <ul className="flex flex-col gap-2 p-6">
            {navListItems.map((item) => (
              <li key={item.title}>
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

          <MobileAuthFooter isSignedIn={isSignedIn} onClose={handleClose} />
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function NavigationMobileOverlay({
  variant,
  pathname,
  mounted,
  isSignedIn,
  onClose,
}: NavigationMobileOverlayProps) {
  if (variant === "hero") {
    return (
      <HeroMobileOverlay
        pathname={pathname}
        mounted={mounted}
        isSignedIn={isSignedIn}
        onClose={onClose}
      />
    );
  }

  return (
    <DefaultMobileOverlay
      pathname={pathname}
      mounted={mounted}
      isSignedIn={isSignedIn}
      onClose={onClose}
    />
  );
}
