"use client";

import { cldImage } from "@/lib/cloudinary";
import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { LogIn, Menu } from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { navListItems } from "./navigation-data";

const NavigationMobileOverlay = dynamic(
  () => import("./NavigationMobileOverlay"),
  { ssr: false, loading: () => null }
);

type NavigationProps = {
  variant?: "hero" | "default";
};

function DesktopAuthButtons({
  isSignedIn,
  user,
  router,
  scrolled = true,
}: {
  isSignedIn: boolean;
  user: ReturnType<typeof useUser>["user"];
  router: ReturnType<typeof useRouter>;
  scrolled?: boolean;
}) {
  if (isSignedIn) {
    return (
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
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/sign-in"
        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 shadow-sm ${
          scrolled
            ? "bg-blue-500 text-white hover:bg-blue-600"
            : "bg-white/20 text-white hover:bg-white/30"
        }`}
      >
        <LogIn size={16} />
        <span>Sign in</span>
      </Link>
      <Link
        href="/sign-up"
        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
          scrolled
            ? "border border-blue-500 text-blue-600 hover:bg-blue-50"
            : "border border-white/60 text-white hover:bg-white/20"
        }`}
      >
        <span>Sign up</span>
      </Link>
    </div>
  );
}

function HeroNavigation({
  pathname,
  isSignedIn,
  user,
  router,
  isActive,
  setIsActive,
  mounted,
  scrolled,
}: {
  pathname: string;
  isSignedIn: boolean;
  user: ReturnType<typeof useUser>["user"];
  router: ReturnType<typeof useRouter>;
  isActive: boolean;
  setIsActive: (v: boolean) => void;
  mounted: boolean;
  scrolled: boolean;
}) {
  return (
    <>
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
          <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-3">
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

          <div className="hidden lg2:flex items-center gap-4">
            <DesktopAuthButtons
              isSignedIn={isSignedIn}
              user={user}
              router={router}
              scrolled={scrolled}
            />
            <motion.a
              whileHover={{ scale: 1.08 }}
              href="https://www.reddit.com/r/alevel/"
              target="_blank"
              rel="noreferrer"
              className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold shadow-sm transition-all duration-300 ${
                scrolled
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              Join Now
            </motion.a>
          </div>

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
        <NavigationMobileOverlay
          variant="hero"
          pathname={pathname}
          mounted={mounted}
          isSignedIn={isSignedIn}
          onClose={() => setIsActive(false)}
        />
      )}
    </>
  );
}

function DefaultNavigation({
  pathname,
  isSignedIn,
  user,
  router,
  isActive,
  setIsActive,
  mounted,
}: {
  pathname: string;
  isSignedIn: boolean;
  user: ReturnType<typeof useUser>["user"];
  router: ReturnType<typeof useRouter>;
  isActive: boolean;
  setIsActive: (v: boolean) => void;
  mounted: boolean;
}) {
  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3">
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
                      isCurrent ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                    }`}
                  />
                </Link>
              );
            })}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <DesktopAuthButtons
              isSignedIn={isSignedIn}
              user={user}
              router={router}
            />
            <a
              href="https://www.reddit.com/r/alevel/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-sm hover:scale-105 hover:bg-blue-700 transition-all duration-300"
            >
              Join Now
            </a>
          </div>

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
        <NavigationMobileOverlay
          variant="default"
          pathname={pathname}
          mounted={mounted}
          isSignedIn={isSignedIn}
          onClose={() => setIsActive(false)}
        />
      )}
    </>
  );
}

export default function Navigation({ variant = "default" }: NavigationProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isSignedIn, user } = useUser();
  const [isActive, setIsActive] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    document.body.style.overflow = isActive ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isActive]);

  useEffect(() => {
    if (variant !== "hero") return;
    const handleScroll = () =>
      setScrolled(window.scrollY > window.innerHeight * 0.8);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [variant]);

  if (variant === "hero") {
    return (
      <HeroNavigation
        pathname={pathname}
        isSignedIn={!!isSignedIn}
        user={user}
        router={router}
        isActive={isActive}
        setIsActive={setIsActive}
        mounted={mounted}
        scrolled={scrolled}
      />
    );
  }

  return (
    <DefaultNavigation
      pathname={pathname}
      isSignedIn={!!isSignedIn}
      user={user}
      router={router}
      isActive={isActive}
      setIsActive={setIsActive}
      mounted={mounted}
    />
  );
}
