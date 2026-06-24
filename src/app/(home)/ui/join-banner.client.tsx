"use client";
import dynamic from "next/dynamic";

const JoinBanner = dynamic(() => import("./join-banner"), {
  ssr: false,
});

export default JoinBanner;