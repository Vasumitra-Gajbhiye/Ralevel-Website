"use client";
import ReactConfetti from "react-confetti";
import { useWindowSize } from "react-use";

export default function Confetti() {
  const { width, height } = useWindowSize();
  return (
    <ReactConfetti
      width={width}
      height={height}
      recycle={false}
      numberOfPieces={500}
    />
  );
}
