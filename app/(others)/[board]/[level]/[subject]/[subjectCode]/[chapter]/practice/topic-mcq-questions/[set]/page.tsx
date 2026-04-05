// import McqQuiz, { QuizKind } from "@/components/quiz/McqQuiz";
// import { FINAL_TEST, type MCQ } from "@/lib/quiz/waves-content";
// type Params = {
//   quizType: string;
//   set: string;
// };

// export default async function QuizSet({ params }: { params: Promise<Params> }) {
//   const { quizType, set } = await params;
//   const timerEnabled = false;
//   const livesEnabled = false;
//   console.log(quizType, set);
//   let questions: MCQ[] = FINAL_TEST;

//   return (
//     <main className="mx-auto max-w-5xl px-5 py-8 md:py-12">
//       {/* <header className="border-b border-slate-200 pb-8">
//         <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
//           A Level Physics • Waves
//         </p>
//         <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink md:text-5xl">
//           MCQ Practice
//         </h1>
//         <p className="mt-4 max-w-3xl text-base leading-relaxed text-slate-600">
//           {timerEnabled ? "Timer on" : "Timer off"} •{" "}
//           {livesEnabled ? "Lives on" : "Lives off"}
//         </p>
//       </header> */}

//       <McqQuiz
//         title={"A Level Physics • Waves • MCQ • Set 1"}
//         quizKind={"topic" as QuizKind}
//         questions={questions}
//         timerEnabled={timerEnabled}
//         immediateFeedback={livesEnabled}
//       />
//     </main>
//   );
// }

// "use client";

// import { AnimatePresence, motion } from "framer-motion";
// import katex from "katex";
// import "katex/dist/katex.min.css";
// import {
//   Award,
//   BookOpenCheck,
//   CheckCircle2,
//   ChevronLeft,
//   ChevronRight,
//   Clock,
//   FileText,
//   Loader2,
//   Play,
//   Settings2,
//   Target,
//   XCircle,
// } from "lucide-react";
// import { useEffect, useState } from "react";

// // --- MOCK DATA ---
// const SET_STATS = {
//   totalQuestions: 3,
//   totalMarks: 3,
//   estimatedMinutes: 5,
// };

// const questions = [
//   {
//     id: 1,
//     question:
//       "A transverse wave travels along a stretched string. What is the phase difference between two points on the string that are separated by a distance of half a wavelength?",
//     options: [
//       "0 \\text{ rad}",
//       "\\frac{\\pi}{2} \\text{ rad}",
//       "\\pi \\text{ rad}",
//       "2\\pi \\text{ rad}",
//     ],
//     answer: 2, // Index 2 -> \pi rad
//     explain:
//       "A full wavelength ($\\lambda$) corresponds to a phase difference of $2\\pi$. Therefore, a distance of $\\frac{\\lambda}{2}$ corresponds to a phase difference of $\\pi$ radians.",
//   },
//   {
//     id: 2,
//     question:
//       "Which of the following correctly describes the principle of superposition?",
//     options: [
//       "When two waves meet, their amplitudes multiply.",
//       "When two waves meet, the resultant displacement is the vector sum of their individual displacements.",
//       "Waves always reflect when they meet another wave.",
//       "Two waves can never occupy the same space at the same time.",
//     ],
//     answer: 1,
//     explain:
//       "The principle of superposition states that when two or more waves overlap, the resultant displacement at any point is the vector sum of the displacements of the individual waves at that point.",
//   },
//   {
//     id: 3,
//     question:
//       "In a stationary wave, what is the term for a point of zero amplitude?",
//     options: ["Antinode", "Crest", "Trough", "Node"],
//     answer: 3,
//     explain:
//       "A node is a point along a stationary wave where the wave has minimum (or zero) amplitude. This occurs due to destructive interference between the incident and reflected waves.",
//   },
// ];

// // --- UTILS ---
// const safeRenderKatex = (latex: string) => {
//   try {
//     return katex.renderToString(latex || " ", {
//       throwOnError: false,
//       displayMode: false,
//     });
//   } catch (e) {
//     return `<span class="text-red-500">${latex}</span>`;
//   }
// };

// const MathInline = ({ text }: { text: string }) => {
//   // Simple parser to identify $...$ blocks for katex, and render normal text otherwise
//   const parts = text.split(/(\$.*?\$)/g);
//   return (
//     <span>
//       {parts.map((part, idx) => {
//         if (part.startsWith("$") && part.endsWith("$")) {
//           const latex = part.slice(1, -1);
//           return (
//             <span
//               key={idx}
//               dangerouslySetInnerHTML={{ __html: safeRenderKatex(latex) }}
//             />
//           );
//         }
//         return <span key={idx}>{part}</span>;
//       })}
//     </span>
//   );
// };

// // --- REUSABLE COMPONENTS ---
// const Toggle = ({
//   enabled,
//   onChange,
// }: {
//   enabled: boolean;
//   onChange: () => void;
// }) => (
//   <button
//     onClick={onChange}
//     className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 ${
//       enabled ? "bg-cyan-500" : "bg-slate-200"
//     }`}
//   >
//     <span
//       className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
//         enabled ? "translate-x-5" : "translate-x-0"
//       }`}
//     />
//   </button>
// );

// // --- MAIN COMPONENT ---
// export default function McqPractice() {
//   const [hasStarted, setHasStarted] = useState(false);
//   const [isCompleted, setIsCompleted] = useState(false);

//   // Settings
//   const [useTimer, setUseTimer] = useState(true);
//   const [isLearningMode, setIsLearningMode] = useState(true);
//   const [timeLeft, setTimeLeft] = useState(SET_STATS.estimatedMinutes * 60);

//   // Quiz State
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [direction, setDirection] = useState(1);
//   const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
//   const [submittedQuestions, setSubmittedQuestions] = useState<
//     Record<number, boolean>
//   >({});
//   const [isLoading, setIsLoading] = useState(false);

//   const currentQuestion = questions[currentIndex];
//   const isLastQuestion = currentIndex === questions.length - 1;
//   const currentAnswer = userAnswers[currentQuestion.id];
//   const hasAnswered = currentAnswer !== undefined;
//   const isCurrentSubmitted = submittedQuestions[currentQuestion.id] || false;

//   // Timer Logic
//   useEffect(() => {
//     let timer: NodeJS.Timeout;
//     if (hasStarted && !isCompleted && useTimer && timeLeft > 0) {
//       timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
//     }
//     return () => clearInterval(timer);
//   }, [hasStarted, isCompleted, useTimer, timeLeft]);

//   const formatTime = (seconds: number) => {
//     const m = Math.floor(seconds / 60);
//     const s = seconds % 60;
//     return `${m}:${s.toString().padStart(2, "0")}`;
//   };

//   // Handlers
//   const handleSelectOption = (optionIndex: number) => {
//     if (isLearningMode && isCurrentSubmitted) return;
//     setUserAnswers((prev) => ({ ...prev, [currentQuestion.id]: optionIndex }));
//   };

//   const submitCurrentAnswer = () => {
//     if (!hasAnswered || isLoading) return;
//     setIsLoading(true);
//     // Fake evaluation delay for premium feel
//     setTimeout(() => {
//       setIsLoading(false);
//       setSubmittedQuestions((prev) => ({
//         ...prev,
//         [currentQuestion.id]: true,
//       }));
//     }, 400);
//   };

//   const goNext = () => {
//     if (currentIndex < questions.length - 1) {
//       setDirection(1);
//       setCurrentIndex((prev) => prev + 1);
//     }
//   };

//   const goPrev = () => {
//     if (currentIndex > 0) {
//       setDirection(-1);
//       setCurrentIndex((prev) => prev - 1);
//     }
//   };

//   const finishPractice = () => {
//     // If practicing without learning mode, mark all answered as submitted for the results screen
//     if (!isLearningMode) {
//       const allSubmitted: Record<number, boolean> = {};
//       questions.forEach((q) => {
//         if (userAnswers[q.id] !== undefined) allSubmitted[q.id] = true;
//       });
//       setSubmittedQuestions(allSubmitted);
//     }
//     setIsCompleted(true);
//   };

//   // --- RENDER MODES ---

//   // 1. INTRO SCREEN
//   if (!hasStarted) {
//     return (
//       <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="max-w-md w-full bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100"
//         >
//           <div className="w-12 h-12 bg-cyan-50 text-cyan-600 rounded-2xl flex items-center justify-center mb-6">
//             <Target className="w-6 h-6" />
//           </div>
//           <h1 className="text-2xl font-bold text-slate-900 mb-2">
//             Physics Multiple Choice
//           </h1>
//           <p className="text-slate-500 mb-8">
//             Test your understanding of wave mechanics and superposition.
//           </p>

//           <div className="grid grid-cols-3 gap-4 mb-8">
//             <div className="bg-slate-50 p-4 rounded-2xl text-center border border-slate-100">
//               <FileText className="w-5 h-5 text-slate-400 mx-auto mb-2" />
//               <div className="text-xl font-bold text-slate-800">
//                 {SET_STATS.totalQuestions}
//               </div>
//               <div className="text-xs font-medium text-slate-500 uppercase mt-1">
//                 Questions
//               </div>
//             </div>
//             <div className="bg-slate-50 p-4 rounded-2xl text-center border border-slate-100">
//               <Award className="w-5 h-5 text-slate-400 mx-auto mb-2" />
//               <div className="text-xl font-bold text-slate-800">
//                 {SET_STATS.totalMarks}
//               </div>
//               <div className="text-xs font-medium text-slate-500 uppercase mt-1">
//                 Total Marks
//               </div>
//             </div>
//             <div className="bg-slate-50 p-4 rounded-2xl text-center border border-slate-100">
//               <Clock className="w-5 h-5 text-slate-400 mx-auto mb-2" />
//               <div className="text-xl font-bold text-slate-800">
//                 {SET_STATS.estimatedMinutes}m
//               </div>
//               <div className="text-xs font-medium text-slate-500 uppercase mt-1">
//                 Duration
//               </div>
//             </div>
//           </div>

//           <div className="space-y-4 mb-8">
//             <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-white">
//               <div className="flex items-center gap-3">
//                 <Clock className="w-5 h-5 text-slate-400" />
//                 <div>
//                   <p className="text-sm font-medium text-slate-800">
//                     Strict Timer
//                   </p>
//                   <p className="text-xs text-slate-500">
//                     Enable countdown timer
//                   </p>
//                 </div>
//               </div>
//               <Toggle
//                 enabled={useTimer}
//                 onChange={() => setUseTimer(!useTimer)}
//               />
//             </div>
//             <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-white">
//               <div className="flex items-center gap-3">
//                 <Settings2 className="w-5 h-5 text-slate-400" />
//                 <div>
//                   <p className="text-sm font-medium text-slate-800">
//                     Learning Mode
//                   </p>
//                   <p className="text-xs text-slate-500">
//                     Get feedback after every question
//                   </p>
//                 </div>
//               </div>
//               <Toggle
//                 enabled={isLearningMode}
//                 onChange={() => setIsLearningMode(!isLearningMode)}
//               />
//             </div>
//           </div>
//           <button
//             onClick={() => setHasStarted(true)}
//             className="w-full flex items-center justify-center gap-2 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium transition-all shadow-sm"
//           >
//             Start Practice <Play className="w-4 h-4 fill-current" />
//           </button>
//         </motion.div>
//       </div>
//     );
//   }

//   // 2. COMPLETED SCREEN
//   if (isCompleted) {
//     const totalAchieved = questions.reduce((sum, q) => {
//       return submittedQuestions[q.id] && userAnswers[q.id] === q.answer
//         ? sum + 1
//         : sum;
//     }, 0);

//     return (
//       <div className="min-h-screen bg-slate-50 text-slate-800 py-12 px-4 pb-32">
//         <div className="max-w-3xl mx-auto space-y-8">
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-center"
//           >
//             <Award className="w-12 h-12 text-cyan-500 mx-auto mb-4" />
//             <h1 className="text-3xl font-bold text-slate-900 mb-2">
//               Practice Complete!
//             </h1>
//             <div className="text-5xl font-bold text-cyan-600 mt-6 flex justify-center items-baseline gap-2">
//               {totalAchieved}{" "}
//               <span className="text-2xl text-slate-400">
//                 / {SET_STATS.totalMarks}
//               </span>
//             </div>
//             <p className="text-slate-500 font-medium uppercase tracking-widest text-sm mt-2">
//               Total Score
//             </p>
//           </motion.div>

//           <div className="space-y-6">
//             {questions.map((q, idx) => {
//               const userAnswer = userAnswers[q.id];
//               const isCorrect = userAnswer === q.answer;
//               const isOmitted = userAnswer === undefined;

//               return (
//                 <motion.div
//                   key={q.id}
//                   initial={{ opacity: 0, y: 10 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   transition={{ delay: idx * 0.1 }}
//                   className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm"
//                 >
//                   <div className="flex justify-between items-start mb-6">
//                     <h3 className="text-lg font-semibold text-slate-900">
//                       <span className="text-cyan-600 mr-2">Q{idx + 1}.</span>
//                       <MathInline text={q.question} />
//                     </h3>
//                     <div
//                       className={`px-3 py-1 font-bold rounded-lg text-sm shrink-0 ${
//                         isCorrect
//                           ? "bg-green-50 text-green-700"
//                           : isOmitted
//                           ? "bg-slate-100 text-slate-500"
//                           : "bg-red-50 text-red-700"
//                       }`}
//                     >
//                       {isCorrect ? "1 / 1" : "0 / 1"}
//                     </div>
//                   </div>

//                   <div className="space-y-3 mb-6">
//                     {q.options.map((opt, oIdx) => {
//                       const isThisUserAnswer = userAnswer === oIdx;
//                       const isThisCorrectAnswer = q.answer === oIdx;

//                       let bgClass = "bg-white border-slate-200 opacity-50";
//                       let icon = null;

//                       if (isThisCorrectAnswer) {
//                         bgClass = "bg-green-50 border-green-500 text-green-900";
//                         icon = (
//                           <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
//                         );
//                       } else if (isThisUserAnswer && !isThisCorrectAnswer) {
//                         bgClass = "bg-red-50 border-red-500 text-red-900";
//                         icon = (
//                           <XCircle className="w-5 h-5 text-red-500 shrink-0" />
//                         );
//                       }

//                       return (
//                         <div
//                           key={oIdx}
//                           className={`w-full flex items-center gap-4 p-4 rounded-xl border ${bgClass}`}
//                         >
//                           <div className="w-6 h-6 rounded-full border-2 border-current flex-shrink-0 flex items-center justify-center bg-white/50">
//                             {icon}
//                           </div>
//                           <span className="text-base font-medium">
//                             <MathInline text={opt} />
//                           </span>
//                         </div>
//                       );
//                     })}
//                   </div>

//                   <div className="space-y-4 pt-6 border-t border-slate-100">
//                     <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
//                       <BookOpenCheck className="w-4 h-4 text-cyan-500" />
//                       Explanation
//                     </h3>
//                     <div className="p-5 bg-cyan-50/30 border border-cyan-100 rounded-2xl text-slate-700 leading-relaxed text-sm">
//                       <MathInline text={q.explain} />
//                     </div>
//                   </div>
//                 </motion.div>
//               );
//             })}
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // 3. ACTIVE QUIZ UI
//   return (
//     <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex justify-center pt-12 pb-32 px-4 overflow-x-hidden relative">
//       <div className="w-full max-w-2xl relative z-10">
//         {/* HEADER */}
//         <div className="flex justify-between items-center mb-8 px-2">
//           <div className="flex items-center gap-4">
//             <h2 className="text-sm font-semibold tracking-wide text-slate-500 uppercase">
//               {isLearningMode ? "Learning Mode" : "Practice Mode"}
//             </h2>
//             {useTimer && (
//               <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
//                 <Clock className="w-4 h-4 text-slate-400" />
//                 <span className={timeLeft < 60 ? "text-red-500 font-bold" : ""}>
//                   {formatTime(timeLeft)}
//                 </span>
//               </div>
//             )}
//           </div>
//           <div className="text-sm font-medium text-cyan-600 bg-cyan-50 px-3 py-1 rounded-full border border-cyan-100 hidden sm:block">
//             Question {currentIndex + 1} / {questions.length}
//           </div>
//         </div>

//         {/* MAIN CARD */}
//         <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden border border-slate-100 flex flex-col relative">
//           <div className="p-8 md:p-10 flex-grow relative">
//             <AnimatePresence mode="wait" custom={direction}>
//               <motion.div
//                 key={
//                   currentQuestion.id + (isCurrentSubmitted ? "-eval" : "-input")
//                 }
//                 initial={{ opacity: 0, x: direction * 20 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 exit={{ opacity: 0, x: -direction * 20 }}
//                 transition={{ duration: 0.3, ease: "easeOut" }}
//               >
//                 <h1 className="text-2xl md:text-3xl font-medium leading-snug text-slate-900 mb-8">
//                   <MathInline text={currentQuestion.question} />
//                 </h1>

//                 {/* OPTIONS LIST */}
//                 <div className="space-y-4">
//                   {currentQuestion.options.map((opt, oIdx) => {
//                     const isSelected = currentAnswer === oIdx;
//                     const isCorrect = currentQuestion.answer === oIdx;

//                     // Evaluate styling states based on mode and submission
//                     let stateClasses =
//                       "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700";
//                     let showIcon = false;
//                     let iconContent = null;

//                     if (isLearningMode && isCurrentSubmitted) {
//                       if (isCorrect) {
//                         stateClasses =
//                           "bg-green-50 border-green-500 text-green-900 shadow-sm";
//                         showIcon = true;
//                         iconContent = (
//                           <CheckCircle2 className="w-5 h-5 text-green-500" />
//                         );
//                       } else if (isSelected) {
//                         stateClasses =
//                           "bg-red-50 border-red-500 text-red-900 shadow-sm";
//                         showIcon = true;
//                         iconContent = (
//                           <XCircle className="w-5 h-5 text-red-500" />
//                         );
//                       } else {
//                         stateClasses =
//                           "bg-white border-slate-200 opacity-40 text-slate-400";
//                       }
//                     } else if (isSelected) {
//                       stateClasses =
//                         "bg-cyan-50 border-cyan-500 ring-1 ring-cyan-200 text-cyan-900 shadow-sm";
//                     }

//                     return (
//                       <button
//                         key={oIdx}
//                         onClick={() => handleSelectOption(oIdx)}
//                         disabled={isLearningMode && isCurrentSubmitted}
//                         className={`w-full flex items-center gap-5 p-5 rounded-2xl border-2 transition-all duration-200 text-left ${stateClasses}`}
//                       >
//                         {/* Radio / Status Indicator */}
//                         <div
//                           className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
//                             showIcon
//                               ? "border-transparent bg-white/50"
//                               : isSelected
//                               ? "border-cyan-500 bg-white"
//                               : "border-slate-300 bg-white"
//                           }`}
//                         >
//                           {showIcon
//                             ? iconContent
//                             : isSelected && (
//                                 <div className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
//                               )}
//                         </div>

//                         {/* Option Text */}
//                         <span className="text-lg font-medium leading-relaxed">
//                           <MathInline text={opt} />
//                         </span>
//                       </button>
//                     );
//                   })}
//                 </div>

//                 {/* EXPLANATION REVEAL (Learning Mode Only) */}
//                 <AnimatePresence>
//                   {isLearningMode && isCurrentSubmitted && (
//                     <motion.div
//                       initial={{ opacity: 0, y: 10, height: 0 }}
//                       animate={{ opacity: 1, y: 0, height: "auto" }}
//                       className="mt-8 overflow-hidden"
//                     >
//                       <div className="space-y-4 pt-6 border-t border-slate-100">
//                         <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
//                           <BookOpenCheck className="w-4 h-4 text-cyan-500" />
//                           Explanation
//                         </h3>
//                         <div className="p-6 bg-cyan-50/50 border border-cyan-100 rounded-2xl text-slate-700 leading-relaxed text-base">
//                           <MathInline text={currentQuestion.explain} />
//                         </div>
//                       </div>
//                     </motion.div>
//                   )}
//                 </AnimatePresence>
//               </motion.div>
//             </AnimatePresence>
//           </div>
//         </div>
//       </div>

//       {/* FLOATING BOTTOM NAVBAR */}
//       <motion.div
//         initial={{ y: 100, opacity: 0, x: "-50%" }}
//         animate={{ y: 0, opacity: 1, x: "-50%" }}
//         className="fixed bottom-6 left-1/2 z-30 flex items-center gap-2 p-2 bg-white/80 backdrop-blur-md border border-slate-200/50 shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-full"
//       >
//         <button
//           onClick={goPrev}
//           disabled={currentIndex === 0}
//           className="w-12 h-12 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
//           aria-label="Previous Question"
//         >
//           <ChevronLeft className="w-6 h-6" />
//         </button>

//         <div className="flex-shrink-0 flex items-center justify-center gap-2 min-w-[160px] relative">
//           {isLearningMode && !isCurrentSubmitted ? (
//             <button
//               onClick={submitCurrentAnswer}
//               disabled={!hasAnswered || isLoading}
//               className="flex items-center justify-center gap-2 w-full py-3 px-6 bg-cyan-600 hover:bg-cyan-700 text-white rounded-full font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
//             >
//               {isLoading ? (
//                 <Loader2 className="w-5 h-5 animate-spin" />
//               ) : (
//                 "Check Answer"
//               )}
//             </button>
//           ) : isLastQuestion ? (
//             <button
//               onClick={finishPractice}
//               className="flex items-center justify-center gap-2 w-full py-3 px-6 bg-slate-900 hover:bg-slate-800 text-white rounded-full font-bold transition-all shadow-sm"
//             >
//               Finish Set
//               <CheckCircle2 className="w-4 h-4 ml-1" />
//             </button>
//           ) : (
//             <div className="px-6 py-3 font-bold text-slate-400 text-sm tracking-widest uppercase">
//               {currentIndex + 1} of {questions.length}
//             </div>
//           )}
//         </div>

//         <button
//           onClick={goNext}
//           disabled={isLastQuestion}
//           className="w-12 h-12 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
//           aria-label="Next Question"
//         >
//           <ChevronRight className="w-6 h-6" />
//         </button>
//       </motion.div>
//     </div>
//   );
// }

// "use client";

// import { AnimatePresence, motion, useDragControls } from "framer-motion";
// import katex from "katex";
// import "katex/dist/katex.min.css";
// import {
//   Award,
//   BookOpenCheck,
//   Calculator,
//   CheckCircle2,
//   ChevronLeft,
//   ChevronRight,
//   Clock,
//   Delete,
//   FileText,
//   GripHorizontal,
//   Info,
//   Lightbulb,
//   Loader2,
//   Play,
//   Settings2,
//   Target,
//   X,
//   XCircle,
// } from "lucide-react";
// import * as math from "mathjs";
// import { useEffect, useState } from "react";

// // --- MOCK DATA ---
// const SET_STATS = {
//   totalQuestions: 3,
//   totalMarks: 3,
//   estimatedMinutes: 5,
// };

// const questions = [
//   {
//     id: 1,
//     question:
//       "A transverse wave travels along a stretched string. What is the phase difference between two points on the string that are separated by a distance of $\\frac{\\lambda}{2}$?",
//     options: [
//       "0 \\text{ rad}",
//       "\\frac{\\pi}{2} \\text{ rad}",
//       "\\pi \\text{ rad}",
//       "2\\pi \\text{ rad}",
//     ],
//     answer: 2,
//     hints: [
//       "Remember that a full wavelength corresponds to a complete cycle.",
//       "A complete cycle in radians is $2\\pi$.",
//     ],
//     explain:
//       "A full wavelength ($\\lambda$) corresponds to a phase difference of $2\\pi$. Therefore, a distance of $\\frac{\\lambda}{2}$ corresponds exactly to half of that phase difference, which is $\\pi$ radians.",
//     mockAnswer:
//       "Model Concept: Phase difference $\\Delta\\phi$ is related to path difference $\\Delta x$ by the formula $\\Delta\\phi = \\frac{2\\pi}{\\lambda} \\Delta x$. Substituting $\\Delta x = \\frac{\\lambda}{2}$ yields $\\pi$ radians.",
//   },
//   {
//     id: 2,
//     question:
//       "Which of the following correctly describes the principle of superposition?",
//     options: [
//       "When two waves meet, their amplitudes multiply.",
//       "When two waves meet, the resultant displacement is the vector sum of their individual displacements.",
//       "Waves always reflect when they meet another wave.",
//       "Two waves can never occupy the same space at the same time.",
//     ],
//     answer: 1,
//     hints: [
//       "Think about what happens to the height (displacement) of the water when two ripples crash into each other.",
//       "Is it a scalar addition or a vector addition?",
//     ],
//     explain:
//       "The principle of superposition states that when two or more waves overlap, the resultant displacement at any point is the vector sum of the displacements of the individual waves at that point.",
//     mockAnswer:
//       "Model Concept: Superposition is a fundamental property of all linear wave systems (light, sound, water). Constructive interference occurs when displacements are in the same direction, and destructive when opposite.",
//   },
//   {
//     id: 3,
//     question:
//       "In a stationary wave, what is the specific term for a point of minimum or zero amplitude?",
//     options: ["Antinode", "Crest", "Trough", "Node"],
//     answer: 3,
//     hints: [], // No hints for the final question
//     explain:
//       "A node is a point along a stationary wave where the wave has minimum (or zero) amplitude. This occurs due to continuous destructive interference between the incident and reflected waves.",
//     mockAnswer:
//       "Model Concept: Stationary waves are characterized by alternating Nodes (zero amplitude) and Antinodes (maximum amplitude). The distance between two adjacent nodes is exactly $\\frac{\\lambda}{2}$.",
//   },
// ];

// // --- UTILS ---
// const safeRenderKatex = (latex: string) => {
//   try {
//     return katex.renderToString(latex || " ", {
//       throwOnError: false,
//       displayMode: false,
//     });
//   } catch (e) {
//     return `<span class="text-red-500">${latex}</span>`;
//   }
// };

// // Intelligently renders either pure LaTeX (for options) or mixed text (for questions)
// const MathInline = ({
//   text,
//   isPureMath = false,
// }: {
//   text: string;
//   isPureMath?: boolean;
// }) => {
//   if (isPureMath) {
//     return <span dangerouslySetInnerHTML={{ __html: safeRenderKatex(text) }} />;
//   }
//   const parts = text.split(/(\$.*?\$)/g);
//   return (
//     <span>
//       {parts.map((part, idx) => {
//         if (part.startsWith("$") && part.endsWith("$")) {
//           const latex = part.slice(1, -1);
//           return (
//             <span
//               key={idx}
//               dangerouslySetInnerHTML={{ __html: safeRenderKatex(latex) }}
//               className="mx-1"
//             />
//           );
//         }
//         return <span key={idx}>{part}</span>;
//       })}
//     </span>
//   );
// };

// // --- REUSABLE COMPONENTS ---
// const Toggle = ({
//   enabled,
//   onChange,
// }: {
//   enabled: boolean;
//   onChange: () => void;
// }) => (
//   <button
//     onClick={onChange}
//     className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 ${
//       enabled ? "bg-cyan-500" : "bg-slate-200"
//     }`}
//   >
//     <span
//       className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
//         enabled ? "translate-x-5" : "translate-x-0"
//       }`}
//     />
//   </button>
// );

// // --- MAIN COMPONENT ---
// export default function McqPractice() {
//   const [hasStarted, setHasStarted] = useState(false);
//   const [isCompleted, setIsCompleted] = useState(false);

//   // Settings
//   const [useTimer, setUseTimer] = useState(true);
//   const [isLearningMode, setIsLearningMode] = useState(true);
//   const [timeLeft, setTimeLeft] = useState(SET_STATS.estimatedMinutes * 60);

//   // Quiz State
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [direction, setDirection] = useState(1);
//   const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
//   const [submittedQuestions, setSubmittedQuestions] = useState<
//     Record<number, boolean>
//   >({});
//   const [isLoading, setIsLoading] = useState(false);

//   // UI Helpers
//   const [showHintPopover, setShowHintPopover] = useState(false);
//   const [revealedHints, setRevealedHints] = useState(1);

//   // Draggable Modals State & Controls
//   const [isDesktop, setIsDesktop] = useState(true);
//   const [showReference, setShowReference] = useState(false);
//   const [refTab, setRefTab] = useState<"formula" | "constants" | "latex">(
//     "formula"
//   );
//   const refDragControls = useDragControls();

//   // Calculator State & Controls
//   const [showCalculator, setShowCalculator] = useState(false);
//   const [calcInput, setCalcInput] = useState("");
//   const [calcResult, setCalcResult] = useState("");
//   const calcDragControls = useDragControls();

//   const currentQuestion = questions[currentIndex];
//   const isLastQuestion = currentIndex === questions.length - 1;
//   const currentAnswer = userAnswers[currentQuestion.id];
//   const hasAnswered = currentAnswer !== undefined;
//   const isCurrentSubmitted = submittedQuestions[currentQuestion.id] || false;

//   // Desktop Detection
//   useEffect(() => {
//     const checkDesktop = () => setIsDesktop(window.innerWidth >= 768);
//     checkDesktop();
//     window.addEventListener("resize", checkDesktop);
//     return () => window.removeEventListener("resize", checkDesktop);
//   }, []);

//   // Timer
//   useEffect(() => {
//     let timer: NodeJS.Timeout;
//     if (hasStarted && !isCompleted && useTimer && timeLeft > 0) {
//       timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
//     }
//     return () => clearInterval(timer);
//   }, [hasStarted, isCompleted, useTimer, timeLeft]);

//   // Calculator Keyboard Bindings
//   useEffect(() => {
//     if (!showCalculator) return;

//     const handleKeyDown = (e: KeyboardEvent) => {
//       // Don't steal keystrokes if the user is typing in a native input somewhere
//       const activeEl = document.activeElement;
//       if (
//         activeEl &&
//         (["INPUT", "TEXTAREA"].includes(activeEl.tagName) ||
//           activeEl.getAttribute("contenteditable") === "true")
//       )
//         return;
//       if (e.ctrlKey || e.metaKey) return;

//       const key = e.key;
//       if (/^[0-9.()]$/.test(key)) handleCalcKey(key);
//       else if (key === "+" || key === "-") handleCalcKey(key);
//       else if (key === "*" || key === "x") handleCalcKey("×");
//       else if (key === "/") {
//         e.preventDefault();
//         handleCalcKey("÷");
//       } else if (key === "Enter" || key === "=") {
//         e.preventDefault();
//         handleCalcKey("=");
//       } else if (key === "Backspace") handleCalcKey("⌫");
//       else if (key === "Escape" || key.toLowerCase() === "c")
//         handleCalcKey("C");
//       else if (key === "^") handleCalcKey("^");
//     };

//     window.addEventListener("keydown", handleKeyDown);
//     return () => window.removeEventListener("keydown", handleKeyDown);
//   }, [showCalculator, calcResult]);

//   // Calculator Live Evaluator
//   useEffect(() => {
//     if (!calcInput) {
//       setCalcResult("");
//       return;
//     }
//     try {
//       const evalStr = calcInput
//         .replace(/×/g, "*")
//         .replace(/÷/g, "/")
//         .replace(/²/g, "^2")
//         .replace(/π/g, "pi")
//         .replace(/√\(/g, "sqrt(")
//         .replace(/ln\(/g, "log(")
//         .replace(/log\(/g, "log10(");
//       const res = math.evaluate(evalStr);
//       if (res !== undefined && typeof res !== "function") {
//         setCalcResult(math.format(res, { precision: 10 }));
//       }
//     } catch (e) {
//       setCalcResult("");
//     }
//   }, [calcInput]);

//   const formatTime = (seconds: number) => {
//     const m = Math.floor(seconds / 60);
//     const s = seconds % 60;
//     return `${m}:${s.toString().padStart(2, "0")}`;
//   };

//   const handleCalcKey = (key: string) => {
//     if (key === "C") {
//       setCalcInput("");
//       setCalcResult("");
//       return;
//     }
//     if (key === "⌫") {
//       setCalcInput((prev) => prev.slice(0, -1));
//       return;
//     }
//     if (key === "=") {
//       if (calcResult) {
//         setCalcInput(calcResult);
//         setCalcResult("");
//       }
//       return;
//     }
//     let append = key;
//     if (["sin", "cos", "tan", "log", "ln", "√"].includes(key))
//       append = key + "(";
//     setCalcInput((prev) => prev + append);
//   };

//   // MCQ Handlers
//   const handleSelectOption = (optionIndex: number) => {
//     if (isLearningMode && isCurrentSubmitted) return;
//     setUserAnswers((prev) => ({ ...prev, [currentQuestion.id]: optionIndex }));
//   };

//   const submitCurrentAnswer = () => {
//     if (!hasAnswered || isLoading) return;
//     setIsLoading(true);
//     setTimeout(() => {
//       setIsLoading(false);
//       setSubmittedQuestions((prev) => ({
//         ...prev,
//         [currentQuestion.id]: true,
//       }));
//     }, 400);
//   };

//   const resetHelpers = () => {
//     setShowHintPopover(false);
//     setRevealedHints(1);
//   };

//   const goNext = () => {
//     if (currentIndex < questions.length - 1) {
//       setDirection(1);
//       setCurrentIndex((prev) => prev + 1);
//       resetHelpers();
//     }
//   };

//   const goPrev = () => {
//     if (currentIndex > 0) {
//       setDirection(-1);
//       setCurrentIndex((prev) => prev - 1);
//       resetHelpers();
//     }
//   };

//   const finishPractice = () => {
//     if (!isLearningMode) {
//       const allSubmitted: Record<number, boolean> = {};
//       questions.forEach((q) => {
//         if (userAnswers[q.id] !== undefined) allSubmitted[q.id] = true;
//       });
//       setSubmittedQuestions(allSubmitted);
//     }
//     setIsCompleted(true);
//   };

//   // --- RENDER MODES ---

//   // 1. INTRO SCREEN
//   if (!hasStarted) {
//     return (
//       <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="max-w-md w-full bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100"
//         >
//           <div className="w-12 h-12 bg-cyan-50 text-cyan-600 rounded-2xl flex items-center justify-center mb-6">
//             <Target className="w-6 h-6" />
//           </div>
//           <h1 className="text-2xl font-bold text-slate-900 mb-2">
//             Physics Multiple Choice
//           </h1>
//           <p className="text-slate-500 mb-8">
//             Test your understanding of wave mechanics and superposition.
//           </p>
//           <div className="grid grid-cols-3 gap-4 mb-8">
//             <div className="bg-slate-50 p-4 rounded-2xl text-center border border-slate-100">
//               <FileText className="w-5 h-5 text-slate-400 mx-auto mb-2" />
//               <div className="text-xl font-bold text-slate-800">
//                 {SET_STATS.totalQuestions}
//               </div>
//               <div className="text-xs font-medium text-slate-500 uppercase mt-1">
//                 Questions
//               </div>
//             </div>
//             <div className="bg-slate-50 p-4 rounded-2xl text-center border border-slate-100">
//               <Award className="w-5 h-5 text-slate-400 mx-auto mb-2" />
//               <div className="text-xl font-bold text-slate-800">
//                 {SET_STATS.totalMarks}
//               </div>
//               <div className="text-xs font-medium text-slate-500 uppercase mt-1">
//                 Total Marks
//               </div>
//             </div>
//             <div className="bg-slate-50 p-4 rounded-2xl text-center border border-slate-100">
//               <Clock className="w-5 h-5 text-slate-400 mx-auto mb-2" />
//               <div className="text-xl font-bold text-slate-800">
//                 {SET_STATS.estimatedMinutes}m
//               </div>
//               <div className="text-xs font-medium text-slate-500 uppercase mt-1">
//                 Duration
//               </div>
//             </div>
//           </div>
//           <div className="space-y-4 mb-8">
//             <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-white">
//               <div className="flex items-center gap-3">
//                 <Clock className="w-5 h-5 text-slate-400" />
//                 <div>
//                   <p className="text-sm font-medium text-slate-800">
//                     Strict Timer
//                   </p>
//                   <p className="text-xs text-slate-500">
//                     Enable countdown timer
//                   </p>
//                 </div>
//               </div>
//               <Toggle
//                 enabled={useTimer}
//                 onChange={() => setUseTimer(!useTimer)}
//               />
//             </div>
//             <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-white">
//               <div className="flex items-center gap-3">
//                 <Settings2 className="w-5 h-5 text-slate-400" />
//                 <div>
//                   <p className="text-sm font-medium text-slate-800">
//                     Learning Mode
//                   </p>
//                   <p className="text-xs text-slate-500">
//                     Get feedback after every question
//                   </p>
//                 </div>
//               </div>
//               <Toggle
//                 enabled={isLearningMode}
//                 onChange={() => setIsLearningMode(!isLearningMode)}
//               />
//             </div>
//           </div>
//           <button
//             onClick={() => setHasStarted(true)}
//             className="w-full flex items-center justify-center gap-2 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium transition-all shadow-sm"
//           >
//             Start Practice <Play className="w-4 h-4 fill-current" />
//           </button>
//         </motion.div>
//       </div>
//     );
//   }

//   // 2. COMPLETED SCREEN
//   if (isCompleted) {
//     const totalAchieved = questions.reduce(
//       (sum, q) =>
//         submittedQuestions[q.id] && userAnswers[q.id] === q.answer
//           ? sum + 1
//           : sum,
//       0
//     );

//     return (
//       <div className="min-h-screen bg-slate-50 text-slate-800 py-12 px-4 pb-32">
//         <div className="max-w-3xl mx-auto space-y-8">
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-center"
//           >
//             <Award className="w-12 h-12 text-cyan-500 mx-auto mb-4" />
//             <h1 className="text-3xl font-bold text-slate-900 mb-2">
//               Practice Complete!
//             </h1>
//             <div className="text-5xl font-bold text-cyan-600 mt-6 flex justify-center items-baseline gap-2">
//               {totalAchieved}{" "}
//               <span className="text-2xl text-slate-400">
//                 / {SET_STATS.totalMarks}
//               </span>
//             </div>
//             <p className="text-slate-500 font-medium uppercase tracking-widest text-sm mt-2">
//               Total Score
//             </p>
//           </motion.div>

//           <div className="space-y-6">
//             {questions.map((q, idx) => {
//               const userAnswer = userAnswers[q.id];
//               const isCorrect = userAnswer === q.answer;
//               const isOmitted = userAnswer === undefined;

//               return (
//                 <motion.div
//                   key={q.id}
//                   initial={{ opacity: 0, y: 10 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   transition={{ delay: idx * 0.1 }}
//                   className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm"
//                 >
//                   <div className="flex justify-between items-start mb-6">
//                     <h3 className="text-lg font-semibold text-slate-900">
//                       <span className="text-cyan-600 mr-2">Q{idx + 1}.</span>
//                       <MathInline text={q.question} />
//                     </h3>
//                     <div
//                       className={`px-3 py-1 font-bold rounded-lg text-sm shrink-0 ${
//                         isCorrect
//                           ? "bg-green-50 text-green-700"
//                           : isOmitted
//                           ? "bg-slate-100 text-slate-500"
//                           : "bg-red-50 text-red-700"
//                       }`}
//                     >
//                       {isCorrect ? "1 / 1" : "0 / 1"}
//                     </div>
//                   </div>

//                   <div className="space-y-3 mb-6">
//                     {q.options.map((opt, oIdx) => {
//                       const isThisUserAnswer = userAnswer === oIdx;
//                       const isThisCorrectAnswer = q.answer === oIdx;
//                       let bgClass = "bg-white border-slate-200 opacity-50";
//                       let icon = null;

//                       if (isThisCorrectAnswer) {
//                         bgClass = "bg-green-50 border-green-500 text-green-900";
//                         icon = (
//                           <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
//                         );
//                       } else if (isThisUserAnswer && !isThisCorrectAnswer) {
//                         bgClass = "bg-red-50 border-red-500 text-red-900";
//                         icon = (
//                           <XCircle className="w-5 h-5 text-red-500 shrink-0" />
//                         );
//                       }

//                       return (
//                         <div
//                           key={oIdx}
//                           className={`w-full flex items-center gap-4 p-4 rounded-xl border ${bgClass}`}
//                         >
//                           <div className="w-6 h-6 rounded-full border-2 border-current flex-shrink-0 flex items-center justify-center bg-white/50">
//                             {icon}
//                           </div>
//                           <span className="text-base font-medium">
//                             <MathInline text={opt} isPureMath />
//                           </span>
//                         </div>
//                       );
//                     })}
//                   </div>

//                   <div className="space-y-4 pt-6 border-t border-slate-100">
//                     <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
//                       <BookOpenCheck className="w-4 h-4 text-cyan-500" />
//                       Explanation
//                     </h3>
//                     <div className="p-5 bg-cyan-50/30 border border-cyan-100 rounded-2xl text-slate-700 leading-relaxed text-sm">
//                       <MathInline text={q.explain} />
//                     </div>
//                   </div>
//                 </motion.div>
//               );
//             })}
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // 3. ACTIVE QUIZ UI
//   return (
//     <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex justify-center pt-12 pb-32 px-4 overflow-x-hidden relative">
//       {/* DRAGGABLE REFERENCE MODAL */}
//       <AnimatePresence>
//         {showReference && (
//           <>
//             {!isDesktop && (
//               <motion.div
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 exit={{ opacity: 0 }}
//                 className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[60]"
//                 onClick={() => setShowReference(false)}
//               />
//             )}
//             <motion.div
//               drag={isDesktop}
//               dragControls={refDragControls}
//               dragListener={false}
//               dragMomentum={false}
//               initial={
//                 isDesktop ? { opacity: 0, y: 20 } : { opacity: 0, y: "100%" }
//               }
//               animate={isDesktop ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
//               exit={
//                 isDesktop ? { opacity: 0, y: 20 } : { opacity: 0, y: "100%" }
//               }
//               style={
//                 isDesktop
//                   ? {
//                       resize: "both",
//                       overflow: "hidden",
//                       width: "380px",
//                       height: "450px",
//                       minWidth: "300px",
//                       minHeight: "300px",
//                       maxWidth: "80vw",
//                       maxHeight: "80vh",
//                       top: "10vh",
//                       left: "calc(100vw - 420px)",
//                     }
//                   : {}
//               }
//               className={`fixed z-[70] bg-white border border-slate-200 flex flex-col shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] ${
//                 isDesktop
//                   ? "rounded-xl absolute"
//                   : "inset-x-4 bottom-24 top-24 rounded-2xl"
//               }`}
//             >
//               <div
//                 onPointerDown={(e) => isDesktop && refDragControls.start(e)}
//                 style={{ touchAction: "none" }}
//                 className={`flex justify-between items-center px-4 py-3 bg-slate-50 border-b border-slate-100 ${
//                   isDesktop ? "cursor-move" : ""
//                 }`}
//               >
//                 <div className="flex items-center gap-2">
//                   {isDesktop && (
//                     <GripHorizontal className="w-4 h-4 text-slate-300" />
//                   )}
//                   <span className="text-sm font-bold text-slate-700">
//                     Reference Guide
//                   </span>
//                 </div>
//                 <button
//                   onClick={() => setShowReference(false)}
//                   onPointerDown={(e) => e.stopPropagation()}
//                   className="p-1 hover:bg-slate-200 rounded-md transition-colors text-slate-400 hover:text-slate-700"
//                 >
//                   <X className="w-4 h-4" />
//                 </button>
//               </div>

//               <div className="flex border-b border-slate-100">
//                 {(["formula", "constants", "latex"] as const).map((tab) => (
//                   <button
//                     key={tab}
//                     onClick={() => setRefTab(tab)}
//                     className={`flex-1 py-2.5 text-xs font-semibold capitalize transition-colors ${
//                       refTab === tab
//                         ? "text-cyan-600 border-b-2 border-cyan-500"
//                         : "text-slate-500 hover:text-slate-800"
//                     }`}
//                   >
//                     {tab === "latex" ? "LaTeX" : tab}
//                   </button>
//                 ))}
//               </div>

//               <div className="flex-1 overflow-y-auto p-5 bg-white">
//                 {refTab === "formula" && (
//                   <div className="space-y-5">
//                     <div>
//                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
//                         Kinematics
//                       </p>
//                       <div className="space-y-3 text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">
//                         <div className="flex justify-between items-center">
//                           <span>Velocity</span>{" "}
//                           <MathInline text="$v = u + at$" />
//                         </div>
//                         <div className="flex justify-between items-center">
//                           <span>Displacement</span>{" "}
//                           <MathInline text="$s = ut + \frac{1}{2}at^2$" />
//                         </div>
//                       </div>
//                     </div>
//                     <div>
//                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
//                         Waves
//                       </p>
//                       <div className="space-y-3 text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">
//                         <div className="flex justify-between items-center">
//                           <span>Wave Speed</span>{" "}
//                           <MathInline text="$v = f\lambda$" />
//                         </div>
//                         <div className="flex justify-between items-center">
//                           <span>Phase Diff</span>{" "}
//                           <MathInline text="$\Delta\phi = \frac{2\pi}{\lambda}\Delta x$" />
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 )}
//                 {refTab === "constants" && (
//                   <div className="space-y-5">
//                     <div>
//                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
//                         Universal
//                       </p>
//                       <div className="space-y-3 text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">
//                         <div className="flex justify-between items-center">
//                           <span>Gravity (g)</span>{" "}
//                           <MathInline text="$9.81 \, \text{m/s}^2$" />
//                         </div>
//                         <div className="flex justify-between items-center">
//                           <span>Speed of Light (c)</span>{" "}
//                           <MathInline text="$3 \times 10^8 \, \text{m/s}$" />
//                         </div>
//                         <div className="flex justify-between items-center">
//                           <span>Planck (h)</span>{" "}
//                           <MathInline text="$6.63 \times 10^{-34} \, \text{J s}$" />
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 )}
//                 {refTab === "latex" && (
//                   <div className="space-y-5">
//                     <div>
//                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
//                         Quick Syntax Guide
//                       </p>
//                       <div className="space-y-3 text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">
//                         <div className="flex justify-between items-center">
//                           <code className="text-[11px] bg-white px-1.5 py-0.5 rounded border border-slate-200">
//                             \frac{"{a}{b}"}
//                           </code>{" "}
//                           <MathInline text="$\frac{a}{b}$" />
//                         </div>
//                         <div className="flex justify-between items-center">
//                           <code className="text-[11px] bg-white px-1.5 py-0.5 rounded border border-slate-200">
//                             x^2
//                           </code>{" "}
//                           <MathInline text="$x^2$" />
//                         </div>
//                         <div className="flex justify-between items-center">
//                           <code className="text-[11px] bg-white px-1.5 py-0.5 rounded border border-slate-200">
//                             v_0
//                           </code>{" "}
//                           <MathInline text="$v_0$" />
//                         </div>
//                         <div className="flex justify-between items-center">
//                           <code className="text-[11px] bg-white px-1.5 py-0.5 rounded border border-slate-200">
//                             \sqrt{"{x}"}
//                           </code>{" "}
//                           <MathInline text="$\sqrt{x}$" />
//                         </div>
//                         <div className="flex justify-between items-center">
//                           <code className="text-[11px] bg-white px-1.5 py-0.5 rounded border border-slate-200">
//                             \lambda
//                           </code>{" "}
//                           <MathInline text="$\lambda$" />
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </motion.div>
//           </>
//         )}
//       </AnimatePresence>

//       {/* DRAGGABLE CALCULATOR MODAL */}
//       <AnimatePresence>
//         {showCalculator && (
//           <>
//             {!isDesktop && (
//               <motion.div
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 exit={{ opacity: 0 }}
//                 className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[60]"
//                 onClick={() => setShowCalculator(false)}
//               />
//             )}
//             <motion.div
//               drag={isDesktop}
//               dragControls={calcDragControls}
//               dragListener={false}
//               dragMomentum={false}
//               initial={
//                 isDesktop ? { opacity: 0, y: 20 } : { opacity: 0, y: "100%" }
//               }
//               animate={isDesktop ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
//               exit={
//                 isDesktop ? { opacity: 0, y: 20 } : { opacity: 0, y: "100%" }
//               }
//               style={
//                 isDesktop ? { width: "340px", top: "15vh", left: "8vw" } : {}
//               }
//               className={`fixed z-[70] bg-white border border-slate-200 flex flex-col shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] overflow-hidden ${
//                 isDesktop
//                   ? "rounded-2xl absolute"
//                   : "inset-x-4 bottom-24 rounded-3xl"
//               }`}
//             >
//               <div
//                 onPointerDown={(e) => isDesktop && calcDragControls.start(e)}
//                 style={{ touchAction: "none" }}
//                 className={`flex justify-between items-center px-4 py-3 bg-slate-50 border-b border-slate-100 ${
//                   isDesktop ? "cursor-move" : ""
//                 }`}
//               >
//                 <div className="flex items-center gap-2">
//                   {isDesktop && (
//                     <GripHorizontal className="w-4 h-4 text-slate-300" />
//                   )}
//                   <span className="text-sm font-bold text-slate-700">
//                     Scientific Calculator
//                   </span>
//                 </div>
//                 <button
//                   onClick={() => setShowCalculator(false)}
//                   onPointerDown={(e) => e.stopPropagation()}
//                   className="p-1 hover:bg-slate-200 rounded-md transition-colors text-slate-400 hover:text-slate-700"
//                 >
//                   <X className="w-4 h-4" />
//                 </button>
//               </div>
//               <div className="bg-white p-5 border-b border-slate-100 flex flex-col items-end min-h-[100px] justify-end">
//                 <div className="text-slate-400 font-mono text-sm tracking-wider mb-1 w-full text-right overflow-hidden text-ellipsis whitespace-nowrap">
//                   {calcInput || "0"}
//                 </div>
//                 <div className="text-3xl font-semibold text-slate-900 font-mono overflow-hidden text-ellipsis whitespace-nowrap">
//                   {calcResult ? `= ${calcResult}` : "\u00A0"}
//                 </div>
//               </div>
//               <div className="p-3 bg-slate-50/50">
//                 <div className="grid grid-cols-5 gap-2">
//                   {[
//                     "sin",
//                     "cos",
//                     "tan",
//                     "C",
//                     "⌫",
//                     "x²",
//                     "√",
//                     "(",
//                     ")",
//                     "÷",
//                     "^",
//                     "7",
//                     "8",
//                     "9",
//                     "×",
//                     "log",
//                     "4",
//                     "5",
//                     "6",
//                     "-",
//                     "ln",
//                     "1",
//                     "2",
//                     "3",
//                     "+",
//                     "π",
//                     "e",
//                     "0",
//                     ".",
//                     "=",
//                   ].map((key, i) => {
//                     const isNum = [
//                       "0",
//                       "1",
//                       "2",
//                       "3",
//                       "4",
//                       "5",
//                       "6",
//                       "7",
//                       "8",
//                       "9",
//                       ".",
//                     ].includes(key);
//                     const isOp = ["÷", "×", "-", "+", "="].includes(key);
//                     const isClear = ["C", "⌫"].includes(key);
//                     let bg =
//                       "bg-white hover:bg-slate-100 text-slate-600 border border-slate-200";
//                     if (isNum)
//                       bg =
//                         "bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 shadow-sm font-medium text-lg";
//                     if (isOp)
//                       bg =
//                         "bg-cyan-50 hover:bg-cyan-100 text-cyan-700 border border-cyan-100 font-medium text-lg";
//                     if (key === "=")
//                       bg =
//                         "bg-cyan-600 hover:bg-cyan-700 text-white border border-cyan-700 shadow-sm font-medium text-lg";
//                     if (isClear)
//                       bg =
//                         "bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-100";
//                     return (
//                       <button
//                         key={i}
//                         onClick={() => handleCalcKey(key)}
//                         className={`h-12 rounded-xl flex items-center justify-center transition-colors active:scale-95 ${bg}`}
//                       >
//                         {key === "⌫" ? <Delete className="w-5 h-5" /> : key}
//                       </button>
//                     );
//                   })}
//                 </div>
//               </div>
//             </motion.div>
//           </>
//         )}
//       </AnimatePresence>

//       <div className="w-full max-w-2xl relative z-10">
//         {/* HEADER */}
//         <div className="flex justify-between items-center mb-8 px-2">
//           <div className="flex items-center gap-4">
//             <h2 className="text-sm font-semibold tracking-wide text-slate-500 uppercase">
//               {isLearningMode ? "Learning Mode" : "Practice Mode"}
//             </h2>
//             {useTimer && (
//               <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
//                 <Clock className="w-4 h-4 text-slate-400" />
//                 <span className={timeLeft < 60 ? "text-red-500 font-bold" : ""}>
//                   {formatTime(timeLeft)}
//                 </span>
//               </div>
//             )}
//           </div>
//           <div className="text-sm font-medium text-cyan-600 bg-cyan-50 px-3 py-1 rounded-full border border-cyan-100 hidden sm:block">
//             Question {currentIndex + 1} / {questions.length}
//           </div>
//         </div>

//         {/* MAIN CARD */}
//         <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden border border-slate-100 flex flex-col relative">
//           <div className="p-8 md:p-10 flex-grow relative">
//             <AnimatePresence mode="wait" custom={direction}>
//               <motion.div
//                 key={
//                   currentQuestion.id + (isCurrentSubmitted ? "-eval" : "-input")
//                 }
//                 initial={{ opacity: 0, x: direction * 20 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 exit={{ opacity: 0, x: -direction * 20 }}
//                 transition={{ duration: 0.3, ease: "easeOut" }}
//               >
//                 {/* Hints Toolbar */}
//                 {currentQuestion.hints &&
//                   currentQuestion.hints.length > 0 &&
//                   (!isLearningMode || !isCurrentSubmitted) && (
//                     <div className="flex justify-end mb-4 relative z-20">
//                       <div className="relative">
//                         <button
//                           onClick={() => setShowHintPopover(!showHintPopover)}
//                           className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors border ${
//                             showHintPopover || revealedHints > 1
//                               ? "bg-amber-50 text-amber-600 border-amber-200 shadow-sm"
//                               : "bg-white text-slate-400 border-slate-200 hover:text-amber-500 hover:border-amber-200"
//                           }`}
//                         >
//                           <Lightbulb
//                             className={`w-4 h-4 ${
//                               showHintPopover || revealedHints > 1
//                                 ? "fill-amber-100"
//                                 : ""
//                             }`}
//                           />
//                           Hints {revealedHints > 1 && `(${revealedHints})`}
//                         </button>

//                         <AnimatePresence>
//                           {showHintPopover && (
//                             <>
//                               <div
//                                 className="fixed inset-0 z-30"
//                                 onClick={() => setShowHintPopover(false)}
//                               />
//                               <motion.div
//                                 initial={{ opacity: 0, y: 5, scale: 0.95 }}
//                                 animate={{ opacity: 1, y: 0, scale: 1 }}
//                                 exit={{ opacity: 0, y: 5, scale: 0.95 }}
//                                 transition={{ duration: 0.15 }}
//                                 className="absolute right-0 top-[calc(100%+8px)] w-72 md:w-80 bg-white border border-slate-200 shadow-xl rounded-xl p-4 z-40"
//                               >
//                                 <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">
//                                   Available Hints
//                                 </div>
//                                 <div className="space-y-2">
//                                   {currentQuestion.hints
//                                     .slice(0, revealedHints)
//                                     .map((hint, idx) => (
//                                       <motion.div
//                                         initial={{ opacity: 0, x: -5 }}
//                                         animate={{ opacity: 1, x: 0 }}
//                                         key={idx}
//                                         className="p-3 bg-amber-50/80 rounded-lg text-sm text-amber-900 border border-amber-100/50 leading-relaxed"
//                                       >
//                                         <MathInline text={hint} />
//                                       </motion.div>
//                                     ))}
//                                 </div>
//                                 {revealedHints <
//                                   currentQuestion.hints.length && (
//                                   <button
//                                     onClick={() =>
//                                       setRevealedHints((prev) => prev + 1)
//                                     }
//                                     className="mt-3 w-full py-2 bg-slate-50 hover:bg-amber-50 text-xs font-bold text-slate-500 hover:text-amber-600 border border-slate-200 hover:border-amber-200 rounded-lg transition-colors"
//                                   >
//                                     Reveal Next Hint
//                                   </button>
//                                 )}
//                               </motion.div>
//                             </>
//                           )}
//                         </AnimatePresence>
//                       </div>
//                     </div>
//                   )}

//                 <h1 className="text-2xl md:text-3xl font-medium leading-snug text-slate-900 mb-8">
//                   <MathInline text={currentQuestion.question} />
//                 </h1>

//                 {/* OPTIONS LIST */}
//                 <div className="space-y-4">
//                   {currentQuestion.options.map((opt, oIdx) => {
//                     const isSelected = currentAnswer === oIdx;
//                     const isCorrect = currentQuestion.answer === oIdx;

//                     let stateClasses =
//                       "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700";
//                     let showIcon = false;
//                     let iconContent = null;

//                     if (isLearningMode && isCurrentSubmitted) {
//                       if (isCorrect) {
//                         stateClasses =
//                           "bg-green-50 border-green-500 text-green-900 shadow-sm";
//                         showIcon = true;
//                         iconContent = (
//                           <CheckCircle2 className="w-5 h-5 text-green-500" />
//                         );
//                       } else if (isSelected) {
//                         stateClasses =
//                           "bg-red-50 border-red-500 text-red-900 shadow-sm";
//                         showIcon = true;
//                         iconContent = (
//                           <XCircle className="w-5 h-5 text-red-500" />
//                         );
//                       } else {
//                         stateClasses =
//                           "bg-white border-slate-200 opacity-40 text-slate-400";
//                       }
//                     } else if (isSelected) {
//                       stateClasses =
//                         "bg-cyan-50 border-cyan-500 ring-1 ring-cyan-200 text-cyan-900 shadow-sm";
//                     }

//                     return (
//                       <button
//                         key={oIdx}
//                         onClick={() => handleSelectOption(oIdx)}
//                         disabled={isLearningMode && isCurrentSubmitted}
//                         className={`w-full flex items-center gap-5 p-5 rounded-2xl border-2 transition-all duration-200 text-left ${stateClasses}`}
//                       >
//                         <div
//                           className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
//                             showIcon
//                               ? "border-transparent bg-white/50"
//                               : isSelected
//                               ? "border-cyan-500 bg-white"
//                               : "border-slate-300 bg-white"
//                           }`}
//                         >
//                           {showIcon
//                             ? iconContent
//                             : isSelected && (
//                                 <div className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
//                               )}
//                         </div>
//                         <span className="text-lg font-medium leading-relaxed">
//                           <MathInline text={opt} isPureMath />
//                         </span>
//                       </button>
//                     );
//                   })}
//                 </div>

//                 {/* EXPLANATION REVEAL */}
//                 <AnimatePresence>
//                   {isLearningMode && isCurrentSubmitted && (
//                     <motion.div
//                       initial={{ opacity: 0, y: 10, height: 0 }}
//                       animate={{ opacity: 1, y: 0, height: "auto" }}
//                       className="mt-8 overflow-hidden"
//                     >
//                       <div className="space-y-4 pt-6 border-t border-slate-100">
//                         <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
//                           <BookOpenCheck className="w-4 h-4 text-cyan-500" />
//                           Explanation
//                         </h3>
//                         <div className="p-6 bg-cyan-50/50 border border-cyan-100 rounded-2xl text-slate-700 leading-relaxed text-base">
//                           <MathInline text={currentQuestion.explain} />
//                         </div>
//                       </div>

//                       {currentQuestion.mockAnswer && (
//                         <div className="space-y-4 pt-6 mt-6 border-t border-slate-100">
//                           <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
//                             <FileText className="w-4 h-4 text-indigo-500" />
//                             Model Concept
//                           </h3>
//                           <div className="p-6 bg-indigo-50/50 border border-indigo-100 rounded-2xl text-slate-700 leading-relaxed text-base">
//                             <MathInline text={currentQuestion.mockAnswer} />
//                           </div>
//                         </div>
//                       )}
//                     </motion.div>
//                   )}
//                 </AnimatePresence>
//               </motion.div>
//             </AnimatePresence>
//           </div>
//         </div>
//       </div>

//       {/* FLOATING BOTTOM NAVBAR */}
//       <motion.div
//         initial={{ y: 100, opacity: 0, x: "-50%" }}
//         animate={{ y: 0, opacity: 1, x: "-50%" }}
//         className="fixed bottom-6 left-1/2 z-30 flex items-center gap-2 p-2 bg-white/80 backdrop-blur-md border border-slate-200/50 shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-full"
//       >
//         <button
//           onClick={goPrev}
//           disabled={currentIndex === 0}
//           className="w-12 h-12 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
//         >
//           <ChevronLeft className="w-6 h-6" />
//         </button>

//         <div className="flex-shrink-0 flex items-center justify-center gap-2 min-w-[160px] relative">
//           {isLearningMode && !isCurrentSubmitted ? (
//             <button
//               onClick={submitCurrentAnswer}
//               disabled={!hasAnswered || isLoading}
//               className="flex items-center justify-center gap-2 w-full py-3 px-6 bg-cyan-600 hover:bg-cyan-700 text-white rounded-full font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
//             >
//               {isLoading ? (
//                 <Loader2 className="w-5 h-5 animate-spin" />
//               ) : (
//                 "Check Answer"
//               )}
//             </button>
//           ) : isLastQuestion ? (
//             <button
//               onClick={finishPractice}
//               className="flex items-center justify-center gap-2 w-full py-3 px-6 bg-slate-900 hover:bg-slate-800 text-white rounded-full font-bold transition-all shadow-sm"
//             >
//               Finish Set <CheckCircle2 className="w-4 h-4 ml-1" />
//             </button>
//           ) : (
//             <div className="px-6 py-3 font-bold text-slate-400 text-sm tracking-widest uppercase">
//               {currentIndex + 1} of {questions.length}
//             </div>
//           )}
//         </div>

//         <button
//           onClick={goNext}
//           disabled={isLastQuestion}
//           className="w-12 h-12 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
//         >
//           <ChevronRight className="w-6 h-6" />
//         </button>

//         <div className="w-px h-6 bg-slate-200 mx-1 hidden sm:block" />

//         <button
//           onClick={() => setShowReference(!showReference)}
//           className={`w-12 h-12 flex items-center justify-center border transition-all shadow-sm rounded-full ${
//             showReference
//               ? "bg-cyan-600 border-cyan-600 text-white"
//               : "bg-slate-50 border-slate-200 hover:border-cyan-300 hover:bg-cyan-50 text-slate-600 hover:text-cyan-700"
//           }`}
//           title="Reference Materials"
//         >
//           <Info className="w-5 h-5" />
//         </button>
//         <button
//           onClick={() => setShowCalculator(!showCalculator)}
//           className={`w-12 h-12 flex items-center justify-center border transition-all shadow-sm rounded-full ${
//             showCalculator
//               ? "bg-cyan-600 border-cyan-600 text-white"
//               : "bg-slate-50 border-slate-200 hover:border-cyan-300 hover:bg-cyan-50 text-slate-600 hover:text-cyan-700"
//           }`}
//           title="Scientific Calculator"
//         >
//           <Calculator className="w-5 h-5" />
//         </button>
//       </motion.div>
//     </div>
//   );
// }

// "use client";

// import { AnimatePresence, motion, useDragControls } from "framer-motion";
// import katex from "katex";
// import "katex/dist/katex.min.css";
// import {
//   Award,
//   BookOpenCheck,
//   Calculator,
//   CheckCircle2,
//   ChevronLeft,
//   ChevronRight,
//   Clock,
//   Delete,
//   FileText,
//   GripHorizontal,
//   Info,
//   Lightbulb,
//   Loader2,
//   Play,
//   Settings2,
//   Target,
//   X,
//   XCircle,
// } from "lucide-react";
// import * as math from "mathjs";
// import { useEffect, useState } from "react";

// // --- MOCK DATA ---
// const SET_STATS = {
//   totalQuestions: 3,
//   totalMarks: 3,
//   estimatedMinutes: 5,
// };

// const questions = [
//   {
//     id: 1,
//     question:
//       "A transverse wave travels along a stretched string. What is the phase difference between two points on the string that are separated by a distance of $\\frac{\\lambda}{2}$?",
//     options: [
//       "0 \\text{ rad}",
//       "\\frac{\\pi}{2} \\text{ rad}",
//       "\\pi \\text{ rad}",
//       "2\\pi \\text{ rad}",
//     ],
//     answer: 2,
//     hints: [
//       "Remember that a full wavelength corresponds to a complete cycle.",
//       "A complete cycle in radians is $2\\pi$.",
//     ],
//     explain:
//       "A full wavelength ($\\lambda$) corresponds to a phase difference of $2\\pi$. Therefore, a distance of $\\frac{\\lambda}{2}$ corresponds exactly to half of that phase difference, which is $\\pi$ radians.",
//     mockAnswer:
//       "Model Concept: Phase difference $\\Delta\\phi$ is related to path difference $\\Delta x$ by the formula $\\Delta\\phi = \\frac{2\\pi}{\\lambda} \\Delta x$. Substituting $\\Delta x = \\frac{\\lambda}{2}$ yields $\\pi$ radians.",
//   },
//   {
//     id: 2,
//     question:
//       "Which of the following correctly describes the principle of superposition?",
//     options: [
//       "When two waves meet, their amplitudes multiply.",
//       "When two waves meet, the resultant displacement is the vector sum of their individual displacements.",
//       "Waves always reflect when they meet another wave.",
//       "Two waves can never occupy the same space at the same time.",
//     ],
//     answer: 1,
//     hints: [
//       "Think about what happens to the height (displacement) of the water when two ripples crash into each other.",
//       "Is it a scalar addition or a vector addition?",
//     ],
//     explain:
//       "The principle of superposition states that when two or more waves overlap, the resultant displacement at any point is the vector sum of the displacements of the individual waves at that point.",
//     mockAnswer:
//       "Model Concept: Superposition is a fundamental property of all linear wave systems (light, sound, water). Constructive interference occurs when displacements are in the same direction, and destructive when opposite.",
//   },
//   {
//     id: 3,
//     question:
//       "In a stationary wave, what is the specific term for a point of minimum or zero amplitude?",
//     options: ["Antinode", "Crest", "Trough", "Node"],
//     answer: 3,
//     hints: [], // No hints for the final question
//     explain:
//       "A node is a point along a stationary wave where the wave has minimum (or zero) amplitude. This occurs due to continuous destructive interference between the incident and reflected waves.",
//     mockAnswer:
//       "Model Concept: Stationary waves are characterized by alternating Nodes (zero amplitude) and Antinodes (maximum amplitude). The distance between two adjacent nodes is exactly $\\frac{\\lambda}{2}$.",
//   },
// ];

// // --- UTILS ---
// const safeRenderKatex = (latex: string) => {
//   try {
//     return katex.renderToString(latex || " ", {
//       throwOnError: false,
//       displayMode: false,
//     });
//   } catch (e) {
//     return `<span class="text-red-500">${latex}</span>`;
//   }
// };

// // Intelligently renders either pure LaTeX (for options) or mixed text (for questions)
// const MathInline = ({
//   text,
//   isPureMath = false,
// }: {
//   text: string;
//   isPureMath?: boolean;
// }) => {
//   if (isPureMath) {
//     return <span dangerouslySetInnerHTML={{ __html: safeRenderKatex(text) }} />;
//   }
//   const parts = text.split(/(\$.*?\$)/g);
//   return (
//     <span>
//       {parts.map((part, idx) => {
//         if (part.startsWith("$") && part.endsWith("$")) {
//           const latex = part.slice(1, -1);
//           return (
//             <span
//               key={idx}
//               dangerouslySetInnerHTML={{ __html: safeRenderKatex(latex) }}
//               className="mx-1 inline-block"
//             />
//           );
//         }
//         // FIX: Added whitespace-pre-wrap to preserve spaces in normal text
//         return (
//           <span key={idx} className="whitespace-pre-wrap">
//             {part}
//           </span>
//         );
//       })}
//     </span>
//   );
// };

// // --- REUSABLE COMPONENTS ---
// const Toggle = ({
//   enabled,
//   onChange,
// }: {
//   enabled: boolean;
//   onChange: () => void;
// }) => (
//   <button
//     onClick={onChange}
//     className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 ${
//       enabled ? "bg-cyan-500" : "bg-slate-200"
//     }`}
//   >
//     <span
//       className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
//         enabled ? "translate-x-5" : "translate-x-0"
//       }`}
//     />
//   </button>
// );

// // --- MAIN COMPONENT ---
// export default function McqPractice() {
//   const [hasStarted, setHasStarted] = useState(false);
//   const [isCompleted, setIsCompleted] = useState(false);

//   // Settings
//   const [useTimer, setUseTimer] = useState(true);
//   const [isLearningMode, setIsLearningMode] = useState(true);
//   const [timeLeft, setTimeLeft] = useState(SET_STATS.estimatedMinutes * 60);

//   // Quiz State
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [direction, setDirection] = useState(1);
//   const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
//   const [submittedQuestions, setSubmittedQuestions] = useState<
//     Record<number, boolean>
//   >({});
//   const [isLoading, setIsLoading] = useState(false);

//   // UI Helpers
//   const [showHintPopover, setShowHintPopover] = useState(false);
//   const [revealedHints, setRevealedHints] = useState(1);

//   // Draggable Modals State & Controls
//   const [isDesktop, setIsDesktop] = useState(true);
//   const [showReference, setShowReference] = useState(false);
//   const [refTab, setRefTab] = useState<"formula" | "constants" | "latex">(
//     "formula"
//   );
//   const refDragControls = useDragControls();

//   // Calculator State & Controls
//   const [showCalculator, setShowCalculator] = useState(false);
//   const [calcInput, setCalcInput] = useState("");
//   const [calcResult, setCalcResult] = useState("");
//   const calcDragControls = useDragControls();

//   const currentQuestion = questions[currentIndex];
//   const isLastQuestion = currentIndex === questions.length - 1;
//   const currentAnswer = userAnswers[currentQuestion.id];
//   const hasAnswered = currentAnswer !== undefined;
//   const isCurrentSubmitted = submittedQuestions[currentQuestion.id] || false;

//   // Desktop Detection
//   useEffect(() => {
//     const checkDesktop = () => setIsDesktop(window.innerWidth >= 768);
//     checkDesktop();
//     window.addEventListener("resize", checkDesktop);
//     return () => window.removeEventListener("resize", checkDesktop);
//   }, []);

//   // Timer
//   useEffect(() => {
//     let timer: NodeJS.Timeout;
//     if (hasStarted && !isCompleted && useTimer && timeLeft > 0) {
//       timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
//     }
//     return () => clearInterval(timer);
//   }, [hasStarted, isCompleted, useTimer, timeLeft]);

//   // Calculator Keyboard Bindings
//   useEffect(() => {
//     if (!showCalculator) return;

//     const handleKeyDown = (e: KeyboardEvent) => {
//       // Don't steal keystrokes if the user is typing in a native input somewhere
//       const activeEl = document.activeElement;
//       if (
//         activeEl &&
//         (["INPUT", "TEXTAREA"].includes(activeEl.tagName) ||
//           activeEl.getAttribute("contenteditable") === "true")
//       )
//         return;
//       if (e.ctrlKey || e.metaKey) return;

//       const key = e.key;
//       if (/^[0-9.()]$/.test(key)) handleCalcKey(key);
//       else if (key === "+" || key === "-") handleCalcKey(key);
//       else if (key === "*" || key === "x") handleCalcKey("×");
//       else if (key === "/") {
//         e.preventDefault();
//         handleCalcKey("÷");
//       } else if (key === "Enter" || key === "=") {
//         e.preventDefault();
//         handleCalcKey("=");
//       } else if (key === "Backspace") handleCalcKey("⌫");
//       else if (key === "Escape" || key.toLowerCase() === "c")
//         handleCalcKey("C");
//       else if (key === "^") handleCalcKey("^");
//     };

//     window.addEventListener("keydown", handleKeyDown);
//     return () => window.removeEventListener("keydown", handleKeyDown);
//   }, [showCalculator, calcResult]);

//   // Calculator Live Evaluator
//   useEffect(() => {
//     if (!calcInput) {
//       setCalcResult("");
//       return;
//     }
//     try {
//       const evalStr = calcInput
//         .replace(/×/g, "*")
//         .replace(/÷/g, "/")
//         .replace(/²/g, "^2")
//         .replace(/π/g, "pi")
//         .replace(/√\(/g, "sqrt(")
//         .replace(/ln\(/g, "log(")
//         .replace(/log\(/g, "log10(");
//       const res = math.evaluate(evalStr);
//       if (res !== undefined && typeof res !== "function") {
//         setCalcResult(math.format(res, { precision: 10 }));
//       }
//     } catch (e) {
//       setCalcResult("");
//     }
//   }, [calcInput]);

//   const formatTime = (seconds: number) => {
//     const m = Math.floor(seconds / 60);
//     const s = seconds % 60;
//     return `${m}:${s.toString().padStart(2, "0")}`;
//   };

//   const handleCalcKey = (key: string) => {
//     if (key === "C") {
//       setCalcInput("");
//       setCalcResult("");
//       return;
//     }
//     if (key === "⌫") {
//       setCalcInput((prev) => prev.slice(0, -1));
//       return;
//     }
//     if (key === "=") {
//       if (calcResult) {
//         setCalcInput(calcResult);
//         setCalcResult("");
//       }
//       return;
//     }
//     let append = key;
//     if (["sin", "cos", "tan", "log", "ln", "√"].includes(key))
//       append = key + "(";
//     setCalcInput((prev) => prev + append);
//   };

//   // MCQ Handlers
//   const handleSelectOption = (optionIndex: number) => {
//     if (isLearningMode && isCurrentSubmitted) return;
//     setUserAnswers((prev) => ({ ...prev, [currentQuestion.id]: optionIndex }));
//   };

//   const submitCurrentAnswer = () => {
//     if (!hasAnswered || isLoading) return;
//     setIsLoading(true);
//     setTimeout(() => {
//       setIsLoading(false);
//       setSubmittedQuestions((prev) => ({
//         ...prev,
//         [currentQuestion.id]: true,
//       }));
//     }, 400);
//   };

//   const resetHelpers = () => {
//     setShowHintPopover(false);
//     setRevealedHints(1);
//   };

//   const goNext = () => {
//     if (currentIndex < questions.length - 1) {
//       setDirection(1);
//       setCurrentIndex((prev) => prev + 1);
//       resetHelpers();
//     }
//   };

//   const goPrev = () => {
//     if (currentIndex > 0) {
//       setDirection(-1);
//       setCurrentIndex((prev) => prev - 1);
//       resetHelpers();
//     }
//   };

//   const finishPractice = () => {
//     if (!isLearningMode) {
//       const allSubmitted: Record<number, boolean> = {};
//       questions.forEach((q) => {
//         if (userAnswers[q.id] !== undefined) allSubmitted[q.id] = true;
//       });
//       setSubmittedQuestions(allSubmitted);
//     }
//     setIsCompleted(true);
//   };

//   // --- RENDER MODES ---

//   // 1. INTRO SCREEN
//   if (!hasStarted) {
//     return (
//       <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="max-w-md w-full bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100"
//         >
//           <div className="w-12 h-12 bg-cyan-50 text-cyan-600 rounded-2xl flex items-center justify-center mb-6">
//             <Target className="w-6 h-6" />
//           </div>
//           <h1 className="text-2xl font-bold text-slate-900 mb-2">
//             Physics Multiple Choice
//           </h1>
//           <p className="text-slate-500 mb-8">
//             Test your understanding of wave mechanics and superposition.
//           </p>
//           <div className="grid grid-cols-3 gap-4 mb-8">
//             <div className="bg-slate-50 p-4 rounded-2xl text-center border border-slate-100">
//               <FileText className="w-5 h-5 text-slate-400 mx-auto mb-2" />
//               <div className="text-xl font-bold text-slate-800">
//                 {SET_STATS.totalQuestions}
//               </div>
//               <div className="text-xs font-medium text-slate-500 uppercase mt-1">
//                 Questions
//               </div>
//             </div>
//             <div className="bg-slate-50 p-4 rounded-2xl text-center border border-slate-100">
//               <Award className="w-5 h-5 text-slate-400 mx-auto mb-2" />
//               <div className="text-xl font-bold text-slate-800">
//                 {SET_STATS.totalMarks}
//               </div>
//               <div className="text-xs font-medium text-slate-500 uppercase mt-1">
//                 Total Marks
//               </div>
//             </div>
//             <div className="bg-slate-50 p-4 rounded-2xl text-center border border-slate-100">
//               <Clock className="w-5 h-5 text-slate-400 mx-auto mb-2" />
//               <div className="text-xl font-bold text-slate-800">
//                 {SET_STATS.estimatedMinutes}m
//               </div>
//               <div className="text-xs font-medium text-slate-500 uppercase mt-1">
//                 Duration
//               </div>
//             </div>
//           </div>
//           <div className="space-y-4 mb-8">
//             <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-white">
//               <div className="flex items-center gap-3">
//                 <Clock className="w-5 h-5 text-slate-400" />
//                 <div>
//                   <p className="text-sm font-medium text-slate-800">
//                     Strict Timer
//                   </p>
//                   <p className="text-xs text-slate-500">
//                     Enable countdown timer
//                   </p>
//                 </div>
//               </div>
//               <Toggle
//                 enabled={useTimer}
//                 onChange={() => setUseTimer(!useTimer)}
//               />
//             </div>
//             <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-white">
//               <div className="flex items-center gap-3">
//                 <Settings2 className="w-5 h-5 text-slate-400" />
//                 <div>
//                   <p className="text-sm font-medium text-slate-800">
//                     Learning Mode
//                   </p>
//                   <p className="text-xs text-slate-500">
//                     Get feedback after every question
//                   </p>
//                 </div>
//               </div>
//               <Toggle
//                 enabled={isLearningMode}
//                 onChange={() => setIsLearningMode(!isLearningMode)}
//               />
//             </div>
//           </div>
//           <button
//             onClick={() => setHasStarted(true)}
//             className="w-full flex items-center justify-center gap-2 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium transition-all shadow-sm"
//           >
//             Start Practice <Play className="w-4 h-4 fill-current" />
//           </button>
//         </motion.div>
//       </div>
//     );
//   }

//   // 2. COMPLETED SCREEN
//   if (isCompleted) {
//     const totalAchieved = questions.reduce(
//       (sum, q) =>
//         submittedQuestions[q.id] && userAnswers[q.id] === q.answer
//           ? sum + 1
//           : sum,
//       0
//     );

//     return (
//       <div className="min-h-screen bg-slate-50 text-slate-800 py-12 px-4 pb-32">
//         <div className="max-w-3xl mx-auto space-y-8">
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-center"
//           >
//             <Award className="w-12 h-12 text-cyan-500 mx-auto mb-4" />
//             <h1 className="text-3xl font-bold text-slate-900 mb-2">
//               Practice Complete!
//             </h1>
//             <div className="text-5xl font-bold text-cyan-600 mt-6 flex justify-center items-baseline gap-2">
//               {totalAchieved}{" "}
//               <span className="text-2xl text-slate-400">
//                 / {SET_STATS.totalMarks}
//               </span>
//             </div>
//             <p className="text-slate-500 font-medium uppercase tracking-widest text-sm mt-2">
//               Total Score
//             </p>
//           </motion.div>

//           <div className="space-y-6">
//             {questions.map((q, idx) => {
//               const userAnswer = userAnswers[q.id];
//               const isCorrect = userAnswer === q.answer;
//               const isOmitted = userAnswer === undefined;

//               return (
//                 <motion.div
//                   key={q.id}
//                   initial={{ opacity: 0, y: 10 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   transition={{ delay: idx * 0.1 }}
//                   className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm"
//                 >
//                   <div className="flex justify-between items-start mb-6">
//                     <h3 className="text-lg font-semibold text-slate-900">
//                       <span className="text-cyan-600 mr-2">Q{idx + 1}.</span>
//                       <MathInline text={q.question} />
//                     </h3>
//                     <div
//                       className={`px-3 py-1 font-bold rounded-lg text-sm shrink-0 ${
//                         isCorrect
//                           ? "bg-green-50 text-green-700"
//                           : isOmitted
//                           ? "bg-slate-100 text-slate-500"
//                           : "bg-red-50 text-red-700"
//                       }`}
//                     >
//                       {isCorrect ? "1 / 1" : "0 / 1"}
//                     </div>
//                   </div>

//                   <div className="space-y-3 mb-6">
//                     {q.options.map((opt, oIdx) => {
//                       const isThisUserAnswer = userAnswer === oIdx;
//                       const isThisCorrectAnswer = q.answer === oIdx;
//                       let bgClass = "bg-white border-slate-200 opacity-50";
//                       let icon = null;

//                       if (isThisCorrectAnswer) {
//                         bgClass = "bg-green-50 border-green-500 text-green-900";
//                         icon = (
//                           <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
//                         );
//                       } else if (isThisUserAnswer && !isThisCorrectAnswer) {
//                         bgClass = "bg-red-50 border-red-500 text-red-900";
//                         icon = (
//                           <XCircle className="w-5 h-5 text-red-500 shrink-0" />
//                         );
//                       }

//                       return (
//                         <div
//                           key={oIdx}
//                           className={`w-full flex items-center gap-4 p-4 rounded-xl border ${bgClass}`}
//                         >
//                           <div className="w-6 h-6 rounded-full border-2 border-current flex-shrink-0 flex items-center justify-center bg-white/50">
//                             {icon}
//                           </div>
//                           <span className="text-base font-medium">
//                             <MathInline text={opt} isPureMath />
//                           </span>
//                         </div>
//                       );
//                     })}
//                   </div>

//                   <div className="space-y-4 pt-6 border-t border-slate-100">
//                     <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
//                       <BookOpenCheck className="w-4 h-4 text-cyan-500" />
//                       Explanation
//                     </h3>
//                     <div className="p-5 bg-cyan-50/30 border border-cyan-100 rounded-2xl text-slate-700 leading-relaxed text-sm">
//                       <MathInline text={q.explain} />
//                     </div>
//                   </div>
//                 </motion.div>
//               );
//             })}
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // 3. ACTIVE QUIZ UI
//   return (
//     <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex justify-center pt-12 pb-32 px-4 overflow-x-hidden relative">
//       {/* DRAGGABLE REFERENCE MODAL */}
//       <AnimatePresence>
//         {showReference && (
//           <>
//             {!isDesktop && (
//               <motion.div
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 exit={{ opacity: 0 }}
//                 className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[60]"
//                 onClick={() => setShowReference(false)}
//               />
//             )}
//             <motion.div
//               drag={isDesktop}
//               dragControls={refDragControls}
//               dragListener={false}
//               dragMomentum={false}
//               initial={
//                 isDesktop ? { opacity: 0, y: 20 } : { opacity: 0, y: "100%" }
//               }
//               animate={isDesktop ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
//               exit={
//                 isDesktop ? { opacity: 0, y: 20 } : { opacity: 0, y: "100%" }
//               }
//               style={
//                 isDesktop
//                   ? {
//                       resize: "both",
//                       overflow: "hidden",
//                       width: "380px",
//                       height: "450px",
//                       minWidth: "300px",
//                       minHeight: "300px",
//                       maxWidth: "80vw",
//                       maxHeight: "80vh",
//                       top: "10vh",
//                       left: "calc(100vw - 420px)",
//                     }
//                   : {}
//               }
//               className={`fixed z-[70] bg-white border border-slate-200 flex flex-col shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] ${
//                 isDesktop
//                   ? "rounded-xl absolute"
//                   : "inset-x-4 bottom-24 top-24 rounded-2xl"
//               }`}
//             >
//               <div
//                 onPointerDown={(e) => isDesktop && refDragControls.start(e)}
//                 style={{ touchAction: "none" }}
//                 className={`flex justify-between items-center px-4 py-3 bg-slate-50 border-b border-slate-100 ${
//                   isDesktop ? "cursor-move" : ""
//                 }`}
//               >
//                 <div className="flex items-center gap-2">
//                   {isDesktop && (
//                     <GripHorizontal className="w-4 h-4 text-slate-300" />
//                   )}
//                   <span className="text-sm font-bold text-slate-700">
//                     Reference Guide
//                   </span>
//                 </div>
//                 <button
//                   onClick={() => setShowReference(false)}
//                   onPointerDown={(e) => e.stopPropagation()}
//                   className="p-1 hover:bg-slate-200 rounded-md transition-colors text-slate-400 hover:text-slate-700"
//                 >
//                   <X className="w-4 h-4" />
//                 </button>
//               </div>

//               <div className="flex border-b border-slate-100">
//                 {(["formula", "constants", "latex"] as const).map((tab) => (
//                   <button
//                     key={tab}
//                     onClick={() => setRefTab(tab)}
//                     className={`flex-1 py-2.5 text-xs font-semibold capitalize transition-colors ${
//                       refTab === tab
//                         ? "text-cyan-600 border-b-2 border-cyan-500"
//                         : "text-slate-500 hover:text-slate-800"
//                     }`}
//                   >
//                     {tab === "latex" ? "LaTeX" : tab}
//                   </button>
//                 ))}
//               </div>

//               <div className="flex-1 overflow-y-auto p-5 bg-white">
//                 {refTab === "formula" && (
//                   <div className="space-y-5">
//                     <div>
//                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
//                         Kinematics
//                       </p>
//                       <div className="space-y-3 text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">
//                         <div className="flex justify-between items-center">
//                           <span>Velocity</span>{" "}
//                           <MathInline text="$v = u + at$" />
//                         </div>
//                         <div className="flex justify-between items-center">
//                           <span>Displacement</span>{" "}
//                           <MathInline text="$s = ut + \frac{1}{2}at^2$" />
//                         </div>
//                       </div>
//                     </div>
//                     <div>
//                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
//                         Waves
//                       </p>
//                       <div className="space-y-3 text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">
//                         <div className="flex justify-between items-center">
//                           <span>Wave Speed</span>{" "}
//                           <MathInline text="$v = f\lambda$" />
//                         </div>
//                         <div className="flex justify-between items-center">
//                           <span>Phase Diff</span>{" "}
//                           <MathInline text="$\Delta\phi = \frac{2\pi}{\lambda}\Delta x$" />
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 )}
//                 {refTab === "constants" && (
//                   <div className="space-y-5">
//                     <div>
//                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
//                         Universal
//                       </p>
//                       <div className="space-y-3 text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">
//                         <div className="flex justify-between items-center">
//                           <span>Gravity (g)</span>{" "}
//                           <MathInline text="$9.81 \, \text{m/s}^2$" />
//                         </div>
//                         <div className="flex justify-between items-center">
//                           <span>Speed of Light (c)</span>{" "}
//                           <MathInline text="$3 \times 10^8 \, \text{m/s}$" />
//                         </div>
//                         <div className="flex justify-between items-center">
//                           <span>Planck (h)</span>{" "}
//                           <MathInline text="$6.63 \times 10^{-34} \, \text{J s}$" />
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 )}
//                 {refTab === "latex" && (
//                   <div className="space-y-5">
//                     <div>
//                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
//                         Quick Syntax Guide
//                       </p>
//                       <div className="space-y-3 text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">
//                         <div className="flex justify-between items-center">
//                           <code className="text-[11px] bg-white px-1.5 py-0.5 rounded border border-slate-200">
//                             \frac{"{a}{b}"}
//                           </code>{" "}
//                           <MathInline text="$\frac{a}{b}$" />
//                         </div>
//                         <div className="flex justify-between items-center">
//                           <code className="text-[11px] bg-white px-1.5 py-0.5 rounded border border-slate-200">
//                             x^2
//                           </code>{" "}
//                           <MathInline text="$x^2$" />
//                         </div>
//                         <div className="flex justify-between items-center">
//                           <code className="text-[11px] bg-white px-1.5 py-0.5 rounded border border-slate-200">
//                             v_0
//                           </code>{" "}
//                           <MathInline text="$v_0$" />
//                         </div>
//                         <div className="flex justify-between items-center">
//                           <code className="text-[11px] bg-white px-1.5 py-0.5 rounded border border-slate-200">
//                             \sqrt{"{x}"}
//                           </code>{" "}
//                           <MathInline text="$\sqrt{x}$" />
//                         </div>
//                         <div className="flex justify-between items-center">
//                           <code className="text-[11px] bg-white px-1.5 py-0.5 rounded border border-slate-200">
//                             \lambda
//                           </code>{" "}
//                           <MathInline text="$\lambda$" />
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </motion.div>
//           </>
//         )}
//       </AnimatePresence>

//       {/* DRAGGABLE CALCULATOR MODAL */}
//       <AnimatePresence>
//         {showCalculator && (
//           <>
//             {!isDesktop && (
//               <motion.div
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 exit={{ opacity: 0 }}
//                 className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[60]"
//                 onClick={() => setShowCalculator(false)}
//               />
//             )}
//             <motion.div
//               drag={isDesktop}
//               dragControls={calcDragControls}
//               dragListener={false}
//               dragMomentum={false}
//               initial={
//                 isDesktop ? { opacity: 0, y: 20 } : { opacity: 0, y: "100%" }
//               }
//               animate={isDesktop ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
//               exit={
//                 isDesktop ? { opacity: 0, y: 20 } : { opacity: 0, y: "100%" }
//               }
//               style={
//                 isDesktop ? { width: "340px", top: "15vh", left: "8vw" } : {}
//               }
//               className={`fixed z-[70] bg-white border border-slate-200 flex flex-col shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] overflow-hidden ${
//                 isDesktop
//                   ? "rounded-2xl absolute"
//                   : "inset-x-4 bottom-24 rounded-3xl"
//               }`}
//             >
//               <div
//                 onPointerDown={(e) => isDesktop && calcDragControls.start(e)}
//                 style={{ touchAction: "none" }}
//                 className={`flex justify-between items-center px-4 py-3 bg-slate-50 border-b border-slate-100 ${
//                   isDesktop ? "cursor-move" : ""
//                 }`}
//               >
//                 <div className="flex items-center gap-2">
//                   {isDesktop && (
//                     <GripHorizontal className="w-4 h-4 text-slate-300" />
//                   )}
//                   <span className="text-sm font-bold text-slate-700">
//                     Scientific Calculator
//                   </span>
//                 </div>
//                 <button
//                   onClick={() => setShowCalculator(false)}
//                   onPointerDown={(e) => e.stopPropagation()}
//                   className="p-1 hover:bg-slate-200 rounded-md transition-colors text-slate-400 hover:text-slate-700"
//                 >
//                   <X className="w-4 h-4" />
//                 </button>
//               </div>
//               <div className="bg-white p-5 border-b border-slate-100 flex flex-col items-end min-h-[100px] justify-end">
//                 <div className="text-slate-400 font-mono text-sm tracking-wider mb-1 w-full text-right overflow-hidden text-ellipsis whitespace-nowrap">
//                   {calcInput || "0"}
//                 </div>
//                 <div className="text-3xl font-semibold text-slate-900 font-mono overflow-hidden text-ellipsis whitespace-nowrap">
//                   {calcResult ? `= ${calcResult}` : "\u00A0"}
//                 </div>
//               </div>
//               <div className="p-3 bg-slate-50/50">
//                 <div className="grid grid-cols-5 gap-2">
//                   {[
//                     "sin",
//                     "cos",
//                     "tan",
//                     "C",
//                     "⌫",
//                     "x²",
//                     "√",
//                     "(",
//                     ")",
//                     "÷",
//                     "^",
//                     "7",
//                     "8",
//                     "9",
//                     "×",
//                     "log",
//                     "4",
//                     "5",
//                     "6",
//                     "-",
//                     "ln",
//                     "1",
//                     "2",
//                     "3",
//                     "+",
//                     "π",
//                     "e",
//                     "0",
//                     ".",
//                     "=",
//                   ].map((key, i) => {
//                     const isNum = [
//                       "0",
//                       "1",
//                       "2",
//                       "3",
//                       "4",
//                       "5",
//                       "6",
//                       "7",
//                       "8",
//                       "9",
//                       ".",
//                     ].includes(key);
//                     const isOp = ["÷", "×", "-", "+", "="].includes(key);
//                     const isClear = ["C", "⌫"].includes(key);
//                     let bg =
//                       "bg-white hover:bg-slate-100 text-slate-600 border border-slate-200";
//                     if (isNum)
//                       bg =
//                         "bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 shadow-sm font-medium text-lg";
//                     if (isOp)
//                       bg =
//                         "bg-cyan-50 hover:bg-cyan-100 text-cyan-700 border border-cyan-100 font-medium text-lg";
//                     if (key === "=")
//                       bg =
//                         "bg-cyan-600 hover:bg-cyan-700 text-white border border-cyan-700 shadow-sm font-medium text-lg";
//                     if (isClear)
//                       bg =
//                         "bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-100";
//                     return (
//                       <button
//                         key={i}
//                         onClick={() => handleCalcKey(key)}
//                         className={`h-12 rounded-xl flex items-center justify-center transition-colors active:scale-95 ${bg}`}
//                       >
//                         {key === "⌫" ? <Delete className="w-5 h-5" /> : key}
//                       </button>
//                     );
//                   })}
//                 </div>
//               </div>
//             </motion.div>
//           </>
//         )}
//       </AnimatePresence>

//       <div className="w-full max-w-2xl relative z-10">
//         {/* HEADER */}
//         <div className="flex justify-between items-center mb-8 px-2">
//           <div className="flex items-center gap-4">
//             <h2 className="text-sm font-semibold tracking-wide text-slate-500 uppercase">
//               {isLearningMode ? "Learning Mode" : "Practice Mode"}
//             </h2>
//             {useTimer && (
//               <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
//                 <Clock className="w-4 h-4 text-slate-400" />
//                 <span className={timeLeft < 60 ? "text-red-500 font-bold" : ""}>
//                   {formatTime(timeLeft)}
//                 </span>
//               </div>
//             )}
//           </div>
//           <div className="text-sm font-medium text-cyan-600 bg-cyan-50 px-3 py-1 rounded-full border border-cyan-100 hidden sm:block">
//             Question {currentIndex + 1} / {questions.length}
//           </div>
//         </div>

//         {/* MAIN CARD */}
//         <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden border border-slate-100 flex flex-col relative">
//           <div className="p-8 md:p-10 flex-grow relative">
//             <AnimatePresence mode="wait" custom={direction}>
//               <motion.div
//                 key={
//                   currentQuestion.id + (isCurrentSubmitted ? "-eval" : "-input")
//                 }
//                 initial={{ opacity: 0, x: direction * 20 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 exit={{ opacity: 0, x: -direction * 20 }}
//                 transition={{ duration: 0.3, ease: "easeOut" }}
//               >
//                 {/* Hints Toolbar */}
//                 {currentQuestion.hints &&
//                   currentQuestion.hints.length > 0 &&
//                   (!isLearningMode || !isCurrentSubmitted) && (
//                     <div className="flex justify-end mb-4 relative z-20">
//                       <div className="relative">
//                         <button
//                           onClick={() => setShowHintPopover(!showHintPopover)}
//                           className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors border ${
//                             showHintPopover || revealedHints > 1
//                               ? "bg-amber-50 text-amber-600 border-amber-200 shadow-sm"
//                               : "bg-white text-slate-400 border-slate-200 hover:text-amber-500 hover:border-amber-200"
//                           }`}
//                         >
//                           <Lightbulb
//                             className={`w-4 h-4 ${
//                               showHintPopover || revealedHints > 1
//                                 ? "fill-amber-100"
//                                 : ""
//                             }`}
//                           />
//                           Hints {revealedHints > 1 && `(${revealedHints})`}
//                         </button>

//                         <AnimatePresence>
//                           {showHintPopover && (
//                             <>
//                               <div
//                                 className="fixed inset-0 z-30"
//                                 onClick={() => setShowHintPopover(false)}
//                               />
//                               <motion.div
//                                 initial={{ opacity: 0, y: 5, scale: 0.95 }}
//                                 animate={{ opacity: 1, y: 0, scale: 1 }}
//                                 exit={{ opacity: 0, y: 5, scale: 0.95 }}
//                                 transition={{ duration: 0.15 }}
//                                 className="absolute right-0 top-[calc(100%+8px)] w-72 md:w-80 bg-white border border-slate-200 shadow-xl rounded-xl p-4 z-40"
//                               >
//                                 <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">
//                                   Available Hints
//                                 </div>
//                                 <div className="space-y-2">
//                                   {currentQuestion.hints
//                                     .slice(0, revealedHints)
//                                     .map((hint, idx) => (
//                                       <motion.div
//                                         initial={{ opacity: 0, x: -5 }}
//                                         animate={{ opacity: 1, x: 0 }}
//                                         key={idx}
//                                         className="p-3 bg-amber-50/80 rounded-lg text-sm text-amber-900 border border-amber-100/50 leading-relaxed whitespace-pre-wrap"
//                                       >
//                                         <MathInline text={hint} />
//                                       </motion.div>
//                                     ))}
//                                 </div>
//                                 {revealedHints <
//                                   currentQuestion.hints.length && (
//                                   <button
//                                     onClick={() =>
//                                       setRevealedHints((prev) => prev + 1)
//                                     }
//                                     className="mt-3 w-full py-2 bg-slate-50 hover:bg-amber-50 text-xs font-bold text-slate-500 hover:text-amber-600 border border-slate-200 hover:border-amber-200 rounded-lg transition-colors"
//                                   >
//                                     Reveal Next Hint
//                                   </button>
//                                 )}
//                               </motion.div>
//                             </>
//                           )}
//                         </AnimatePresence>
//                       </div>
//                     </div>
//                   )}

//                 <h1 className="text-2xl md:text-3xl font-medium leading-snug text-slate-900 mb-8">
//                   <MathInline text={currentQuestion.question} />
//                 </h1>

//                 {/* OPTIONS LIST */}
//                 <div className="space-y-4">
//                   {currentQuestion.options.map((opt, oIdx) => {
//                     const isSelected = currentAnswer === oIdx;
//                     const isCorrect = currentQuestion.answer === oIdx;

//                     let stateClasses =
//                       "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700";
//                     let showIcon = false;
//                     let iconContent = null;

//                     if (isLearningMode && isCurrentSubmitted) {
//                       if (isCorrect) {
//                         stateClasses =
//                           "bg-green-50 border-green-500 text-green-900 shadow-sm";
//                         showIcon = true;
//                         iconContent = (
//                           <CheckCircle2 className="w-5 h-5 text-green-500" />
//                         );
//                       } else if (isSelected) {
//                         stateClasses =
//                           "bg-red-50 border-red-500 text-red-900 shadow-sm";
//                         showIcon = true;
//                         iconContent = (
//                           <XCircle className="w-5 h-5 text-red-500" />
//                         );
//                       } else {
//                         stateClasses =
//                           "bg-white border-slate-200 opacity-40 text-slate-400";
//                       }
//                     } else if (isSelected) {
//                       stateClasses =
//                         "bg-cyan-50 border-cyan-500 ring-1 ring-cyan-200 text-cyan-900 shadow-sm";
//                     }

//                     return (
//                       <button
//                         key={oIdx}
//                         onClick={() => handleSelectOption(oIdx)}
//                         disabled={isLearningMode && isCurrentSubmitted}
//                         className={`w-full flex items-center gap-5 p-5 rounded-2xl border-2 transition-all duration-200 text-left ${stateClasses}`}
//                       >
//                         <div
//                           className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
//                             showIcon
//                               ? "border-transparent bg-white/50"
//                               : isSelected
//                               ? "border-cyan-500 bg-white"
//                               : "border-slate-300 bg-white"
//                           }`}
//                         >
//                           {showIcon
//                             ? iconContent
//                             : isSelected && (
//                                 <div className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
//                               )}
//                         </div>
//                         <span className="text-lg font-medium leading-relaxed">
//                           <MathInline text={opt} isPureMath />
//                         </span>
//                       </button>
//                     );
//                   })}
//                 </div>

//                 {/* EXPLANATION REVEAL */}
//                 <AnimatePresence>
//                   {isLearningMode && isCurrentSubmitted && (
//                     <motion.div
//                       initial={{ opacity: 0, y: 10, height: 0 }}
//                       animate={{ opacity: 1, y: 0, height: "auto" }}
//                       className="mt-8 overflow-hidden"
//                     >
//                       <div className="space-y-4 pt-6 border-t border-slate-100">
//                         <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
//                           <BookOpenCheck className="w-4 h-4 text-cyan-500" />
//                           Explanation
//                         </h3>
//                         <div className="p-6 bg-cyan-50/50 border border-cyan-100 rounded-2xl text-slate-700 leading-relaxed text-base whitespace-pre-wrap">
//                           <MathInline text={currentQuestion.explain} />
//                         </div>
//                       </div>

//                       {currentQuestion.mockAnswer && (
//                         <div className="space-y-4 pt-6 mt-6 border-t border-slate-100">
//                           <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
//                             <FileText className="w-4 h-4 text-indigo-500" />
//                             Model Concept
//                           </h3>
//                           <div className="p-6 bg-indigo-50/50 border border-indigo-100 rounded-2xl text-slate-700 leading-relaxed text-base whitespace-pre-wrap">
//                             <MathInline text={currentQuestion.mockAnswer} />
//                           </div>
//                         </div>
//                       )}
//                     </motion.div>
//                   )}
//                 </AnimatePresence>
//               </motion.div>
//             </AnimatePresence>
//           </div>
//         </div>
//       </div>

//       {/* FLOATING BOTTOM NAVBAR */}
//       <motion.div
//         initial={{ y: 100, opacity: 0, x: "-50%" }}
//         animate={{ y: 0, opacity: 1, x: "-50%" }}
//         className="fixed bottom-6 left-1/2 z-30 flex items-center gap-2 p-2 bg-white/80 backdrop-blur-md border border-slate-200/50 shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-full"
//       >
//         <button
//           onClick={goPrev}
//           disabled={currentIndex === 0}
//           className="w-12 h-12 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
//         >
//           <ChevronLeft className="w-6 h-6" />
//         </button>

//         <div className="flex-shrink-0 flex items-center justify-center gap-2 min-w-[160px] relative">
//           {isLearningMode && !isCurrentSubmitted ? (
//             <button
//               onClick={submitCurrentAnswer}
//               disabled={!hasAnswered || isLoading}
//               className="flex items-center justify-center gap-2 w-full py-3 px-6 bg-cyan-600 hover:bg-cyan-700 text-white rounded-full font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
//             >
//               {isLoading ? (
//                 <Loader2 className="w-5 h-5 animate-spin" />
//               ) : (
//                 "Check Answer"
//               )}
//             </button>
//           ) : isLastQuestion ? (
//             <button
//               onClick={finishPractice}
//               className="flex items-center justify-center gap-2 w-full py-3 px-6 bg-slate-900 hover:bg-slate-800 text-white rounded-full font-bold transition-all shadow-sm"
//             >
//               Finish Set <CheckCircle2 className="w-4 h-4 ml-1" />
//             </button>
//           ) : (
//             <div className="px-6 py-3 font-bold text-slate-400 text-sm tracking-widest uppercase">
//               {currentIndex + 1} of {questions.length}
//             </div>
//           )}
//         </div>

//         <button
//           onClick={goNext}
//           disabled={isLastQuestion}
//           className="w-12 h-12 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
//         >
//           <ChevronRight className="w-6 h-6" />
//         </button>

//         <div className="w-px h-6 bg-slate-200 mx-1 hidden sm:block" />

//         <button
//           onClick={() => setShowReference(!showReference)}
//           className={`w-12 h-12 flex items-center justify-center border transition-all shadow-sm rounded-full ${
//             showReference
//               ? "bg-cyan-600 border-cyan-600 text-white"
//               : "bg-slate-50 border-slate-200 hover:border-cyan-300 hover:bg-cyan-50 text-slate-600 hover:text-cyan-700"
//           }`}
//           title="Reference Materials"
//         >
//           <Info className="w-5 h-5" />
//         </button>
//         <button
//           onClick={() => setShowCalculator(!showCalculator)}
//           className={`w-12 h-12 flex items-center justify-center border transition-all shadow-sm rounded-full ${
//             showCalculator
//               ? "bg-cyan-600 border-cyan-600 text-white"
//               : "bg-slate-50 border-slate-200 hover:border-cyan-300 hover:bg-cyan-50 text-slate-600 hover:text-cyan-700"
//           }`}
//           title="Scientific Calculator"
//         >
//           <Calculator className="w-5 h-5" />
//         </button>
//       </motion.div>
//     </div>
//   );
// }

"use client";

import { AnimatePresence, motion, useDragControls } from "framer-motion";
import katex from "katex";
import "katex/dist/katex.min.css";
import {
  Award,
  BookOpenCheck,
  Calculator,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Delete,
  FileText,
  GripHorizontal,
  Info,
  Lightbulb,
  Loader2,
  Play,
  Settings2,
  Target,
  X,
  XCircle,
} from "lucide-react";
import * as math from "mathjs";
import { useEffect, useState } from "react";

// --- MOCK DATA ---
const SET_STATS = {
  totalQuestions: 3,
  totalMarks: 3,
  estimatedMinutes: 5,
};

const questions = [
  {
    id: 1,
    question:
      "A transverse wave travels along a stretched string. What is the phase difference between two points on the string that are separated by a distance of $\\frac{\\lambda}{2}$?",
    options: [
      "0 \\text{ rad}",
      "\\frac{\\pi}{2} \\text{ rad}",
      "\\pi \\text{ rad}",
      "2\\pi \\text{ rad}",
    ],
    answer: 2,
    hints: [
      "Remember that a full wavelength corresponds to a complete cycle.",
      "A complete cycle in radians is $2\\pi$.",
    ],
    explain:
      "A full wavelength ($\\lambda$) corresponds to a phase difference of $2\\pi$. Therefore, a distance of $\\frac{\\lambda}{2}$ corresponds exactly to half of that phase difference, which is $\\pi$ radians.",
    mockAnswer:
      "Model Concept: Phase difference $\\Delta\\phi$ is related to path difference $\\Delta x$ by the formula $\\Delta\\phi = \\frac{2\\pi}{\\lambda} \\Delta x$. Substituting $\\Delta x = \\frac{\\lambda}{2}$ yields $\\pi$ radians.",
  },
  {
    id: 2,
    question:
      "Which of the following correctly describes the principle of superposition?",
    options: [
      "When two waves meet, their amplitudes multiply.",
      "When two waves meet, the resultant displacement is the vector sum of their individual displacements.",
      "Waves always reflect when they meet another wave.",
      "Two waves can never occupy the same space at the same time.",
    ],
    answer: 1,
    hints: [
      "Think about what happens to the height (displacement) of the water when two ripples crash into each other.",
      "Is it a scalar addition or a vector addition?",
    ],
    explain:
      "The principle of superposition states that when two or more waves overlap, the resultant displacement at any point is the vector sum of the displacements of the individual waves at that point.",
    mockAnswer:
      "Model Concept: Superposition is a fundamental property of all linear wave systems (light, sound, water). Constructive interference occurs when displacements are in the same direction, and destructive when opposite.",
  },
  {
    id: 3,
    question:
      "In a stationary wave, what is the specific term for a point of minimum or zero amplitude?",
    options: ["Antinode", "Crest", "Trough", "Node"],
    answer: 3,
    hints: [],
    explain:
      "A node is a point along a stationary wave where the wave has minimum (or zero) amplitude. This occurs due to continuous destructive interference between the incident and reflected waves.",
    mockAnswer:
      "Model Concept: Stationary waves are characterized by alternating Nodes (zero amplitude) and Antinodes (maximum amplitude). The distance between two adjacent nodes is exactly $\\frac{\\lambda}{2}$.",
  },
];

// --- UTILS ---
const safeRenderKatex = (latex: string) => {
  try {
    return katex.renderToString(latex || " ", {
      throwOnError: false,
      displayMode: false,
    });
  } catch (e) {
    return `<span class="text-red-500">${latex}</span>`;
  }
};

// Returns true only when the string actually contains LaTeX syntax.
// Plain English sentences should never be sent to KaTeX.
const hasLatexSyntax = (text: string) => /[\\^_{}]/.test(text);

// Intelligently renders either pure LaTeX (for options) or mixed text (for questions/explanations).
// When isPureMath=true it first checks whether the string is actually LaTeX;
// plain-text option strings are rendered as normal text, not fed into KaTeX.
const MathInline = ({
  text,
  isPureMath = false,
}: {
  text: string;
  isPureMath?: boolean;
}) => {
  if (isPureMath) {
    // FIX: Only invoke KaTeX when the string actually contains LaTeX syntax.
    // Plain-English option strings (no backslashes / ^ / _ / {}) are rendered
    // as plain text, preventing KaTeX from stripping spaces and italicising words.
    if (hasLatexSyntax(text)) {
      return (
        <span dangerouslySetInnerHTML={{ __html: safeRenderKatex(text) }} />
      );
    }
    return <span>{text}</span>;
  }

  // Mixed mode: split on inline $...$ delimiters
  const parts = text.split(/(\$.*?\$)/g);
  return (
    <span>
      {parts.map((part, idx) => {
        if (part.startsWith("$") && part.endsWith("$")) {
          const latex = part.slice(1, -1);
          return (
            <span
              key={idx}
              dangerouslySetInnerHTML={{ __html: safeRenderKatex(latex) }}
              className="mx-1 inline-block"
            />
          );
        }
        return (
          <span key={idx} className="whitespace-pre-wrap">
            {part}
          </span>
        );
      })}
    </span>
  );
};

// --- REUSABLE COMPONENTS ---
const Toggle = ({
  enabled,
  onChange,
}: {
  enabled: boolean;
  onChange: () => void;
}) => (
  <button
    onClick={onChange}
    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 ${
      enabled ? "bg-cyan-500" : "bg-slate-200"
    }`}
  >
    <span
      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
        enabled ? "translate-x-5" : "translate-x-0"
      }`}
    />
  </button>
);

// --- MAIN COMPONENT ---
export default function McqPractice() {
  const [hasStarted, setHasStarted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // Settings
  const [useTimer, setUseTimer] = useState(true);
  const [isLearningMode, setIsLearningMode] = useState(true);
  const [timeLeft, setTimeLeft] = useState(SET_STATS.estimatedMinutes * 60);

  // Quiz State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [submittedQuestions, setSubmittedQuestions] = useState<
    Record<number, boolean>
  >({});
  const [isLoading, setIsLoading] = useState(false);

  // UI Helpers
  const [showHintPopover, setShowHintPopover] = useState(false);
  const [revealedHints, setRevealedHints] = useState(1);

  // Draggable Modals State & Controls
  const [isDesktop, setIsDesktop] = useState(true);
  const [showReference, setShowReference] = useState(false);
  const [refTab, setRefTab] = useState<"formula" | "constants" | "latex">(
    "formula"
  );
  const refDragControls = useDragControls();

  // Calculator State & Controls
  const [showCalculator, setShowCalculator] = useState(false);
  const [calcInput, setCalcInput] = useState("");
  const [calcResult, setCalcResult] = useState("");
  const calcDragControls = useDragControls();

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const currentAnswer = userAnswers[currentQuestion.id];
  const hasAnswered = currentAnswer !== undefined;
  const isCurrentSubmitted = submittedQuestions[currentQuestion.id] || false;

  // Desktop Detection
  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 768);
    checkDesktop();
    window.addEventListener("resize", checkDesktop);
    return () => window.removeEventListener("resize", checkDesktop);
  }, []);

  // Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (hasStarted && !isCompleted && useTimer && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [hasStarted, isCompleted, useTimer, timeLeft]);

  // Calculator Keyboard Bindings
  useEffect(() => {
    if (!showCalculator) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (["INPUT", "TEXTAREA"].includes(activeEl.tagName) ||
          activeEl.getAttribute("contenteditable") === "true")
      )
        return;
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
      else if (key === "Escape" || key.toLowerCase() === "c")
        handleCalcKey("C");
      else if (key === "^") handleCalcKey("^");
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showCalculator, calcResult]);

  // Calculator Live Evaluator
  useEffect(() => {
    if (!calcInput) {
      setCalcResult("");
      return;
    }
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
    } catch (e) {
      setCalcResult("");
    }
  }, [calcInput]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

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
    if (["sin", "cos", "tan", "log", "ln", "√"].includes(key))
      append = key + "(";
    setCalcInput((prev) => prev + append);
  };

  // MCQ Handlers
  const handleSelectOption = (optionIndex: number) => {
    if (isLearningMode && isCurrentSubmitted) return;
    setUserAnswers((prev) => ({ ...prev, [currentQuestion.id]: optionIndex }));
  };

  const submitCurrentAnswer = () => {
    if (!hasAnswered || isLoading) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setSubmittedQuestions((prev) => ({
        ...prev,
        [currentQuestion.id]: true,
      }));
    }, 400);
  };

  const resetHelpers = () => {
    setShowHintPopover(false);
    setRevealedHints(1);
  };

  const goNext = () => {
    if (currentIndex < questions.length - 1) {
      setDirection(1);
      setCurrentIndex((prev) => prev + 1);
      resetHelpers();
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex((prev) => prev - 1);
      resetHelpers();
    }
  };

  const finishPractice = () => {
    if (!isLearningMode) {
      const allSubmitted: Record<number, boolean> = {};
      questions.forEach((q) => {
        if (userAnswers[q.id] !== undefined) allSubmitted[q.id] = true;
      });
      setSubmittedQuestions(allSubmitted);
    }
    setIsCompleted(true);
  };

  // --- RENDER MODES ---

  // 1. INTRO SCREEN
  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100"
        >
          <div className="w-12 h-12 bg-cyan-50 text-cyan-600 rounded-2xl flex items-center justify-center mb-6">
            <Target className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Physics Multiple Choice
          </h1>
          <p className="text-slate-500 mb-8">
            Test your understanding of wave mechanics and superposition.
          </p>
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-slate-50 p-4 rounded-2xl text-center border border-slate-100">
              <FileText className="w-5 h-5 text-slate-400 mx-auto mb-2" />
              <div className="text-xl font-bold text-slate-800">
                {SET_STATS.totalQuestions}
              </div>
              <div className="text-xs font-medium text-slate-500 uppercase mt-1">
                Questions
              </div>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl text-center border border-slate-100">
              <Award className="w-5 h-5 text-slate-400 mx-auto mb-2" />
              <div className="text-xl font-bold text-slate-800">
                {SET_STATS.totalMarks}
              </div>
              <div className="text-xs font-medium text-slate-500 uppercase mt-1">
                Total Marks
              </div>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl text-center border border-slate-100">
              <Clock className="w-5 h-5 text-slate-400 mx-auto mb-2" />
              <div className="text-xl font-bold text-slate-800">
                {SET_STATS.estimatedMinutes}m
              </div>
              <div className="text-xs font-medium text-slate-500 uppercase mt-1">
                Duration
              </div>
            </div>
          </div>
          <div className="space-y-4 mb-8">
            <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-white">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    Strict Timer
                  </p>
                  <p className="text-xs text-slate-500">
                    Enable countdown timer
                  </p>
                </div>
              </div>
              <Toggle
                enabled={useTimer}
                onChange={() => setUseTimer(!useTimer)}
              />
            </div>
            <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-white">
              <div className="flex items-center gap-3">
                <Settings2 className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    Learning Mode
                  </p>
                  <p className="text-xs text-slate-500">
                    Get feedback after every question
                  </p>
                </div>
              </div>
              <Toggle
                enabled={isLearningMode}
                onChange={() => setIsLearningMode(!isLearningMode)}
              />
            </div>
          </div>
          <button
            onClick={() => setHasStarted(true)}
            className="w-full flex items-center justify-center gap-2 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium transition-all shadow-sm"
          >
            Start Practice <Play className="w-4 h-4 fill-current" />
          </button>
        </motion.div>
      </div>
    );
  }

  // 2. COMPLETED SCREEN
  if (isCompleted) {
    const totalAchieved = questions.reduce(
      (sum, q) =>
        submittedQuestions[q.id] && userAnswers[q.id] === q.answer
          ? sum + 1
          : sum,
      0
    );

    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 py-12 px-4 pb-32">
        <div className="max-w-3xl mx-auto space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-center"
          >
            <Award className="w-12 h-12 text-cyan-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Practice Complete!
            </h1>
            <div className="text-5xl font-bold text-cyan-600 mt-6 flex justify-center items-baseline gap-2">
              {totalAchieved}{" "}
              <span className="text-2xl text-slate-400">
                / {SET_STATS.totalMarks}
              </span>
            </div>
            <p className="text-slate-500 font-medium uppercase tracking-widest text-sm mt-2">
              Total Score
            </p>
          </motion.div>

          <div className="space-y-6">
            {questions.map((q, idx) => {
              const userAnswer = userAnswers[q.id];
              const isCorrect = userAnswer === q.answer;
              const isOmitted = userAnswer === undefined;

              return (
                <motion.div
                  key={q.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm"
                >
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="text-lg font-semibold text-slate-900">
                      <span className="text-cyan-600 mr-2">Q{idx + 1}.</span>
                      <MathInline text={q.question} />
                    </h3>
                    <div
                      className={`px-3 py-1 font-bold rounded-lg text-sm shrink-0 ${
                        isCorrect
                          ? "bg-green-50 text-green-700"
                          : isOmitted
                          ? "bg-slate-100 text-slate-500"
                          : "bg-red-50 text-red-700"
                      }`}
                    >
                      {isCorrect ? "1 / 1" : "0 / 1"}
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    {q.options.map((opt, oIdx) => {
                      const isThisUserAnswer = userAnswer === oIdx;
                      const isThisCorrectAnswer = q.answer === oIdx;
                      let bgClass = "bg-white border-slate-200 opacity-50";
                      let icon = null;

                      if (isThisCorrectAnswer) {
                        bgClass = "bg-green-50 border-green-500 text-green-900";
                        icon = (
                          <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                        );
                      } else if (isThisUserAnswer && !isThisCorrectAnswer) {
                        bgClass = "bg-red-50 border-red-500 text-red-900";
                        icon = (
                          <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                        );
                      }

                      return (
                        <div
                          key={oIdx}
                          className={`w-full flex items-center gap-4 p-4 rounded-xl border ${bgClass}`}
                        >
                          <div className="w-6 h-6 rounded-full border-2 border-current flex-shrink-0 flex items-center justify-center bg-white/50">
                            {icon}
                          </div>
                          <span className="text-base font-medium">
                            <MathInline text={opt} isPureMath />
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="space-y-4 pt-6 border-t border-slate-100">
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                      <BookOpenCheck className="w-4 h-4 text-cyan-500" />
                      Explanation
                    </h3>
                    <div className="p-5 bg-cyan-50/30 border border-cyan-100 rounded-2xl text-slate-700 leading-relaxed text-sm">
                      <MathInline text={q.explain} />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // 3. ACTIVE QUIZ UI
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex justify-center pt-12 pb-32 px-4 overflow-x-hidden relative">
      {/* DRAGGABLE REFERENCE MODAL */}
      <AnimatePresence>
        {showReference && (
          <>
            {!isDesktop && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[60]"
                onClick={() => setShowReference(false)}
              />
            )}
            <motion.div
              drag={isDesktop}
              dragControls={refDragControls}
              dragListener={false}
              dragMomentum={false}
              initial={
                isDesktop ? { opacity: 0, y: 20 } : { opacity: 0, y: "100%" }
              }
              animate={isDesktop ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
              exit={
                isDesktop ? { opacity: 0, y: 20 } : { opacity: 0, y: "100%" }
              }
              style={
                isDesktop
                  ? {
                      resize: "both",
                      overflow: "hidden",
                      width: "380px",
                      height: "450px",
                      minWidth: "300px",
                      minHeight: "300px",
                      maxWidth: "80vw",
                      maxHeight: "80vh",
                      top: "10vh",
                      left: "calc(100vw - 420px)",
                    }
                  : {}
              }
              className={`fixed z-[70] bg-white border border-slate-200 flex flex-col shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] ${
                isDesktop
                  ? "rounded-xl absolute"
                  : "inset-x-4 bottom-24 top-24 rounded-2xl"
              }`}
            >
              <div
                onPointerDown={(e) => isDesktop && refDragControls.start(e)}
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
                    Reference Guide
                  </span>
                </div>
                <button
                  onClick={() => setShowReference(false)}
                  onPointerDown={(e) => e.stopPropagation()}
                  className="p-1 hover:bg-slate-200 rounded-md transition-colors text-slate-400 hover:text-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex border-b border-slate-100">
                {(["formula", "constants", "latex"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setRefTab(tab)}
                    className={`flex-1 py-2.5 text-xs font-semibold capitalize transition-colors ${
                      refTab === tab
                        ? "text-cyan-600 border-b-2 border-cyan-500"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {tab === "latex" ? "LaTeX" : tab}
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto p-5 bg-white">
                {refTab === "formula" && (
                  <div className="space-y-5">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Kinematics
                      </p>
                      <div className="space-y-3 text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <div className="flex justify-between items-center">
                          <span>Velocity</span>{" "}
                          <MathInline text="$v = u + at$" />
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Displacement</span>{" "}
                          <MathInline text="$s = ut + \frac{1}{2}at^2$" />
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Waves
                      </p>
                      <div className="space-y-3 text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <div className="flex justify-between items-center">
                          <span>Wave Speed</span>{" "}
                          <MathInline text="$v = f\lambda$" />
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Phase Diff</span>{" "}
                          <MathInline text="$\Delta\phi = \frac{2\pi}{\lambda}\Delta x$" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {refTab === "constants" && (
                  <div className="space-y-5">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Universal
                      </p>
                      <div className="space-y-3 text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <div className="flex justify-between items-center">
                          <span>Gravity (g)</span>{" "}
                          <MathInline text="$9.81 \, \text{m/s}^2$" />
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Speed of Light (c)</span>{" "}
                          <MathInline text="$3 \times 10^8 \, \text{m/s}$" />
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Planck (h)</span>{" "}
                          <MathInline text="$6.63 \times 10^{-34} \, \text{J s}$" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {refTab === "latex" && (
                  <div className="space-y-5">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Quick Syntax Guide
                      </p>
                      <div className="space-y-3 text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <div className="flex justify-between items-center">
                          <code className="text-[11px] bg-white px-1.5 py-0.5 rounded border border-slate-200">
                            \frac{"{a}{b}"}
                          </code>{" "}
                          <MathInline text="$\frac{a}{b}$" />
                        </div>
                        <div className="flex justify-between items-center">
                          <code className="text-[11px] bg-white px-1.5 py-0.5 rounded border border-slate-200">
                            x^2
                          </code>{" "}
                          <MathInline text="$x^2$" />
                        </div>
                        <div className="flex justify-between items-center">
                          <code className="text-[11px] bg-white px-1.5 py-0.5 rounded border border-slate-200">
                            v_0
                          </code>{" "}
                          <MathInline text="$v_0$" />
                        </div>
                        <div className="flex justify-between items-center">
                          <code className="text-[11px] bg-white px-1.5 py-0.5 rounded border border-slate-200">
                            \sqrt{"{x}"}
                          </code>{" "}
                          <MathInline text="$\sqrt{x}$" />
                        </div>
                        <div className="flex justify-between items-center">
                          <code className="text-[11px] bg-white px-1.5 py-0.5 rounded border border-slate-200">
                            \lambda
                          </code>{" "}
                          <MathInline text="$\lambda$" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* DRAGGABLE CALCULATOR MODAL */}
      <AnimatePresence>
        {showCalculator && (
          <>
            {!isDesktop && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[60]"
                onClick={() => setShowCalculator(false)}
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
              exit={
                isDesktop ? { opacity: 0, y: 20 } : { opacity: 0, y: "100%" }
              }
              style={
                isDesktop ? { width: "340px", top: "15vh", left: "8vw" } : {}
              }
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
                  onClick={() => setShowCalculator(false)}
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
                    if (isNum)
                      bg =
                        "bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 shadow-sm font-medium text-lg";
                    if (isOp)
                      bg =
                        "bg-cyan-50 hover:bg-cyan-100 text-cyan-700 border border-cyan-100 font-medium text-lg";
                    if (key === "=")
                      bg =
                        "bg-cyan-600 hover:bg-cyan-700 text-white border border-cyan-700 shadow-sm font-medium text-lg";
                    if (isClear)
                      bg =
                        "bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-100";
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
        )}
      </AnimatePresence>

      <div className="w-full max-w-2xl relative z-10">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-8 px-2">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-semibold tracking-wide text-slate-500 uppercase">
              {isLearningMode ? "Learning Mode" : "Practice Mode"}
            </h2>
            {useTimer && (
              <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
                <Clock className="w-4 h-4 text-slate-400" />
                <span className={timeLeft < 60 ? "text-red-500 font-bold" : ""}>
                  {formatTime(timeLeft)}
                </span>
              </div>
            )}
          </div>
          <div className="text-sm font-medium text-cyan-600 bg-cyan-50 px-3 py-1 rounded-full border border-cyan-100 hidden sm:block">
            Question {currentIndex + 1} / {questions.length}
          </div>
        </div>

        {/* MAIN CARD */}
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden border border-slate-100 flex flex-col relative">
          <div className="p-8 md:p-10 flex-grow relative">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={
                  currentQuestion.id + (isCurrentSubmitted ? "-eval" : "-input")
                }
                initial={{ opacity: 0, x: direction * 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -direction * 20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                {/* Hints Toolbar */}
                {currentQuestion.hints &&
                  currentQuestion.hints.length > 0 &&
                  (!isLearningMode || !isCurrentSubmitted) && (
                    <div className="flex justify-end mb-4 relative z-20">
                      <div className="relative">
                        <button
                          onClick={() => setShowHintPopover(!showHintPopover)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors border ${
                            showHintPopover || revealedHints > 1
                              ? "bg-amber-50 text-amber-600 border-amber-200 shadow-sm"
                              : "bg-white text-slate-400 border-slate-200 hover:text-amber-500 hover:border-amber-200"
                          }`}
                        >
                          <Lightbulb
                            className={`w-4 h-4 ${
                              showHintPopover || revealedHints > 1
                                ? "fill-amber-100"
                                : ""
                            }`}
                          />
                          Hints {revealedHints > 1 && `(${revealedHints})`}
                        </button>

                        <AnimatePresence>
                          {showHintPopover && (
                            <>
                              <div
                                className="fixed inset-0 z-30"
                                onClick={() => setShowHintPopover(false)}
                              />
                              <motion.div
                                initial={{ opacity: 0, y: 5, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 5, scale: 0.95 }}
                                transition={{ duration: 0.15 }}
                                className="absolute right-0 top-[calc(100%+8px)] w-72 md:w-80 bg-white border border-slate-200 shadow-xl rounded-xl p-4 z-40"
                              >
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                                  Available Hints
                                </div>
                                <div className="space-y-2">
                                  {currentQuestion.hints
                                    .slice(0, revealedHints)
                                    .map((hint, idx) => (
                                      <motion.div
                                        initial={{ opacity: 0, x: -5 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        key={idx}
                                        className="p-3 bg-amber-50/80 rounded-lg text-sm text-amber-900 border border-amber-100/50 leading-relaxed whitespace-pre-wrap"
                                      >
                                        <MathInline text={hint} />
                                      </motion.div>
                                    ))}
                                </div>
                                {revealedHints <
                                  currentQuestion.hints.length && (
                                  <button
                                    onClick={() =>
                                      setRevealedHints((prev) => prev + 1)
                                    }
                                    className="mt-3 w-full py-2 bg-slate-50 hover:bg-amber-50 text-xs font-bold text-slate-500 hover:text-amber-600 border border-slate-200 hover:border-amber-200 rounded-lg transition-colors"
                                  >
                                    Reveal Next Hint
                                  </button>
                                )}
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  )}

                <h1 className="text-2xl md:text-3xl font-medium leading-snug text-slate-900 mb-8">
                  <MathInline text={currentQuestion.question} />
                </h1>

                {/* OPTIONS LIST */}
                <div className="space-y-4">
                  {currentQuestion.options.map((opt, oIdx) => {
                    const isSelected = currentAnswer === oIdx;
                    const isCorrect = currentQuestion.answer === oIdx;

                    let stateClasses =
                      "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700";
                    let showIcon = false;
                    let iconContent = null;

                    if (isLearningMode && isCurrentSubmitted) {
                      if (isCorrect) {
                        stateClasses =
                          "bg-green-50 border-green-500 text-green-900 shadow-sm";
                        showIcon = true;
                        iconContent = (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        );
                      } else if (isSelected) {
                        stateClasses =
                          "bg-red-50 border-red-500 text-red-900 shadow-sm";
                        showIcon = true;
                        iconContent = (
                          <XCircle className="w-5 h-5 text-red-500" />
                        );
                      } else {
                        stateClasses =
                          "bg-white border-slate-200 opacity-40 text-slate-400";
                      }
                    } else if (isSelected) {
                      stateClasses =
                        "bg-cyan-50 border-cyan-500 ring-1 ring-cyan-200 text-cyan-900 shadow-sm";
                    }

                    return (
                      <button
                        key={oIdx}
                        onClick={() => handleSelectOption(oIdx)}
                        disabled={isLearningMode && isCurrentSubmitted}
                        className={`w-full flex items-center gap-5 p-5 rounded-2xl border-2 transition-all duration-200 text-left ${stateClasses}`}
                      >
                        <div
                          className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                            showIcon
                              ? "border-transparent bg-white/50"
                              : isSelected
                              ? "border-cyan-500 bg-white"
                              : "border-slate-300 bg-white"
                          }`}
                        >
                          {showIcon
                            ? iconContent
                            : isSelected && (
                                <div className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
                              )}
                        </div>
                        <span className="text-lg font-medium leading-relaxed">
                          <MathInline text={opt} isPureMath />
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* EXPLANATION REVEAL */}
                <AnimatePresence>
                  {isLearningMode && isCurrentSubmitted && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: "auto" }}
                      className="mt-8 overflow-hidden"
                    >
                      <div className="space-y-4 pt-6 border-t border-slate-100">
                        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                          <BookOpenCheck className="w-4 h-4 text-cyan-500" />
                          Explanation
                        </h3>
                        <div className="p-6 bg-cyan-50/50 border border-cyan-100 rounded-2xl text-slate-700 leading-relaxed text-base whitespace-pre-wrap">
                          <MathInline text={currentQuestion.explain} />
                        </div>
                      </div>

                      {currentQuestion.mockAnswer && (
                        <div className="space-y-4 pt-6 mt-6 border-t border-slate-100">
                          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                            <FileText className="w-4 h-4 text-indigo-500" />
                            Model Concept
                          </h3>
                          <div className="p-6 bg-indigo-50/50 border border-indigo-100 rounded-2xl text-slate-700 leading-relaxed text-base whitespace-pre-wrap">
                            <MathInline text={currentQuestion.mockAnswer} />
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* FLOATING BOTTOM NAVBAR */}
      <motion.div
        initial={{ y: 100, opacity: 0, x: "-50%" }}
        animate={{ y: 0, opacity: 1, x: "-50%" }}
        className="fixed bottom-6 left-1/2 z-30 flex items-center gap-2 p-2 bg-white/80 backdrop-blur-md border border-slate-200/50 shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-full"
      >
        <button
          onClick={goPrev}
          disabled={currentIndex === 0}
          className="w-12 h-12 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <div className="flex-shrink-0 flex items-center justify-center gap-2 min-w-[160px] relative">
          {isLearningMode && !isCurrentSubmitted ? (
            <button
              onClick={submitCurrentAnswer}
              disabled={!hasAnswered || isLoading}
              className="flex items-center justify-center gap-2 w-full py-3 px-6 bg-cyan-600 hover:bg-cyan-700 text-white rounded-full font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Check Answer"
              )}
            </button>
          ) : isLastQuestion ? (
            <button
              onClick={finishPractice}
              className="flex items-center justify-center gap-2 w-full py-3 px-6 bg-slate-900 hover:bg-slate-800 text-white rounded-full font-bold transition-all shadow-sm"
            >
              Finish Set <CheckCircle2 className="w-4 h-4 ml-1" />
            </button>
          ) : (
            <div className="px-6 py-3 font-bold text-slate-400 text-sm tracking-widest uppercase">
              {currentIndex + 1} of {questions.length}
            </div>
          )}
        </div>

        <button
          onClick={goNext}
          disabled={isLastQuestion}
          className="w-12 h-12 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        <div className="w-px h-6 bg-slate-200 mx-1 hidden sm:block" />

        <button
          onClick={() => setShowReference(!showReference)}
          className={`w-12 h-12 flex items-center justify-center border transition-all shadow-sm rounded-full ${
            showReference
              ? "bg-cyan-600 border-cyan-600 text-white"
              : "bg-slate-50 border-slate-200 hover:border-cyan-300 hover:bg-cyan-50 text-slate-600 hover:text-cyan-700"
          }`}
          title="Reference Materials"
        >
          <Info className="w-5 h-5" />
        </button>
        <button
          onClick={() => setShowCalculator(!showCalculator)}
          className={`w-12 h-12 flex items-center justify-center border transition-all shadow-sm rounded-full ${
            showCalculator
              ? "bg-cyan-600 border-cyan-600 text-white"
              : "bg-slate-50 border-slate-200 hover:border-cyan-300 hover:bg-cyan-50 text-slate-600 hover:text-cyan-700"
          }`}
          title="Scientific Calculator"
        >
          <Calculator className="w-5 h-5" />
        </button>
      </motion.div>
    </div>
  );
}
