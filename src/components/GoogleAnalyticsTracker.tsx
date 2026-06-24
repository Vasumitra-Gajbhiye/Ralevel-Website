"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function GoogleAnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const url = pathname + searchParams.toString();

    if (window.gtag) {
      window.gtag("config", "G-8WQ1YNJQR8", {
        page_path: url,
      });
    }
  }, [pathname, searchParams]);

  return null;
}
