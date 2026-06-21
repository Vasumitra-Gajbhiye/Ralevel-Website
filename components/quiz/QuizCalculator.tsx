"use client";

import { AnimatePresence, motion, useDragControls } from "framer-motion";
import { Delete, GripHorizontal, X } from "lucide-react";
import { useEffect, useState } from "react";

type QuizCalculatorProps = {
  isDesktop: boolean;
  onClose: () => void;
};

export default function QuizCalculator({
  isDesktop,
  onClose,
}: QuizCalculatorProps) {
  const calcDragControls = useDragControls();
  const [calcInput, setCalcInput] = useState("");
  const [calcResult, setCalcResult] = useState("");

  useEffect(() => {
    if (!calcInput) {
      setCalcResult("");
      return;
    }

    let cancelled = false;

    import("mathjs").then((math) => {
      if (cancelled) return;

      try {
        const evalStr = calcInput
          .replace(/×/g, "*")
          .replace(/÷/g, "/")
          .replace(/²/g, "^2")
          .replace(/π/g, "pi")
          .replace(/√\(/g, "sqrt(")
          .replace(/ln\(/g, "log(")
          .replace(/log\(/g, "log10(");
        const res = math.evaluate(evalStr);
        if (res !== undefined && typeof res !== "function") {
          setCalcResult(math.format(res, { precision: 10 }));
        }
      } catch {
        setCalcResult("");
      }
    });

    return () => {
      cancelled = true;
    };
  }, [calcInput]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (["INPUT", "TEXTAREA"].includes(activeEl.tagName) ||
          activeEl.getAttribute("contenteditable") === "true")
      ) {
        return;
      }
      if (e.ctrlKey || e.metaKey) return;

      const key = e.key;
      if (/^[0-9.()]$/.test(key)) handleCalcKey(key);
      else if (key === "+" || key === "-") handleCalcKey(key);
      else if (key === "*" || key === "x") handleCalcKey("×");
      else if (key === "/") {
        e.preventDefault();
        handleCalcKey("÷");
      } else if (key === "Enter" || key === "=") {
        e.preventDefault();
        handleCalcKey("=");
      } else if (key === "Backspace") handleCalcKey("⌫");
      else if (key === "Escape" || key.toLowerCase() === "c") handleCalcKey("C");
      else if (key === "^") handleCalcKey("^");
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [calcResult]);

  const handleCalcKey = (key: string) => {
    if (key === "C") {
      setCalcInput("");
      setCalcResult("");
      return;
    }
    if (key === "⌫") {
      setCalcInput((prev) => prev.slice(0, -1));
      return;
    }
    if (key === "=") {
      if (calcResult) {
        setCalcInput(calcResult);
        setCalcResult("");
      }
      return;
    }

    let append = key;
    if (["sin", "cos", "tan", "log", "ln", "√"].includes(key)) {
      append = `${key}(`;
    }
    setCalcInput((prev) => prev + append);
  };

  return (
    <AnimatePresence>
      <>
        {!isDesktop && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[60]"
            onClick={onClose}
          />
        )}
        <motion.div
          drag={isDesktop}
          dragControls={calcDragControls}
          dragListener={false}
          dragMomentum={false}
          initial={
            isDesktop ? { opacity: 0, y: 20 } : { opacity: 0, y: "100%" }
          }
          animate={isDesktop ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
          exit={isDesktop ? { opacity: 0, y: 20 } : { opacity: 0, y: "100%" }}
          style={isDesktop ? { width: "340px", top: "15vh", left: "8vw" } : {}}
          className={`fixed z-[70] bg-white border border-slate-200 flex flex-col shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] overflow-hidden ${
            isDesktop
              ? "rounded-2xl absolute"
              : "inset-x-4 bottom-24 rounded-3xl"
          }`}
        >
          <div
            onPointerDown={(e) => isDesktop && calcDragControls.start(e)}
            style={{ touchAction: "none" }}
            className={`flex justify-between items-center px-4 py-3 bg-slate-50 border-b border-slate-100 ${
              isDesktop ? "cursor-move" : ""
            }`}
          >
            <div className="flex items-center gap-2">
              {isDesktop && (
                <GripHorizontal className="w-4 h-4 text-slate-300" />
              )}
              <span className="text-sm font-bold text-slate-700">
                Scientific Calculator
              </span>
            </div>
            <button
              onClick={onClose}
              onPointerDown={(e) => e.stopPropagation()}
              className="p-1 hover:bg-slate-200 rounded-md transition-colors text-slate-400 hover:text-slate-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="bg-white p-5 border-b border-slate-100 flex flex-col items-end min-h-[100px] justify-end">
            <div className="text-slate-400 font-mono text-sm tracking-wider mb-1 w-full text-right overflow-hidden text-ellipsis whitespace-nowrap">
              {calcInput || "0"}
            </div>
            <div className="text-3xl font-semibold text-slate-900 font-mono overflow-hidden text-ellipsis whitespace-nowrap">
              {calcResult ? `= ${calcResult}` : "\u00A0"}
            </div>
          </div>
          <div className="p-3 bg-slate-50/50">
            <div className="grid grid-cols-5 gap-2">
              {[
                "sin",
                "cos",
                "tan",
                "C",
                "⌫",
                "x²",
                "√",
                "(",
                ")",
                "÷",
                "^",
                "7",
                "8",
                "9",
                "×",
                "log",
                "4",
                "5",
                "6",
                "-",
                "ln",
                "1",
                "2",
                "3",
                "+",
                "π",
                "e",
                "0",
                ".",
                "=",
              ].map((key, i) => {
                const isNum = [
                  "0",
                  "1",
                  "2",
                  "3",
                  "4",
                  "5",
                  "6",
                  "7",
                  "8",
                  "9",
                  ".",
                ].includes(key);
                const isOp = ["÷", "×", "-", "+", "="].includes(key);
                const isClear = ["C", "⌫"].includes(key);
                let bg =
                  "bg-white hover:bg-slate-100 text-slate-600 border border-slate-200";
                if (isNum) {
                  bg =
                    "bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 shadow-sm font-medium text-lg";
                }
                if (isOp) {
                  bg =
                    "bg-cyan-50 hover:bg-cyan-100 text-cyan-700 border border-cyan-100 font-medium text-lg";
                }
                if (key === "=") {
                  bg =
                    "bg-cyan-600 hover:bg-cyan-700 text-white border border-cyan-700 shadow-sm font-medium text-lg";
                }
                if (isClear) {
                  bg =
                    "bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-100";
                }
                return (
                  <button
                    key={i}
                    onClick={() => handleCalcKey(key)}
                    className={`h-12 rounded-xl flex items-center justify-center transition-colors active:scale-95 ${bg}`}
                  >
                    {key === "⌫" ? <Delete className="w-5 h-5" /> : key}
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>
      </>
    </AnimatePresence>
  );
}
