// "use client";

// import { AnimatePresence, motion } from "framer-motion";
// import { ArrowRight, CheckCircle2, Loader2, Send, XCircle } from "lucide-react";
// import { useState } from "react";

// // --- MOCK DATA ---
// const questions = [
//   {
//     id: 1,
//     question: "Define a physical quantity.",
//     markscheme: [
//       "A measurable property",
//       "Expressed with numerical value",
//       "Includes a unit",
//       "Used to describe physical systems",
//     ],
//   },
//   {
//     id: 2,
//     question: "Explain the difference between scalar and vector quantities.",
//     markscheme: [
//       "Scalar has magnitude only",
//       "Vector has magnitude and direction",
//       "Example of scalar",
//       "Example of vector",
//     ],
//   },
//   {
//     id: 3,
//     question: "State Newton’s Second Law.",
//     markscheme: [
//       "Force equals mass times acceleration",
//       "F = ma",
//       "Acceleration proportional to force",
//       "Inversely proportional to mass",
//     ],
//   },
// ];

// // --- MOCK EVALUATION LOGIC ---
// const getEvaluation = (questionId: number) => {
//   if (questionId === 1) {
//     return {
//       score: 2,
//       points: [
//         {
//           awarded: true,
//           text: "A measurable property",
//           reason: "User mentioned measurement",
//         },
//         {
//           awarded: true,
//           text: "Expressed with numerical value",
//           reason: "Numerical aspect included",
//         },
//         { awarded: false, text: "Includes a unit", reason: "Units missing" },
//         {
//           awarded: false,
//           text: "Used to describe physical systems",
//           reason: "Context missing",
//         },
//       ],
//     };
//   }
//   if (questionId === 2) {
//     return {
//       score: 0,
//       points: [
//         {
//           awarded: false,
//           text: "Scalar has magnitude only",
//           reason: "Concept missing",
//         },
//         {
//           awarded: false,
//           text: "Vector has magnitude and direction",
//           reason: "Concept missing",
//         },
//         {
//           awarded: false,
//           text: "Example of scalar",
//           reason: "No example provided",
//         },
//         {
//           awarded: false,
//           text: "Example of vector",
//           reason: "No example provided",
//         },
//       ],
//     };
//   }
//   return {
//     score: 4,
//     points: [
//       {
//         awarded: true,
//         text: "Force equals mass times acceleration",
//         reason: "Definition accurate",
//       },
//       { awarded: true, text: "F = ma", reason: "Formula present" },
//       {
//         awarded: true,
//         text: "Acceleration proportional to force",
//         reason: "Relationship correct",
//       },
//       {
//         awarded: true,
//         text: "Inversely proportional to mass",
//         reason: "Relationship correct",
//       },
//     ],
//   };
// };

// // --- MAIN COMPONENT ---
// export default function TheoryPractice() {
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [answer, setAnswer] = useState("");
//   const [isSubmitted, setIsSubmitted] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);

//   const currentQuestion = questions[currentIndex];
//   const evaluation = getEvaluation(currentQuestion.id);

//   const handleSubmit = () => {
//     if (!answer.trim()) return;
//     setIsLoading(true);
//     // Fake 0.5s network delay
//     setTimeout(() => {
//       setIsLoading(false);
//       setIsSubmitted(true);
//     }, 500);
//   };

//   const handleNext = () => {
//     if (currentIndex < questions.length - 1) {
//       setCurrentIndex((prev) => prev + 1);
//       setAnswer("");
//       setIsSubmitted(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex justify-center py-12 px-4">
//       <div className="w-full max-w-2xl">
//         {/* HEADER */}
//         <div className="flex justify-between items-center mb-8 px-2">
//           <h2 className="text-sm font-semibold tracking-wide text-slate-500 uppercase">
//             Theory Practice
//           </h2>
//           <div className="text-sm font-medium text-cyan-600 bg-cyan-50 px-3 py-1 rounded-full">
//             Question {currentIndex + 1} / {questions.length}
//           </div>
//         </div>

//         {/* MAIN CARD */}
//         <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden border border-slate-100">
//           <AnimatePresence mode="wait">
//             <motion.div
//               key={currentQuestion.id + (isSubmitted ? "-submitted" : "")}
//               initial={{ opacity: 0, y: 10 }}
//               animate={{ opacity: 1, y: 0 }}
//               exit={{ opacity: 0, y: -10 }}
//               transition={{ duration: 0.3, ease: "easeOut" }}
//               className="p-8 md:p-10"
//             >
//               {/* QUESTION */}
//               <h1 className="text-2xl md:text-3xl font-medium leading-snug mb-8 text-center text-slate-900">
//                 {currentQuestion.question}
//               </h1>

//               {!isSubmitted ? (
//                 /* INPUT STATE */
//                 <motion.div
//                   initial={{ opacity: 0 }}
//                   animate={{ opacity: 1 }}
//                   className="space-y-6"
//                 >
//                   <textarea
//                     value={answer}
//                     onChange={(e) => setAnswer(e.target.value)}
//                     placeholder="Write your answer here..."
//                     className="w-full h-48 p-5 bg-slate-50 text-slate-700 placeholder:text-slate-400 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all resize-none text-lg leading-relaxed shadow-inner"
//                   />
//                   <div className="flex justify-end">
//                     <button
//                       onClick={handleSubmit}
//                       disabled={!answer.trim() || isLoading}
//                       className="flex items-center gap-2 px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
//                     >
//                       {isLoading ? (
//                         <>
//                           <Loader2 className="w-5 h-5 animate-spin" />
//                           Evaluating...
//                         </>
//                       ) : (
//                         <>
//                           Submit Answer
//                           <Send className="w-4 h-4 ml-1" />
//                         </>
//                       )}
//                     </button>
//                   </div>
//                 </motion.div>
//               ) : (
//                 /* EVALUATION STATE */
//                 <motion.div
//                   initial={{ opacity: 0, scale: 0.98 }}
//                   animate={{ opacity: 1, scale: 1 }}
//                   transition={{ duration: 0.4 }}
//                   className="space-y-8"
//                 >
//                   {/* Score Display */}
//                   <div className="flex flex-col items-center justify-center py-6 bg-cyan-50/50 rounded-2xl border border-cyan-100">
//                     <span className="text-sm font-semibold text-cyan-600 uppercase tracking-widest mb-2">
//                       Final Score
//                     </span>
//                     <div className="text-5xl font-bold text-slate-900 flex items-baseline gap-1">
//                       {evaluation.score}
//                       <span className="text-2xl text-slate-400 font-medium">
//                         / 4
//                       </span>
//                     </div>
//                   </div>

//                   {/* Markscheme Breakdown */}
//                   <div className="space-y-4">
//                     <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
//                       Markscheme Breakdown
//                     </h3>
//                     <div className="space-y-3">
//                       {evaluation.points.map((point, idx) => (
//                         <motion.div
//                           initial={{ opacity: 0, x: -10 }}
//                           animate={{ opacity: 1, x: 0 }}
//                           transition={{ delay: idx * 0.1 + 0.2 }}
//                           key={idx}
//                           className={`p-4 rounded-xl flex gap-4 items-start border ${
//                             point.awarded
//                               ? "bg-green-50/30 border-green-100"
//                               : "bg-red-50/30 border-red-100"
//                           }`}
//                         >
//                           {point.awarded ? (
//                             <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0 mt-0.5" />
//                           ) : (
//                             <XCircle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
//                           )}
//                           <div>
//                             <p className="text-slate-800 font-medium mb-1">
//                               {point.text}
//                             </p>
//                             <div className="flex items-center text-sm gap-2">
//                               <ArrowRight className="w-3 h-3 text-slate-400" />
//                               <span
//                                 className={
//                                   point.awarded
//                                     ? "text-green-700"
//                                     : "text-red-700"
//                                 }
//                               >
//                                 {point.reason}
//                               </span>
//                             </div>
//                           </div>
//                         </motion.div>
//                       ))}
//                     </div>
//                   </div>

//                   {/* Next Question Navigation */}
//                   <div className="pt-6 border-t border-slate-100 flex justify-end">
//                     {currentIndex < questions.length - 1 ? (
//                       <button
//                         onClick={handleNext}
//                         className="flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium transition-all shadow-sm"
//                       >
//                         Next Question
//                         <ArrowRight className="w-4 h-4" />
//                       </button>
//                     ) : (
//                       <div className="px-6 py-3 bg-cyan-50 text-cyan-700 rounded-xl font-medium border border-cyan-100">
//                         Practice Complete! 🎉
//                       </div>
//                     )}
//                   </div>
//                 </motion.div>
//               )}
//             </motion.div>
//           </AnimatePresence>
//         </div>
//       </div>
//     </div>
//   );
// }

// "use client";

// import { AnimatePresence, motion } from "framer-motion";
// import {
//   ArrowRight,
//   Award,
//   CheckCircle2,
//   Clock,
//   FileText,
//   Loader2,
//   Play,
//   Send,
//   Settings2,
//   Target,
//   XCircle,
// } from "lucide-react";
// import { useEffect, useState } from "react";

// // --- MOCK DATA ---
// const SET_STATS = {
//   totalQuestions: 3,
//   totalMarks: 12,
//   estimatedMinutes: 10,
// };

// const questions = [
//   {
//     id: 1,
//     question: "Define a physical quantity.",
//     markscheme: [
//       "A measurable property",
//       "Expressed with numerical value",
//       "Includes a unit",
//       "Used to describe physical systems",
//     ],
//   },
//   {
//     id: 2,
//     question: "Explain the difference between scalar and vector quantities.",
//     markscheme: [
//       "Scalar has magnitude only",
//       "Vector has magnitude and direction",
//       "Example of scalar",
//       "Example of vector",
//     ],
//   },
//   {
//     id: 3,
//     question: "State Newton’s Second Law.",
//     markscheme: [
//       "Force equals mass times acceleration",
//       "F = ma",
//       "Acceleration proportional to force",
//       "Inversely proportional to mass",
//     ],
//   },
// ];

// // --- MOCK EVALUATION LOGIC ---
// const getEvaluation = (questionId: number) => {
//   if (questionId === 1) {
//     return {
//       score: 2,
//       points: [
//         {
//           awarded: true,
//           text: "A measurable property",
//           reason: "User mentioned measurement",
//         },
//         {
//           awarded: true,
//           text: "Expressed with numerical value",
//           reason: "Numerical aspect included",
//         },
//         { awarded: false, text: "Includes a unit", reason: "Units missing" },
//         {
//           awarded: false,
//           text: "Used to describe physical systems",
//           reason: "Context missing",
//         },
//       ],
//     };
//   }
//   if (questionId === 2) {
//     return {
//       score: 0,
//       points: [
//         {
//           awarded: false,
//           text: "Scalar has magnitude only",
//           reason: "Concept missing",
//         },
//         {
//           awarded: false,
//           text: "Vector has magnitude and direction",
//           reason: "Concept missing",
//         },
//         {
//           awarded: false,
//           text: "Example of scalar",
//           reason: "No example provided",
//         },
//         {
//           awarded: false,
//           text: "Example of vector",
//           reason: "No example provided",
//         },
//       ],
//     };
//   }
//   return {
//     score: 4,
//     points: [
//       {
//         awarded: true,
//         text: "Force equals mass times acceleration",
//         reason: "Definition accurate",
//       },
//       { awarded: true, text: "F = ma", reason: "Formula present" },
//       {
//         awarded: true,
//         text: "Acceleration proportional to force",
//         reason: "Relationship correct",
//       },
//       {
//         awarded: true,
//         text: "Inversely proportional to mass",
//         reason: "Relationship correct",
//       },
//     ],
//   };
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
// export default function TheoryPractice() {
//   // App State
//   const [hasStarted, setHasStarted] = useState(false);
//   const [isCompleted, setIsCompleted] = useState(false);

//   // Settings State
//   const [useTimer, setUseTimer] = useState(true);
//   const [isLearningMode, setIsLearningMode] = useState(true);
//   const [timeLeft, setTimeLeft] = useState(SET_STATS.estimatedMinutes * 60);

//   // Quiz State
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
//   const [currentDraft, setCurrentDraft] = useState("");
//   const [isSubmitted, setIsSubmitted] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);

//   const currentQuestion = questions[currentIndex];
//   const isLastQuestion = currentIndex === questions.length - 1;

//   // Timer Effect
//   useEffect(() => {
//     let timer: NodeJS.Timeout;
//     if (hasStarted && !isCompleted && useTimer && timeLeft > 0) {
//       timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
//     }
//     return () => clearInterval(timer);
//   }, [hasStarted, isCompleted, useTimer, timeLeft]);

// const formatTime = (seconds: number) => {
//   const m = Math.floor(seconds / 60);
//   const s = seconds % 60;
//   return `${m}:${s.toString().padStart(2, "0")}`;
// };

//   const startPractice = () => {
//     setHasStarted(true);
//   };

//   const handleAction = () => {
//     // Save draft to state
//     setUserAnswers((prev) => ({ ...prev, [currentQuestion.id]: currentDraft }));

//     if (isLearningMode && !isSubmitted) {
//       // LEARNING MODE: Evaluate immediately
//       if (!currentDraft.trim()) return;
//       setIsLoading(true);
//       setTimeout(() => {
//         setIsLoading(false);
//         setIsSubmitted(true);
//       }, 500);
//     } else {
//       // PRACTICE MODE OR LEARNING MODE "NEXT"
//       if (isLastQuestion) {
//         setIsCompleted(true);
//       } else {
//         setCurrentIndex((prev) => prev + 1);
//         setCurrentDraft(userAnswers[questions[currentIndex + 1]?.id] || "");
//         setIsSubmitted(false);
//       }
//     }
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
//             Physics Theory Set #1
//           </h1>
//           <p className="text-slate-500 mb-8">
//             Test your understanding of core physical properties and laws.
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
//             onClick={startPractice}
//             className="w-full flex items-center justify-center gap-2 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium transition-all shadow-sm"
//           >
//             Start Practice
//             <Play className="w-4 h-4 fill-current" />
//           </button>
//         </motion.div>
//       </div>
//     );
//   }

//   // 2. COMPLETED SCREEN (All Results)
//   if (isCompleted) {
//     const totalAchieved = questions.reduce(
//       (sum, q) => sum + getEvaluation(q.id).score,
//       0
//     );

//     return (
//       <div className="min-h-screen bg-slate-50 text-slate-800 py-12 px-4">
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
//               const evalResult = getEvaluation(q.id);
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
//                       {q.question}
//                     </h3>
//                     <div className="px-3 py-1 bg-cyan-50 text-cyan-700 font-bold rounded-lg text-sm shrink-0">
//                       {evalResult.score} / 4
//                     </div>
//                   </div>

//                   <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 text-slate-600 italic">
//                     "{userAnswers[q.id] || "No answer provided."}"
//                   </div>

//                   <div className="space-y-3">
//                     {evalResult.points.map((point, pIdx) => (
//                       <div
//                         key={pIdx}
//                         className="flex gap-4 items-start text-sm"
//                       >
//                         {point.awarded ? (
//                           <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
//                         ) : (
//                           <XCircle className="w-5 h-5 text-red-400 shrink-0" />
//                         )}
//                         <div>
//                           <p
//                             className={`font-medium ${
//                               point.awarded
//                                 ? "text-slate-800"
//                                 : "text-slate-500"
//                             }`}
//                           >
//                             {point.text}
//                           </p>
//                           <p
//                             className={
//                               point.awarded ? "text-green-600" : "text-red-500"
//                             }
//                           >
//                             ↳ {point.reason}
//                           </p>
//                         </div>
//                       </div>
//                     ))}
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
//     <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex justify-center py-12 px-4">
//       <div className="w-full max-w-2xl">
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
//           <div className="text-sm font-medium text-cyan-600 bg-cyan-50 px-3 py-1 rounded-full border border-cyan-100">
//             Question {currentIndex + 1} / {questions.length}
//           </div>
//         </div>

//         {/* MAIN CARD */}
//         <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden border border-slate-100">
//           <AnimatePresence mode="wait">
//             <motion.div
//               key={currentQuestion.id + (isSubmitted ? "-submitted" : "-draft")}
//               initial={{ opacity: 0, y: 10 }}
//               animate={{ opacity: 1, y: 0 }}
//               exit={{ opacity: 0, y: -10 }}
//               transition={{ duration: 0.3, ease: "easeOut" }}
//               className="p-8 md:p-10"
//             >
//               <h1 className="text-2xl md:text-3xl font-medium leading-snug mb-8 text-center text-slate-900">
//                 {currentQuestion.question}
//               </h1>

//               {!isLearningMode || !isSubmitted ? (
//                 /* INPUT STATE */
//                 <motion.div
//                   initial={{ opacity: 0 }}
//                   animate={{ opacity: 1 }}
//                   className="space-y-6"
//                 >
//                   <textarea
//                     value={currentDraft}
//                     onChange={(e) => setCurrentDraft(e.target.value)}
//                     placeholder="Write your answer here..."
//                     className="w-full h-48 p-5 bg-slate-50 text-slate-700 placeholder:text-slate-400 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all resize-none text-lg leading-relaxed shadow-inner"
//                   />
//                   <div className="flex justify-end">
//                     <button
//                       onClick={handleAction}
//                       disabled={
//                         isLearningMode && (!currentDraft.trim() || isLoading)
//                       }
//                       className="flex items-center gap-2 px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
//                     >
//                       {isLoading ? (
//                         <>
//                           <Loader2 className="w-5 h-5 animate-spin" />{" "}
//                           Evaluating...
//                         </>
//                       ) : (
//                         <>
//                           {isLearningMode
//                             ? "Submit Answer"
//                             : isLastQuestion
//                             ? "Finish Practice"
//                             : "Next Question"}
//                           {isLearningMode ? (
//                             <Send className="w-4 h-4 ml-1" />
//                           ) : (
//                             <ArrowRight className="w-4 h-4 ml-1" />
//                           )}
//                         </>
//                       )}
//                     </button>
//                   </div>
//                 </motion.div>
//               ) : (
//                 /* EVALUATION STATE (Only in Learning Mode) */
//                 <motion.div
//                   initial={{ opacity: 0, scale: 0.98 }}
//                   animate={{ opacity: 1, scale: 1 }}
//                   transition={{ duration: 0.4 }}
//                   className="space-y-8"
//                 >
//                   <div className="flex flex-col items-center justify-center py-6 bg-cyan-50/50 rounded-2xl border border-cyan-100">
//                     <span className="text-sm font-semibold text-cyan-600 uppercase tracking-widest mb-2">
//                       Score
//                     </span>
//                     <div className="text-5xl font-bold text-slate-900 flex items-baseline gap-1">
//                       {getEvaluation(currentQuestion.id).score}
//                       <span className="text-2xl text-slate-400 font-medium">
//                         / 4
//                       </span>
//                     </div>
//                   </div>

//                   <div className="space-y-4">
//                     <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
//                       Markscheme Breakdown
//                     </h3>
//                     <div className="space-y-3">
//                       {getEvaluation(currentQuestion.id).points.map(
//                         (point, idx) => (
//                           <motion.div
//                             initial={{ opacity: 0, x: -10 }}
//                             animate={{ opacity: 1, x: 0 }}
//                             transition={{ delay: idx * 0.1 + 0.2 }}
//                             key={idx}
//                             className={`p-4 rounded-xl flex gap-4 items-start border ${
//                               point.awarded
//                                 ? "bg-green-50/30 border-green-100"
//                                 : "bg-red-50/30 border-red-100"
//                             }`}
//                           >
//                             {point.awarded ? (
//                               <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0 mt-0.5" />
//                             ) : (
//                               <XCircle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
//                             )}
//                             <div>
//                               <p className="text-slate-800 font-medium mb-1">
//                                 {point.text}
//                               </p>
//                               <div className="flex items-center text-sm gap-2">
//                                 <ArrowRight className="w-3 h-3 text-slate-400" />
//                                 <span
//                                   className={
//                                     point.awarded
//                                       ? "text-green-700"
//                                       : "text-red-700"
//                                   }
//                                 >
//                                   {point.reason}
//                                 </span>
//                               </div>
//                             </div>
//                           </motion.div>
//                         )
//                       )}
//                     </div>
//                   </div>

//                   <div className="pt-6 border-t border-slate-100 flex justify-end">
//                     <button
//                       onClick={handleAction}
//                       className="flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium transition-all shadow-sm"
//                     >
//                       {isLastQuestion ? "Complete Set" : "Next Question"}
//                       <ArrowRight className="w-4 h-4" />
//                     </button>
//                   </div>
//                 </motion.div>
//               )}
//             </motion.div>
//           </AnimatePresence>
//         </div>
//       </div>
//     </div>
//   );
// }

// "use client";

// import { AnimatePresence, motion } from "framer-motion";
// import {
//   ArrowRight,
//   Award,
//   CheckCircle2,
//   ChevronLeft,
//   ChevronRight,
//   Clock,
//   FileText,
//   Loader2,
//   Play,
//   Send,
//   Settings2,
//   Target,
//   XCircle,
// } from "lucide-react";
// import React, { useEffect, useState } from "react";

// // --- MOCK DATA ---
// const SET_STATS = {
//   totalQuestions: 3,
//   totalMarks: 12,
//   estimatedMinutes: 10,
// };

// const questions = [
//   {
//     id: 1,
//     question: "Define a physical quantity.",
//     markscheme: [
//       "A measurable property",
//       "Expressed with numerical value",
//       "Includes a unit",
//       "Used to describe physical systems",
//     ],
//   },
//   {
//     id: 2,
//     question: "Explain the difference between scalar and vector quantities.",
//     markscheme: [
//       "Scalar has magnitude only",
//       "Vector has magnitude and direction",
//       "Example of scalar",
//       "Example of vector",
//     ],
//   },
//   {
//     id: 3,
//     question: "State Newton’s Second Law.",
//     markscheme: [
//       "Force equals mass times acceleration",
//       "F = ma",
//       "Acceleration proportional to force",
//       "Inversely proportional to mass",
//     ],
//   },
// ];

// // --- MOCK EVALUATION LOGIC ---
// const getEvaluation = (questionId: number) => {
//   if (questionId === 1) {
//     return {
//       score: 2,
//       points: [
//         {
//           awarded: true,
//           text: "A measurable property",
//           reason: "User mentioned measurement",
//         },
//         {
//           awarded: true,
//           text: "Expressed with numerical value",
//           reason: "Numerical aspect included",
//         },
//         { awarded: false, text: "Includes a unit", reason: "Units missing" },
//         {
//           awarded: false,
//           text: "Used to describe physical systems",
//           reason: "Context missing",
//         },
//       ],
//     };
//   }
//   if (questionId === 2) {
//     return {
//       score: 0,
//       points: [
//         {
//           awarded: false,
//           text: "Scalar has magnitude only",
//           reason: "Concept missing",
//         },
//         {
//           awarded: false,
//           text: "Vector has magnitude and direction",
//           reason: "Concept missing",
//         },
//         {
//           awarded: false,
//           text: "Example of scalar",
//           reason: "No example provided",
//         },
//         {
//           awarded: false,
//           text: "Example of vector",
//           reason: "No example provided",
//         },
//       ],
//     };
//   }
//   return {
//     score: 4,
//     points: [
//       {
//         awarded: true,
//         text: "Force equals mass times acceleration",
//         reason: "Definition accurate",
//       },
//       { awarded: true, text: "F = ma", reason: "Formula present" },
//       {
//         awarded: true,
//         text: "Acceleration proportional to force",
//         reason: "Relationship correct",
//       },
//       {
//         awarded: true,
//         text: "Inversely proportional to mass",
//         reason: "Relationship correct",
//       },
//     ],
//   };
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
// export default function TheoryPractice() {
//   // App State
//   const [hasStarted, setHasStarted] = useState(false);
//   const [isCompleted, setIsCompleted] = useState(false);

//   // Settings State
//   const [useTimer, setUseTimer] = useState(true);
//   const [isLearningMode, setIsLearningMode] = useState(true);
//   const [timeLeft, setTimeLeft] = useState(SET_STATS.estimatedMinutes * 60);

//   // Quiz State
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [direction, setDirection] = useState(1); // 1 for next, -1 for prev (used for animations)
//   const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
//   const [submittedQuestions, setSubmittedQuestions] = useState<
//     Record<number, boolean>
//   >({});
//   const [isLoading, setIsLoading] = useState(false);

//   const currentQuestion = questions[currentIndex];
//   const isLastQuestion = currentIndex === questions.length - 1;
//   const currentAnswer = userAnswers[currentQuestion.id] || "";
//   const isCurrentSubmitted = submittedQuestions[currentQuestion.id] || false;

//   // Timer Effect
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
//   const handleAnswerChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
//     setUserAnswers((prev) => ({
//       ...prev,
//       [currentQuestion.id]: e.target.value,
//     }));
//   };

//   const submitCurrentAnswer = () => {
//     if (!currentAnswer.trim() || isLoading) return;
//     setIsLoading(true);
//     // Fake network evaluation delay
//     setTimeout(() => {
//       setIsLoading(false);
//       setSubmittedQuestions((prev) => ({
//         ...prev,
//         [currentQuestion.id]: true,
//       }));
//     }, 500);
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
//             Physics Theory Set #1
//           </h1>
//           <p className="text-slate-500 mb-8">
//             Test your understanding of core physical properties and laws.
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
//             Start Practice
//             <Play className="w-4 h-4 fill-current" />
//           </button>
//         </motion.div>
//       </div>
//     );
//   }

//   // 2. COMPLETED SCREEN (All Results)
//   if (isCompleted) {
//     const totalAchieved = questions.reduce(
//       (sum, q) => sum + getEvaluation(q.id).score,
//       0
//     );

//     return (
//       <div className="min-h-screen bg-slate-50 text-slate-800 py-12 px-4">
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
//               const evalResult = getEvaluation(q.id);
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
//                       {q.question}
//                     </h3>
//                     <div className="px-3 py-1 bg-cyan-50 text-cyan-700 font-bold rounded-lg text-sm shrink-0">
//                       {evalResult.score} / 4
//                     </div>
//                   </div>

//                   <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 text-slate-600 italic">
//                     "{userAnswers[q.id] || "No answer provided."}"
//                   </div>

//                   <div className="space-y-3">
//                     {evalResult.points.map((point, pIdx) => (
//                       <div
//                         key={pIdx}
//                         className="flex gap-4 items-start text-sm"
//                       >
//                         {point.awarded ? (
//                           <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
//                         ) : (
//                           <XCircle className="w-5 h-5 text-red-400 shrink-0" />
//                         )}
//                         <div>
//                           <p
//                             className={`font-medium ${
//                               point.awarded
//                                 ? "text-slate-800"
//                                 : "text-slate-500"
//                             }`}
//                           >
//                             {point.text}
//                           </p>
//                           <p
//                             className={
//                               point.awarded ? "text-green-600" : "text-red-500"
//                             }
//                           >
//                             ↳ {point.reason}
//                           </p>
//                         </div>
//                       </div>
//                     ))}
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
//     <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex justify-center py-12 px-4 overflow-x-hidden">
//       <div className="w-full max-w-2xl">
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
//           <div className="text-sm font-medium text-cyan-600 bg-cyan-50 px-3 py-1 rounded-full border border-cyan-100">
//             Question {currentIndex + 1} / {questions.length}
//           </div>
//         </div>

//         {/* MAIN CARD */}
//         <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden border border-slate-100 flex flex-col">
//           <div className="p-8 md:p-10 flex-grow">
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
//                 <h1 className="text-2xl md:text-3xl font-medium leading-snug mb-8 text-center text-slate-900">
//                   {currentQuestion.question}
//                 </h1>

//                 {!isLearningMode || !isCurrentSubmitted ? (
//                   /* INPUT STATE */
//                   <div className="space-y-6">
//                     <textarea
//                       value={currentAnswer}
//                       onChange={handleAnswerChange}
//                       placeholder="Write your answer here..."
//                       className="w-full h-48 p-5 bg-slate-50 text-slate-700 placeholder:text-slate-400 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all resize-none text-lg leading-relaxed shadow-inner"
//                     />
//                   </div>
//                 ) : (
//                   /* EVALUATION STATE (Only in Learning Mode) */
//                   <div className="space-y-8">
//                     <div className="flex flex-col items-center justify-center py-6 bg-cyan-50/50 rounded-2xl border border-cyan-100">
//                       <span className="text-sm font-semibold text-cyan-600 uppercase tracking-widest mb-2">
//                         Score
//                       </span>
//                       <div className="text-5xl font-bold text-slate-900 flex items-baseline gap-1">
//                         {getEvaluation(currentQuestion.id).score}
//                         <span className="text-2xl text-slate-400 font-medium">
//                           / 4
//                         </span>
//                       </div>
//                     </div>

//                     <div className="space-y-4">
//                       <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
//                         Markscheme Breakdown
//                       </h3>
//                       <div className="space-y-3">
//                         {getEvaluation(currentQuestion.id).points.map(
//                           (point, idx) => (
//                             <motion.div
//                               initial={{ opacity: 0, y: 10 }}
//                               animate={{ opacity: 1, y: 0 }}
//                               transition={{ delay: idx * 0.1 + 0.1 }}
//                               key={idx}
//                               className={`p-4 rounded-xl flex gap-4 items-start border ${
//                                 point.awarded
//                                   ? "bg-green-50/30 border-green-100"
//                                   : "bg-red-50/30 border-red-100"
//                               }`}
//                             >
//                               {point.awarded ? (
//                                 <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0 mt-0.5" />
//                               ) : (
//                                 <XCircle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
//                               )}
//                               <div>
//                                 <p className="text-slate-800 font-medium mb-1">
//                                   {point.text}
//                                 </p>
//                                 <div className="flex items-center text-sm gap-2">
//                                   <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
//                                   <span
//                                     className={
//                                       point.awarded
//                                         ? "text-green-700"
//                                         : "text-red-700"
//                                     }
//                                   >
//                                     {point.reason}
//                                   </span>
//                                 </div>
//                               </div>
//                             </motion.div>
//                           )
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </motion.div>
//             </AnimatePresence>
//           </div>

//           {/* PERSISTENT BOTTOM NAVIGATION */}
//           <div className="px-8 py-5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
//             <button
//               onClick={goPrev}
//               disabled={currentIndex === 0}
//               className="flex items-center gap-2 px-3 py-2 text-slate-500 hover:text-slate-900 disabled:opacity-30 disabled:hover:text-slate-500 transition-colors font-medium"
//             >
//               <ChevronLeft className="w-5 h-5" />
//               <span className="hidden sm:inline">Previous</span>
//             </button>

//             <div className="flex gap-3">
//               {isLearningMode && !isCurrentSubmitted && (
//                 <button
//                   onClick={submitCurrentAnswer}
//                   disabled={!currentAnswer.trim() || isLoading}
//                   className="flex items-center gap-2 px-6 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
//                 >
//                   {isLoading ? (
//                     <Loader2 className="w-4 h-4 animate-spin" />
//                   ) : (
//                     "Submit"
//                   )}
//                   {!isLoading && <Send className="w-4 h-4" />}
//                 </button>
//               )}

//               {isLastQuestion && (
//                 <button
//                   onClick={finishPractice}
//                   className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium transition-all shadow-sm"
//                 >
//                   Finish Set
//                   <CheckCircle2 className="w-4 h-4" />
//                 </button>
//               )}
//             </div>

//             <button
//               onClick={goNext}
//               disabled={isLastQuestion}
//               className="flex items-center gap-2 px-3 py-2 text-slate-500 hover:text-slate-900 disabled:opacity-30 disabled:hover:text-slate-500 transition-colors font-medium"
//             >
//               <span className="hidden sm:inline">Next</span>
//               <ChevronRight className="w-5 h-5" />
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// "use client";

// import { AnimatePresence, motion } from "framer-motion";
// import {
//   ArrowRight,
//   Award,
//   CheckCircle2,
//   ChevronLeft,
//   ChevronRight,
//   Clock,
//   FileText,
//   Loader2,
//   Play,
//   Send,
//   Settings2,
//   Target,
//   XCircle,
// } from "lucide-react";
// import React, { useEffect, useState } from "react";

// // --- MOCK DATA ---
// const SET_STATS = {
//   totalQuestions: 3,
//   totalMarks: 12,
//   estimatedMinutes: 10,
// };

// const questions = [
//   {
//     id: 1,
//     question: "Define a physical quantity.",
//     markscheme: [
//       "A measurable property",
//       "Expressed with numerical value",
//       "Includes a unit",
//       "Used to describe physical systems",
//     ],
//   },
//   {
//     id: 2,
//     question: "Explain the difference between scalar and vector quantities.",
//     markscheme: [
//       "Scalar has magnitude only",
//       "Vector has magnitude and direction",
//       "Example of scalar",
//       "Example of vector",
//     ],
//   },
//   {
//     id: 3,
//     question: "State Newton’s Second Law.",
//     markscheme: [
//       "Force equals mass times acceleration",
//       "F = ma",
//       "Acceleration proportional to force",
//       "Inversely proportional to mass",
//     ],
//   },
// ];

// // --- MOCK EVALUATION LOGIC ---
// const getEvaluation = (questionId: number) => {
//   if (questionId === 1) {
//     return {
//       score: 2,
//       points: [
//         {
//           awarded: true,
//           text: "A measurable property",
//           reason: "User mentioned measurement",
//         },
//         {
//           awarded: true,
//           text: "Expressed with numerical value",
//           reason: "Numerical aspect included",
//         },
//         { awarded: false, text: "Includes a unit", reason: "Units missing" },
//         {
//           awarded: false,
//           text: "Used to describe physical systems",
//           reason: "Context missing",
//         },
//       ],
//     };
//   }
//   if (questionId === 2) {
//     return {
//       score: 0,
//       points: [
//         {
//           awarded: false,
//           text: "Scalar has magnitude only",
//           reason: "Concept missing",
//         },
//         {
//           awarded: false,
//           text: "Vector has magnitude and direction",
//           reason: "Concept missing",
//         },
//         {
//           awarded: false,
//           text: "Example of scalar",
//           reason: "No example provided",
//         },
//         {
//           awarded: false,
//           text: "Example of vector",
//           reason: "No example provided",
//         },
//       ],
//     };
//   }
//   return {
//     score: 4,
//     points: [
//       {
//         awarded: true,
//         text: "Force equals mass times acceleration",
//         reason: "Definition accurate",
//       },
//       { awarded: true, text: "F = ma", reason: "Formula present" },
//       {
//         awarded: true,
//         text: "Acceleration proportional to force",
//         reason: "Relationship correct",
//       },
//       {
//         awarded: true,
//         text: "Inversely proportional to mass",
//         reason: "Relationship correct",
//       },
//     ],
//   };
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
// export default function TheoryPractice() {
//   // App State
//   const [hasStarted, setHasStarted] = useState(false);
//   const [isCompleted, setIsCompleted] = useState(false);

//   // Settings State
//   const [useTimer, setUseTimer] = useState(true);
//   const [isLearningMode, setIsLearningMode] = useState(true);
//   const [timeLeft, setTimeLeft] = useState(SET_STATS.estimatedMinutes * 60);

//   // Quiz State
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [direction, setDirection] = useState(1);
//   const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
//   const [submittedQuestions, setSubmittedQuestions] = useState<
//     Record<number, boolean>
//   >({});
//   const [isLoading, setIsLoading] = useState(false);

//   const currentQuestion = questions[currentIndex];
//   const isLastQuestion = currentIndex === questions.length - 1;
//   const currentAnswer = userAnswers[currentQuestion.id] || "";
//   const isCurrentSubmitted = submittedQuestions[currentQuestion.id] || false;

//   // Timer Effect
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
//   const handleAnswerChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
//     setUserAnswers((prev) => ({
//       ...prev,
//       [currentQuestion.id]: e.target.value,
//     }));
//   };

//   const submitCurrentAnswer = () => {
//     if (!currentAnswer.trim() || isLoading) return;
//     setIsLoading(true);
//     setTimeout(() => {
//       setIsLoading(false);
//       setSubmittedQuestions((prev) => ({
//         ...prev,
//         [currentQuestion.id]: true,
//       }));
//     }, 500);
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
//             Physics Theory Set #1
//           </h1>
//           <p className="text-slate-500 mb-8">
//             Test your understanding of core physical properties and laws.
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
//             Start Practice
//             <Play className="w-4 h-4 fill-current" />
//           </button>
//         </motion.div>
//       </div>
//     );
//   }

//   // 2. COMPLETED SCREEN (All Results)
//   if (isCompleted) {
//     const totalAchieved = questions.reduce(
//       (sum, q) => sum + getEvaluation(q.id).score,
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
//               const evalResult = getEvaluation(q.id);
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
//                       {q.question}
//                     </h3>
//                     <div className="px-3 py-1 bg-cyan-50 text-cyan-700 font-bold rounded-lg text-sm shrink-0">
//                       {evalResult.score} / 4
//                     </div>
//                   </div>

//                   <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 text-slate-600 italic">
//                     "{userAnswers[q.id] || "No answer provided."}"
//                   </div>

//                   <div className="space-y-3">
//                     {evalResult.points.map((point, pIdx) => (
//                       <div
//                         key={pIdx}
//                         className="flex gap-4 items-start text-sm"
//                       >
//                         {point.awarded ? (
//                           <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
//                         ) : (
//                           <XCircle className="w-5 h-5 text-red-400 shrink-0" />
//                         )}
//                         <div>
//                           <p
//                             className={`font-medium ${
//                               point.awarded
//                                 ? "text-slate-800"
//                                 : "text-slate-500"
//                             }`}
//                           >
//                             {point.text}
//                           </p>
//                           <p
//                             className={
//                               point.awarded ? "text-green-600" : "text-red-500"
//                             }
//                           >
//                             ↳ {point.reason}
//                           </p>
//                         </div>
//                       </div>
//                     ))}
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
//         <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden border border-slate-100 flex flex-col">
//           <div className="p-8 md:p-10 flex-grow">
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
//                 <h1 className="text-2xl md:text-3xl font-medium leading-snug mb-8 text-center text-slate-900">
//                   {currentQuestion.question}
//                 </h1>

//                 {!isLearningMode || !isCurrentSubmitted ? (
//                   /* INPUT STATE */
//                   <div className="space-y-6">
//                     <textarea
//                       value={currentAnswer}
//                       onChange={handleAnswerChange}
//                       placeholder="Write your answer here..."
//                       className="w-full h-48 p-5 bg-slate-50 text-slate-700 placeholder:text-slate-400 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all resize-none text-lg leading-relaxed shadow-inner"
//                     />
//                   </div>
//                 ) : (
//                   /* EVALUATION STATE (Only in Learning Mode) */
//                   <div className="space-y-8">
//                     <div className="flex flex-col items-center justify-center py-6 bg-cyan-50/50 rounded-2xl border border-cyan-100">
//                       <span className="text-sm font-semibold text-cyan-600 uppercase tracking-widest mb-2">
//                         Score
//                       </span>
//                       <div className="text-5xl font-bold text-slate-900 flex items-baseline gap-1">
//                         {getEvaluation(currentQuestion.id).score}
//                         <span className="text-2xl text-slate-400 font-medium">
//                           / 4
//                         </span>
//                       </div>
//                     </div>

//                     <div className="space-y-4">
//                       <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
//                         Markscheme Breakdown
//                       </h3>
//                       <div className="space-y-3">
//                         {getEvaluation(currentQuestion.id).points.map(
//                           (point, idx) => (
//                             <motion.div
//                               initial={{ opacity: 0, y: 10 }}
//                               animate={{ opacity: 1, y: 0 }}
//                               transition={{ delay: idx * 0.1 + 0.1 }}
//                               key={idx}
//                               className={`p-4 rounded-xl flex gap-4 items-start border ${
//                                 point.awarded
//                                   ? "bg-green-50/30 border-green-100"
//                                   : "bg-red-50/30 border-red-100"
//                               }`}
//                             >
//                               {point.awarded ? (
//                                 <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0 mt-0.5" />
//                               ) : (
//                                 <XCircle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
//                               )}
//                               <div>
//                                 <p className="text-slate-800 font-medium mb-1">
//                                   {point.text}
//                                 </p>
//                                 <div className="flex items-center text-sm gap-2">
//                                   <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
//                                   <span
//                                     className={
//                                       point.awarded
//                                         ? "text-green-700"
//                                         : "text-red-700"
//                                     }
//                                   >
//                                     {point.reason}
//                                   </span>
//                                 </div>
//                               </div>
//                             </motion.div>
//                           )
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </motion.div>
//             </AnimatePresence>
//           </div>
//         </div>
//       </div>

//       {/* FLOATING CUTE NAVBAR */}
//       <motion.div
//         initial={{ y: 100, opacity: 0, x: "-50%" }}
//         animate={{ y: 0, opacity: 1, x: "-50%" }}
//         className="fixed bottom-6 left-1/2 z-50 flex items-center gap-2 p-2 bg-white/80 backdrop-blur-md border border-slate-200/50 shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-full"
//       >
//         <button
//           onClick={goPrev}
//           disabled={currentIndex === 0}
//           className="w-12 h-12 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
//           aria-label="Previous Question"
//         >
//           <ChevronLeft className="w-6 h-6" />
//         </button>

//         <div className="flex-shrink-0 flex items-center justify-center min-w-[140px]">
//           {isLearningMode && !isCurrentSubmitted ? (
//             <button
//               onClick={submitCurrentAnswer}
//               disabled={!currentAnswer.trim() || isLoading}
//               className="flex items-center justify-center gap-2 w-full py-3 px-6 bg-cyan-600 hover:bg-cyan-700 text-white rounded-full font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
//             >
//               {isLoading ? (
//                 <Loader2 className="w-5 h-5 animate-spin" />
//               ) : (
//                 "Submit"
//               )}
//               {!isLoading && <Send className="w-4 h-4 ml-1" />}
//             </button>
//           ) : isLastQuestion ? (
//             <button
//               onClick={finishPractice}
//               className="flex items-center justify-center gap-2 w-full py-3 px-6 bg-slate-900 hover:bg-slate-800 text-white rounded-full font-medium transition-all shadow-sm"
//             >
//               Finish Set
//               <CheckCircle2 className="w-4 h-4 ml-1" />
//             </button>
//           ) : (
//             <div className="px-4 py-2 font-medium text-slate-400 text-sm tracking-wide">
//               {currentIndex + 1} / {questions.length}
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

// import { AnimatePresence, motion } from "framer-motion";
// import katex from "katex";
// import "katex/dist/katex.min.css";
// import {
//   ArrowRight,
//   Award,
//   CheckCircle2,
//   ChevronLeft,
//   ChevronRight,
//   Clock,
//   FileText,
//   Loader2,
//   Play,
//   Send,
//   Settings2,
//   Sigma,
//   Target,
//   XCircle,
// } from "lucide-react";
// import React, {
//   forwardRef,
//   useEffect,
//   useImperativeHandle,
//   useRef,
//   useState,
// } from "react";

// // --- MOCK DATA ---
// const SET_STATS = {
//   totalQuestions: 3,
//   totalMarks: 12,
//   estimatedMinutes: 10,
// };

// const questions = [
//   {
//     id: 1,
//     question: "Define a physical quantity.",
//     markscheme: [
//       "A measurable property",
//       "Expressed with numerical value",
//       "Includes a unit",
//       "Used to describe physical systems",
//     ],
//   },
//   {
//     id: 2,
//     question: "Explain the difference between scalar and vector quantities.",
//     markscheme: [
//       "Scalar has magnitude only",
//       "Vector has magnitude and direction",
//       "Example of scalar",
//       "Example of vector",
//     ],
//   },
//   {
//     id: 3,
//     question: "State Newton’s Second Law.",
//     markscheme: [
//       "Force equals mass times acceleration",
//       "F = ma",
//       "Acceleration proportional to force",
//       "Inversely proportional to mass",
//     ],
//   },
// ];

// // --- MOCK EVALUATION LOGIC ---
// const getEvaluation = (questionId: number) => {
//   if (questionId === 1) {
//     return {
//       score: 2,
//       points: [
//         {
//           awarded: true,
//           text: "A measurable property",
//           reason: "User mentioned measurement",
//         },
//         {
//           awarded: true,
//           text: "Expressed with numerical value",
//           reason: "Numerical aspect included",
//         },
//         { awarded: false, text: "Includes a unit", reason: "Units missing" },
//         {
//           awarded: false,
//           text: "Used to describe physical systems",
//           reason: "Context missing",
//         },
//       ],
//     };
//   }
//   if (questionId === 2) {
//     return {
//       score: 0,
//       points: [
//         {
//           awarded: false,
//           text: "Scalar has magnitude only",
//           reason: "Concept missing",
//         },
//         {
//           awarded: false,
//           text: "Vector has magnitude and direction",
//           reason: "Concept missing",
//         },
//         {
//           awarded: false,
//           text: "Example of scalar",
//           reason: "No example provided",
//         },
//         {
//           awarded: false,
//           text: "Example of vector",
//           reason: "No example provided",
//         },
//       ],
//     };
//   }
//   return {
//     score: 4,
//     points: [
//       {
//         awarded: true,
//         text: "Force equals mass times acceleration",
//         reason: "Definition accurate",
//       },
//       { awarded: true, text: "F = ma", reason: "Formula present" },
//       {
//         awarded: true,
//         text: "Acceleration proportional to force",
//         reason: "Relationship correct",
//       },
//       {
//         awarded: true,
//         text: "Inversely proportional to mass",
//         reason: "Relationship correct",
//       },
//     ],
//   };
// };

// // --- UTILS ---
// const safeRenderKatex = (latex: string) => {
//   try {
//     return katex.renderToString(latex || " ", {
//       throwOnError: false,
//       displayMode: false,
//     });
//   } catch (e) {
//     return `<span>${latex}</span>`;
//   }
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

// // --- NOTION-LIKE RICH TEXT EDITOR ---
// interface EditorRef {
//   insertMath: () => void;
// }

// const RichEditor = forwardRef<
//   EditorRef,
//   {
//     initialHtml: string;
//     onChange: (html: string, text: string) => void;
//     readOnly?: boolean;
//   }
// >(({ initialHtml, onChange, readOnly }, ref) => {
//   const editorRef = useRef<HTMLDivElement>(null);
//   const [popover, setPopover] = useState<{
//     node: HTMLElement;
//     x: number;
//     y: number;
//     latex: string;
//   } | null>(null);

//   useImperativeHandle(ref, () => ({
//     insertMath: () => {
//       const editorNode = editorRef.current;
//       if (!editorNode) return;

//       const sel = window.getSelection();
//       if (
//         !sel ||
//         sel.rangeCount === 0 ||
//         !editorNode.contains(sel.anchorNode)
//       ) {
//         editorNode.focus();
//         const range = document.createRange();
//         range.selectNodeContents(editorNode);
//         range.collapse(false);
//         sel?.removeAllRanges();
//         sel?.addRange(range);
//       }

//       const range = window.getSelection()!.getRangeAt(0);

//       // Create the Notion-like math span
//       const span = document.createElement("span");
//       span.contentEditable = "false";
//       span.className =
//         "inline-math cursor-pointer bg-slate-100/80 hover:bg-slate-200/80 px-1.5 py-0.5 rounded text-cyan-800 mx-1 border border-slate-200 transition-colors shadow-sm select-none";
//       span.dataset.latex = "";
//       span.innerHTML = "<i>ƒ(x)</i>";

//       range.insertNode(span);

//       // Insert zero-width space so the cursor can move past the inline block
//       const zws = document.createTextNode("\u200B");
//       range.collapse(false);
//       range.insertNode(zws);
//       range.setStartAfter(zws);
//       range.setEndAfter(zws);
//       window.getSelection()!.removeAllRanges();
//       window.getSelection()!.addRange(range);

//       // Open popover immediately
//       const rect = span.getBoundingClientRect();
//       setPopover({
//         node: span,
//         x: rect.left,
//         y: rect.bottom + 8,
//         latex: "",
//       });

//       triggerChange();
//     },
//   }));

//   const triggerChange = () => {
//     if (editorRef.current) {
//       onChange(editorRef.current.innerHTML, editorRef.current.innerText);
//     }
//   };

//   const handleEditorClick = (e: React.MouseEvent) => {
//     if (readOnly) return;
//     const target = e.target as HTMLElement;
//     const mathNode = target.closest(".inline-math") as HTMLElement;

//     if (mathNode) {
//       const rect = mathNode.getBoundingClientRect();
//       setPopover({
//         node: mathNode,
//         x: rect.left,
//         y: rect.bottom + 8,
//         latex: mathNode.dataset.latex || "",
//       });
//     }
//   };

//   const updateLatex = (val: string) => {
//     if (!popover) return;
//     setPopover({ ...popover, latex: val });
//     popover.node.dataset.latex = val;
//     popover.node.innerHTML = val ? safeRenderKatex(val) : "<i>ƒ(x)</i>";
//     triggerChange();
//   };

//   return (
//     <>
//       <style>{`
//         .custom-editor:empty:before {
//           content: attr(data-placeholder);
//           color: #94a3b8;
//           pointer-events: none;
//         }
//       `}</style>

//       <div
//         ref={editorRef}
//         contentEditable={!readOnly}
//         suppressContentEditableWarning
//         onInput={triggerChange}
//         onClick={handleEditorClick}
//         data-placeholder="Write your answer here..."
//         className={`custom-editor w-full min-h-[12rem] p-5 bg-slate-50 text-slate-700 border border-slate-200 rounded-2xl transition-all text-lg leading-relaxed shadow-inner focus:outline-none ${
//           !readOnly
//             ? "focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
//             : "opacity-80"
//         }`}
//         dangerouslySetInnerHTML={{ __html: initialHtml }}
//       />

//       {/* NOTION MATH POPOVER */}
//       {popover && (
//         <>
//           <div
//             className="fixed inset-0 z-40"
//             onClick={() => setPopover(null)}
//           />
//           <motion.div
//             initial={{ opacity: 0, y: -5 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="fixed z-50 bg-white border border-slate-200 shadow-xl rounded-xl p-3 w-80 flex flex-col gap-3"
//             style={{
//               top: popover.y,
//               left: Math.min(popover.x, window.innerWidth - 340),
//             }}
//           >
//             <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
//               Inline Equation
//             </div>
//             <input
//               autoFocus
//               value={popover.latex}
//               onChange={(e) => updateLatex(e.target.value)}
//               onKeyDown={(e) => {
//                 if (e.key === "Enter") setPopover(null);
//               }}
//               placeholder="e.g. E = mc^2"
//               className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
//             />
//             <div className="min-h-[2.5rem] flex items-center bg-slate-50/50 rounded-md border border-slate-100 p-2 overflow-x-auto">
//               {popover.latex ? (
//                 <span
//                   dangerouslySetInnerHTML={{
//                     __html: safeRenderKatex(popover.latex),
//                   }}
//                 />
//               ) : (
//                 <span className="text-slate-400 text-sm italic">
//                   Preview...
//                 </span>
//               )}
//             </div>
//           </motion.div>
//         </>
//       )}
//     </>
//   );
// });
// RichEditor.displayName = "RichEditor";

// // --- MAIN COMPONENT ---
// export default function TheoryPractice() {
//   const [hasStarted, setHasStarted] = useState(false);
//   const [isCompleted, setIsCompleted] = useState(false);

//   const [useTimer, setUseTimer] = useState(true);
//   const [isLearningMode, setIsLearningMode] = useState(true);
//   const [timeLeft, setTimeLeft] = useState(SET_STATS.estimatedMinutes * 60);

//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [direction, setDirection] = useState(1);
//   const [userAnswersHtml, setUserAnswersHtml] = useState<
//     Record<number, string>
//   >({});
//   const [userAnswersText, setUserAnswersText] = useState<
//     Record<number, string>
//   >({});
//   const [submittedQuestions, setSubmittedQuestions] = useState<
//     Record<number, boolean>
//   >({});
//   const [isLoading, setIsLoading] = useState(false);

//   const editorRef = useRef<EditorRef>(null);

//   const currentQuestion = questions[currentIndex];
//   const isLastQuestion = currentIndex === questions.length - 1;
//   const currentAnswerHtml = userAnswersHtml[currentQuestion.id] || "";
//   const currentAnswerText = userAnswersText[currentQuestion.id] || "";
//   const isCurrentSubmitted = submittedQuestions[currentQuestion.id] || false;

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

//   const handleEditorChange = (html: string, text: string) => {
//     setUserAnswersHtml((prev) => ({ ...prev, [currentQuestion.id]: html }));
//     setUserAnswersText((prev) => ({ ...prev, [currentQuestion.id]: text }));
//   };

//   const submitCurrentAnswer = () => {
//     if (!currentAnswerText.trim() && !currentAnswerHtml.includes("inline-math"))
//       return;
//     if (isLoading) return;
//     setIsLoading(true);
//     setTimeout(() => {
//       setIsLoading(false);
//       setSubmittedQuestions((prev) => ({
//         ...prev,
//         [currentQuestion.id]: true,
//       }));
//     }, 500);
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
//     setIsCompleted(true);
//   };

//   // 1. INTRO SCREEN
//   if (!hasStarted) {
//     return (
//       <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
//         {/* Intro modal identical to previous step */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="max-w-md w-full bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100"
//         >
//           <div className="w-12 h-12 bg-cyan-50 text-cyan-600 rounded-2xl flex items-center justify-center mb-6">
//             <Target className="w-6 h-6" />
//           </div>
//           <h1 className="text-2xl font-bold text-slate-900 mb-2">
//             Physics Theory Set #1
//           </h1>
//           <p className="text-slate-500 mb-8">
//             Test your understanding of core physical properties and laws.
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
//       (sum, q) => sum + getEvaluation(q.id).score,
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
//               const evalResult = getEvaluation(q.id);
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
//                       {q.question}
//                     </h3>
//                     <div className="px-3 py-1 bg-cyan-50 text-cyan-700 font-bold rounded-lg text-sm shrink-0">
//                       {evalResult.score} / 4
//                     </div>
//                   </div>

//                   {/* Safely render the HTML containing our styled Katex nodes */}
//                   <div
//                     className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 text-slate-600"
//                     dangerouslySetInnerHTML={{
//                       __html:
//                         userAnswersHtml[q.id] ||
//                         "<span class='italic opacity-60'>No answer provided.</span>",
//                     }}
//                   />

//                   <div className="space-y-3">
//                     {evalResult.points.map((point, pIdx) => (
//                       <div
//                         key={pIdx}
//                         className="flex gap-4 items-start text-sm"
//                       >
//                         {point.awarded ? (
//                           <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
//                         ) : (
//                           <XCircle className="w-5 h-5 text-red-400 shrink-0" />
//                         )}
//                         <div>
//                           <p
//                             className={`font-medium ${
//                               point.awarded
//                                 ? "text-slate-800"
//                                 : "text-slate-500"
//                             }`}
//                           >
//                             {point.text}
//                           </p>
//                           <p
//                             className={
//                               point.awarded ? "text-green-600" : "text-red-500"
//                             }
//                           >
//                             ↳ {point.reason}
//                           </p>
//                         </div>
//                       </div>
//                     ))}
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
//         <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden border border-slate-100 flex flex-col">
//           <div className="p-8 md:p-10 flex-grow">
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
//                 <h1 className="text-2xl md:text-3xl font-medium leading-snug mb-8 text-center text-slate-900">
//                   {currentQuestion.question}
//                 </h1>

//                 {!isLearningMode || !isCurrentSubmitted ? (
//                   /* INPUT STATE WITH NOTION RICH TEXT EDITOR */
//                   <div className="space-y-6">
//                     <RichEditor
//                       key={`editor-${currentQuestion.id}`} // Force re-mount on question change to reset internal cursor states cleanly
//                       ref={editorRef}
//                       initialHtml={currentAnswerHtml}
//                       onChange={handleEditorChange}
//                     />
//                   </div>
//                 ) : (
//                   /* EVALUATION STATE */
//                   <div className="space-y-8">
//                     <div className="flex flex-col items-center justify-center py-6 bg-cyan-50/50 rounded-2xl border border-cyan-100">
//                       <span className="text-sm font-semibold text-cyan-600 uppercase tracking-widest mb-2">
//                         Score
//                       </span>
//                       <div className="text-5xl font-bold text-slate-900 flex items-baseline gap-1">
//                         {getEvaluation(currentQuestion.id).score}
//                         <span className="text-2xl text-slate-400 font-medium">
//                           / 4
//                         </span>
//                       </div>
//                     </div>

//                     <div className="space-y-4">
//                       <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
//                         Markscheme Breakdown
//                       </h3>
//                       <div className="space-y-3">
//                         {getEvaluation(currentQuestion.id).points.map(
//                           (point, idx) => (
//                             <motion.div
//                               initial={{ opacity: 0, y: 10 }}
//                               animate={{ opacity: 1, y: 0 }}
//                               transition={{ delay: idx * 0.1 + 0.1 }}
//                               key={idx}
//                               className={`p-4 rounded-xl flex gap-4 items-start border ${
//                                 point.awarded
//                                   ? "bg-green-50/30 border-green-100"
//                                   : "bg-red-50/30 border-red-100"
//                               }`}
//                             >
//                               {point.awarded ? (
//                                 <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0 mt-0.5" />
//                               ) : (
//                                 <XCircle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
//                               )}
//                               <div>
//                                 <p className="text-slate-800 font-medium mb-1">
//                                   {point.text}
//                                 </p>
//                                 <div className="flex items-center text-sm gap-2">
//                                   <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
//                                   <span
//                                     className={
//                                       point.awarded
//                                         ? "text-green-700"
//                                         : "text-red-700"
//                                     }
//                                   >
//                                     {point.reason}
//                                   </span>
//                                 </div>
//                               </div>
//                             </motion.div>
//                           )
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </motion.div>
//             </AnimatePresence>
//           </div>
//         </div>
//       </div>

//       {/* FLOATING NAVBAR W/ MATH BUTTON */}
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

//         <div className="flex-shrink-0 flex items-center justify-center gap-2 min-w-[140px]">
//           {(!isLearningMode || !isCurrentSubmitted) && (
//             <button
//               onClick={() => editorRef.current?.insertMath()}
//               className="w-12 h-12 flex items-center justify-center bg-slate-50 border border-slate-200 hover:border-cyan-300 hover:bg-cyan-50 text-slate-600 hover:text-cyan-700 rounded-full transition-all shadow-sm group"
//               title="Add Inline Math"
//             >
//               <Sigma className="w-5 h-5 group-hover:scale-110 transition-transform" />
//             </button>
//           )}

//           {isLearningMode && !isCurrentSubmitted ? (
//             <button
//               onClick={submitCurrentAnswer}
//               disabled={
//                 (!currentAnswerText.trim() &&
//                   !currentAnswerHtml.includes("inline-math")) ||
//                 isLoading
//               }
//               className="flex items-center justify-center gap-2 w-full py-3 px-6 bg-cyan-600 hover:bg-cyan-700 text-white rounded-full font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
//             >
//               {isLoading ? (
//                 <Loader2 className="w-5 h-5 animate-spin" />
//               ) : (
//                 "Submit"
//               )}
//               {!isLoading && <Send className="w-4 h-4 ml-1" />}
//             </button>
//           ) : isLastQuestion ? (
//             <button
//               onClick={finishPractice}
//               className="flex items-center justify-center gap-2 w-full py-3 px-6 bg-slate-900 hover:bg-slate-800 text-white rounded-full font-medium transition-all shadow-sm"
//             >
//               Finish Set
//               <CheckCircle2 className="w-4 h-4 ml-1" />
//             </button>
//           ) : (
//             <div className="px-4 py-2 font-medium text-slate-400 text-sm tracking-wide">
//               {currentIndex + 1} / {questions.length}
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

// import { AnimatePresence, motion } from "framer-motion";
// import katex from "katex";
// import "katex/dist/katex.min.css";
// import {
//   ArrowRight,
//   Award,
//   CheckCircle2,
//   ChevronLeft,
//   ChevronRight,
//   Clock,
//   FileText,
//   Loader2,
//   Play,
//   Send,
//   Settings2,
//   Sigma,
//   Target,
//   XCircle,
// } from "lucide-react";
// import React, {
//   forwardRef,
//   useEffect,
//   useImperativeHandle,
//   useRef,
//   useState,
// } from "react";

// // --- MOCK DATA ---
// const SET_STATS = {
//   totalQuestions: 3,
//   totalMarks: 12,
//   estimatedMinutes: 10,
// };

// const questions = [
//   {
//     id: 1,
//     question: "Define a physical quantity.",
//     markscheme: [
//       "A measurable property",
//       "Expressed with numerical value",
//       "Includes a unit",
//       "Used to describe physical systems",
//     ],
//   },
//   {
//     id: 2,
//     question: "Explain the difference between scalar and vector quantities.",
//     markscheme: [
//       "Scalar has magnitude only",
//       "Vector has magnitude and direction",
//       "Example of scalar",
//       "Example of vector",
//     ],
//   },
//   {
//     id: 3,
//     question: "State Newton’s Second Law.",
//     markscheme: [
//       "Force equals mass times acceleration",
//       "F = ma",
//       "Acceleration proportional to force",
//       "Inversely proportional to mass",
//     ],
//   },
// ];

// // --- MOCK EVALUATION LOGIC ---
// const getEvaluation = (questionId: number) => {
//   if (questionId === 1) {
//     return {
//       score: 2,
//       points: [
//         {
//           awarded: true,
//           text: "A measurable property",
//           reason: "User mentioned measurement",
//         },
//         {
//           awarded: true,
//           text: "Expressed with numerical value",
//           reason: "Numerical aspect included",
//         },
//         { awarded: false, text: "Includes a unit", reason: "Units missing" },
//         {
//           awarded: false,
//           text: "Used to describe physical systems",
//           reason: "Context missing",
//         },
//       ],
//     };
//   }
//   if (questionId === 2) {
//     return {
//       score: 0,
//       points: [
//         {
//           awarded: false,
//           text: "Scalar has magnitude only",
//           reason: "Concept missing",
//         },
//         {
//           awarded: false,
//           text: "Vector has magnitude and direction",
//           reason: "Concept missing",
//         },
//         {
//           awarded: false,
//           text: "Example of scalar",
//           reason: "No example provided",
//         },
//         {
//           awarded: false,
//           text: "Example of vector",
//           reason: "No example provided",
//         },
//       ],
//     };
//   }
//   return {
//     score: 4,
//     points: [
//       {
//         awarded: true,
//         text: "Force equals mass times acceleration",
//         reason: "Definition accurate",
//       },
//       { awarded: true, text: "F = ma", reason: "Formula present" },
//       {
//         awarded: true,
//         text: "Acceleration proportional to force",
//         reason: "Relationship correct",
//       },
//       {
//         awarded: true,
//         text: "Inversely proportional to mass",
//         reason: "Relationship correct",
//       },
//     ],
//   };
// };

// // --- UTILS ---
// const safeRenderKatex = (latex: string) => {
//   try {
//     return katex.renderToString(latex || " ", {
//       throwOnError: false,
//       displayMode: false,
//     });
//   } catch (e) {
//     return `<span>${latex}</span>`;
//   }
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

// // --- NOTION-LIKE RICH TEXT EDITOR ---
// interface EditorRef {
//   insertMath: () => void;
// }

// const RichEditor = forwardRef<
//   EditorRef,
//   {
//     initialHtml: string;
//     onChange: (html: string, text: string) => void;
//     readOnly?: boolean;
//   }
// >(({ initialHtml, onChange, readOnly }, ref) => {
//   const editorRef = useRef<HTMLDivElement>(null);
//   const [popover, setPopover] = useState<{
//     node: HTMLElement;
//     x: number;
//     y: number;
//     latex: string;
//   } | null>(null);

//   useImperativeHandle(ref, () => ({
//     insertMath: () => {
//       const editorNode = editorRef.current;
//       if (!editorNode) return;

//       const sel = window.getSelection();
//       if (
//         !sel ||
//         sel.rangeCount === 0 ||
//         !editorNode.contains(sel.anchorNode)
//       ) {
//         editorNode.focus();
//         const range = document.createRange();
//         range.selectNodeContents(editorNode);
//         range.collapse(false);
//         sel?.removeAllRanges();
//         sel?.addRange(range);
//       }

//       const range = window.getSelection()!.getRangeAt(0);

//       // Create the Notion-like math span
//       const span = document.createElement("span");
//       span.contentEditable = "false";
//       span.className =
//         "inline-math cursor-pointer bg-slate-100/80 hover:bg-slate-200/80 px-1.5 py-0.5 rounded text-cyan-800 mx-1 border border-slate-200 transition-colors shadow-sm select-none";
//       span.dataset.latex = "";
//       span.innerHTML = "<i>ƒ(x)</i>";

//       range.insertNode(span);

//       // Insert zero-width space so the cursor can move past the inline block
//       const zws = document.createTextNode("\u200B");
//       range.collapse(false);
//       range.insertNode(zws);
//       range.setStartAfter(zws);
//       range.setEndAfter(zws);
//       window.getSelection()!.removeAllRanges();
//       window.getSelection()!.addRange(range);

//       // Open popover immediately
//       const rect = span.getBoundingClientRect();
//       setPopover({
//         node: span,
//         x: rect.left,
//         y: rect.bottom + 8,
//         latex: "",
//       });

//       triggerChange();
//     },
//   }));

//   const triggerChange = () => {
//     if (editorRef.current) {
//       onChange(editorRef.current.innerHTML, editorRef.current.innerText);
//     }
//   };

//   const handleEditorClick = (e: React.MouseEvent) => {
//     if (readOnly) return;
//     const target = e.target as HTMLElement;
//     const mathNode = target.closest(".inline-math") as HTMLElement;

//     if (mathNode) {
//       const rect = mathNode.getBoundingClientRect();
//       setPopover({
//         node: mathNode,
//         x: rect.left,
//         y: rect.bottom + 8,
//         latex: mathNode.dataset.latex || "",
//       });
//     }
//   };

//   const updateLatex = (val: string) => {
//     if (!popover) return;
//     setPopover({ ...popover, latex: val });
//     popover.node.dataset.latex = val;
//     popover.node.innerHTML = val ? safeRenderKatex(val) : "<i>ƒ(x)</i>";
//     triggerChange();
//   };

//   return (
//     <>
//       <style>{`
//         .custom-editor:empty:before {
//           content: attr(data-placeholder);
//           color: #94a3b8;
//           pointer-events: none;
//         }
//       `}</style>

//       <div
//         ref={editorRef}
//         contentEditable={!readOnly}
//         suppressContentEditableWarning
//         onInput={triggerChange}
//         onClick={handleEditorClick}
//         data-placeholder="Write your answer here..."
//         className={`custom-editor w-full min-h-[12rem] p-5 bg-slate-50 text-slate-700 border border-slate-200 rounded-2xl transition-all text-lg leading-relaxed shadow-inner focus:outline-none ${
//           !readOnly
//             ? "focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
//             : "opacity-80"
//         }`}
//         dangerouslySetInnerHTML={{ __html: initialHtml }}
//       />

//       {/* NOTION MATH POPOVER */}
//       {popover && (
//         <>
//           <div
//             className="fixed inset-0 z-40"
//             onClick={() => setPopover(null)}
//           />
//           <motion.div
//             initial={{ opacity: 0, y: -5 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="fixed z-50 bg-white border border-slate-200 shadow-xl rounded-xl p-3 w-80 flex flex-col gap-3"
//             style={{
//               top: popover.y,
//               left: Math.min(popover.x, window.innerWidth - 340),
//             }}
//           >
//             <div className="flex justify-between items-center">
//               <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
//                 Inline Equation
//               </div>
//               <button
//                 onClick={() => setPopover(null)}
//                 className="text-xs px-3 py-1 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 rounded-md font-semibold transition-colors border border-cyan-100"
//               >
//                 Done
//               </button>
//             </div>

//             <input
//               autoFocus
//               value={popover.latex}
//               onChange={(e) => updateLatex(e.target.value)}
//               onKeyDown={(e) => {
//                 if (e.key === "Enter") setPopover(null);
//               }}
//               placeholder="e.g. E = mc^2"
//               className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
//             />
//             <div className="min-h-[2.5rem] flex items-center bg-slate-50/50 rounded-md border border-slate-100 p-2 overflow-x-auto">
//               {popover.latex ? (
//                 <span
//                   dangerouslySetInnerHTML={{
//                     __html: safeRenderKatex(popover.latex),
//                   }}
//                 />
//               ) : (
//                 <span className="text-slate-400 text-sm italic">
//                   Preview...
//                 </span>
//               )}
//             </div>
//           </motion.div>
//         </>
//       )}
//     </>
//   );
// });
// RichEditor.displayName = "RichEditor";

// // --- MAIN COMPONENT ---
// export default function TheoryPractice() {
//   const [hasStarted, setHasStarted] = useState(false);
//   const [isCompleted, setIsCompleted] = useState(false);

//   const [useTimer, setUseTimer] = useState(true);
//   const [isLearningMode, setIsLearningMode] = useState(true);
//   const [timeLeft, setTimeLeft] = useState(SET_STATS.estimatedMinutes * 60);

//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [direction, setDirection] = useState(1);
//   const [userAnswersHtml, setUserAnswersHtml] = useState<
//     Record<number, string>
//   >({});
//   const [userAnswersText, setUserAnswersText] = useState<
//     Record<number, string>
//   >({});
//   const [submittedQuestions, setSubmittedQuestions] = useState<
//     Record<number, boolean>
//   >({});
//   const [isLoading, setIsLoading] = useState(false);

//   const editorRef = useRef<EditorRef>(null);

//   const currentQuestion = questions[currentIndex];
//   const isLastQuestion = currentIndex === questions.length - 1;
//   const currentAnswerHtml = userAnswersHtml[currentQuestion.id] || "";
//   const currentAnswerText = userAnswersText[currentQuestion.id] || "";
//   const isCurrentSubmitted = submittedQuestions[currentQuestion.id] || false;

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

//   const handleEditorChange = (html: string, text: string) => {
//     setUserAnswersHtml((prev) => ({ ...prev, [currentQuestion.id]: html }));
//     setUserAnswersText((prev) => ({ ...prev, [currentQuestion.id]: text }));
//   };

//   const submitCurrentAnswer = () => {
//     if (!currentAnswerText.trim() && !currentAnswerHtml.includes("inline-math"))
//       return;
//     if (isLoading) return;
//     setIsLoading(true);
//     setTimeout(() => {
//       setIsLoading(false);
//       setSubmittedQuestions((prev) => ({
//         ...prev,
//         [currentQuestion.id]: true,
//       }));
//     }, 500);
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
//     setIsCompleted(true);
//   };

//   // 1. INTRO SCREEN
//   if (!hasStarted) {
//     return (
//       <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
//         {/* Intro modal identical to previous step */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="max-w-md w-full bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100"
//         >
//           <div className="w-12 h-12 bg-cyan-50 text-cyan-600 rounded-2xl flex items-center justify-center mb-6">
//             <Target className="w-6 h-6" />
//           </div>
//           <h1 className="text-2xl font-bold text-slate-900 mb-2">
//             Physics Theory Set #1
//           </h1>
//           <p className="text-slate-500 mb-8">
//             Test your understanding of core physical properties and laws.
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
//       (sum, q) => sum + getEvaluation(q.id).score,
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
//               const evalResult = getEvaluation(q.id);
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
//                       {q.question}
//                     </h3>
//                     <div className="px-3 py-1 bg-cyan-50 text-cyan-700 font-bold rounded-lg text-sm shrink-0">
//                       {evalResult.score} / 4
//                     </div>
//                   </div>

//                   {/* Safely render the HTML containing our styled Katex nodes */}
//                   <div
//                     className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 text-slate-600"
//                     dangerouslySetInnerHTML={{
//                       __html:
//                         userAnswersHtml[q.id] ||
//                         "<span class='italic opacity-60'>No answer provided.</span>",
//                     }}
//                   />

//                   <div className="space-y-3">
//                     {evalResult.points.map((point, pIdx) => (
//                       <div
//                         key={pIdx}
//                         className="flex gap-4 items-start text-sm"
//                       >
//                         {point.awarded ? (
//                           <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
//                         ) : (
//                           <XCircle className="w-5 h-5 text-red-400 shrink-0" />
//                         )}
//                         <div>
//                           <p
//                             className={`font-medium ${
//                               point.awarded
//                                 ? "text-slate-800"
//                                 : "text-slate-500"
//                             }`}
//                           >
//                             {point.text}
//                           </p>
//                           <p
//                             className={
//                               point.awarded ? "text-green-600" : "text-red-500"
//                             }
//                           >
//                             ↳ {point.reason}
//                           </p>
//                         </div>
//                       </div>
//                     ))}
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
//         <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden border border-slate-100 flex flex-col">
//           <div className="p-8 md:p-10 flex-grow">
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
//                 <h1 className="text-2xl md:text-3xl font-medium leading-snug mb-8 text-center text-slate-900">
//                   {currentQuestion.question}
//                 </h1>

//                 {!isLearningMode || !isCurrentSubmitted ? (
//                   /* INPUT STATE WITH NOTION RICH TEXT EDITOR */
//                   <div className="space-y-6">
//                     <RichEditor
//                       key={`editor-${currentQuestion.id}`} // Force re-mount on question change to reset internal cursor states cleanly
//                       ref={editorRef}
//                       initialHtml={currentAnswerHtml}
//                       onChange={handleEditorChange}
//                     />
//                   </div>
//                 ) : (
//                   /* EVALUATION STATE */
//                   <div className="space-y-8">
//                     <div className="flex flex-col items-center justify-center py-6 bg-cyan-50/50 rounded-2xl border border-cyan-100">
//                       <span className="text-sm font-semibold text-cyan-600 uppercase tracking-widest mb-2">
//                         Score
//                       </span>
//                       <div className="text-5xl font-bold text-slate-900 flex items-baseline gap-1">
//                         {getEvaluation(currentQuestion.id).score}
//                         <span className="text-2xl text-slate-400 font-medium">
//                           / 4
//                         </span>
//                       </div>
//                     </div>

//                     <div className="space-y-4">
//                       <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
//                         Markscheme Breakdown
//                       </h3>
//                       <div className="space-y-3">
//                         {getEvaluation(currentQuestion.id).points.map(
//                           (point, idx) => (
//                             <motion.div
//                               initial={{ opacity: 0, y: 10 }}
//                               animate={{ opacity: 1, y: 0 }}
//                               transition={{ delay: idx * 0.1 + 0.1 }}
//                               key={idx}
//                               className={`p-4 rounded-xl flex gap-4 items-start border ${
//                                 point.awarded
//                                   ? "bg-green-50/30 border-green-100"
//                                   : "bg-red-50/30 border-red-100"
//                               }`}
//                             >
//                               {point.awarded ? (
//                                 <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0 mt-0.5" />
//                               ) : (
//                                 <XCircle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
//                               )}
//                               <div>
//                                 <p className="text-slate-800 font-medium mb-1">
//                                   {point.text}
//                                 </p>
//                                 <div className="flex items-center text-sm gap-2">
//                                   <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
//                                   <span
//                                     className={
//                                       point.awarded
//                                         ? "text-green-700"
//                                         : "text-red-700"
//                                     }
//                                   >
//                                     {point.reason}
//                                   </span>
//                                 </div>
//                               </div>
//                             </motion.div>
//                           )
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </motion.div>
//             </AnimatePresence>
//           </div>
//         </div>
//       </div>

//       {/* FLOATING NAVBAR W/ MATH BUTTON */}
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

//         <div className="flex-shrink-0 flex items-center justify-center gap-2 min-w-[140px]">
//           {(!isLearningMode || !isCurrentSubmitted) && (
//             <button
//               onClick={() => editorRef.current?.insertMath()}
//               className="w-12 h-12 flex items-center justify-center bg-slate-50 border border-slate-200 hover:border-cyan-300 hover:bg-cyan-50 text-slate-600 hover:text-cyan-700 rounded-full transition-all shadow-sm group"
//               title="Add Inline Math"
//             >
//               <Sigma className="w-5 h-5 group-hover:scale-110 transition-transform" />
//             </button>
//           )}

//           {isLearningMode && !isCurrentSubmitted ? (
//             <button
//               onClick={submitCurrentAnswer}
//               disabled={
//                 (!currentAnswerText.trim() &&
//                   !currentAnswerHtml.includes("inline-math")) ||
//                 isLoading
//               }
//               className="flex items-center justify-center gap-2 w-full py-3 px-6 bg-cyan-600 hover:bg-cyan-700 text-white rounded-full font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
//             >
//               {isLoading ? (
//                 <Loader2 className="w-5 h-5 animate-spin" />
//               ) : (
//                 "Submit"
//               )}
//               {!isLoading && <Send className="w-4 h-4 ml-1" />}
//             </button>
//           ) : isLastQuestion ? (
//             <button
//               onClick={finishPractice}
//               className="flex items-center justify-center gap-2 w-full py-3 px-6 bg-slate-900 hover:bg-slate-800 text-white rounded-full font-medium transition-all shadow-sm"
//             >
//               Finish Set
//               <CheckCircle2 className="w-4 h-4 ml-1" />
//             </button>
//           ) : (
//             <div className="px-4 py-2 font-medium text-slate-400 text-sm tracking-wide">
//               {currentIndex + 1} / {questions.length}
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

// import { AnimatePresence, motion } from "framer-motion";
// import katex from "katex";
// import "katex/dist/katex.min.css";
// import {
//   ArrowRight,
//   Award,
//   CheckCircle2,
//   ChevronLeft,
//   ChevronRight,
//   Clock,
//   FileText,
//   Loader2,
//   Play,
//   Send,
//   Settings2,
//   Sigma,
//   Target,
//   XCircle,
// } from "lucide-react";
// import React, {
//   forwardRef,
//   useEffect,
//   useImperativeHandle,
//   useRef,
//   useState,
// } from "react";

// // --- MOCK DATA ---
// const SET_STATS = {
//   totalQuestions: 3,
//   totalMarks: 12,
//   estimatedMinutes: 10,
// };

// const questions = [
//   {
//     id: 1,
//     question: "Define a physical quantity.",
//     markscheme: [
//       "A measurable property",
//       "Expressed with numerical value",
//       "Includes a unit",
//       "Used to describe physical systems",
//     ],
//   },
//   {
//     id: 2,
//     question: "Explain the difference between scalar and vector quantities.",
//     markscheme: [
//       "Scalar has magnitude only",
//       "Vector has magnitude and direction",
//       "Example of scalar",
//       "Example of vector",
//     ],
//   },
//   {
//     id: 3,
//     question: "State Newton's Second Law.",
//     markscheme: [
//       "Force equals mass times acceleration",
//       "F = ma",
//       "Acceleration proportional to force",
//       "Inversely proportional to mass",
//     ],
//   },
// ];

// // --- MOCK EVALUATION LOGIC ---
// const getEvaluation = (questionId: number) => {
//   if (questionId === 1) {
//     return {
//       score: 2,
//       points: [
//         {
//           awarded: true,
//           text: "A measurable property",
//           reason: "User mentioned measurement",
//         },
//         {
//           awarded: true,
//           text: "Expressed with numerical value",
//           reason: "Numerical aspect included",
//         },
//         { awarded: false, text: "Includes a unit", reason: "Units missing" },
//         {
//           awarded: false,
//           text: "Used to describe physical systems",
//           reason: "Context missing",
//         },
//       ],
//     };
//   }
//   if (questionId === 2) {
//     return {
//       score: 0,
//       points: [
//         {
//           awarded: false,
//           text: "Scalar has magnitude only",
//           reason: "Concept missing",
//         },
//         {
//           awarded: false,
//           text: "Vector has magnitude and direction",
//           reason: "Concept missing",
//         },
//         {
//           awarded: false,
//           text: "Example of scalar",
//           reason: "No example provided",
//         },
//         {
//           awarded: false,
//           text: "Example of vector",
//           reason: "No example provided",
//         },
//       ],
//     };
//   }
//   return {
//     score: 4,
//     points: [
//       {
//         awarded: true,
//         text: "Force equals mass times acceleration",
//         reason: "Definition accurate",
//       },
//       { awarded: true, text: "F = ma", reason: "Formula present" },
//       {
//         awarded: true,
//         text: "Acceleration proportional to force",
//         reason: "Relationship correct",
//       },
//       {
//         awarded: true,
//         text: "Inversely proportional to mass",
//         reason: "Relationship correct",
//       },
//     ],
//   };
// };

// // --- UTILS ---
// const safeRenderKatex = (latex: string) => {
//   try {
//     return katex.renderToString(latex || " ", {
//       throwOnError: false,
//       displayMode: false,
//     });
//   } catch (e) {
//     return `<span>${latex}</span>`;
//   }
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

// // --- NOTION-LIKE RICH TEXT EDITOR ---
// interface EditorRef {
//   insertMath: () => void;
// }

// const RichEditor = forwardRef<
//   EditorRef,
//   {
//     initialHtml: string;
//     onChange: (html: string, text: string) => void;
//     readOnly?: boolean;
//   }
// >(({ initialHtml, onChange, readOnly }, ref) => {
//   const editorRef = useRef<HTMLDivElement>(null);
//   const [popover, setPopover] = useState<{
//     node: HTMLElement;
//     x: number;
//     y: number;
//     latex: string;
//   } | null>(null);

//   // FIX 1: Set innerHTML imperatively on mount only.
//   // This prevents React from ever reconciling dangerouslySetInnerHTML
//   // over our direct DOM mutations (KaTeX injection), which was causing
//   // the rendered equation to get wiped on every state update.
//   useEffect(() => {
//     if (editorRef.current) {
//       editorRef.current.innerHTML = initialHtml;
//     }
//   }, []); // eslint-disable-line react-hooks/exhaustive-deps

//   useImperativeHandle(ref, () => ({
//     insertMath: () => {
//       const editorNode = editorRef.current;
//       if (!editorNode) return;

//       const sel = window.getSelection();
//       if (
//         !sel ||
//         sel.rangeCount === 0 ||
//         !editorNode.contains(sel.anchorNode)
//       ) {
//         editorNode.focus();
//         const range = document.createRange();
//         range.selectNodeContents(editorNode);
//         range.collapse(false);
//         sel?.removeAllRanges();
//         sel?.addRange(range);
//       }

//       const range = window.getSelection()!.getRangeAt(0);

//       // Create the Notion-like math span
//       const span = document.createElement("span");
//       span.contentEditable = "false";
//       span.className =
//         "inline-math cursor-pointer bg-slate-100/80 hover:bg-slate-200/80 px-1.5 py-0.5 rounded text-cyan-800 mx-1 border border-slate-200 transition-colors shadow-sm select-none";
//       span.dataset.latex = "";
//       span.innerHTML = "<i>ƒ(x)</i>";

//       range.insertNode(span);

//       // Insert zero-width space so the cursor can move past the inline block
//       const zws = document.createTextNode("\u200B");
//       range.collapse(false);
//       range.insertNode(zws);
//       range.setStartAfter(zws);
//       range.setEndAfter(zws);
//       window.getSelection()!.removeAllRanges();
//       window.getSelection()!.addRange(range);

//       // Open popover immediately
//       const rect = span.getBoundingClientRect();
//       setPopover({
//         node: span,
//         x: rect.left,
//         y: rect.bottom + 8,
//         latex: "",
//       });

//       triggerChange();
//     },
//   }));

//   const triggerChange = () => {
//     if (editorRef.current) {
//       onChange(editorRef.current.innerHTML, editorRef.current.innerText);
//     }
//   };

//   const handleEditorClick = (e: React.MouseEvent) => {
//     if (readOnly) return;
//     const target = e.target as HTMLElement;
//     const mathNode = target.closest(".inline-math") as HTMLElement;

//     if (mathNode) {
//       const rect = mathNode.getBoundingClientRect();
//       setPopover({
//         node: mathNode,
//         x: rect.left,
//         y: rect.bottom + 8,
//         latex: mathNode.dataset.latex || "",
//       });
//     }
//   };

//   const updateLatex = (val: string) => {
//     if (!popover) return;
//     setPopover({ ...popover, latex: val });
//     popover.node.dataset.latex = val;
//     popover.node.innerHTML = val ? safeRenderKatex(val) : "<i>ƒ(x)</i>";
//     triggerChange();
//   };

//   return (
//     <>
//       <style>{`
//         .custom-editor:empty:before {
//           content: attr(data-placeholder);
//           color: #94a3b8;
//           pointer-events: none;
//         }
//       `}</style>

//       {/* FIX 2: dangerouslySetInnerHTML removed. innerHTML is set once
//           via the useEffect above, so React never overwrites our DOM edits. */}
//       <div
//         ref={editorRef}
//         contentEditable={!readOnly}
//         suppressContentEditableWarning
//         onInput={triggerChange}
//         onClick={handleEditorClick}
//         data-placeholder="Write your answer here..."
//         className={`custom-editor w-full min-h-[12rem] p-5 bg-slate-50 text-slate-700 border border-slate-200 rounded-2xl transition-all text-lg leading-relaxed shadow-inner focus:outline-none ${
//           !readOnly
//             ? "focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
//             : "opacity-80"
//         }`}
//       />

//       {/* NOTION MATH POPOVER */}
//       {popover && (
//         <>
//           <div
//             className="fixed inset-0 z-40"
//             onClick={() => setPopover(null)}
//           />
//           <motion.div
//             initial={{ opacity: 0, y: -5 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="fixed z-50 bg-white border border-slate-200 shadow-xl rounded-xl p-3 w-80 flex flex-col gap-3"
//             style={{
//               top: popover.y,
//               left: Math.min(popover.x, window.innerWidth - 340),
//             }}
//           >
//             <div className="flex justify-between items-center">
//               <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
//                 Inline Equation
//               </div>
//               <button
//                 onClick={() => setPopover(null)}
//                 className="text-xs px-3 py-1 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 rounded-md font-semibold transition-colors border border-cyan-100"
//               >
//                 Done
//               </button>
//             </div>

//             <input
//               autoFocus
//               value={popover.latex}
//               onChange={(e) => updateLatex(e.target.value)}
//               onKeyDown={(e) => {
//                 if (e.key === "Enter") setPopover(null);
//               }}
//               placeholder="e.g. E = mc^2"
//               className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
//             />
//             <div className="min-h-[2.5rem] flex items-center bg-slate-50/50 rounded-md border border-slate-100 p-2 overflow-x-auto">
//               {popover.latex ? (
//                 <span
//                   dangerouslySetInnerHTML={{
//                     __html: safeRenderKatex(popover.latex),
//                   }}
//                 />
//               ) : (
//                 <span className="text-slate-400 text-sm italic">
//                   Preview...
//                 </span>
//               )}
//             </div>
//           </motion.div>
//         </>
//       )}
//     </>
//   );
// });
// RichEditor.displayName = "RichEditor";

// // --- MAIN COMPONENT ---
// export default function TheoryPractice() {
//   const [hasStarted, setHasStarted] = useState(false);
//   const [isCompleted, setIsCompleted] = useState(false);

//   const [useTimer, setUseTimer] = useState(true);
//   const [isLearningMode, setIsLearningMode] = useState(true);
//   const [timeLeft, setTimeLeft] = useState(SET_STATS.estimatedMinutes * 60);

//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [direction, setDirection] = useState(1);
//   const [userAnswersHtml, setUserAnswersHtml] = useState<
//     Record<number, string>
//   >({});
//   const [userAnswersText, setUserAnswersText] = useState<
//     Record<number, string>
//   >({});
//   const [submittedQuestions, setSubmittedQuestions] = useState<
//     Record<number, boolean>
//   >({});
//   const [isLoading, setIsLoading] = useState(false);

//   const editorRef = useRef<EditorRef>(null);

//   const currentQuestion = questions[currentIndex];
//   const isLastQuestion = currentIndex === questions.length - 1;
//   const currentAnswerHtml = userAnswersHtml[currentQuestion.id] || "";
//   const currentAnswerText = userAnswersText[currentQuestion.id] || "";
//   const isCurrentSubmitted = submittedQuestions[currentQuestion.id] || false;

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

//   const handleEditorChange = (html: string, text: string) => {
//     setUserAnswersHtml((prev) => ({ ...prev, [currentQuestion.id]: html }));
//     setUserAnswersText((prev) => ({ ...prev, [currentQuestion.id]: text }));
//   };

//   const submitCurrentAnswer = () => {
//     if (!currentAnswerText.trim() && !currentAnswerHtml.includes("inline-math"))
//       return;
//     if (isLoading) return;
//     setIsLoading(true);
//     setTimeout(() => {
//       setIsLoading(false);
//       setSubmittedQuestions((prev) => ({
//         ...prev,
//         [currentQuestion.id]: true,
//       }));
//     }, 500);
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
//     setIsCompleted(true);
//   };

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
//             Physics Theory Set #1
//           </h1>
//           <p className="text-slate-500 mb-8">
//             Test your understanding of core physical properties and laws.
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
//       (sum, q) => sum + getEvaluation(q.id).score,
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
//               const evalResult = getEvaluation(q.id);
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
//                       {q.question}
//                     </h3>
//                     <div className="px-3 py-1 bg-cyan-50 text-cyan-700 font-bold rounded-lg text-sm shrink-0">
//                       {evalResult.score} / 4
//                     </div>
//                   </div>

//                   <div
//                     className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 text-slate-600"
//                     dangerouslySetInnerHTML={{
//                       __html:
//                         userAnswersHtml[q.id] ||
//                         "<span class='italic opacity-60'>No answer provided.</span>",
//                     }}
//                   />

//                   <div className="space-y-3">
//                     {evalResult.points.map((point, pIdx) => (
//                       <div
//                         key={pIdx}
//                         className="flex gap-4 items-start text-sm"
//                       >
//                         {point.awarded ? (
//                           <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
//                         ) : (
//                           <XCircle className="w-5 h-5 text-red-400 shrink-0" />
//                         )}
//                         <div>
//                           <p
//                             className={`font-medium ${
//                               point.awarded
//                                 ? "text-slate-800"
//                                 : "text-slate-500"
//                             }`}
//                           >
//                             {point.text}
//                           </p>
//                           <p
//                             className={
//                               point.awarded ? "text-green-600" : "text-red-500"
//                             }
//                           >
//                             ↳ {point.reason}
//                           </p>
//                         </div>
//                       </div>
//                     ))}
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
//         <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden border border-slate-100 flex flex-col">
//           <div className="p-8 md:p-10 flex-grow">
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
//                 <h1 className="text-2xl md:text-3xl font-medium leading-snug mb-8 text-center text-slate-900">
//                   {currentQuestion.question}
//                 </h1>

//                 {!isLearningMode || !isCurrentSubmitted ? (
//                   /* INPUT STATE WITH NOTION RICH TEXT EDITOR */
//                   <div className="space-y-6">
//                     <RichEditor
//                       key={`editor-${currentQuestion.id}`}
//                       ref={editorRef}
//                       initialHtml={currentAnswerHtml}
//                       onChange={handleEditorChange}
//                     />
//                   </div>
//                 ) : (
//                   /* EVALUATION STATE */
//                   <div className="space-y-8">
//                     <div className="flex flex-col items-center justify-center py-6 bg-cyan-50/50 rounded-2xl border border-cyan-100">
//                       <span className="text-sm font-semibold text-cyan-600 uppercase tracking-widest mb-2">
//                         Score
//                       </span>
//                       <div className="text-5xl font-bold text-slate-900 flex items-baseline gap-1">
//                         {getEvaluation(currentQuestion.id).score}
//                         <span className="text-2xl text-slate-400 font-medium">
//                           / 4
//                         </span>
//                       </div>
//                     </div>

//                     <div className="space-y-4">
//                       <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
//                         Markscheme Breakdown
//                       </h3>
//                       <div className="space-y-3">
//                         {getEvaluation(currentQuestion.id).points.map(
//                           (point, idx) => (
//                             <motion.div
//                               initial={{ opacity: 0, y: 10 }}
//                               animate={{ opacity: 1, y: 0 }}
//                               transition={{ delay: idx * 0.1 + 0.1 }}
//                               key={idx}
//                               className={`p-4 rounded-xl flex gap-4 items-start border ${
//                                 point.awarded
//                                   ? "bg-green-50/30 border-green-100"
//                                   : "bg-red-50/30 border-red-100"
//                               }`}
//                             >
//                               {point.awarded ? (
//                                 <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0 mt-0.5" />
//                               ) : (
//                                 <XCircle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
//                               )}
//                               <div>
//                                 <p className="text-slate-800 font-medium mb-1">
//                                   {point.text}
//                                 </p>
//                                 <div className="flex items-center text-sm gap-2">
//                                   <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
//                                   <span
//                                     className={
//                                       point.awarded
//                                         ? "text-green-700"
//                                         : "text-red-700"
//                                     }
//                                   >
//                                     {point.reason}
//                                   </span>
//                                 </div>
//                               </div>
//                             </motion.div>
//                           )
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </motion.div>
//             </AnimatePresence>
//           </div>
//         </div>
//       </div>

//       {/* FLOATING NAVBAR W/ MATH BUTTON */}
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

//         <div className="flex-shrink-0 flex items-center justify-center gap-2 min-w-[140px]">
//           {(!isLearningMode || !isCurrentSubmitted) && (
//             <button
//               onClick={() => editorRef.current?.insertMath()}
//               className="w-12 h-12 flex items-center justify-center bg-slate-50 border border-slate-200 hover:border-cyan-300 hover:bg-cyan-50 text-slate-600 hover:text-cyan-700 rounded-full transition-all shadow-sm group"
//               title="Add Inline Math"
//             >
//               <Sigma className="w-5 h-5 group-hover:scale-110 transition-transform" />
//             </button>
//           )}

//           {isLearningMode && !isCurrentSubmitted ? (
//             <button
//               onClick={submitCurrentAnswer}
//               disabled={
//                 (!currentAnswerText.trim() &&
//                   !currentAnswerHtml.includes("inline-math")) ||
//                 isLoading
//               }
//               className="flex items-center justify-center gap-2 w-full py-3 px-6 bg-cyan-600 hover:bg-cyan-700 text-white rounded-full font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
//             >
//               {isLoading ? (
//                 <Loader2 className="w-5 h-5 animate-spin" />
//               ) : (
//                 "Submit"
//               )}
//               {!isLoading && <Send className="w-4 h-4 ml-1" />}
//             </button>
//           ) : isLastQuestion ? (
//             <button
//               onClick={finishPractice}
//               className="flex items-center justify-center gap-2 w-full py-3 px-6 bg-slate-900 hover:bg-slate-800 text-white rounded-full font-medium transition-all shadow-sm"
//             >
//               Finish Set
//               <CheckCircle2 className="w-4 h-4 ml-1" />
//             </button>
//           ) : (
//             <div className="px-4 py-2 font-medium text-slate-400 text-sm tracking-wide">
//               {currentIndex + 1} / {questions.length}
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

// import { AnimatePresence, motion } from "framer-motion";
// import katex from "katex";
// import "katex/dist/katex.min.css";
// import {
//   ArrowRight,
//   Award,
//   CheckCircle2,
//   ChevronLeft,
//   ChevronRight,
//   Clock,
//   Divide,
//   FileText,
//   Loader2,
//   Play,
//   Plus,
//   Send,
//   Settings2,
//   Sigma,
//   Target,
//   XCircle,
// } from "lucide-react";
// import React, {
//   forwardRef,
//   useEffect,
//   useImperativeHandle,
//   useRef,
//   useState,
// } from "react";

// // --- MOCK DATA ---
// const SET_STATS = {
//   totalQuestions: 3,
//   totalMarks: 12,
//   estimatedMinutes: 10,
// };

// const questions = [
//   {
//     id: 1,
//     question: "Define a physical quantity.",
//     markscheme: [
//       "A measurable property",
//       "Expressed with numerical value",
//       "Includes a unit",
//       "Used to describe physical systems",
//     ],
//   },
//   {
//     id: 2,
//     question: "Explain the difference between scalar and vector quantities.",
//     markscheme: [
//       "Scalar has magnitude only",
//       "Vector has magnitude and direction",
//       "Example of scalar",
//       "Example of vector",
//     ],
//   },
//   {
//     id: 3,
//     question: "State Newton's Second Law.",
//     markscheme: [
//       "Force equals mass times acceleration",
//       "F = ma",
//       "Acceleration proportional to force",
//       "Inversely proportional to mass",
//     ],
//   },
// ];

// // --- MOCK EVALUATION LOGIC ---
// const getEvaluation = (questionId: number) => {
//   if (questionId === 1) {
//     return {
//       score: 2,
//       points: [
//         {
//           awarded: true,
//           text: "A measurable property",
//           reason: "User mentioned measurement",
//         },
//         {
//           awarded: true,
//           text: "Expressed with numerical value",
//           reason: "Numerical aspect included",
//         },
//         { awarded: false, text: "Includes a unit", reason: "Units missing" },
//         {
//           awarded: false,
//           text: "Used to describe physical systems",
//           reason: "Context missing",
//         },
//       ],
//     };
//   }
//   if (questionId === 2) {
//     return {
//       score: 0,
//       points: [
//         {
//           awarded: false,
//           text: "Scalar has magnitude only",
//           reason: "Concept missing",
//         },
//         {
//           awarded: false,
//           text: "Vector has magnitude and direction",
//           reason: "Concept missing",
//         },
//         {
//           awarded: false,
//           text: "Example of scalar",
//           reason: "No example provided",
//         },
//         {
//           awarded: false,
//           text: "Example of vector",
//           reason: "No example provided",
//         },
//       ],
//     };
//   }
//   return {
//     score: 4,
//     points: [
//       {
//         awarded: true,
//         text: "Force equals mass times acceleration",
//         reason: "Definition accurate",
//       },
//       { awarded: true, text: "F = ma", reason: "Formula present" },
//       {
//         awarded: true,
//         text: "Acceleration proportional to force",
//         reason: "Relationship correct",
//       },
//       {
//         awarded: true,
//         text: "Inversely proportional to mass",
//         reason: "Relationship correct",
//       },
//     ],
//   };
// };

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

// // --- NOTION-LIKE RICH TEXT EDITOR ---
// type MathType = "general" | "fraction" | "power";

// interface EditorRef {
//   insertMath: (type: MathType) => void;
// }

// const RichEditor = forwardRef<
//   EditorRef,
//   {
//     initialHtml: string;
//     onChange: (html: string, text: string) => void;
//     readOnly?: boolean;
//   }
// >(({ initialHtml, onChange, readOnly }, ref) => {
//   const editorRef = useRef<HTMLDivElement>(null);

//   const [popover, setPopover] = useState<{
//     id: string;
//     x: number;
//     y: number;
//     type: MathType;
//     latex: string;
//     num: string;
//     den: string;
//     base: string;
//     exp: string;
//   } | null>(null);

//   // Set innerHTML imperatively on mount only to prevent React from overwriting DOM
//   useEffect(() => {
//     if (editorRef.current) {
//       editorRef.current.innerHTML = initialHtml;
//     }
//   }, []); // eslint-disable-line react-hooks/exhaustive-deps

//   useImperativeHandle(ref, () => ({
//     insertMath: (type: MathType = "general") => {
//       const editorNode = editorRef.current;
//       if (!editorNode) return;

//       const sel = window.getSelection();
//       if (
//         !sel ||
//         sel.rangeCount === 0 ||
//         !editorNode.contains(sel.anchorNode)
//       ) {
//         editorNode.focus();
//         const range = document.createRange();
//         range.selectNodeContents(editorNode);
//         range.collapse(false);
//         sel?.removeAllRanges();
//         sel?.addRange(range);
//       }

//       const range = window.getSelection()!.getRangeAt(0);

//       // Create the mathematical node span
//       const span = document.createElement("span");
//       const mathId = `math-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
//       span.id = mathId;
//       span.contentEditable = "false";
//       span.className =
//         "inline-math cursor-pointer inline-block align-middle bg-slate-100 hover:bg-slate-200 px-1.5 py-0.5 rounded text-cyan-800 mx-1 border border-slate-200 transition-colors shadow-sm select-none";

//       // Initialize Dataset based on specific type
//       span.dataset.mathType = type;
//       span.dataset.latex = "";
//       span.dataset.num = "";
//       span.dataset.den = "";
//       span.dataset.base = "";
//       span.dataset.exp = "";

//       if (type === "fraction") span.innerHTML = "<i>a/b</i>";
//       else if (type === "power") span.innerHTML = "<i>xⁿ</i>";
//       else span.innerHTML = "<i>ƒ(x)</i>";

//       range.insertNode(span);

//       // Insert zero-width space after block to free the cursor
//       const zws = document.createTextNode("\u200B");
//       range.collapse(false);
//       range.insertNode(zws);
//       range.setStartAfter(zws);
//       range.setEndAfter(zws);
//       window.getSelection()!.removeAllRanges();
//       window.getSelection()!.addRange(range);

//       // Trigger popover instantly
//       const rect = span.getBoundingClientRect();
//       setPopover({
//         id: mathId,
//         x: rect.left,
//         y: rect.bottom + 8,
//         type,
//         latex: "",
//         num: "",
//         den: "",
//         base: "",
//         exp: "",
//       });

//       triggerChange();
//     },
//   }));

//   const triggerChange = () => {
//     if (editorRef.current) {
//       onChange(editorRef.current.innerHTML, editorRef.current.innerText);
//     }
//   };

//   const handleEditorClick = (e: React.MouseEvent) => {
//     if (readOnly) return;
//     const target = e.target as HTMLElement;
//     const mathNode = target.closest(".inline-math") as HTMLElement;

//     if (mathNode) {
//       const rect = mathNode.getBoundingClientRect();

//       // Ensure node has ID for targeted updates
//       if (!mathNode.id) {
//         mathNode.id = `math-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
//       }

//       setPopover({
//         id: mathNode.id,
//         x: rect.left,
//         y: rect.bottom + 8,
//         type: (mathNode.dataset.mathType as MathType) || "general",
//         latex: mathNode.dataset.latex || "",
//         num: mathNode.dataset.num || "",
//         den: mathNode.dataset.den || "",
//         base: mathNode.dataset.base || "",
//         exp: mathNode.dataset.exp || "",
//       });
//     }
//   };

//   const updateMathField = (
//     field: "latex" | "num" | "den" | "base" | "exp",
//     val: string
//   ) => {
//     if (!popover) return;

//     // Create updated popover state
//     const newPopover = { ...popover, [field]: val };
//     setPopover(newPopover);

//     // Find the target DOM node
//     const node = document.getElementById(popover.id);
//     if (node) {
//       node.dataset[field] = val;

//       // Calculate Combined LaTeX based on type
//       let finalLatex = "";
//       if (newPopover.type === "general") finalLatex = newPopover.latex;
//       if (newPopover.type === "fraction") {
//         if (newPopover.num || newPopover.den)
//           finalLatex = `\\frac{${newPopover.num || " "}}{${
//             newPopover.den || " "
//           }}`;
//       }
//       if (newPopover.type === "power") {
//         if (newPopover.base || newPopover.exp)
//           finalLatex = `${newPopover.base || " "}^{${newPopover.exp || " "}}`;
//       }

//       // Render out
//       if (finalLatex.trim() === "") {
//         if (newPopover.type === "fraction") node.innerHTML = "<i>a/b</i>";
//         else if (newPopover.type === "power") node.innerHTML = "<i>xⁿ</i>";
//         else node.innerHTML = "<i>ƒ(x)</i>";
//       } else {
//         node.innerHTML = safeRenderKatex(finalLatex);
//       }
//       triggerChange();
//     }
//   };

//   // Derive preview LaTeX for the Popover bottom window
//   let previewLatex = "";
//   if (popover) {
//     if (popover.type === "general") previewLatex = popover.latex;
//     if (popover.type === "fraction" && (popover.num || popover.den))
//       previewLatex = `\\frac{${popover.num || " "}}{${popover.den || " "}}`;
//     if (popover.type === "power" && (popover.base || popover.exp))
//       previewLatex = `${popover.base || " "}^{${popover.exp || " "}}`;
//   }

//   return (
//     <>
//       <style>{`
//         .custom-editor:empty:before {
//           content: attr(data-placeholder);
//           color: #94a3b8;
//           pointer-events: none;
//         }
//         .custom-editor .katex {
//            font-size: 1.15em;
//         }
//       `}</style>

//       <div
//         ref={editorRef}
//         contentEditable={!readOnly}
//         suppressContentEditableWarning
//         onInput={triggerChange}
//         onClick={handleEditorClick}
//         data-placeholder="Write your answer here..."
//         className={`custom-editor w-full min-h-[12rem] p-5 bg-slate-50 text-slate-700 border border-slate-200 rounded-2xl transition-all text-lg leading-relaxed shadow-inner focus:outline-none ${
//           !readOnly
//             ? "focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
//             : "opacity-80"
//         }`}
//       />

//       {/* NOTION MATH POPOVER */}
//       {popover && (
//         <>
//           <div
//             className="fixed inset-0 z-40"
//             onClick={() => setPopover(null)}
//           />
//           <motion.div
//             initial={{ opacity: 0, y: -5 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="fixed z-50 bg-white border border-slate-200 shadow-xl rounded-xl p-4 w-[340px] flex flex-col gap-4"
//             style={{
//               top: popover.y,
//               left: Math.min(popover.x, window.innerWidth - 360),
//             }}
//           >
//             <div className="flex justify-between items-center">
//               <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
//                 {popover.type === "fraction"
//                   ? "Fraction"
//                   : popover.type === "power"
//                   ? "Power/Exponent"
//                   : "Inline Equation"}
//               </div>
//               <button
//                 onClick={() => setPopover(null)}
//                 className="text-xs px-3 py-1.5 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 rounded-md font-semibold transition-colors border border-cyan-100"
//               >
//                 Done
//               </button>
//             </div>

//             {/* CONDITIONAL INPUT FIELDS BASED ON TYPE */}
//             {popover.type === "general" && (
//               <input
//                 autoFocus
//                 value={popover.latex}
//                 onChange={(e) => updateMathField("latex", e.target.value)}
//                 onKeyDown={(e) => {
//                   if (e.key === "Enter") setPopover(null);
//                 }}
//                 placeholder="e.g. E = mc^2"
//                 className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
//               />
//             )}

//             {popover.type === "fraction" && (
//               <div className="flex flex-col gap-2">
//                 <input
//                   autoFocus
//                   value={popover.num}
//                   onChange={(e) => updateMathField("num", e.target.value)}
//                   placeholder="Numerator (Top)"
//                   className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 font-mono text-sm text-center focus:outline-none focus:ring-2 focus:ring-cyan-500"
//                 />
//                 <div className="w-full h-[2px] bg-slate-200 rounded-full my-0.5" />
//                 <input
//                   value={popover.den}
//                   onChange={(e) => updateMathField("den", e.target.value)}
//                   placeholder="Denominator (Bottom)"
//                   className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 font-mono text-sm text-center focus:outline-none focus:ring-2 focus:ring-cyan-500"
//                 />
//               </div>
//             )}

//             {popover.type === "power" && (
//               <div className="flex items-start gap-2">
//                 <input
//                   autoFocus
//                   value={popover.base}
//                   onChange={(e) => updateMathField("base", e.target.value)}
//                   placeholder="Base (x)"
//                   className="flex-1 bg-slate-50 border border-slate-200 rounded-md p-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
//                 />
//                 <input
//                   value={popover.exp}
//                   onChange={(e) => updateMathField("exp", e.target.value)}
//                   placeholder="Exp (n)"
//                   className="w-[100px] bg-slate-50 border border-slate-200 rounded-md p-2 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500 mt-[-8px] shadow-sm"
//                 />
//               </div>
//             )}

//             {/* LIVE PREVIEW WINDOW */}
//             <div className="min-h-[3rem] flex justify-center items-center bg-slate-50/50 rounded-md border border-slate-100 p-2 overflow-x-auto text-slate-800">
//               {previewLatex ? (
//                 <span
//                   dangerouslySetInnerHTML={{
//                     __html: safeRenderKatex(previewLatex),
//                   }}
//                 />
//               ) : (
//                 <span className="text-slate-400 text-sm italic">
//                   Live Preview...
//                 </span>
//               )}
//             </div>
//           </motion.div>
//         </>
//       )}
//     </>
//   );
// });
// RichEditor.displayName = "RichEditor";

// // --- MAIN COMPONENT ---
// export default function TheoryPractice() {
//   const [hasStarted, setHasStarted] = useState(false);
//   const [isCompleted, setIsCompleted] = useState(false);

//   const [useTimer, setUseTimer] = useState(true);
//   const [isLearningMode, setIsLearningMode] = useState(true);
//   const [timeLeft, setTimeLeft] = useState(SET_STATS.estimatedMinutes * 60);

//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [direction, setDirection] = useState(1);
//   const [userAnswersHtml, setUserAnswersHtml] = useState<
//     Record<number, string>
//   >({});
//   const [userAnswersText, setUserAnswersText] = useState<
//     Record<number, string>
//   >({});
//   const [submittedQuestions, setSubmittedQuestions] = useState<
//     Record<number, boolean>
//   >({});
//   const [isLoading, setIsLoading] = useState(false);

//   // Controls the expandable math menu in the navbar
//   const [showMathMenu, setShowMathMenu] = useState(false);

//   const editorRef = useRef<EditorRef>(null);

//   const currentQuestion = questions[currentIndex];
//   const isLastQuestion = currentIndex === questions.length - 1;
//   const currentAnswerHtml = userAnswersHtml[currentQuestion.id] || "";
//   const currentAnswerText = userAnswersText[currentQuestion.id] || "";
//   const isCurrentSubmitted = submittedQuestions[currentQuestion.id] || false;

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

//   const handleEditorChange = (html: string, text: string) => {
//     setUserAnswersHtml((prev) => ({ ...prev, [currentQuestion.id]: html }));
//     setUserAnswersText((prev) => ({ ...prev, [currentQuestion.id]: text }));
//   };

//   const submitCurrentAnswer = () => {
//     if (!currentAnswerText.trim() && !currentAnswerHtml.includes("inline-math"))
//       return;
//     if (isLoading) return;
//     setIsLoading(true);
//     setTimeout(() => {
//       setIsLoading(false);
//       setSubmittedQuestions((prev) => ({
//         ...prev,
//         [currentQuestion.id]: true,
//       }));
//     }, 500);
//   };

//   const goNext = () => {
//     if (currentIndex < questions.length - 1) {
//       setDirection(1);
//       setCurrentIndex((prev) => prev + 1);
//       setShowMathMenu(false);
//     }
//   };

//   const goPrev = () => {
//     if (currentIndex > 0) {
//       setDirection(-1);
//       setCurrentIndex((prev) => prev - 1);
//       setShowMathMenu(false);
//     }
//   };

//   const finishPractice = () => {
//     setIsCompleted(true);
//   };

//   const insertMathAndClose = (type: MathType) => {
//     editorRef.current?.insertMath(type);
//     setShowMathMenu(false);
//   };

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
//             Physics Theory Set #1
//           </h1>
//           <p className="text-slate-500 mb-8">
//             Test your understanding of core physical properties and laws.
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
//       (sum, q) => sum + getEvaluation(q.id).score,
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
//               const evalResult = getEvaluation(q.id);
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
//                       {q.question}
//                     </h3>
//                     <div className="px-3 py-1 bg-cyan-50 text-cyan-700 font-bold rounded-lg text-sm shrink-0">
//                       {evalResult.score} / 4
//                     </div>
//                   </div>

//                   <div
//                     className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 text-slate-600"
//                     dangerouslySetInnerHTML={{
//                       __html:
//                         userAnswersHtml[q.id] ||
//                         "<span class='italic opacity-60'>No answer provided.</span>",
//                     }}
//                   />

//                   <div className="space-y-3">
//                     {evalResult.points.map((point, pIdx) => (
//                       <div
//                         key={pIdx}
//                         className="flex gap-4 items-start text-sm"
//                       >
//                         {point.awarded ? (
//                           <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
//                         ) : (
//                           <XCircle className="w-5 h-5 text-red-400 shrink-0" />
//                         )}
//                         <div>
//                           <p
//                             className={`font-medium ${
//                               point.awarded
//                                 ? "text-slate-800"
//                                 : "text-slate-500"
//                             }`}
//                           >
//                             {point.text}
//                           </p>
//                           <p
//                             className={
//                               point.awarded ? "text-green-600" : "text-red-500"
//                             }
//                           >
//                             ↳ {point.reason}
//                           </p>
//                         </div>
//                       </div>
//                     ))}
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
//         <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden border border-slate-100 flex flex-col">
//           <div className="p-8 md:p-10 flex-grow">
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
//                 <h1 className="text-2xl md:text-3xl font-medium leading-snug mb-8 text-center text-slate-900">
//                   {currentQuestion.question}
//                 </h1>

//                 {!isLearningMode || !isCurrentSubmitted ? (
//                   <div className="space-y-6">
//                     <RichEditor
//                       key={`editor-${currentQuestion.id}`}
//                       ref={editorRef}
//                       initialHtml={currentAnswerHtml}
//                       onChange={handleEditorChange}
//                     />
//                   </div>
//                 ) : (
//                   <div className="space-y-8">
//                     <div className="flex flex-col items-center justify-center py-6 bg-cyan-50/50 rounded-2xl border border-cyan-100">
//                       <span className="text-sm font-semibold text-cyan-600 uppercase tracking-widest mb-2">
//                         Score
//                       </span>
//                       <div className="text-5xl font-bold text-slate-900 flex items-baseline gap-1">
//                         {getEvaluation(currentQuestion.id).score}
//                         <span className="text-2xl text-slate-400 font-medium">
//                           / 4
//                         </span>
//                       </div>
//                     </div>

//                     <div className="space-y-4">
//                       <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
//                         Markscheme Breakdown
//                       </h3>
//                       <div className="space-y-3">
//                         {getEvaluation(currentQuestion.id).points.map(
//                           (point, idx) => (
//                             <motion.div
//                               initial={{ opacity: 0, y: 10 }}
//                               animate={{ opacity: 1, y: 0 }}
//                               transition={{ delay: idx * 0.1 + 0.1 }}
//                               key={idx}
//                               className={`p-4 rounded-xl flex gap-4 items-start border ${
//                                 point.awarded
//                                   ? "bg-green-50/30 border-green-100"
//                                   : "bg-red-50/30 border-red-100"
//                               }`}
//                             >
//                               {point.awarded ? (
//                                 <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0 mt-0.5" />
//                               ) : (
//                                 <XCircle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
//                               )}
//                               <div>
//                                 <p className="text-slate-800 font-medium mb-1">
//                                   {point.text}
//                                 </p>
//                                 <div className="flex items-center text-sm gap-2">
//                                   <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
//                                   <span
//                                     className={
//                                       point.awarded
//                                         ? "text-green-700"
//                                         : "text-red-700"
//                                     }
//                                   >
//                                     {point.reason}
//                                   </span>
//                                 </div>
//                               </div>
//                             </motion.div>
//                           )
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </motion.div>
//             </AnimatePresence>
//           </div>
//         </div>
//       </div>

//       {/* FLOATING NAVBAR */}
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

//         <div className="flex-shrink-0 flex items-center justify-center gap-2 min-w-[140px] relative">
//           {/* EXPANDABLE MATH MENU */}
//           {(!isLearningMode || !isCurrentSubmitted) && (
//             <div className="relative">
//               <AnimatePresence>
//                 {showMathMenu && (
//                   <>
//                     <div
//                       className="fixed inset-0 z-30"
//                       onClick={() => setShowMathMenu(false)}
//                     />
//                     <motion.div
//                       initial={{ opacity: 0, y: 10, scale: 0.95 }}
//                       animate={{ opacity: 1, y: 0, scale: 1 }}
//                       exit={{ opacity: 0, y: 10, scale: 0.95 }}
//                       transition={{ duration: 0.15 }}
//                       className="absolute bottom-[calc(100%+12px)] left-1/2 -translate-x-1/2 flex items-center gap-2 p-2 bg-white border border-slate-200 shadow-xl rounded-full z-40"
//                     >
//                       <button
//                         onClick={() => insertMathAndClose("general")}
//                         className="w-10 h-10 flex flex-col items-center justify-center bg-slate-50 hover:bg-cyan-50 border border-slate-100 hover:border-cyan-200 text-slate-600 hover:text-cyan-700 rounded-full transition-all group"
//                         title="General Equation"
//                       >
//                         <Sigma className="w-4 h-4 group-hover:scale-110 transition-transform" />
//                       </button>
//                       <div className="w-px h-6 bg-slate-200" />
//                       <button
//                         onClick={() => insertMathAndClose("fraction")}
//                         className="w-10 h-10 flex flex-col items-center justify-center bg-slate-50 hover:bg-cyan-50 border border-slate-100 hover:border-cyan-200 text-slate-600 hover:text-cyan-700 rounded-full transition-all group"
//                         title="Fraction"
//                       >
//                         <Divide className="w-4 h-4 group-hover:scale-110 transition-transform" />
//                       </button>
//                       <div className="w-px h-6 bg-slate-200" />
//                       <button
//                         onClick={() => insertMathAndClose("power")}
//                         className="w-10 h-10 flex flex-col items-center justify-center bg-slate-50 hover:bg-cyan-50 border border-slate-100 hover:border-cyan-200 text-slate-600 hover:text-cyan-700 rounded-full transition-all group font-serif italic text-sm font-bold"
//                         title="Power / Exponent"
//                       >
//                         <span className="group-hover:scale-110 transition-transform tracking-tighter">
//                           x<span className="text-[10px] align-top">n</span>
//                         </span>
//                       </button>
//                     </motion.div>
//                   </>
//                 )}
//               </AnimatePresence>

//               <button
//                 onClick={() => setShowMathMenu(!showMathMenu)}
//                 className={`w-12 h-12 flex items-center justify-center border transition-all shadow-sm rounded-full ${
//                   showMathMenu
//                     ? "bg-slate-800 border-slate-800 text-white"
//                     : "bg-slate-50 border-slate-200 hover:border-cyan-300 hover:bg-cyan-50 text-slate-600 hover:text-cyan-700"
//                 }`}
//                 title="Add Math Element"
//               >
//                 <Plus
//                   className={`w-5 h-5 transition-transform duration-300 ${
//                     showMathMenu ? "rotate-45" : "rotate-0"
//                   }`}
//                 />
//               </button>
//             </div>
//           )}

//           {isLearningMode && !isCurrentSubmitted ? (
//             <button
//               onClick={submitCurrentAnswer}
//               disabled={
//                 (!currentAnswerText.trim() &&
//                   !currentAnswerHtml.includes("inline-math")) ||
//                 isLoading
//               }
//               className="flex items-center justify-center gap-2 w-full py-3 px-6 bg-cyan-600 hover:bg-cyan-700 text-white rounded-full font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
//             >
//               {isLoading ? (
//                 <Loader2 className="w-5 h-5 animate-spin" />
//               ) : (
//                 "Submit"
//               )}
//               {!isLoading && <Send className="w-4 h-4 ml-1" />}
//             </button>
//           ) : isLastQuestion ? (
//             <button
//               onClick={finishPractice}
//               className="flex items-center justify-center gap-2 w-full py-3 px-6 bg-slate-900 hover:bg-slate-800 text-white rounded-full font-medium transition-all shadow-sm"
//             >
//               Finish Set
//               <CheckCircle2 className="w-4 h-4 ml-1" />
//             </button>
//           ) : (
//             <div className="px-4 py-2 font-medium text-slate-400 text-sm tracking-wide">
//               {currentIndex + 1} / {questions.length}
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

// import { AnimatePresence, motion } from "framer-motion";
// import katex from "katex";
// import "katex/dist/katex.min.css";
// import {
//   ArrowRight,
//   Award,
//   CheckCircle2,
//   ChevronLeft,
//   ChevronRight,
//   Clock,
//   Divide,
//   FileText,
//   List,
//   ListOrdered,
//   Loader2,
//   Play,
//   Plus,
//   Send,
//   Settings2,
//   Sigma,
//   Target,
//   XCircle,
// } from "lucide-react";
// import React, {
//   forwardRef,
//   useEffect,
//   useImperativeHandle,
//   useRef,
//   useState,
// } from "react";

// // --- MOCK DATA ---
// const SET_STATS = {
//   totalQuestions: 3,
//   totalMarks: 12,
//   estimatedMinutes: 10,
// };

// const questions = [
//   {
//     id: 1,
//     question: "Define a physical quantity.",
//     markscheme: [
//       "A measurable property",
//       "Expressed with numerical value",
//       "Includes a unit",
//       "Used to describe physical systems",
//     ],
//   },
//   {
//     id: 2,
//     question: "Explain the difference between scalar and vector quantities.",
//     markscheme: [
//       "Scalar has magnitude only",
//       "Vector has magnitude and direction",
//       "Example of scalar",
//       "Example of vector",
//     ],
//   },
//   {
//     id: 3,
//     question: "State Newton's Second Law.",
//     markscheme: [
//       "Force equals mass times acceleration",
//       "F = ma",
//       "Acceleration proportional to force",
//       "Inversely proportional to mass",
//     ],
//   },
// ];

// // --- MOCK EVALUATION LOGIC ---
// const getEvaluation = (questionId: number) => {
//   if (questionId === 1) {
//     return {
//       score: 2,
//       points: [
//         {
//           awarded: true,
//           text: "A measurable property",
//           reason: "User mentioned measurement",
//         },
//         {
//           awarded: true,
//           text: "Expressed with numerical value",
//           reason: "Numerical aspect included",
//         },
//         { awarded: false, text: "Includes a unit", reason: "Units missing" },
//         {
//           awarded: false,
//           text: "Used to describe physical systems",
//           reason: "Context missing",
//         },
//       ],
//     };
//   }
//   if (questionId === 2) {
//     return {
//       score: 0,
//       points: [
//         {
//           awarded: false,
//           text: "Scalar has magnitude only",
//           reason: "Concept missing",
//         },
//         {
//           awarded: false,
//           text: "Vector has magnitude and direction",
//           reason: "Concept missing",
//         },
//         {
//           awarded: false,
//           text: "Example of scalar",
//           reason: "No example provided",
//         },
//         {
//           awarded: false,
//           text: "Example of vector",
//           reason: "No example provided",
//         },
//       ],
//     };
//   }
//   return {
//     score: 4,
//     points: [
//       {
//         awarded: true,
//         text: "Force equals mass times acceleration",
//         reason: "Definition accurate",
//       },
//       { awarded: true, text: "F = ma", reason: "Formula present" },
//       {
//         awarded: true,
//         text: "Acceleration proportional to force",
//         reason: "Relationship correct",
//       },
//       {
//         awarded: true,
//         text: "Inversely proportional to mass",
//         reason: "Relationship correct",
//       },
//     ],
//   };
// };

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

// // --- NOTION-LIKE RICH TEXT EDITOR ---
// type MathType = "general" | "fraction" | "power";

// interface EditorRef {
//   insertMath: (type: MathType) => void;
//   insertList: (type: "bullet" | "number") => void;
// }

// const RichEditor = forwardRef<
//   EditorRef,
//   {
//     initialHtml: string;
//     onChange: (html: string, text: string) => void;
//     readOnly?: boolean;
//   }
// >(({ initialHtml, onChange, readOnly }, ref) => {
//   const editorRef = useRef<HTMLDivElement>(null);

//   const [popover, setPopover] = useState<{
//     id: string;
//     x: number;
//     y: number;
//     type: MathType;
//     latex: string;
//     num: string;
//     den: string;
//     base: string;
//     exp: string;
//   } | null>(null);

//   // Set innerHTML imperatively on mount only to prevent React from overwriting DOM
//   useEffect(() => {
//     if (editorRef.current) {
//       editorRef.current.innerHTML = initialHtml;
//     }
//   }, []); // eslint-disable-line react-hooks/exhaustive-deps

//   useImperativeHandle(ref, () => ({
//     insertMath: (type: MathType = "general") => {
//       const editorNode = editorRef.current;
//       if (!editorNode) return;

//       const sel = window.getSelection();
//       if (
//         !sel ||
//         sel.rangeCount === 0 ||
//         !editorNode.contains(sel.anchorNode)
//       ) {
//         editorNode.focus();
//         const range = document.createRange();
//         range.selectNodeContents(editorNode);
//         range.collapse(false);
//         sel?.removeAllRanges();
//         sel?.addRange(range);
//       }

//       const range = window.getSelection()!.getRangeAt(0);

//       // Create the mathematical node span
//       const span = document.createElement("span");
//       const mathId = `math-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
//       span.id = mathId;
//       span.contentEditable = "false";
//       span.className =
//         "inline-math cursor-pointer inline-block align-middle bg-slate-100 hover:bg-slate-200 px-1.5 py-0.5 rounded text-cyan-800 mx-1 border border-slate-200 transition-colors shadow-sm select-none";

//       // Initialize Dataset based on specific type
//       span.dataset.mathType = type;
//       span.dataset.latex = "";
//       span.dataset.num = "";
//       span.dataset.den = "";
//       span.dataset.base = "";
//       span.dataset.exp = "";

//       if (type === "fraction") span.innerHTML = "<i>a/b</i>";
//       else if (type === "power") span.innerHTML = "<i>xⁿ</i>";
//       else span.innerHTML = "<i>ƒ(x)</i>";

//       range.insertNode(span);

//       // Insert zero-width space after block to free the cursor
//       const zws = document.createTextNode("\u200B");
//       range.collapse(false);
//       range.insertNode(zws);
//       range.setStartAfter(zws);
//       range.setEndAfter(zws);
//       window.getSelection()!.removeAllRanges();
//       window.getSelection()!.addRange(range);

//       // Trigger popover instantly
//       const rect = span.getBoundingClientRect();
//       setPopover({
//         id: mathId,
//         x: rect.left,
//         y: rect.bottom + 8,
//         type,
//         latex: "",
//         num: "",
//         den: "",
//         base: "",
//         exp: "",
//       });

//       triggerChange();
//     },
//     insertList: (type: "bullet" | "number") => {
//       const editorNode = editorRef.current;
//       if (!editorNode) return;
//       editorNode.focus();
//       document.execCommand(
//         type === "number" ? "insertOrderedList" : "insertUnorderedList",
//         false
//       );
//       triggerChange();
//     },
//   }));

//   const triggerChange = () => {
//     if (editorRef.current) {
//       onChange(editorRef.current.innerHTML, editorRef.current.innerText);
//     }
//   };

//   const handleEditorClick = (e: React.MouseEvent) => {
//     if (readOnly) return;
//     const target = e.target as HTMLElement;
//     const mathNode = target.closest(".inline-math") as HTMLElement;

//     if (mathNode) {
//       const rect = mathNode.getBoundingClientRect();

//       // Ensure node has ID for targeted updates
//       if (!mathNode.id) {
//         mathNode.id = `math-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
//       }

//       setPopover({
//         id: mathNode.id,
//         x: rect.left,
//         y: rect.bottom + 8,
//         type: (mathNode.dataset.mathType as MathType) || "general",
//         latex: mathNode.dataset.latex || "",
//         num: mathNode.dataset.num || "",
//         den: mathNode.dataset.den || "",
//         base: mathNode.dataset.base || "",
//         exp: mathNode.dataset.exp || "",
//       });
//     }
//   };

//   const updateMathField = (
//     field: "latex" | "num" | "den" | "base" | "exp",
//     val: string
//   ) => {
//     if (!popover) return;

//     // Create updated popover state
//     const newPopover = { ...popover, [field]: val };
//     setPopover(newPopover);

//     // Find the target DOM node
//     const node = document.getElementById(popover.id);
//     if (node) {
//       node.dataset[field] = val;

//       // Calculate Combined LaTeX based on type
//       let finalLatex = "";
//       if (newPopover.type === "general") finalLatex = newPopover.latex;
//       if (newPopover.type === "fraction") {
//         if (newPopover.num || newPopover.den)
//           finalLatex = `\\frac{${newPopover.num || " "}}{${
//             newPopover.den || " "
//           }}`;
//       }
//       if (newPopover.type === "power") {
//         if (newPopover.base || newPopover.exp)
//           finalLatex = `${newPopover.base || " "}^{${newPopover.exp || " "}}`;
//       }

//       // Render out
//       if (finalLatex.trim() === "") {
//         if (newPopover.type === "fraction") node.innerHTML = "<i>a/b</i>";
//         else if (newPopover.type === "power") node.innerHTML = "<i>xⁿ</i>";
//         else node.innerHTML = "<i>ƒ(x)</i>";
//       } else {
//         node.innerHTML = safeRenderKatex(finalLatex);
//       }
//       triggerChange();
//     }
//   };

//   // Derive preview LaTeX for the Popover bottom window
//   let previewLatex = "";
//   if (popover) {
//     if (popover.type === "general") previewLatex = popover.latex;
//     if (popover.type === "fraction" && (popover.num || popover.den))
//       previewLatex = `\\frac{${popover.num || " "}}{${popover.den || " "}}`;
//     if (popover.type === "power" && (popover.base || popover.exp))
//       previewLatex = `${popover.base || " "}^{${popover.exp || " "}}`;
//   }

//   return (
//     <>
//       {/* Tailwind CSS resets lists globally. We need to add custom list styles back into the editor */}
//       <style>{`
//         .custom-editor:empty:before {
//           content: attr(data-placeholder);
//           color: #94a3b8;
//           pointer-events: none;
//         }
//         .custom-editor .katex {
//            font-size: 1.15em;
//         }
//         .custom-editor ul {
//            list-style-type: disc;
//            padding-left: 1.5rem;
//            margin-top: 0.5rem;
//            margin-bottom: 0.5rem;
//         }
//         .custom-editor ol {
//            list-style-type: decimal;
//            padding-left: 1.5rem;
//            margin-top: 0.5rem;
//            margin-bottom: 0.5rem;
//         }
//         .custom-editor li {
//            margin-bottom: 0.25rem;
//            padding-left: 0.25rem;
//         }
//       `}</style>

//       <div
//         ref={editorRef}
//         contentEditable={!readOnly}
//         suppressContentEditableWarning
//         onInput={triggerChange}
//         onClick={handleEditorClick}
//         data-placeholder="Write your answer here..."
//         className={`custom-editor w-full min-h-[12rem] p-5 bg-slate-50 text-slate-700 border border-slate-200 rounded-2xl transition-all text-lg leading-relaxed shadow-inner focus:outline-none ${
//           !readOnly
//             ? "focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
//             : "opacity-80"
//         }`}
//       />

//       {/* NOTION MATH POPOVER */}
//       {popover && (
//         <>
//           <div
//             className="fixed inset-0 z-40"
//             onClick={() => setPopover(null)}
//           />
//           <motion.div
//             initial={{ opacity: 0, y: -5 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="fixed z-50 bg-white border border-slate-200 shadow-xl rounded-xl p-4 w-[340px] flex flex-col gap-4"
//             style={{
//               top: popover.y,
//               left: Math.min(popover.x, window.innerWidth - 360),
//             }}
//           >
//             <div className="flex justify-between items-center">
//               <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
//                 {popover.type === "fraction"
//                   ? "Fraction"
//                   : popover.type === "power"
//                   ? "Power/Exponent"
//                   : "Inline Equation"}
//               </div>
//               <button
//                 onClick={() => setPopover(null)}
//                 className="text-xs px-3 py-1.5 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 rounded-md font-semibold transition-colors border border-cyan-100"
//               >
//                 Done
//               </button>
//             </div>

//             {/* CONDITIONAL INPUT FIELDS BASED ON TYPE */}
//             {popover.type === "general" && (
//               <input
//                 autoFocus
//                 value={popover.latex}
//                 onChange={(e) => updateMathField("latex", e.target.value)}
//                 onKeyDown={(e) => {
//                   if (e.key === "Enter") setPopover(null);
//                 }}
//                 placeholder="e.g. E = mc^2"
//                 className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
//               />
//             )}

//             {popover.type === "fraction" && (
//               <div className="flex flex-col gap-2">
//                 <input
//                   autoFocus
//                   value={popover.num}
//                   onChange={(e) => updateMathField("num", e.target.value)}
//                   placeholder="Numerator (Top)"
//                   className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 font-mono text-sm text-center focus:outline-none focus:ring-2 focus:ring-cyan-500"
//                 />
//                 <div className="w-full h-[2px] bg-slate-200 rounded-full my-0.5" />
//                 <input
//                   value={popover.den}
//                   onChange={(e) => updateMathField("den", e.target.value)}
//                   placeholder="Denominator (Bottom)"
//                   className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 font-mono text-sm text-center focus:outline-none focus:ring-2 focus:ring-cyan-500"
//                 />
//               </div>
//             )}

//             {popover.type === "power" && (
//               <div className="flex items-start gap-2">
//                 <input
//                   autoFocus
//                   value={popover.base}
//                   onChange={(e) => updateMathField("base", e.target.value)}
//                   placeholder="Base (x)"
//                   className="flex-1 bg-slate-50 border border-slate-200 rounded-md p-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
//                 />
//                 <input
//                   value={popover.exp}
//                   onChange={(e) => updateMathField("exp", e.target.value)}
//                   placeholder="Exp (n)"
//                   className="w-[100px] bg-slate-50 border border-slate-200 rounded-md p-2 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500 mt-[-8px] shadow-sm"
//                 />
//               </div>
//             )}

//             {/* LIVE PREVIEW WINDOW */}
//             <div className="min-h-[3rem] flex justify-center items-center bg-slate-50/50 rounded-md border border-slate-100 p-2 overflow-x-auto text-slate-800">
//               {previewLatex ? (
//                 <span
//                   dangerouslySetInnerHTML={{
//                     __html: safeRenderKatex(previewLatex),
//                   }}
//                 />
//               ) : (
//                 <span className="text-slate-400 text-sm italic">
//                   Live Preview...
//                 </span>
//               )}
//             </div>
//           </motion.div>
//         </>
//       )}
//     </>
//   );
// });
// RichEditor.displayName = "RichEditor";

// // --- MAIN COMPONENT ---
// export default function TheoryPractice() {
//   const [hasStarted, setHasStarted] = useState(false);
//   const [isCompleted, setIsCompleted] = useState(false);

//   const [useTimer, setUseTimer] = useState(true);
//   const [isLearningMode, setIsLearningMode] = useState(true);
//   const [timeLeft, setTimeLeft] = useState(SET_STATS.estimatedMinutes * 60);

//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [direction, setDirection] = useState(1);
//   const [userAnswersHtml, setUserAnswersHtml] = useState<
//     Record<number, string>
//   >({});
//   const [userAnswersText, setUserAnswersText] = useState<
//     Record<number, string>
//   >({});
//   const [submittedQuestions, setSubmittedQuestions] = useState<
//     Record<number, boolean>
//   >({});
//   const [isLoading, setIsLoading] = useState(false);

//   // Controls the expandable menu in the navbar
//   const [showMenu, setShowMenu] = useState(false);

//   const editorRef = useRef<EditorRef>(null);

//   const currentQuestion = questions[currentIndex];
//   const isLastQuestion = currentIndex === questions.length - 1;
//   const currentAnswerHtml = userAnswersHtml[currentQuestion.id] || "";
//   const currentAnswerText = userAnswersText[currentQuestion.id] || "";
//   const isCurrentSubmitted = submittedQuestions[currentQuestion.id] || false;

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

//   const handleEditorChange = (html: string, text: string) => {
//     setUserAnswersHtml((prev) => ({ ...prev, [currentQuestion.id]: html }));
//     setUserAnswersText((prev) => ({ ...prev, [currentQuestion.id]: text }));
//   };

//   const submitCurrentAnswer = () => {
//     if (!currentAnswerText.trim() && !currentAnswerHtml.includes("inline-math"))
//       return;
//     if (isLoading) return;
//     setIsLoading(true);
//     setTimeout(() => {
//       setIsLoading(false);
//       setSubmittedQuestions((prev) => ({
//         ...prev,
//         [currentQuestion.id]: true,
//       }));
//     }, 500);
//   };

//   const goNext = () => {
//     if (currentIndex < questions.length - 1) {
//       setDirection(1);
//       setCurrentIndex((prev) => prev + 1);
//       setShowMenu(false);
//     }
//   };

//   const goPrev = () => {
//     if (currentIndex > 0) {
//       setDirection(-1);
//       setCurrentIndex((prev) => prev - 1);
//       setShowMenu(false);
//     }
//   };

//   const finishPractice = () => {
//     setIsCompleted(true);
//   };

//   const insertMathAndClose = (type: MathType) => {
//     editorRef.current?.insertMath(type);
//     setShowMenu(false);
//   };

//   const insertListAndClose = (type: "bullet" | "number") => {
//     editorRef.current?.insertList(type);
//     setShowMenu(false);
//   };

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
//             Physics Theory Set #1
//           </h1>
//           <p className="text-slate-500 mb-8">
//             Test your understanding of core physical properties and laws.
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
//       (sum, q) => sum + getEvaluation(q.id).score,
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
//               const evalResult = getEvaluation(q.id);
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
//                       {q.question}
//                     </h3>
//                     <div className="px-3 py-1 bg-cyan-50 text-cyan-700 font-bold rounded-lg text-sm shrink-0">
//                       {evalResult.score} / 4
//                     </div>
//                   </div>

//                   <div
//                     className="custom-editor bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 text-slate-600"
//                     dangerouslySetInnerHTML={{
//                       __html:
//                         userAnswersHtml[q.id] ||
//                         "<span class='italic opacity-60'>No answer provided.</span>",
//                     }}
//                   />

//                   <div className="space-y-3">
//                     {evalResult.points.map((point, pIdx) => (
//                       <div
//                         key={pIdx}
//                         className="flex gap-4 items-start text-sm"
//                       >
//                         {point.awarded ? (
//                           <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
//                         ) : (
//                           <XCircle className="w-5 h-5 text-red-400 shrink-0" />
//                         )}
//                         <div>
//                           <p
//                             className={`font-medium ${
//                               point.awarded
//                                 ? "text-slate-800"
//                                 : "text-slate-500"
//                             }`}
//                           >
//                             {point.text}
//                           </p>
//                           <p
//                             className={
//                               point.awarded ? "text-green-600" : "text-red-500"
//                             }
//                           >
//                             ↳ {point.reason}
//                           </p>
//                         </div>
//                       </div>
//                     ))}
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
//         <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden border border-slate-100 flex flex-col">
//           <div className="p-8 md:p-10 flex-grow">
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
//                 <h1 className="text-2xl md:text-3xl font-medium leading-snug mb-8 text-center text-slate-900">
//                   {currentQuestion.question}
//                 </h1>

//                 {!isLearningMode || !isCurrentSubmitted ? (
//                   <div className="space-y-6">
//                     <RichEditor
//                       key={`editor-${currentQuestion.id}`}
//                       ref={editorRef}
//                       initialHtml={currentAnswerHtml}
//                       onChange={handleEditorChange}
//                     />
//                   </div>
//                 ) : (
//                   <div className="space-y-8">
//                     <div className="flex flex-col items-center justify-center py-6 bg-cyan-50/50 rounded-2xl border border-cyan-100">
//                       <span className="text-sm font-semibold text-cyan-600 uppercase tracking-widest mb-2">
//                         Score
//                       </span>
//                       <div className="text-5xl font-bold text-slate-900 flex items-baseline gap-1">
//                         {getEvaluation(currentQuestion.id).score}
//                         <span className="text-2xl text-slate-400 font-medium">
//                           / 4
//                         </span>
//                       </div>
//                     </div>

//                     <div className="space-y-4">
//                       <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
//                         Markscheme Breakdown
//                       </h3>
//                       <div className="space-y-3">
//                         {getEvaluation(currentQuestion.id).points.map(
//                           (point, idx) => (
//                             <motion.div
//                               initial={{ opacity: 0, y: 10 }}
//                               animate={{ opacity: 1, y: 0 }}
//                               transition={{ delay: idx * 0.1 + 0.1 }}
//                               key={idx}
//                               className={`p-4 rounded-xl flex gap-4 items-start border ${
//                                 point.awarded
//                                   ? "bg-green-50/30 border-green-100"
//                                   : "bg-red-50/30 border-red-100"
//                               }`}
//                             >
//                               {point.awarded ? (
//                                 <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0 mt-0.5" />
//                               ) : (
//                                 <XCircle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
//                               )}
//                               <div>
//                                 <p className="text-slate-800 font-medium mb-1">
//                                   {point.text}
//                                 </p>
//                                 <div className="flex items-center text-sm gap-2">
//                                   <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
//                                   <span
//                                     className={
//                                       point.awarded
//                                         ? "text-green-700"
//                                         : "text-red-700"
//                                     }
//                                   >
//                                     {point.reason}
//                                   </span>
//                                 </div>
//                               </div>
//                             </motion.div>
//                           )
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </motion.div>
//             </AnimatePresence>
//           </div>
//         </div>
//       </div>

//       {/* FLOATING NAVBAR */}
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

//         <div className="flex-shrink-0 flex items-center justify-center gap-2 min-w-[140px] relative">
//           {/* EXPANDABLE FAB MENU */}
//           {(!isLearningMode || !isCurrentSubmitted) && (
//             <div className="relative">
//               <AnimatePresence>
//                 {showMenu && (
//                   <>
//                     <div
//                       className="fixed inset-0 z-30"
//                       onClick={() => setShowMenu(false)}
//                     />
//                     <motion.div
//                       initial={{ opacity: 0, y: 10, scale: 0.95 }}
//                       animate={{ opacity: 1, y: 0, scale: 1 }}
//                       exit={{ opacity: 0, y: 10, scale: 0.95 }}
//                       transition={{ duration: 0.15 }}
//                       className="absolute bottom-[calc(100%+12px)] left-1/2 -translate-x-1/2 flex items-center gap-1.5 p-1.5 bg-white border border-slate-200 shadow-xl rounded-full z-40"
//                     >
//                       {/* Math Tools */}
//                       <button
//                         onClick={() => insertMathAndClose("general")}
//                         className="w-10 h-10 flex flex-col items-center justify-center bg-slate-50 hover:bg-cyan-50 border border-slate-100 hover:border-cyan-200 text-slate-600 hover:text-cyan-700 rounded-full transition-all group"
//                         title="General Equation"
//                       >
//                         <Sigma className="w-4 h-4 group-hover:scale-110 transition-transform" />
//                       </button>
//                       <button
//                         onClick={() => insertMathAndClose("fraction")}
//                         className="w-10 h-10 flex flex-col items-center justify-center bg-slate-50 hover:bg-cyan-50 border border-slate-100 hover:border-cyan-200 text-slate-600 hover:text-cyan-700 rounded-full transition-all group"
//                         title="Fraction"
//                       >
//                         <Divide className="w-4 h-4 group-hover:scale-110 transition-transform" />
//                       </button>
//                       <button
//                         onClick={() => insertMathAndClose("power")}
//                         className="w-10 h-10 flex flex-col items-center justify-center bg-slate-50 hover:bg-cyan-50 border border-slate-100 hover:border-cyan-200 text-slate-600 hover:text-cyan-700 rounded-full transition-all group font-serif italic text-sm font-bold"
//                         title="Power / Exponent"
//                       >
//                         <span className="group-hover:scale-110 transition-transform tracking-tighter">
//                           x<span className="text-[10px] align-top">n</span>
//                         </span>
//                       </button>

//                       {/* Divider */}
//                       <div className="w-px h-6 bg-slate-200 mx-1" />

//                       {/* Formatting Tools */}
//                       <button
//                         onClick={() => insertListAndClose("bullet")}
//                         className="w-10 h-10 flex flex-col items-center justify-center bg-slate-50 hover:bg-cyan-50 border border-slate-100 hover:border-cyan-200 text-slate-600 hover:text-cyan-700 rounded-full transition-all group"
//                         title="Bullet List"
//                       >
//                         <List className="w-4 h-4 group-hover:scale-110 transition-transform" />
//                       </button>
//                       <button
//                         onClick={() => insertListAndClose("number")}
//                         className="w-10 h-10 flex flex-col items-center justify-center bg-slate-50 hover:bg-cyan-50 border border-slate-100 hover:border-cyan-200 text-slate-600 hover:text-cyan-700 rounded-full transition-all group"
//                         title="Numbered List"
//                       >
//                         <ListOrdered className="w-4 h-4 group-hover:scale-110 transition-transform" />
//                       </button>
//                     </motion.div>
//                   </>
//                 )}
//               </AnimatePresence>

//               <button
//                 onClick={() => setShowMenu(!showMenu)}
//                 className={`w-12 h-12 flex items-center justify-center border transition-all shadow-sm rounded-full ${
//                   showMenu
//                     ? "bg-slate-800 border-slate-800 text-white"
//                     : "bg-slate-50 border-slate-200 hover:border-cyan-300 hover:bg-cyan-50 text-slate-600 hover:text-cyan-700"
//                 }`}
//                 title="Add Math Element"
//               >
//                 <Plus
//                   className={`w-5 h-5 transition-transform duration-300 ${
//                     showMenu ? "rotate-45" : "rotate-0"
//                   }`}
//                 />
//               </button>
//             </div>
//           )}

//           {isLearningMode && !isCurrentSubmitted ? (
//             <button
//               onClick={submitCurrentAnswer}
//               disabled={
//                 (!currentAnswerText.trim() &&
//                   !currentAnswerHtml.includes("inline-math")) ||
//                 isLoading
//               }
//               className="flex items-center justify-center gap-2 w-full py-3 px-6 bg-cyan-600 hover:bg-cyan-700 text-white rounded-full font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
//             >
//               {isLoading ? (
//                 <Loader2 className="w-5 h-5 animate-spin" />
//               ) : (
//                 "Submit"
//               )}
//               {!isLoading && <Send className="w-4 h-4 ml-1" />}
//             </button>
//           ) : isLastQuestion ? (
//             <button
//               onClick={finishPractice}
//               className="flex items-center justify-center gap-2 w-full py-3 px-6 bg-slate-900 hover:bg-slate-800 text-white rounded-full font-medium transition-all shadow-sm"
//             >
//               Finish Set
//               <CheckCircle2 className="w-4 h-4 ml-1" />
//             </button>
//           ) : (
//             <div className="px-4 py-2 font-medium text-slate-400 text-sm tracking-wide">
//               {currentIndex + 1} / {questions.length}
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

// import { AnimatePresence, motion } from "framer-motion";
// import katex from "katex";
// import "katex/dist/katex.min.css";
// import {
//   ArrowRight,
//   Award,
//   CheckCircle2,
//   ChevronLeft,
//   ChevronRight,
//   Clock,
//   Divide,
//   Eye,
//   EyeOff,
//   FileText,
//   Lightbulb,
//   List,
//   ListOrdered,
//   Loader2,
//   Play,
//   Plus,
//   Send,
//   Settings2,
//   Sigma,
//   Target,
//   XCircle,
// } from "lucide-react";
// import React, {
//   forwardRef,
//   useEffect,
//   useImperativeHandle,
//   useRef,
//   useState,
// } from "react";

// // --- MOCK DATA ---
// const SET_STATS = {
//   totalQuestions: 3,
//   totalMarks: 12,
//   estimatedMinutes: 10,
// };

// const questions = [
//   {
//     id: 1,
//     question: "Define a physical quantity.",
//     hints: [
//       "Think about what scientists actually measure in the real world.",
//       "A complete definition usually mentions two things: the value (number) and what it's measured in.",
//     ],
//     markscheme: [
//       "A measurable property",
//       "Expressed with numerical value",
//       "Includes a unit",
//       "Used to describe physical systems",
//     ],
//   },
//   {
//     id: 2,
//     question: "Explain the difference between scalar and vector quantities.",
//     hints: [
//       "One of them only tells you 'how much', while the other tells you 'how much' AND 'which way'.",
//       "Providing one example for each will usually secure full marks in this type of question.",
//     ],
//     markscheme: [
//       "Scalar has magnitude only",
//       "Vector has magnitude and direction",
//       "Example of scalar",
//       "Example of vector",
//     ],
//   },
//   {
//     id: 3,
//     question: "State Newton's Second Law.",
//     // No hints for Q3 as requested
//     hints: [],
//     markscheme: [
//       "Force equals mass times acceleration",
//       "F = ma",
//       "Acceleration proportional to force",
//       "Inversely proportional to mass",
//     ],
//   },
// ];

// // --- MOCK EVALUATION LOGIC ---
// const getEvaluation = (questionId: number) => {
//   if (questionId === 1) {
//     return {
//       score: 2,
//       points: [
//         {
//           awarded: true,
//           text: "A measurable property",
//           reason: "User mentioned measurement",
//         },
//         {
//           awarded: true,
//           text: "Expressed with numerical value",
//           reason: "Numerical aspect included",
//         },
//         { awarded: false, text: "Includes a unit", reason: "Units missing" },
//         {
//           awarded: false,
//           text: "Used to describe physical systems",
//           reason: "Context missing",
//         },
//       ],
//     };
//   }
//   if (questionId === 2) {
//     return {
//       score: 0,
//       points: [
//         {
//           awarded: false,
//           text: "Scalar has magnitude only",
//           reason: "Concept missing",
//         },
//         {
//           awarded: false,
//           text: "Vector has magnitude and direction",
//           reason: "Concept missing",
//         },
//         {
//           awarded: false,
//           text: "Example of scalar",
//           reason: "No example provided",
//         },
//         {
//           awarded: false,
//           text: "Example of vector",
//           reason: "No example provided",
//         },
//       ],
//     };
//   }
//   return {
//     score: 4,
//     points: [
//       {
//         awarded: true,
//         text: "Force equals mass times acceleration",
//         reason: "Definition accurate",
//       },
//       { awarded: true, text: "F = ma", reason: "Formula present" },
//       {
//         awarded: true,
//         text: "Acceleration proportional to force",
//         reason: "Relationship correct",
//       },
//       {
//         awarded: true,
//         text: "Inversely proportional to mass",
//         reason: "Relationship correct",
//       },
//     ],
//   };
// };

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

// // --- NOTION-LIKE RICH TEXT EDITOR ---
// type MathType = "general" | "fraction" | "power";

// interface EditorRef {
//   insertMath: (type: MathType) => void;
//   insertList: (type: "bullet" | "number") => void;
// }

// const RichEditor = forwardRef<
//   EditorRef,
//   {
//     initialHtml: string;
//     onChange: (html: string, text: string) => void;
//     readOnly?: boolean;
//   }
// >(({ initialHtml, onChange, readOnly }, ref) => {
//   const editorRef = useRef<HTMLDivElement>(null);

//   const [popover, setPopover] = useState<{
//     id: string;
//     x: number;
//     y: number;
//     type: MathType;
//     latex: string;
//     num: string;
//     den: string;
//     base: string;
//     exp: string;
//   } | null>(null);

//   useEffect(() => {
//     if (editorRef.current) {
//       editorRef.current.innerHTML = initialHtml;
//     }
//   }, []); // eslint-disable-line react-hooks/exhaustive-deps

//   useImperativeHandle(ref, () => ({
//     insertMath: (type: MathType = "general") => {
//       const editorNode = editorRef.current;
//       if (!editorNode) return;

//       const sel = window.getSelection();
//       if (
//         !sel ||
//         sel.rangeCount === 0 ||
//         !editorNode.contains(sel.anchorNode)
//       ) {
//         editorNode.focus();
//         const range = document.createRange();
//         range.selectNodeContents(editorNode);
//         range.collapse(false);
//         sel?.removeAllRanges();
//         sel?.addRange(range);
//       }

//       const range = window.getSelection()!.getRangeAt(0);

//       const span = document.createElement("span");
//       const mathId = `math-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
//       span.id = mathId;
//       span.contentEditable = "false";
//       span.className =
//         "inline-math cursor-pointer inline-block align-middle bg-slate-100 hover:bg-slate-200 px-1.5 py-0.5 rounded text-cyan-800 mx-1 border border-slate-200 transition-colors shadow-sm select-none";

//       span.dataset.mathType = type;
//       span.dataset.latex = "";
//       span.dataset.num = "";
//       span.dataset.den = "";
//       span.dataset.base = "";
//       span.dataset.exp = "";

//       if (type === "fraction") span.innerHTML = "<i>a/b</i>";
//       else if (type === "power") span.innerHTML = "<i>xⁿ</i>";
//       else span.innerHTML = "<i>ƒ(x)</i>";

//       range.insertNode(span);

//       const zws = document.createTextNode("\u200B");
//       range.collapse(false);
//       range.insertNode(zws);
//       range.setStartAfter(zws);
//       range.setEndAfter(zws);
//       window.getSelection()!.removeAllRanges();
//       window.getSelection()!.addRange(range);

//       const rect = span.getBoundingClientRect();
//       setPopover({
//         id: mathId,
//         x: rect.left,
//         y: rect.bottom + 8,
//         type,
//         latex: "",
//         num: "",
//         den: "",
//         base: "",
//         exp: "",
//       });

//       triggerChange();
//     },
//     insertList: (type: "bullet" | "number") => {
//       const editorNode = editorRef.current;
//       if (!editorNode) return;
//       editorNode.focus();
//       document.execCommand(
//         type === "number" ? "insertOrderedList" : "insertUnorderedList",
//         false
//       );
//       triggerChange();
//     },
//   }));

//   const triggerChange = () => {
//     if (editorRef.current) {
//       onChange(editorRef.current.innerHTML, editorRef.current.innerText);
//     }
//   };

//   const handleEditorClick = (e: React.MouseEvent) => {
//     if (readOnly) return;
//     const target = e.target as HTMLElement;
//     const mathNode = target.closest(".inline-math") as HTMLElement;

//     if (mathNode) {
//       const rect = mathNode.getBoundingClientRect();

//       if (!mathNode.id) {
//         mathNode.id = `math-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
//       }

//       setPopover({
//         id: mathNode.id,
//         x: rect.left,
//         y: rect.bottom + 8,
//         type: (mathNode.dataset.mathType as MathType) || "general",
//         latex: mathNode.dataset.latex || "",
//         num: mathNode.dataset.num || "",
//         den: mathNode.dataset.den || "",
//         base: mathNode.dataset.base || "",
//         exp: mathNode.dataset.exp || "",
//       });
//     }
//   };

//   const updateMathField = (
//     field: "latex" | "num" | "den" | "base" | "exp",
//     val: string
//   ) => {
//     if (!popover) return;

//     const newPopover = { ...popover, [field]: val };
//     setPopover(newPopover);

//     const node = document.getElementById(popover.id);
//     if (node) {
//       node.dataset[field] = val;

//       let finalLatex = "";
//       if (newPopover.type === "general") finalLatex = newPopover.latex;
//       if (newPopover.type === "fraction") {
//         if (newPopover.num || newPopover.den)
//           finalLatex = `\\frac{${newPopover.num || " "}}{${
//             newPopover.den || " "
//           }}`;
//       }
//       if (newPopover.type === "power") {
//         if (newPopover.base || newPopover.exp)
//           finalLatex = `${newPopover.base || " "}^{${newPopover.exp || " "}}`;
//       }

//       if (finalLatex.trim() === "") {
//         if (newPopover.type === "fraction") node.innerHTML = "<i>a/b</i>";
//         else if (newPopover.type === "power") node.innerHTML = "<i>xⁿ</i>";
//         else node.innerHTML = "<i>ƒ(x)</i>";
//       } else {
//         node.innerHTML = safeRenderKatex(finalLatex);
//       }
//       triggerChange();
//     }
//   };

//   let previewLatex = "";
//   if (popover) {
//     if (popover.type === "general") previewLatex = popover.latex;
//     if (popover.type === "fraction" && (popover.num || popover.den))
//       previewLatex = `\\frac{${popover.num || " "}}{${popover.den || " "}}`;
//     if (popover.type === "power" && (popover.base || popover.exp))
//       previewLatex = `${popover.base || " "}^{${popover.exp || " "}}`;
//   }

//   return (
//     <>
//       <style>{`
//         .custom-editor:empty:before {
//           content: attr(data-placeholder);
//           color: #94a3b8;
//           pointer-events: none;
//         }
//         .custom-editor .katex {
//            font-size: 1.15em;
//         }
//         .custom-editor ul {
//            list-style-type: disc;
//            padding-left: 1.5rem;
//            margin-top: 0.5rem;
//            margin-bottom: 0.5rem;
//         }
//         .custom-editor ol {
//            list-style-type: decimal;
//            padding-left: 1.5rem;
//            margin-top: 0.5rem;
//            margin-bottom: 0.5rem;
//         }
//         .custom-editor li {
//            margin-bottom: 0.25rem;
//            padding-left: 0.25rem;
//         }
//       `}</style>

//       <div
//         ref={editorRef}
//         contentEditable={!readOnly}
//         suppressContentEditableWarning
//         onInput={triggerChange}
//         onClick={handleEditorClick}
//         data-placeholder="Write your answer here..."
//         className={`custom-editor w-full min-h-[14rem] p-5 pb-10 bg-slate-50 text-slate-700 border border-slate-200 rounded-2xl transition-all text-lg leading-relaxed shadow-inner focus:outline-none ${
//           !readOnly
//             ? "focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
//             : "opacity-80"
//         }`}
//       />

//       {/* NOTION MATH POPOVER */}
//       {popover && (
//         <>
//           <div
//             className="fixed inset-0 z-40"
//             onClick={() => setPopover(null)}
//           />
//           <motion.div
//             initial={{ opacity: 0, y: -5 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="fixed z-50 bg-white border border-slate-200 shadow-xl rounded-xl p-4 w-[340px] flex flex-col gap-4"
//             style={{
//               top: popover.y,
//               left: Math.min(popover.x, window.innerWidth - 360),
//             }}
//           >
//             <div className="flex justify-between items-center">
//               <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
//                 {popover.type === "fraction"
//                   ? "Fraction"
//                   : popover.type === "power"
//                   ? "Power/Exponent"
//                   : "Inline Equation"}
//               </div>
//               <button
//                 onClick={() => setPopover(null)}
//                 className="text-xs px-3 py-1.5 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 rounded-md font-semibold transition-colors border border-cyan-100"
//               >
//                 Done
//               </button>
//             </div>

//             {popover.type === "general" && (
//               <input
//                 autoFocus
//                 value={popover.latex}
//                 onChange={(e) => updateMathField("latex", e.target.value)}
//                 onKeyDown={(e) => {
//                   if (e.key === "Enter") setPopover(null);
//                 }}
//                 placeholder="e.g. E = mc^2"
//                 className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
//               />
//             )}

//             {popover.type === "fraction" && (
//               <div className="flex flex-col gap-2">
//                 <input
//                   autoFocus
//                   value={popover.num}
//                   onChange={(e) => updateMathField("num", e.target.value)}
//                   placeholder="Numerator (Top)"
//                   className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 font-mono text-sm text-center focus:outline-none focus:ring-2 focus:ring-cyan-500"
//                 />
//                 <div className="w-full h-[2px] bg-slate-200 rounded-full my-0.5" />
//                 <input
//                   value={popover.den}
//                   onChange={(e) => updateMathField("den", e.target.value)}
//                   placeholder="Denominator (Bottom)"
//                   className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 font-mono text-sm text-center focus:outline-none focus:ring-2 focus:ring-cyan-500"
//                 />
//               </div>
//             )}

//             {popover.type === "power" && (
//               <div className="flex items-start gap-2">
//                 <input
//                   autoFocus
//                   value={popover.base}
//                   onChange={(e) => updateMathField("base", e.target.value)}
//                   placeholder="Base (x)"
//                   className="flex-1 bg-slate-50 border border-slate-200 rounded-md p-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
//                 />
//                 <input
//                   value={popover.exp}
//                   onChange={(e) => updateMathField("exp", e.target.value)}
//                   placeholder="Exp (n)"
//                   className="w-[100px] bg-slate-50 border border-slate-200 rounded-md p-2 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500 mt-[-8px] shadow-sm"
//                 />
//               </div>
//             )}

//             <div className="min-h-[3rem] flex justify-center items-center bg-slate-50/50 rounded-md border border-slate-100 p-2 overflow-x-auto text-slate-800">
//               {previewLatex ? (
//                 <span
//                   dangerouslySetInnerHTML={{
//                     __html: safeRenderKatex(previewLatex),
//                   }}
//                 />
//               ) : (
//                 <span className="text-slate-400 text-sm italic">
//                   Live Preview...
//                 </span>
//               )}
//             </div>
//           </motion.div>
//         </>
//       )}
//     </>
//   );
// });
// RichEditor.displayName = "RichEditor";

// // --- MAIN COMPONENT ---
// export default function TheoryPractice() {
//   const [hasStarted, setHasStarted] = useState(false);
//   const [isCompleted, setIsCompleted] = useState(false);

//   const [useTimer, setUseTimer] = useState(true);
//   const [isLearningMode, setIsLearningMode] = useState(true);
//   const [timeLeft, setTimeLeft] = useState(SET_STATS.estimatedMinutes * 60);

//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [direction, setDirection] = useState(1);
//   const [userAnswersHtml, setUserAnswersHtml] = useState<
//     Record<number, string>
//   >({});
//   const [userAnswersText, setUserAnswersText] = useState<
//     Record<number, string>
//   >({});
//   const [submittedQuestions, setSubmittedQuestions] = useState<
//     Record<number, boolean>
//   >({});
//   const [isLoading, setIsLoading] = useState(false);

//   // UI Controls
//   const [showMenu, setShowMenu] = useState(false);
//   const [showMarkschemePreview, setShowMarkschemePreview] = useState(false);
//   const [showHintPopover, setShowHintPopover] = useState(false);
//   const [revealedHints, setRevealedHints] = useState(1);

//   const editorRef = useRef<EditorRef>(null);

//   const currentQuestion = questions[currentIndex];
//   const isLastQuestion = currentIndex === questions.length - 1;
//   const currentAnswerHtml = userAnswersHtml[currentQuestion.id] || "";
//   const currentAnswerText = userAnswersText[currentQuestion.id] || "";
//   const isCurrentSubmitted = submittedQuestions[currentQuestion.id] || false;

//   // Derive word count
//   const wordCount = currentAnswerText.trim()
//     ? currentAnswerText
//         .trim()
//         .split(/\s+/)
//         .filter((w) => w.length > 0).length
//     : 0;

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

//   const handleEditorChange = (html: string, text: string) => {
//     setUserAnswersHtml((prev) => ({ ...prev, [currentQuestion.id]: html }));
//     setUserAnswersText((prev) => ({ ...prev, [currentQuestion.id]: text }));
//   };

//   const submitCurrentAnswer = () => {
//     if (!currentAnswerText.trim() && !currentAnswerHtml.includes("inline-math"))
//       return;
//     if (isLoading) return;
//     setIsLoading(true);
//     setTimeout(() => {
//       setIsLoading(false);
//       setSubmittedQuestions((prev) => ({
//         ...prev,
//         [currentQuestion.id]: true,
//       }));
//     }, 500);
//   };

//   const resetHelpers = () => {
//     setShowMarkschemePreview(false);
//     setShowHintPopover(false);
//     setRevealedHints(1);
//     setShowMenu(false);
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
//     setIsCompleted(true);
//   };

//   const insertMathAndClose = (type: MathType) => {
//     editorRef.current?.insertMath(type);
//     setShowMenu(false);
//   };

//   const insertListAndClose = (type: "bullet" | "number") => {
//     editorRef.current?.insertList(type);
//     setShowMenu(false);
//   };

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
//             Physics Theory Set #1
//           </h1>
//           <p className="text-slate-500 mb-8">
//             Test your understanding of core physical properties and laws.
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
//       (sum, q) => sum + getEvaluation(q.id).score,
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
//               const evalResult = getEvaluation(q.id);
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
//                       {q.question}
//                     </h3>
//                     <div className="px-3 py-1 bg-cyan-50 text-cyan-700 font-bold rounded-lg text-sm shrink-0">
//                       {evalResult.score} / 4
//                     </div>
//                   </div>

//                   <div
//                     className="custom-editor bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 text-slate-600"
//                     dangerouslySetInnerHTML={{
//                       __html:
//                         userAnswersHtml[q.id] ||
//                         "<span class='italic opacity-60'>No answer provided.</span>",
//                     }}
//                   />

//                   <div className="space-y-3">
//                     {evalResult.points.map((point, pIdx) => (
//                       <div
//                         key={pIdx}
//                         className="flex gap-4 items-start text-sm"
//                       >
//                         {point.awarded ? (
//                           <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
//                         ) : (
//                           <XCircle className="w-5 h-5 text-red-400 shrink-0" />
//                         )}
//                         <div>
//                           <p
//                             className={`font-medium ${
//                               point.awarded
//                                 ? "text-slate-800"
//                                 : "text-slate-500"
//                             }`}
//                           >
//                             {point.text}
//                           </p>
//                           <p
//                             className={
//                               point.awarded ? "text-green-600" : "text-red-500"
//                             }
//                           >
//                             ↳ {point.reason}
//                           </p>
//                         </div>
//                       </div>
//                     ))}
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
//                 <h1 className="text-2xl md:text-3xl font-medium leading-snug text-slate-900 mb-6">
//                   {currentQuestion.question}
//                 </h1>

//                 {!isLearningMode || !isCurrentSubmitted ? (
//                   <div className="space-y-4">
//                     {/* HELPER TOOLBAR (Markscheme Preview & Hints) */}
//                     <div className="flex justify-between items-center relative z-20">
//                       {/* Left: Markscheme Preview Toggle */}
//                       {isLearningMode && (
//                         <button
//                           onClick={() =>
//                             setShowMarkschemePreview(!showMarkschemePreview)
//                           }
//                           className={`flex items-center gap-2 text-sm font-semibold transition-colors ${
//                             showMarkschemePreview
//                               ? "text-cyan-600"
//                               : "text-slate-400 hover:text-cyan-600"
//                           }`}
//                         >
//                           {showMarkschemePreview ? (
//                             <EyeOff className="w-4 h-4" />
//                           ) : (
//                             <Eye className="w-4 h-4" />
//                           )}
//                           {showMarkschemePreview
//                             ? "Hide Markscheme"
//                             : "Preview Markscheme"}
//                         </button>
//                       )}
//                       {!isLearningMode && <div />}{" "}
//                       {/* Spacer if learning mode is off */}
//                       {/* Right: Hint Button & Popover */}
//                       {currentQuestion.hints &&
//                         currentQuestion.hints.length > 0 && (
//                           <div className="relative">
//                             <button
//                               onClick={() =>
//                                 setShowHintPopover(!showHintPopover)
//                               }
//                               className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors border ${
//                                 showHintPopover || revealedHints > 1
//                                   ? "bg-amber-50 text-amber-600 border-amber-200 shadow-sm"
//                                   : "bg-white text-slate-400 border-slate-200 hover:text-amber-500 hover:border-amber-200"
//                               }`}
//                             >
//                               <Lightbulb
//                                 className={`w-4 h-4 ${
//                                   showHintPopover || revealedHints > 1
//                                     ? "fill-amber-100"
//                                     : ""
//                                 }`}
//                               />
//                               Hints {revealedHints > 1 && `(${revealedHints})`}
//                             </button>

//                             {/* Hint Popover Dropdown */}
//                             <AnimatePresence>
//                               {showHintPopover && (
//                                 <>
//                                   <div
//                                     className="fixed inset-0 z-30"
//                                     onClick={() => setShowHintPopover(false)}
//                                   />
//                                   <motion.div
//                                     initial={{ opacity: 0, y: 5, scale: 0.95 }}
//                                     animate={{ opacity: 1, y: 0, scale: 1 }}
//                                     exit={{ opacity: 0, y: 5, scale: 0.95 }}
//                                     transition={{ duration: 0.15 }}
//                                     className="absolute right-0 top-[calc(100%+8px)] w-72 md:w-80 bg-white border border-slate-200 shadow-xl rounded-xl p-4 z-40"
//                                   >
//                                     <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">
//                                       Available Hints
//                                     </div>
//                                     <div className="space-y-2">
//                                       {currentQuestion.hints
//                                         .slice(0, revealedHints)
//                                         .map((hint, idx) => (
//                                           <motion.div
//                                             initial={{ opacity: 0, x: -5 }}
//                                             animate={{ opacity: 1, x: 0 }}
//                                             key={idx}
//                                             className="p-3 bg-amber-50/80 rounded-lg text-sm text-amber-900 border border-amber-100/50 leading-relaxed"
//                                           >
//                                             {hint}
//                                           </motion.div>
//                                         ))}
//                                     </div>
//                                     {revealedHints <
//                                       currentQuestion.hints.length && (
//                                       <button
//                                         onClick={() =>
//                                           setRevealedHints((prev) => prev + 1)
//                                         }
//                                         className="mt-3 w-full py-2 bg-slate-50 hover:bg-amber-50 text-xs font-bold text-slate-500 hover:text-amber-600 border border-slate-200 hover:border-amber-200 rounded-lg transition-colors"
//                                       >
//                                         Reveal Next Hint
//                                       </button>
//                                     )}
//                                   </motion.div>
//                                 </>
//                               )}
//                             </AnimatePresence>
//                           </div>
//                         )}
//                     </div>

//                     {/* MARKSCHEME PREVIEW DRAWER */}
//                     <AnimatePresence>
//                       {showMarkschemePreview && (
//                         <motion.div
//                           initial={{ height: 0, opacity: 0 }}
//                           animate={{ height: "auto", opacity: 1 }}
//                           exit={{ height: 0, opacity: 0 }}
//                           className="overflow-hidden"
//                         >
//                           <div className="p-5 bg-cyan-50/50 border border-cyan-100 rounded-2xl mb-2">
//                             <div className="text-[10px] font-bold text-cyan-600 uppercase tracking-wider mb-3">
//                               Required Points (
//                               {currentQuestion.markscheme.length})
//                             </div>
//                             <ul className="list-disc pl-5 space-y-1">
//                               {currentQuestion.markscheme.map((point, idx) => (
//                                 <li
//                                   key={idx}
//                                   className="text-sm text-slate-700"
//                                 >
//                                   {point}
//                                 </li>
//                               ))}
//                             </ul>
//                           </div>
//                         </motion.div>
//                       )}
//                     </AnimatePresence>

//                     {/* EDITOR */}
//                     <div className="relative">
//                       <RichEditor
//                         key={`editor-${currentQuestion.id}`}
//                         ref={editorRef}
//                         initialHtml={currentAnswerHtml}
//                         onChange={handleEditorChange}
//                       />
//                       {/* WORD COUNT INDICATOR */}
//                       <div className="absolute bottom-4 right-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest pointer-events-none">
//                         {wordCount} words
//                       </div>
//                     </div>
//                   </div>
//                 ) : (
//                   <div className="space-y-8 mt-4">
//                     <div className="flex flex-col items-center justify-center py-6 bg-cyan-50/50 rounded-2xl border border-cyan-100">
//                       <span className="text-sm font-semibold text-cyan-600 uppercase tracking-widest mb-2">
//                         Score
//                       </span>
//                       <div className="text-5xl font-bold text-slate-900 flex items-baseline gap-1">
//                         {getEvaluation(currentQuestion.id).score}
//                         <span className="text-2xl text-slate-400 font-medium">
//                           / 4
//                         </span>
//                       </div>
//                     </div>

//                     <div className="space-y-4">
//                       <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
//                         Markscheme Breakdown
//                       </h3>
//                       <div className="space-y-3">
//                         {getEvaluation(currentQuestion.id).points.map(
//                           (point, idx) => (
//                             <motion.div
//                               initial={{ opacity: 0, y: 10 }}
//                               animate={{ opacity: 1, y: 0 }}
//                               transition={{ delay: idx * 0.1 + 0.1 }}
//                               key={idx}
//                               className={`p-4 rounded-xl flex gap-4 items-start border ${
//                                 point.awarded
//                                   ? "bg-green-50/30 border-green-100"
//                                   : "bg-red-50/30 border-red-100"
//                               }`}
//                             >
//                               {point.awarded ? (
//                                 <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0 mt-0.5" />
//                               ) : (
//                                 <XCircle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
//                               )}
//                               <div>
//                                 <p className="text-slate-800 font-medium mb-1">
//                                   {point.text}
//                                 </p>
//                                 <div className="flex items-center text-sm gap-2">
//                                   <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
//                                   <span
//                                     className={
//                                       point.awarded
//                                         ? "text-green-700"
//                                         : "text-red-700"
//                                     }
//                                   >
//                                     {point.reason}
//                                   </span>
//                                 </div>
//                               </div>
//                             </motion.div>
//                           )
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </motion.div>
//             </AnimatePresence>
//           </div>
//         </div>
//       </div>

//       {/* FLOATING NAVBAR */}
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

//         <div className="flex-shrink-0 flex items-center justify-center gap-2 min-w-[140px] relative">
//           {/* EXPANDABLE FAB MENU */}
//           {(!isLearningMode || !isCurrentSubmitted) && (
//             <div className="relative">
//               <AnimatePresence>
//                 {showMenu && (
//                   <>
//                     <div
//                       className="fixed inset-0 z-30"
//                       onClick={() => setShowMenu(false)}
//                     />
//                     <motion.div
//                       initial={{ opacity: 0, y: 10, scale: 0.95 }}
//                       animate={{ opacity: 1, y: 0, scale: 1 }}
//                       exit={{ opacity: 0, y: 10, scale: 0.95 }}
//                       transition={{ duration: 0.15 }}
//                       className="absolute bottom-[calc(100%+12px)] left-1/2 -translate-x-1/2 flex items-center gap-1.5 p-1.5 bg-white border border-slate-200 shadow-xl rounded-full z-40"
//                     >
//                       {/* Math Tools */}
//                       <button
//                         onClick={() => insertMathAndClose("general")}
//                         className="w-10 h-10 flex flex-col items-center justify-center bg-slate-50 hover:bg-cyan-50 border border-slate-100 hover:border-cyan-200 text-slate-600 hover:text-cyan-700 rounded-full transition-all group"
//                         title="General Equation"
//                       >
//                         <Sigma className="w-4 h-4 group-hover:scale-110 transition-transform" />
//                       </button>
//                       <button
//                         onClick={() => insertMathAndClose("fraction")}
//                         className="w-10 h-10 flex flex-col items-center justify-center bg-slate-50 hover:bg-cyan-50 border border-slate-100 hover:border-cyan-200 text-slate-600 hover:text-cyan-700 rounded-full transition-all group"
//                         title="Fraction"
//                       >
//                         <Divide className="w-4 h-4 group-hover:scale-110 transition-transform" />
//                       </button>
//                       <button
//                         onClick={() => insertMathAndClose("power")}
//                         className="w-10 h-10 flex flex-col items-center justify-center bg-slate-50 hover:bg-cyan-50 border border-slate-100 hover:border-cyan-200 text-slate-600 hover:text-cyan-700 rounded-full transition-all group font-serif italic text-sm font-bold"
//                         title="Power / Exponent"
//                       >
//                         <span className="group-hover:scale-110 transition-transform tracking-tighter">
//                           x<span className="text-[10px] align-top">n</span>
//                         </span>
//                       </button>

//                       {/* Divider */}
//                       <div className="w-px h-6 bg-slate-200 mx-1" />

//                       {/* Formatting Tools */}
//                       <button
//                         onClick={() => insertListAndClose("bullet")}
//                         className="w-10 h-10 flex flex-col items-center justify-center bg-slate-50 hover:bg-cyan-50 border border-slate-100 hover:border-cyan-200 text-slate-600 hover:text-cyan-700 rounded-full transition-all group"
//                         title="Bullet List"
//                       >
//                         <List className="w-4 h-4 group-hover:scale-110 transition-transform" />
//                       </button>
//                       <button
//                         onClick={() => insertListAndClose("number")}
//                         className="w-10 h-10 flex flex-col items-center justify-center bg-slate-50 hover:bg-cyan-50 border border-slate-100 hover:border-cyan-200 text-slate-600 hover:text-cyan-700 rounded-full transition-all group"
//                         title="Numbered List"
//                       >
//                         <ListOrdered className="w-4 h-4 group-hover:scale-110 transition-transform" />
//                       </button>
//                     </motion.div>
//                   </>
//                 )}
//               </AnimatePresence>

//               <button
//                 onClick={() => setShowMenu(!showMenu)}
//                 className={`w-12 h-12 flex items-center justify-center border transition-all shadow-sm rounded-full ${
//                   showMenu
//                     ? "bg-slate-800 border-slate-800 text-white"
//                     : "bg-slate-50 border-slate-200 hover:border-cyan-300 hover:bg-cyan-50 text-slate-600 hover:text-cyan-700"
//                 }`}
//                 title="Add Math Element"
//               >
//                 <Plus
//                   className={`w-5 h-5 transition-transform duration-300 ${
//                     showMenu ? "rotate-45" : "rotate-0"
//                   }`}
//                 />
//               </button>
//             </div>
//           )}

//           {isLearningMode && !isCurrentSubmitted ? (
//             <button
//               onClick={submitCurrentAnswer}
//               disabled={
//                 (!currentAnswerText.trim() &&
//                   !currentAnswerHtml.includes("inline-math")) ||
//                 isLoading
//               }
//               className="flex items-center justify-center gap-2 w-full py-3 px-6 bg-cyan-600 hover:bg-cyan-700 text-white rounded-full font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
//             >
//               {isLoading ? (
//                 <Loader2 className="w-5 h-5 animate-spin" />
//               ) : (
//                 "Submit"
//               )}
//               {!isLoading && <Send className="w-4 h-4 ml-1" />}
//             </button>
//           ) : isLastQuestion ? (
//             <button
//               onClick={finishPractice}
//               className="flex items-center justify-center gap-2 w-full py-3 px-6 bg-slate-900 hover:bg-slate-800 text-white rounded-full font-medium transition-all shadow-sm"
//             >
//               Finish Set
//               <CheckCircle2 className="w-4 h-4 ml-1" />
//             </button>
//           ) : (
//             <div className="px-4 py-2 font-medium text-slate-400 text-sm tracking-wide">
//               {currentIndex + 1} / {questions.length}
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

// import { AnimatePresence, motion } from "framer-motion";
// import katex from "katex";
// import "katex/dist/katex.min.css";
// import {
//   ArrowRight,
//   Award,
//   CheckCircle2,
//   ChevronLeft,
//   ChevronRight,
//   Clock,
//   Divide,
//   Eye,
//   EyeOff,
//   FileText,
//   GripHorizontal,
//   Info,
//   Lightbulb,
//   List,
//   ListOrdered,
//   Loader2,
//   Play,
//   Plus,
//   Send,
//   Settings2,
//   Sigma,
//   Target,
//   X,
//   XCircle,
// } from "lucide-react";
// import React, {
//   forwardRef,
//   useEffect,
//   useImperativeHandle,
//   useRef,
//   useState,
// } from "react";

// // --- MOCK DATA ---
// const SET_STATS = {
//   totalQuestions: 3,
//   totalMarks: 12,
//   estimatedMinutes: 10,
// };

// const questions = [
//   {
//     id: 1,
//     question: "Define a physical quantity.",
//     hints: [
//       "Think about what scientists actually measure in the real world.",
//       "A complete definition usually mentions two things: the value (number) and what it's measured in.",
//     ],
//     markscheme: [
//       "A measurable property",
//       "Expressed with numerical value",
//       "Includes a unit",
//       "Used to describe physical systems",
//     ],
//   },
//   {
//     id: 2,
//     question: "Explain the difference between scalar and vector quantities.",
//     hints: [
//       "One of them only tells you 'how much', while the other tells you 'how much' AND 'which way'.",
//       "Providing one example for each will usually secure full marks in this type of question.",
//     ],
//     markscheme: [
//       "Scalar has magnitude only",
//       "Vector has magnitude and direction",
//       "Example of scalar",
//       "Example of vector",
//     ],
//   },
//   {
//     id: 3,
//     question: "State Newton's Second Law.",
//     hints: [],
//     markscheme: [
//       "Force equals mass times acceleration",
//       "F = ma",
//       "Acceleration proportional to force",
//       "Inversely proportional to mass",
//     ],
//   },
// ];

// // --- MOCK EVALUATION LOGIC ---
// const getEvaluation = (questionId: number) => {
//   if (questionId === 1) {
//     return {
//       score: 2,
//       points: [
//         {
//           awarded: true,
//           text: "A measurable property",
//           reason: "User mentioned measurement",
//         },
//         {
//           awarded: true,
//           text: "Expressed with numerical value",
//           reason: "Numerical aspect included",
//         },
//         { awarded: false, text: "Includes a unit", reason: "Units missing" },
//         {
//           awarded: false,
//           text: "Used to describe physical systems",
//           reason: "Context missing",
//         },
//       ],
//     };
//   }
//   if (questionId === 2) {
//     return {
//       score: 0,
//       points: [
//         {
//           awarded: false,
//           text: "Scalar has magnitude only",
//           reason: "Concept missing",
//         },
//         {
//           awarded: false,
//           text: "Vector has magnitude and direction",
//           reason: "Concept missing",
//         },
//         {
//           awarded: false,
//           text: "Example of scalar",
//           reason: "No example provided",
//         },
//         {
//           awarded: false,
//           text: "Example of vector",
//           reason: "No example provided",
//         },
//       ],
//     };
//   }
//   return {
//     score: 4,
//     points: [
//       {
//         awarded: true,
//         text: "Force equals mass times acceleration",
//         reason: "Definition accurate",
//       },
//       { awarded: true, text: "F = ma", reason: "Formula present" },
//       {
//         awarded: true,
//         text: "Acceleration proportional to force",
//         reason: "Relationship correct",
//       },
//       {
//         awarded: true,
//         text: "Inversely proportional to mass",
//         reason: "Relationship correct",
//       },
//     ],
//   };
// };

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

// const MathInline = ({ latex }: { latex: string }) => (
//   <span dangerouslySetInnerHTML={{ __html: safeRenderKatex(latex) }} />
// );

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

// // --- NOTION-LIKE RICH TEXT EDITOR ---
// type MathType = "general" | "fraction" | "power";

// interface EditorRef {
//   insertMath: (type: MathType) => void;
//   insertList: (type: "bullet" | "number") => void;
// }

// const RichEditor = forwardRef<
//   EditorRef,
//   {
//     initialHtml: string;
//     onChange: (html: string, text: string) => void;
//     readOnly?: boolean;
//   }
// >(({ initialHtml, onChange, readOnly }, ref) => {
//   const editorRef = useRef<HTMLDivElement>(null);

//   const [popover, setPopover] = useState<{
//     id: string;
//     x: number;
//     y: number;
//     type: MathType;
//     latex: string;
//     num: string;
//     den: string;
//     base: string;
//     exp: string;
//   } | null>(null);

//   useEffect(() => {
//     if (editorRef.current) {
//       editorRef.current.innerHTML = initialHtml;
//     }
//   }, []); // eslint-disable-line react-hooks/exhaustive-deps

//   useImperativeHandle(ref, () => ({
//     insertMath: (type: MathType = "general") => {
//       const editorNode = editorRef.current;
//       if (!editorNode) return;

//       const sel = window.getSelection();
//       if (
//         !sel ||
//         sel.rangeCount === 0 ||
//         !editorNode.contains(sel.anchorNode)
//       ) {
//         editorNode.focus();
//         const range = document.createRange();
//         range.selectNodeContents(editorNode);
//         range.collapse(false);
//         sel?.removeAllRanges();
//         sel?.addRange(range);
//       }

//       const range = window.getSelection()!.getRangeAt(0);

//       const span = document.createElement("span");
//       const mathId = `math-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
//       span.id = mathId;
//       span.contentEditable = "false";
//       span.className =
//         "inline-math cursor-pointer inline-block align-middle bg-slate-100 hover:bg-slate-200 px-1.5 py-0.5 rounded text-cyan-800 mx-1 border border-slate-200 transition-colors shadow-sm select-none";

//       span.dataset.mathType = type;
//       span.dataset.latex = "";
//       span.dataset.num = "";
//       span.dataset.den = "";
//       span.dataset.base = "";
//       span.dataset.exp = "";

//       if (type === "fraction") span.innerHTML = "<i>a/b</i>";
//       else if (type === "power") span.innerHTML = "<i>xⁿ</i>";
//       else span.innerHTML = "<i>ƒ(x)</i>";

//       range.insertNode(span);

//       const zws = document.createTextNode("\u200B");
//       range.collapse(false);
//       range.insertNode(zws);
//       range.setStartAfter(zws);
//       range.setEndAfter(zws);
//       window.getSelection()!.removeAllRanges();
//       window.getSelection()!.addRange(range);

//       const rect = span.getBoundingClientRect();
//       setPopover({
//         id: mathId,
//         x: rect.left,
//         y: rect.bottom + 8,
//         type,
//         latex: "",
//         num: "",
//         den: "",
//         base: "",
//         exp: "",
//       });

//       triggerChange();
//     },
//     insertList: (type: "bullet" | "number") => {
//       const editorNode = editorRef.current;
//       if (!editorNode) return;
//       editorNode.focus();
//       document.execCommand(
//         type === "number" ? "insertOrderedList" : "insertUnorderedList",
//         false
//       );
//       triggerChange();
//     },
//   }));

//   const triggerChange = () => {
//     if (editorRef.current) {
//       onChange(editorRef.current.innerHTML, editorRef.current.innerText);
//     }
//   };

//   const handleEditorClick = (e: React.MouseEvent) => {
//     if (readOnly) return;
//     const target = e.target as HTMLElement;
//     const mathNode = target.closest(".inline-math") as HTMLElement;

//     if (mathNode) {
//       const rect = mathNode.getBoundingClientRect();

//       if (!mathNode.id) {
//         mathNode.id = `math-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
//       }

//       setPopover({
//         id: mathNode.id,
//         x: rect.left,
//         y: rect.bottom + 8,
//         type: (mathNode.dataset.mathType as MathType) || "general",
//         latex: mathNode.dataset.latex || "",
//         num: mathNode.dataset.num || "",
//         den: mathNode.dataset.den || "",
//         base: mathNode.dataset.base || "",
//         exp: mathNode.dataset.exp || "",
//       });
//     }
//   };

//   const updateMathField = (
//     field: "latex" | "num" | "den" | "base" | "exp",
//     val: string
//   ) => {
//     if (!popover) return;

//     const newPopover = { ...popover, [field]: val };
//     setPopover(newPopover);

//     const node = document.getElementById(popover.id);
//     if (node) {
//       node.dataset[field] = val;

//       let finalLatex = "";
//       if (newPopover.type === "general") finalLatex = newPopover.latex;
//       if (newPopover.type === "fraction") {
//         if (newPopover.num || newPopover.den)
//           finalLatex = `\\frac{${newPopover.num || " "}}{${
//             newPopover.den || " "
//           }}`;
//       }
//       if (newPopover.type === "power") {
//         if (newPopover.base || newPopover.exp)
//           finalLatex = `${newPopover.base || " "}^{${newPopover.exp || " "}}`;
//       }

//       if (finalLatex.trim() === "") {
//         if (newPopover.type === "fraction") node.innerHTML = "<i>a/b</i>";
//         else if (newPopover.type === "power") node.innerHTML = "<i>xⁿ</i>";
//         else node.innerHTML = "<i>ƒ(x)</i>";
//       } else {
//         node.innerHTML = safeRenderKatex(finalLatex);
//       }
//       triggerChange();
//     }
//   };

//   let previewLatex = "";
//   if (popover) {
//     if (popover.type === "general") previewLatex = popover.latex;
//     if (popover.type === "fraction" && (popover.num || popover.den))
//       previewLatex = `\\frac{${popover.num || " "}}{${popover.den || " "}}`;
//     if (popover.type === "power" && (popover.base || popover.exp))
//       previewLatex = `${popover.base || " "}^{${popover.exp || " "}}`;
//   }

//   return (
//     <>
//       <style>{`
//         .custom-editor:empty:before {
//           content: attr(data-placeholder);
//           color: #94a3b8;
//           pointer-events: none;
//         }
//         .custom-editor .katex {
//            font-size: 1.15em;
//         }
//         .custom-editor ul {
//            list-style-type: disc;
//            padding-left: 1.5rem;
//            margin-top: 0.5rem;
//            margin-bottom: 0.5rem;
//         }
//         .custom-editor ol {
//            list-style-type: decimal;
//            padding-left: 1.5rem;
//            margin-top: 0.5rem;
//            margin-bottom: 0.5rem;
//         }
//         .custom-editor li {
//            margin-bottom: 0.25rem;
//            padding-left: 0.25rem;
//         }
//       `}</style>

//       <div
//         ref={editorRef}
//         contentEditable={!readOnly}
//         suppressContentEditableWarning
//         onInput={triggerChange}
//         onClick={handleEditorClick}
//         data-placeholder="Write your answer here..."
//         className={`custom-editor w-full min-h-[14rem] p-5 pb-10 bg-slate-50 text-slate-700 border border-slate-200 rounded-2xl transition-all text-lg leading-relaxed shadow-inner focus:outline-none ${
//           !readOnly
//             ? "focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
//             : "opacity-80"
//         }`}
//       />

//       {/* NOTION MATH POPOVER */}
//       {popover && (
//         <>
//           <div
//             className="fixed inset-0 z-40"
//             onClick={() => setPopover(null)}
//           />
//           <motion.div
//             initial={{ opacity: 0, y: -5 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="fixed z-50 bg-white border border-slate-200 shadow-xl rounded-xl p-4 w-[340px] flex flex-col gap-4"
//             style={{
//               top: popover.y,
//               left: Math.min(popover.x, window.innerWidth - 360),
//             }}
//           >
//             <div className="flex justify-between items-center">
//               <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
//                 {popover.type === "fraction"
//                   ? "Fraction"
//                   : popover.type === "power"
//                   ? "Power/Exponent"
//                   : "Inline Equation"}
//               </div>
//               <button
//                 onClick={() => setPopover(null)}
//                 className="text-xs px-3 py-1.5 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 rounded-md font-semibold transition-colors border border-cyan-100"
//               >
//                 Done
//               </button>
//             </div>

//             {popover.type === "general" && (
//               <input
//                 autoFocus
//                 value={popover.latex}
//                 onChange={(e) => updateMathField("latex", e.target.value)}
//                 onKeyDown={(e) => {
//                   if (e.key === "Enter") setPopover(null);
//                 }}
//                 placeholder="e.g. E = mc^2"
//                 className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
//               />
//             )}

//             {popover.type === "fraction" && (
//               <div className="flex flex-col gap-2">
//                 <input
//                   autoFocus
//                   value={popover.num}
//                   onChange={(e) => updateMathField("num", e.target.value)}
//                   placeholder="Numerator (Top)"
//                   className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 font-mono text-sm text-center focus:outline-none focus:ring-2 focus:ring-cyan-500"
//                 />
//                 <div className="w-full h-[2px] bg-slate-200 rounded-full my-0.5" />
//                 <input
//                   value={popover.den}
//                   onChange={(e) => updateMathField("den", e.target.value)}
//                   placeholder="Denominator (Bottom)"
//                   className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 font-mono text-sm text-center focus:outline-none focus:ring-2 focus:ring-cyan-500"
//                 />
//               </div>
//             )}

//             {popover.type === "power" && (
//               <div className="flex items-start gap-2">
//                 <input
//                   autoFocus
//                   value={popover.base}
//                   onChange={(e) => updateMathField("base", e.target.value)}
//                   placeholder="Base (x)"
//                   className="flex-1 bg-slate-50 border border-slate-200 rounded-md p-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
//                 />
//                 <input
//                   value={popover.exp}
//                   onChange={(e) => updateMathField("exp", e.target.value)}
//                   placeholder="Exp (n)"
//                   className="w-[100px] bg-slate-50 border border-slate-200 rounded-md p-2 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500 mt-[-8px] shadow-sm"
//                 />
//               </div>
//             )}

//             <div className="min-h-[3rem] flex justify-center items-center bg-slate-50/50 rounded-md border border-slate-100 p-2 overflow-x-auto text-slate-800">
//               {previewLatex ? (
//                 <span
//                   dangerouslySetInnerHTML={{
//                     __html: safeRenderKatex(previewLatex),
//                   }}
//                 />
//               ) : (
//                 <span className="text-slate-400 text-sm italic">
//                   Live Preview...
//                 </span>
//               )}
//             </div>
//           </motion.div>
//         </>
//       )}
//     </>
//   );
// });
// RichEditor.displayName = "RichEditor";

// // --- MAIN COMPONENT ---
// export default function TheoryPractice() {
//   const [hasStarted, setHasStarted] = useState(false);
//   const [isCompleted, setIsCompleted] = useState(false);

//   const [useTimer, setUseTimer] = useState(true);
//   const [isLearningMode, setIsLearningMode] = useState(true);
//   const [timeLeft, setTimeLeft] = useState(SET_STATS.estimatedMinutes * 60);

//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [direction, setDirection] = useState(1);
//   const [userAnswersHtml, setUserAnswersHtml] = useState<
//     Record<number, string>
//   >({});
//   const [userAnswersText, setUserAnswersText] = useState<
//     Record<number, string>
//   >({});
//   const [submittedQuestions, setSubmittedQuestions] = useState<
//     Record<number, boolean>
//   >({});
//   const [isLoading, setIsLoading] = useState(false);

//   // UI Controls
//   const [showMenu, setShowMenu] = useState(false);
//   const [showMarkschemePreview, setShowMarkschemePreview] = useState(false);
//   const [showHintPopover, setShowHintPopover] = useState(false);
//   const [revealedHints, setRevealedHints] = useState(1);

//   // Reference Modal State
//   const [showReference, setShowReference] = useState(false);
//   const [refTab, setRefTab] = useState<"formula" | "constants" | "latex">(
//     "formula"
//   );
//   const [isDesktop, setIsDesktop] = useState(true);

//   const editorRef = useRef<EditorRef>(null);

//   const currentQuestion = questions[currentIndex];
//   const isLastQuestion = currentIndex === questions.length - 1;
//   const currentAnswerHtml = userAnswersHtml[currentQuestion.id] || "";
//   const currentAnswerText = userAnswersText[currentQuestion.id] || "";
//   const isCurrentSubmitted = submittedQuestions[currentQuestion.id] || false;

//   // Derive word count safely
//   const wordCount = currentAnswerText.trim()
//     ? currentAnswerText
//         .trim()
//         .split(/\s+/)
//         .filter((w) => w.length > 0).length
//     : 0;

//   // Detect Desktop for Draggable Modal
//   useEffect(() => {
//     const checkDesktop = () => setIsDesktop(window.innerWidth >= 768);
//     checkDesktop();
//     window.addEventListener("resize", checkDesktop);
//     return () => window.removeEventListener("resize", checkDesktop);
//   }, []);

//   // Timer logic
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

//   const handleEditorChange = (html: string, text: string) => {
//     setUserAnswersHtml((prev) => ({ ...prev, [currentQuestion.id]: html }));
//     setUserAnswersText((prev) => ({ ...prev, [currentQuestion.id]: text }));
//   };

//   const submitCurrentAnswer = () => {
//     if (!currentAnswerText.trim() && !currentAnswerHtml.includes("inline-math"))
//       return;
//     if (isLoading) return;
//     setIsLoading(true);
//     setTimeout(() => {
//       setIsLoading(false);
//       setSubmittedQuestions((prev) => ({
//         ...prev,
//         [currentQuestion.id]: true,
//       }));
//     }, 500);
//   };

//   const resetHelpers = () => {
//     setShowMarkschemePreview(false);
//     setShowHintPopover(false);
//     setRevealedHints(1);
//     setShowMenu(false);
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
//     setIsCompleted(true);
//   };

//   const insertMathAndClose = (type: MathType) => {
//     editorRef.current?.insertMath(type);
//     setShowMenu(false);
//   };

//   const insertListAndClose = (type: "bullet" | "number") => {
//     editorRef.current?.insertList(type);
//     setShowMenu(false);
//   };

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
//             Physics Theory Set #1
//           </h1>
//           <p className="text-slate-500 mb-8">
//             Test your understanding of core physical properties and laws.
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
//       (sum, q) => sum + getEvaluation(q.id).score,
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
//               const evalResult = getEvaluation(q.id);
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
//                       {q.question}
//                     </h3>
//                     <div className="px-3 py-1 bg-cyan-50 text-cyan-700 font-bold rounded-lg text-sm shrink-0">
//                       {evalResult.score} / 4
//                     </div>
//                   </div>

//                   <div
//                     className="custom-editor bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 text-slate-600"
//                     dangerouslySetInnerHTML={{
//                       __html:
//                         userAnswersHtml[q.id] ||
//                         "<span class='italic opacity-60'>No answer provided.</span>",
//                     }}
//                   />

//                   <div className="space-y-3">
//                     {evalResult.points.map((point, pIdx) => (
//                       <div
//                         key={pIdx}
//                         className="flex gap-4 items-start text-sm"
//                       >
//                         {point.awarded ? (
//                           <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
//                         ) : (
//                           <XCircle className="w-5 h-5 text-red-400 shrink-0" />
//                         )}
//                         <div>
//                           <p
//                             className={`font-medium ${
//                               point.awarded
//                                 ? "text-slate-800"
//                                 : "text-slate-500"
//                             }`}
//                           >
//                             {point.text}
//                           </p>
//                           <p
//                             className={
//                               point.awarded ? "text-green-600" : "text-red-500"
//                             }
//                           >
//                             ↳ {point.reason}
//                           </p>
//                         </div>
//                       </div>
//                     ))}
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
//             {/* Mobile Backdrop */}
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
//               dragHandle=".drag-handle"
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
//                       right: "5vw",
//                     }
//                   : {}
//               }
//               className={`fixed z-[70] bg-white border border-slate-200 flex flex-col shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] ${
//                 isDesktop
//                   ? "rounded-xl absolute"
//                   : "inset-x-4 bottom-24 top-24 rounded-2xl"
//               }`}
//             >
//               {/* Header */}
//               <div
//                 className={`drag-handle flex justify-between items-center px-4 py-3 bg-slate-50 border-b border-slate-100 ${
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
//                   className="p-1 hover:bg-slate-200 rounded-md transition-colors text-slate-400 hover:text-slate-700"
//                 >
//                   <X className="w-4 h-4" />
//                 </button>
//               </div>

//               {/* Tabs Container */}
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

//               {/* Scrollable Content */}
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
//                           <MathInline latex="v = u + at" />
//                         </div>
//                         <div className="flex justify-between items-center">
//                           <span>Displacement</span>{" "}
//                           <MathInline latex="s = ut + \frac{1}{2}at^2" />
//                         </div>
//                       </div>
//                     </div>
//                     <div>
//                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
//                         Dynamics
//                       </p>
//                       <div className="space-y-3 text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">
//                         <div className="flex justify-between items-center">
//                           <span>Force</span> <MathInline latex="F = ma" />
//                         </div>
//                         <div className="flex justify-between items-center">
//                           <span>Momentum</span> <MathInline latex="p = mv" />
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
//                           <MathInline latex="9.81 \, \text{m/s}^2" />
//                         </div>
//                         <div className="flex justify-between items-center">
//                           <span>Speed of Light (c)</span>{" "}
//                           <MathInline latex="3 \times 10^8 \, \text{m/s}" />
//                         </div>
//                         <div className="flex justify-between items-center">
//                           <span>Planck (h)</span>{" "}
//                           <MathInline latex="6.63 \times 10^{-34} \, \text{J s}" />
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
//                           </code>
//                           <MathInline latex="\frac{a}{b}" />
//                         </div>
//                         <div className="flex justify-between items-center">
//                           <code className="text-[11px] bg-white px-1.5 py-0.5 rounded border border-slate-200">
//                             x^2
//                           </code>
//                           <MathInline latex="x^2" />
//                         </div>
//                         <div className="flex justify-between items-center">
//                           <code className="text-[11px] bg-white px-1.5 py-0.5 rounded border border-slate-200">
//                             v_0
//                           </code>
//                           <MathInline latex="v_0" />
//                         </div>
//                         <div className="flex justify-between items-center">
//                           <code className="text-[11px] bg-white px-1.5 py-0.5 rounded border border-slate-200">
//                             \sqrt{"{x}"}
//                           </code>
//                           <MathInline latex="\sqrt{x}" />
//                         </div>
//                         <div className="flex justify-between items-center">
//                           <code className="text-[11px] bg-white px-1.5 py-0.5 rounded border border-slate-200">
//                             \Delta
//                           </code>
//                           <MathInline latex="\Delta" />
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

//       {/* MAIN VIEW CONTENT */}
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
//                 <h1 className="text-2xl md:text-3xl font-medium leading-snug text-slate-900 mb-6">
//                   {currentQuestion.question}
//                 </h1>

//                 {!isLearningMode || !isCurrentSubmitted ? (
//                   <div className="space-y-4">
//                     {/* HELPER TOOLBAR (Markscheme Preview & Hints) */}
//                     <div className="flex justify-between items-center relative z-20">
//                       {/* Left: Markscheme Preview Toggle */}
//                       {isLearningMode && (
//                         <button
//                           onClick={() =>
//                             setShowMarkschemePreview(!showMarkschemePreview)
//                           }
//                           className={`flex items-center gap-2 text-sm font-semibold transition-colors ${
//                             showMarkschemePreview
//                               ? "text-cyan-600"
//                               : "text-slate-400 hover:text-cyan-600"
//                           }`}
//                         >
//                           {showMarkschemePreview ? (
//                             <EyeOff className="w-4 h-4" />
//                           ) : (
//                             <Eye className="w-4 h-4" />
//                           )}
//                           {showMarkschemePreview
//                             ? "Hide Markscheme"
//                             : "Preview Markscheme"}
//                         </button>
//                       )}
//                       {!isLearningMode && <div />}{" "}
//                       {/* Spacer if learning mode is off */}
//                       {/* Right: Hint Button & Popover */}
//                       {currentQuestion.hints &&
//                         currentQuestion.hints.length > 0 && (
//                           <div className="relative">
//                             <button
//                               onClick={() =>
//                                 setShowHintPopover(!showHintPopover)
//                               }
//                               className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors border ${
//                                 showHintPopover || revealedHints > 1
//                                   ? "bg-amber-50 text-amber-600 border-amber-200 shadow-sm"
//                                   : "bg-white text-slate-400 border-slate-200 hover:text-amber-500 hover:border-amber-200"
//                               }`}
//                             >
//                               <Lightbulb
//                                 className={`w-4 h-4 ${
//                                   showHintPopover || revealedHints > 1
//                                     ? "fill-amber-100"
//                                     : ""
//                                 }`}
//                               />
//                               Hints {revealedHints > 1 && `(${revealedHints})`}
//                             </button>

//                             {/* Hint Popover Dropdown */}
//                             <AnimatePresence>
//                               {showHintPopover && (
//                                 <>
//                                   <div
//                                     className="fixed inset-0 z-30"
//                                     onClick={() => setShowHintPopover(false)}
//                                   />
//                                   <motion.div
//                                     initial={{ opacity: 0, y: 5, scale: 0.95 }}
//                                     animate={{ opacity: 1, y: 0, scale: 1 }}
//                                     exit={{ opacity: 0, y: 5, scale: 0.95 }}
//                                     transition={{ duration: 0.15 }}
//                                     className="absolute right-0 top-[calc(100%+8px)] w-72 md:w-80 bg-white border border-slate-200 shadow-xl rounded-xl p-4 z-40"
//                                   >
//                                     <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">
//                                       Available Hints
//                                     </div>
//                                     <div className="space-y-2">
//                                       {currentQuestion.hints
//                                         .slice(0, revealedHints)
//                                         .map((hint, idx) => (
//                                           <motion.div
//                                             initial={{ opacity: 0, x: -5 }}
//                                             animate={{ opacity: 1, x: 0 }}
//                                             key={idx}
//                                             className="p-3 bg-amber-50/80 rounded-lg text-sm text-amber-900 border border-amber-100/50 leading-relaxed"
//                                           >
//                                             {hint}
//                                           </motion.div>
//                                         ))}
//                                     </div>
//                                     {revealedHints <
//                                       currentQuestion.hints.length && (
//                                       <button
//                                         onClick={() =>
//                                           setRevealedHints((prev) => prev + 1)
//                                         }
//                                         className="mt-3 w-full py-2 bg-slate-50 hover:bg-amber-50 text-xs font-bold text-slate-500 hover:text-amber-600 border border-slate-200 hover:border-amber-200 rounded-lg transition-colors"
//                                       >
//                                         Reveal Next Hint
//                                       </button>
//                                     )}
//                                   </motion.div>
//                                 </>
//                               )}
//                             </AnimatePresence>
//                           </div>
//                         )}
//                     </div>

//                     {/* MARKSCHEME PREVIEW DRAWER */}
//                     <AnimatePresence>
//                       {showMarkschemePreview && (
//                         <motion.div
//                           initial={{ height: 0, opacity: 0 }}
//                           animate={{ height: "auto", opacity: 1 }}
//                           exit={{ height: 0, opacity: 0 }}
//                           className="overflow-hidden"
//                         >
//                           <div className="p-5 bg-cyan-50/50 border border-cyan-100 rounded-2xl mb-2">
//                             <div className="text-[10px] font-bold text-cyan-600 uppercase tracking-wider mb-3">
//                               Required Points (
//                               {currentQuestion.markscheme.length})
//                             </div>
//                             <ul className="list-disc pl-5 space-y-1">
//                               {currentQuestion.markscheme.map((point, idx) => (
//                                 <li
//                                   key={idx}
//                                   className="text-sm text-slate-700"
//                                 >
//                                   {point}
//                                 </li>
//                               ))}
//                             </ul>
//                           </div>
//                         </motion.div>
//                       )}
//                     </AnimatePresence>

//                     {/* EDITOR */}
//                     <div className="relative">
//                       <RichEditor
//                         key={`editor-${currentQuestion.id}`}
//                         ref={editorRef}
//                         initialHtml={currentAnswerHtml}
//                         onChange={handleEditorChange}
//                       />
//                       {/* WORD COUNT INDICATOR */}
//                       <div className="absolute bottom-4 right-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest pointer-events-none">
//                         {wordCount} words
//                       </div>
//                     </div>
//                   </div>
//                 ) : (
//                   <div className="space-y-8 mt-4">
//                     <div className="flex flex-col items-center justify-center py-6 bg-cyan-50/50 rounded-2xl border border-cyan-100">
//                       <span className="text-sm font-semibold text-cyan-600 uppercase tracking-widest mb-2">
//                         Score
//                       </span>
//                       <div className="text-5xl font-bold text-slate-900 flex items-baseline gap-1">
//                         {getEvaluation(currentQuestion.id).score}
//                         <span className="text-2xl text-slate-400 font-medium">
//                           / 4
//                         </span>
//                       </div>
//                     </div>

//                     <div className="space-y-4">
//                       <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
//                         Markscheme Breakdown
//                       </h3>
//                       <div className="space-y-3">
//                         {getEvaluation(currentQuestion.id).points.map(
//                           (point, idx) => (
//                             <motion.div
//                               initial={{ opacity: 0, y: 10 }}
//                               animate={{ opacity: 1, y: 0 }}
//                               transition={{ delay: idx * 0.1 + 0.1 }}
//                               key={idx}
//                               className={`p-4 rounded-xl flex gap-4 items-start border ${
//                                 point.awarded
//                                   ? "bg-green-50/30 border-green-100"
//                                   : "bg-red-50/30 border-red-100"
//                               }`}
//                             >
//                               {point.awarded ? (
//                                 <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0 mt-0.5" />
//                               ) : (
//                                 <XCircle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
//                               )}
//                               <div>
//                                 <p className="text-slate-800 font-medium mb-1">
//                                   {point.text}
//                                 </p>
//                                 <div className="flex items-center text-sm gap-2">
//                                   <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
//                                   <span
//                                     className={
//                                       point.awarded
//                                         ? "text-green-700"
//                                         : "text-red-700"
//                                     }
//                                   >
//                                     {point.reason}
//                                   </span>
//                                 </div>
//                               </div>
//                             </motion.div>
//                           )
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </motion.div>
//             </AnimatePresence>
//           </div>
//         </div>
//       </div>

//       {/* FLOATING NAVBAR */}
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

//         <div className="flex-shrink-0 flex items-center justify-center gap-2 min-w-[140px] relative">
//           {/* EXPANDABLE FAB MENU */}
//           {(!isLearningMode || !isCurrentSubmitted) && (
//             <div className="relative">
//               <AnimatePresence>
//                 {showMenu && (
//                   <>
//                     <div
//                       className="fixed inset-0 z-30"
//                       onClick={() => setShowMenu(false)}
//                     />
//                     <motion.div
//                       initial={{ opacity: 0, y: 10, scale: 0.95 }}
//                       animate={{ opacity: 1, y: 0, scale: 1 }}
//                       exit={{ opacity: 0, y: 10, scale: 0.95 }}
//                       transition={{ duration: 0.15 }}
//                       className="absolute bottom-[calc(100%+12px)] left-1/2 -translate-x-1/2 flex items-center gap-1.5 p-1.5 bg-white border border-slate-200 shadow-xl rounded-full z-40"
//                     >
//                       {/* Math Tools */}
//                       <button
//                         onClick={() => insertMathAndClose("general")}
//                         className="w-10 h-10 flex flex-col items-center justify-center bg-slate-50 hover:bg-cyan-50 border border-slate-100 hover:border-cyan-200 text-slate-600 hover:text-cyan-700 rounded-full transition-all group"
//                         title="General Equation"
//                       >
//                         <Sigma className="w-4 h-4 group-hover:scale-110 transition-transform" />
//                       </button>
//                       <button
//                         onClick={() => insertMathAndClose("fraction")}
//                         className="w-10 h-10 flex flex-col items-center justify-center bg-slate-50 hover:bg-cyan-50 border border-slate-100 hover:border-cyan-200 text-slate-600 hover:text-cyan-700 rounded-full transition-all group"
//                         title="Fraction"
//                       >
//                         <Divide className="w-4 h-4 group-hover:scale-110 transition-transform" />
//                       </button>
//                       <button
//                         onClick={() => insertMathAndClose("power")}
//                         className="w-10 h-10 flex flex-col items-center justify-center bg-slate-50 hover:bg-cyan-50 border border-slate-100 hover:border-cyan-200 text-slate-600 hover:text-cyan-700 rounded-full transition-all group font-serif italic text-sm font-bold"
//                         title="Power / Exponent"
//                       >
//                         <span className="group-hover:scale-110 transition-transform tracking-tighter">
//                           x<span className="text-[10px] align-top">n</span>
//                         </span>
//                       </button>

//                       {/* Divider */}
//                       <div className="w-px h-6 bg-slate-200 mx-1" />

//                       {/* Formatting Tools */}
//                       <button
//                         onClick={() => insertListAndClose("bullet")}
//                         className="w-10 h-10 flex flex-col items-center justify-center bg-slate-50 hover:bg-cyan-50 border border-slate-100 hover:border-cyan-200 text-slate-600 hover:text-cyan-700 rounded-full transition-all group"
//                         title="Bullet List"
//                       >
//                         <List className="w-4 h-4 group-hover:scale-110 transition-transform" />
//                       </button>
//                       <button
//                         onClick={() => insertListAndClose("number")}
//                         className="w-10 h-10 flex flex-col items-center justify-center bg-slate-50 hover:bg-cyan-50 border border-slate-100 hover:border-cyan-200 text-slate-600 hover:text-cyan-700 rounded-full transition-all group"
//                         title="Numbered List"
//                       >
//                         <ListOrdered className="w-4 h-4 group-hover:scale-110 transition-transform" />
//                       </button>
//                     </motion.div>
//                   </>
//                 )}
//               </AnimatePresence>

//               <button
//                 onClick={() => setShowMenu(!showMenu)}
//                 className={`w-12 h-12 flex items-center justify-center border transition-all shadow-sm rounded-full ${
//                   showMenu
//                     ? "bg-slate-800 border-slate-800 text-white"
//                     : "bg-slate-50 border-slate-200 hover:border-cyan-300 hover:bg-cyan-50 text-slate-600 hover:text-cyan-700"
//                 }`}
//                 title="Add Math Element"
//               >
//                 <Plus
//                   className={`w-5 h-5 transition-transform duration-300 ${
//                     showMenu ? "rotate-45" : "rotate-0"
//                   }`}
//                 />
//               </button>
//             </div>
//           )}

//           {isLearningMode && !isCurrentSubmitted ? (
//             <button
//               onClick={submitCurrentAnswer}
//               disabled={
//                 (!currentAnswerText.trim() &&
//                   !currentAnswerHtml.includes("inline-math")) ||
//                 isLoading
//               }
//               className="flex items-center justify-center gap-2 w-full py-3 px-6 bg-cyan-600 hover:bg-cyan-700 text-white rounded-full font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
//             >
//               {isLoading ? (
//                 <Loader2 className="w-5 h-5 animate-spin" />
//               ) : (
//                 "Submit"
//               )}
//               {!isLoading && <Send className="w-4 h-4 ml-1" />}
//             </button>
//           ) : isLastQuestion ? (
//             <button
//               onClick={finishPractice}
//               className="flex items-center justify-center gap-2 w-full py-3 px-6 bg-slate-900 hover:bg-slate-800 text-white rounded-full font-medium transition-all shadow-sm"
//             >
//               Finish Set
//               <CheckCircle2 className="w-4 h-4 ml-1" />
//             </button>
//           ) : (
//             <div className="px-4 py-2 font-medium text-slate-400 text-sm tracking-wide">
//               {currentIndex + 1} / {questions.length}
//             </div>
//           )}

//           {/* ADDED REFERENCE MODAL BUTTON */}
//           <div className="w-px h-6 bg-slate-200 mx-1 hidden sm:block" />
//           <button
//             onClick={() => setShowReference(!showReference)}
//             className={`w-12 h-12 flex items-center justify-center border transition-all shadow-sm rounded-full ${
//               showReference
//                 ? "bg-cyan-600 border-cyan-600 text-white"
//                 : "bg-slate-50 border-slate-200 hover:border-cyan-300 hover:bg-cyan-50 text-slate-600 hover:text-cyan-700"
//             }`}
//             title="Reference Materials"
//           >
//             <Info className="w-5 h-5" />
//           </button>
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
//   ArrowRight,
//   Award,
//   CheckCircle2,
//   ChevronLeft,
//   ChevronRight,
//   Clock,
//   Divide,
//   Eye,
//   EyeOff,
//   FileText,
//   GripHorizontal,
//   Info,
//   Lightbulb,
//   List,
//   ListOrdered,
//   Loader2,
//   Play,
//   Plus,
//   Send,
//   Settings2,
//   Sigma,
//   Target,
//   X,
//   XCircle,
// } from "lucide-react";
// import React, {
//   forwardRef,
//   useEffect,
//   useImperativeHandle,
//   useRef,
//   useState,
// } from "react";

// // --- MOCK DATA ---
// const SET_STATS = {
//   totalQuestions: 3,
//   totalMarks: 12,
//   estimatedMinutes: 10,
// };

// const questions = [
//   {
//     id: 1,
//     question: "Define a physical quantity.",
//     hints: [
//       "Think about what scientists actually measure in the real world.",
//       "A complete definition usually mentions two things: the value (number) and what it's measured in.",
//     ],
//     markscheme: [
//       "A measurable property",
//       "Expressed with numerical value",
//       "Includes a unit",
//       "Used to describe physical systems",
//     ],
//   },
//   {
//     id: 2,
//     question: "Explain the difference between scalar and vector quantities.",
//     hints: [
//       "One of them only tells you 'how much', while the other tells you 'how much' AND 'which way'.",
//       "Providing one example for each will usually secure full marks in this type of question.",
//     ],
//     markscheme: [
//       "Scalar has magnitude only",
//       "Vector has magnitude and direction",
//       "Example of scalar",
//       "Example of vector",
//     ],
//   },
//   {
//     id: 3,
//     question: "State Newton's Second Law.",
//     hints: [],
//     markscheme: [
//       "Force equals mass times acceleration",
//       "F = ma",
//       "Acceleration proportional to force",
//       "Inversely proportional to mass",
//     ],
//   },
// ];

// // --- MOCK EVALUATION LOGIC ---
// const getEvaluation = (questionId: number) => {
//   if (questionId === 1) {
//     return {
//       score: 2,
//       points: [
//         {
//           awarded: true,
//           text: "A measurable property",
//           reason: "User mentioned measurement",
//         },
//         {
//           awarded: true,
//           text: "Expressed with numerical value",
//           reason: "Numerical aspect included",
//         },
//         { awarded: false, text: "Includes a unit", reason: "Units missing" },
//         {
//           awarded: false,
//           text: "Used to describe physical systems",
//           reason: "Context missing",
//         },
//       ],
//     };
//   }
//   if (questionId === 2) {
//     return {
//       score: 0,
//       points: [
//         {
//           awarded: false,
//           text: "Scalar has magnitude only",
//           reason: "Concept missing",
//         },
//         {
//           awarded: false,
//           text: "Vector has magnitude and direction",
//           reason: "Concept missing",
//         },
//         {
//           awarded: false,
//           text: "Example of scalar",
//           reason: "No example provided",
//         },
//         {
//           awarded: false,
//           text: "Example of vector",
//           reason: "No example provided",
//         },
//       ],
//     };
//   }
//   return {
//     score: 4,
//     points: [
//       {
//         awarded: true,
//         text: "Force equals mass times acceleration",
//         reason: "Definition accurate",
//       },
//       { awarded: true, text: "F = ma", reason: "Formula present" },
//       {
//         awarded: true,
//         text: "Acceleration proportional to force",
//         reason: "Relationship correct",
//       },
//       {
//         awarded: true,
//         text: "Inversely proportional to mass",
//         reason: "Relationship correct",
//       },
//     ],
//   };
// };

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

// const MathInline = ({ latex }: { latex: string }) => (
//   <span dangerouslySetInnerHTML={{ __html: safeRenderKatex(latex) }} />
// );

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

// // --- NOTION-LIKE RICH TEXT EDITOR ---
// type MathType = "general" | "fraction" | "power";

// interface EditorRef {
//   insertMath: (type: MathType) => void;
//   insertList: (type: "bullet" | "number") => void;
// }

// const RichEditor = forwardRef<
//   EditorRef,
//   {
//     initialHtml: string;
//     onChange: (html: string, text: string) => void;
//     readOnly?: boolean;
//   }
// >(({ initialHtml, onChange, readOnly }, ref) => {
//   const editorRef = useRef<HTMLDivElement>(null);

//   const [popover, setPopover] = useState<{
//     id: string;
//     x: number;
//     y: number;
//     type: MathType;
//     latex: string;
//     num: string;
//     den: string;
//     base: string;
//     exp: string;
//   } | null>(null);

//   useEffect(() => {
//     if (editorRef.current) {
//       editorRef.current.innerHTML = initialHtml;
//     }
//   }, []); // eslint-disable-line react-hooks/exhaustive-deps

//   useImperativeHandle(ref, () => ({
//     insertMath: (type: MathType = "general") => {
//       const editorNode = editorRef.current;
//       if (!editorNode) return;

//       const sel = window.getSelection();
//       if (
//         !sel ||
//         sel.rangeCount === 0 ||
//         !editorNode.contains(sel.anchorNode)
//       ) {
//         editorNode.focus();
//         const range = document.createRange();
//         range.selectNodeContents(editorNode);
//         range.collapse(false);
//         sel?.removeAllRanges();
//         sel?.addRange(range);
//       }

//       const range = window.getSelection()!.getRangeAt(0);

//       const span = document.createElement("span");
//       const mathId = `math-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
//       span.id = mathId;
//       span.contentEditable = "false";
//       span.className =
//         "inline-math cursor-pointer inline-block align-middle bg-slate-100 hover:bg-slate-200 px-1.5 py-0.5 rounded text-cyan-800 mx-1 border border-slate-200 transition-colors shadow-sm select-none";

//       span.dataset.mathType = type;
//       span.dataset.latex = "";
//       span.dataset.num = "";
//       span.dataset.den = "";
//       span.dataset.base = "";
//       span.dataset.exp = "";

//       if (type === "fraction") span.innerHTML = "<i>a/b</i>";
//       else if (type === "power") span.innerHTML = "<i>xⁿ</i>";
//       else span.innerHTML = "<i>ƒ(x)</i>";

//       range.insertNode(span);

//       const zws = document.createTextNode("\u200B");
//       range.collapse(false);
//       range.insertNode(zws);
//       range.setStartAfter(zws);
//       range.setEndAfter(zws);
//       window.getSelection()!.removeAllRanges();
//       window.getSelection()!.addRange(range);

//       const rect = span.getBoundingClientRect();
//       setPopover({
//         id: mathId,
//         x: rect.left,
//         y: rect.bottom + 8,
//         type,
//         latex: "",
//         num: "",
//         den: "",
//         base: "",
//         exp: "",
//       });

//       triggerChange();
//     },
//     insertList: (type: "bullet" | "number") => {
//       const editorNode = editorRef.current;
//       if (!editorNode) return;
//       editorNode.focus();
//       document.execCommand(
//         type === "number" ? "insertOrderedList" : "insertUnorderedList",
//         false
//       );
//       triggerChange();
//     },
//   }));

//   const triggerChange = () => {
//     if (editorRef.current) {
//       onChange(editorRef.current.innerHTML, editorRef.current.innerText);
//     }
//   };

//   const handleEditorClick = (e: React.MouseEvent) => {
//     if (readOnly) return;
//     const target = e.target as HTMLElement;
//     const mathNode = target.closest(".inline-math") as HTMLElement;

//     if (mathNode) {
//       const rect = mathNode.getBoundingClientRect();

//       if (!mathNode.id) {
//         mathNode.id = `math-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
//       }

//       setPopover({
//         id: mathNode.id,
//         x: rect.left,
//         y: rect.bottom + 8,
//         type: (mathNode.dataset.mathType as MathType) || "general",
//         latex: mathNode.dataset.latex || "",
//         num: mathNode.dataset.num || "",
//         den: mathNode.dataset.den || "",
//         base: mathNode.dataset.base || "",
//         exp: mathNode.dataset.exp || "",
//       });
//     }
//   };

//   const updateMathField = (
//     field: "latex" | "num" | "den" | "base" | "exp",
//     val: string
//   ) => {
//     if (!popover) return;

//     const newPopover = { ...popover, [field]: val };
//     setPopover(newPopover);

//     const node = document.getElementById(popover.id);
//     if (node) {
//       node.dataset[field] = val;

//       let finalLatex = "";
//       if (newPopover.type === "general") finalLatex = newPopover.latex;
//       if (newPopover.type === "fraction") {
//         if (newPopover.num || newPopover.den)
//           finalLatex = `\\frac{${newPopover.num || " "}}{${
//             newPopover.den || " "
//           }}`;
//       }
//       if (newPopover.type === "power") {
//         if (newPopover.base || newPopover.exp)
//           finalLatex = `${newPopover.base || " "}^{${newPopover.exp || " "}}`;
//       }

//       if (finalLatex.trim() === "") {
//         if (newPopover.type === "fraction") node.innerHTML = "<i>a/b</i>";
//         else if (newPopover.type === "power") node.innerHTML = "<i>xⁿ</i>";
//         else node.innerHTML = "<i>ƒ(x)</i>";
//       } else {
//         node.innerHTML = safeRenderKatex(finalLatex);
//       }
//       triggerChange();
//     }
//   };

//   let previewLatex = "";
//   if (popover) {
//     if (popover.type === "general") previewLatex = popover.latex;
//     if (popover.type === "fraction" && (popover.num || popover.den))
//       previewLatex = `\\frac{${popover.num || " "}}{${popover.den || " "}}`;
//     if (popover.type === "power" && (popover.base || popover.exp))
//       previewLatex = `${popover.base || " "}^{${popover.exp || " "}}`;
//   }

//   return (
//     <>
//       <style>{`
//         .custom-editor:empty:before {
//           content: attr(data-placeholder);
//           color: #94a3b8;
//           pointer-events: none;
//         }
//         .custom-editor .katex {
//            font-size: 1.15em;
//         }
//         .custom-editor ul {
//            list-style-type: disc;
//            padding-left: 1.5rem;
//            margin-top: 0.5rem;
//            margin-bottom: 0.5rem;
//         }
//         .custom-editor ol {
//            list-style-type: decimal;
//            padding-left: 1.5rem;
//            margin-top: 0.5rem;
//            margin-bottom: 0.5rem;
//         }
//         .custom-editor li {
//            margin-bottom: 0.25rem;
//            padding-left: 0.25rem;
//         }
//       `}</style>

//       <div
//         ref={editorRef}
//         contentEditable={!readOnly}
//         suppressContentEditableWarning
//         onInput={triggerChange}
//         onClick={handleEditorClick}
//         data-placeholder="Write your answer here..."
//         className={`custom-editor w-full min-h-[14rem] p-5 pb-10 bg-slate-50 text-slate-700 border border-slate-200 rounded-2xl transition-all text-lg leading-relaxed shadow-inner focus:outline-none ${
//           !readOnly
//             ? "focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
//             : "opacity-80"
//         }`}
//       />

//       {/* NOTION MATH POPOVER */}
//       {popover && (
//         <>
//           <div
//             className="fixed inset-0 z-40"
//             onClick={() => setPopover(null)}
//           />
//           <motion.div
//             initial={{ opacity: 0, y: -5 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="fixed z-50 bg-white border border-slate-200 shadow-xl rounded-xl p-4 w-[340px] flex flex-col gap-4"
//             style={{
//               top: popover.y,
//               left: Math.min(popover.x, window.innerWidth - 360),
//             }}
//           >
//             <div className="flex justify-between items-center">
//               <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
//                 {popover.type === "fraction"
//                   ? "Fraction"
//                   : popover.type === "power"
//                   ? "Power/Exponent"
//                   : "Inline Equation"}
//               </div>
//               <button
//                 onClick={() => setPopover(null)}
//                 className="text-xs px-3 py-1.5 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 rounded-md font-semibold transition-colors border border-cyan-100"
//               >
//                 Done
//               </button>
//             </div>

//             {popover.type === "general" && (
//               <input
//                 autoFocus
//                 value={popover.latex}
//                 onChange={(e) => updateMathField("latex", e.target.value)}
//                 onKeyDown={(e) => {
//                   if (e.key === "Enter") setPopover(null);
//                 }}
//                 placeholder="e.g. E = mc^2"
//                 className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
//               />
//             )}

//             {popover.type === "fraction" && (
//               <div className="flex flex-col gap-2">
//                 <input
//                   autoFocus
//                   value={popover.num}
//                   onChange={(e) => updateMathField("num", e.target.value)}
//                   placeholder="Numerator (Top)"
//                   className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 font-mono text-sm text-center focus:outline-none focus:ring-2 focus:ring-cyan-500"
//                 />
//                 <div className="w-full h-[2px] bg-slate-200 rounded-full my-0.5" />
//                 <input
//                   value={popover.den}
//                   onChange={(e) => updateMathField("den", e.target.value)}
//                   placeholder="Denominator (Bottom)"
//                   className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 font-mono text-sm text-center focus:outline-none focus:ring-2 focus:ring-cyan-500"
//                 />
//               </div>
//             )}

//             {popover.type === "power" && (
//               <div className="flex items-start gap-2">
//                 <input
//                   autoFocus
//                   value={popover.base}
//                   onChange={(e) => updateMathField("base", e.target.value)}
//                   placeholder="Base (x)"
//                   className="flex-1 bg-slate-50 border border-slate-200 rounded-md p-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
//                 />
//                 <input
//                   value={popover.exp}
//                   onChange={(e) => updateMathField("exp", e.target.value)}
//                   placeholder="Exp (n)"
//                   className="w-[100px] bg-slate-50 border border-slate-200 rounded-md p-2 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500 mt-[-8px] shadow-sm"
//                 />
//               </div>
//             )}

//             <div className="min-h-[3rem] flex justify-center items-center bg-slate-50/50 rounded-md border border-slate-100 p-2 overflow-x-auto text-slate-800">
//               {previewLatex ? (
//                 <span
//                   dangerouslySetInnerHTML={{
//                     __html: safeRenderKatex(previewLatex),
//                   }}
//                 />
//               ) : (
//                 <span className="text-slate-400 text-sm italic">
//                   Live Preview...
//                 </span>
//               )}
//             </div>
//           </motion.div>
//         </>
//       )}
//     </>
//   );
// });
// RichEditor.displayName = "RichEditor";

// // --- MAIN COMPONENT ---
// export default function TheoryPractice() {
//   const [hasStarted, setHasStarted] = useState(false);
//   const [isCompleted, setIsCompleted] = useState(false);

//   const [useTimer, setUseTimer] = useState(true);
//   const [isLearningMode, setIsLearningMode] = useState(true);
//   const [timeLeft, setTimeLeft] = useState(SET_STATS.estimatedMinutes * 60);

//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [direction, setDirection] = useState(1);
//   const [userAnswersHtml, setUserAnswersHtml] = useState<
//     Record<number, string>
//   >({});
//   const [userAnswersText, setUserAnswersText] = useState<
//     Record<number, string>
//   >({});
//   const [submittedQuestions, setSubmittedQuestions] = useState<
//     Record<number, boolean>
//   >({});
//   const [isLoading, setIsLoading] = useState(false);

//   // UI Controls
//   const [showMenu, setShowMenu] = useState(false);
//   const [showMarkschemePreview, setShowMarkschemePreview] = useState(false);
//   const [showHintPopover, setShowHintPopover] = useState(false);
//   const [revealedHints, setRevealedHints] = useState(1);

//   // Reference Modal State & Drag Controls
//   const [showReference, setShowReference] = useState(false);
//   const [refTab, setRefTab] = useState<"formula" | "constants" | "latex">(
//     "formula"
//   );
//   const [isDesktop, setIsDesktop] = useState(true);

//   // Custom Drag Controls to restrict dragging to the header only
//   const dragControls = useDragControls();

//   const editorRef = useRef<EditorRef>(null);

//   const currentQuestion = questions[currentIndex];
//   const isLastQuestion = currentIndex === questions.length - 1;
//   const currentAnswerHtml = userAnswersHtml[currentQuestion.id] || "";
//   const currentAnswerText = userAnswersText[currentQuestion.id] || "";
//   const isCurrentSubmitted = submittedQuestions[currentQuestion.id] || false;

//   // Derive word count safely
//   const wordCount = currentAnswerText.trim()
//     ? currentAnswerText
//         .trim()
//         .split(/\s+/)
//         .filter((w) => w.length > 0).length
//     : 0;

//   // Detect Desktop for Draggable Modal
//   useEffect(() => {
//     const checkDesktop = () => setIsDesktop(window.innerWidth >= 768);
//     checkDesktop();
//     window.addEventListener("resize", checkDesktop);
//     return () => window.removeEventListener("resize", checkDesktop);
//   }, []);

//   // Timer logic
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

//   const handleEditorChange = (html: string, text: string) => {
//     setUserAnswersHtml((prev) => ({ ...prev, [currentQuestion.id]: html }));
//     setUserAnswersText((prev) => ({ ...prev, [currentQuestion.id]: text }));
//   };

//   const submitCurrentAnswer = () => {
//     if (!currentAnswerText.trim() && !currentAnswerHtml.includes("inline-math"))
//       return;
//     if (isLoading) return;
//     setIsLoading(true);
//     setTimeout(() => {
//       setIsLoading(false);
//       setSubmittedQuestions((prev) => ({
//         ...prev,
//         [currentQuestion.id]: true,
//       }));
//     }, 500);
//   };

//   const resetHelpers = () => {
//     setShowMarkschemePreview(false);
//     setShowHintPopover(false);
//     setRevealedHints(1);
//     setShowMenu(false);
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
//     setIsCompleted(true);
//   };

//   const insertMathAndClose = (type: MathType) => {
//     editorRef.current?.insertMath(type);
//     setShowMenu(false);
//   };

//   const insertListAndClose = (type: "bullet" | "number") => {
//     editorRef.current?.insertList(type);
//     setShowMenu(false);
//   };

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
//             Physics Theory Set #1
//           </h1>
//           <p className="text-slate-500 mb-8">
//             Test your understanding of core physical properties and laws.
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
//       (sum, q) => sum + getEvaluation(q.id).score,
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
//               const evalResult = getEvaluation(q.id);
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
//                       {q.question}
//                     </h3>
//                     <div className="px-3 py-1 bg-cyan-50 text-cyan-700 font-bold rounded-lg text-sm shrink-0">
//                       {evalResult.score} / 4
//                     </div>
//                   </div>

//                   <div
//                     className="custom-editor bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 text-slate-600"
//                     dangerouslySetInnerHTML={{
//                       __html:
//                         userAnswersHtml[q.id] ||
//                         "<span class='italic opacity-60'>No answer provided.</span>",
//                     }}
//                   />

//                   <div className="space-y-3">
//                     {evalResult.points.map((point, pIdx) => (
//                       <div
//                         key={pIdx}
//                         className="flex gap-4 items-start text-sm"
//                       >
//                         {point.awarded ? (
//                           <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
//                         ) : (
//                           <XCircle className="w-5 h-5 text-red-400 shrink-0" />
//                         )}
//                         <div>
//                           <p
//                             className={`font-medium ${
//                               point.awarded
//                                 ? "text-slate-800"
//                                 : "text-slate-500"
//                             }`}
//                           >
//                             {point.text}
//                           </p>
//                           <p
//                             className={
//                               point.awarded ? "text-green-600" : "text-red-500"
//                             }
//                           >
//                             ↳ {point.reason}
//                           </p>
//                         </div>
//                       </div>
//                     ))}
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
//             {/* Mobile Backdrop */}
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
//               dragControls={dragControls}
//               dragListener={false} // Prevents dragging from the modal body
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
//                       left: "calc(100vw - 420px)", // Left anchor ensures stable resize
//                     }
//                   : {}
//               }
//               className={`fixed z-[70] bg-white border border-slate-200 flex flex-col shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] ${
//                 isDesktop
//                   ? "rounded-xl absolute"
//                   : "inset-x-4 bottom-24 top-24 rounded-2xl"
//               }`}
//             >
//               {/* Header (Drag Handle) */}
//               <div
//                 onPointerDown={(e) => isDesktop && dragControls.start(e)}
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
//                   onPointerDown={(e) => e.stopPropagation()} // Prevent closing from triggering drag
//                   className="p-1 hover:bg-slate-200 rounded-md transition-colors text-slate-400 hover:text-slate-700"
//                 >
//                   <X className="w-4 h-4" />
//                 </button>
//               </div>

//               {/* Tabs Container */}
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

//               {/* Scrollable Content */}
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
//                           <MathInline latex="v = u + at" />
//                         </div>
//                         <div className="flex justify-between items-center">
//                           <span>Displacement</span>{" "}
//                           <MathInline latex="s = ut + \frac{1}{2}at^2" />
//                         </div>
//                       </div>
//                     </div>
//                     <div>
//                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
//                         Dynamics
//                       </p>
//                       <div className="space-y-3 text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">
//                         <div className="flex justify-between items-center">
//                           <span>Force</span> <MathInline latex="F = ma" />
//                         </div>
//                         <div className="flex justify-between items-center">
//                           <span>Momentum</span> <MathInline latex="p = mv" />
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
//                           <MathInline latex="9.81 \, \text{m/s}^2" />
//                         </div>
//                         <div className="flex justify-between items-center">
//                           <span>Speed of Light (c)</span>{" "}
//                           <MathInline latex="3 \times 10^8 \, \text{m/s}" />
//                         </div>
//                         <div className="flex justify-between items-center">
//                           <span>Planck (h)</span>{" "}
//                           <MathInline latex="6.63 \times 10^{-34} \, \text{J s}" />
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
//                           </code>
//                           <MathInline latex="\frac{a}{b}" />
//                         </div>
//                         <div className="flex justify-between items-center">
//                           <code className="text-[11px] bg-white px-1.5 py-0.5 rounded border border-slate-200">
//                             x^2
//                           </code>
//                           <MathInline latex="x^2" />
//                         </div>
//                         <div className="flex justify-between items-center">
//                           <code className="text-[11px] bg-white px-1.5 py-0.5 rounded border border-slate-200">
//                             v_0
//                           </code>
//                           <MathInline latex="v_0" />
//                         </div>
//                         <div className="flex justify-between items-center">
//                           <code className="text-[11px] bg-white px-1.5 py-0.5 rounded border border-slate-200">
//                             \sqrt{"{x}"}
//                           </code>
//                           <MathInline latex="\sqrt{x}" />
//                         </div>
//                         <div className="flex justify-between items-center">
//                           <code className="text-[11px] bg-white px-1.5 py-0.5 rounded border border-slate-200">
//                             \Delta
//                           </code>
//                           <MathInline latex="\Delta" />
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

//       {/* MAIN VIEW CONTENT */}
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
//                 <h1 className="text-2xl md:text-3xl font-medium leading-snug text-slate-900 mb-6">
//                   {currentQuestion.question}
//                 </h1>

//                 {!isLearningMode || !isCurrentSubmitted ? (
//                   <div className="space-y-4">
//                     {/* HELPER TOOLBAR (Markscheme Preview & Hints) */}
//                     <div className="flex justify-between items-center relative z-20">
//                       {/* Left: Markscheme Preview Toggle */}
//                       {isLearningMode && (
//                         <button
//                           onClick={() =>
//                             setShowMarkschemePreview(!showMarkschemePreview)
//                           }
//                           className={`flex items-center gap-2 text-sm font-semibold transition-colors ${
//                             showMarkschemePreview
//                               ? "text-cyan-600"
//                               : "text-slate-400 hover:text-cyan-600"
//                           }`}
//                         >
//                           {showMarkschemePreview ? (
//                             <EyeOff className="w-4 h-4" />
//                           ) : (
//                             <Eye className="w-4 h-4" />
//                           )}
//                           {showMarkschemePreview
//                             ? "Hide Markscheme"
//                             : "Preview Markscheme"}
//                         </button>
//                       )}
//                       {!isLearningMode && <div />}{" "}
//                       {/* Spacer if learning mode is off */}
//                       {/* Right: Hint Button & Popover */}
//                       {currentQuestion.hints &&
//                         currentQuestion.hints.length > 0 && (
//                           <div className="relative">
//                             <button
//                               onClick={() =>
//                                 setShowHintPopover(!showHintPopover)
//                               }
//                               className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors border ${
//                                 showHintPopover || revealedHints > 1
//                                   ? "bg-amber-50 text-amber-600 border-amber-200 shadow-sm"
//                                   : "bg-white text-slate-400 border-slate-200 hover:text-amber-500 hover:border-amber-200"
//                               }`}
//                             >
//                               <Lightbulb
//                                 className={`w-4 h-4 ${
//                                   showHintPopover || revealedHints > 1
//                                     ? "fill-amber-100"
//                                     : ""
//                                 }`}
//                               />
//                               Hints {revealedHints > 1 && `(${revealedHints})`}
//                             </button>

//                             {/* Hint Popover Dropdown */}
//                             <AnimatePresence>
//                               {showHintPopover && (
//                                 <>
//                                   <div
//                                     className="fixed inset-0 z-30"
//                                     onClick={() => setShowHintPopover(false)}
//                                   />
//                                   <motion.div
//                                     initial={{ opacity: 0, y: 5, scale: 0.95 }}
//                                     animate={{ opacity: 1, y: 0, scale: 1 }}
//                                     exit={{ opacity: 0, y: 5, scale: 0.95 }}
//                                     transition={{ duration: 0.15 }}
//                                     className="absolute right-0 top-[calc(100%+8px)] w-72 md:w-80 bg-white border border-slate-200 shadow-xl rounded-xl p-4 z-40"
//                                   >
//                                     <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">
//                                       Available Hints
//                                     </div>
//                                     <div className="space-y-2">
//                                       {currentQuestion.hints
//                                         .slice(0, revealedHints)
//                                         .map((hint, idx) => (
//                                           <motion.div
//                                             initial={{ opacity: 0, x: -5 }}
//                                             animate={{ opacity: 1, x: 0 }}
//                                             key={idx}
//                                             className="p-3 bg-amber-50/80 rounded-lg text-sm text-amber-900 border border-amber-100/50 leading-relaxed"
//                                           >
//                                             {hint}
//                                           </motion.div>
//                                         ))}
//                                     </div>
//                                     {revealedHints <
//                                       currentQuestion.hints.length && (
//                                       <button
//                                         onClick={() =>
//                                           setRevealedHints((prev) => prev + 1)
//                                         }
//                                         className="mt-3 w-full py-2 bg-slate-50 hover:bg-amber-50 text-xs font-bold text-slate-500 hover:text-amber-600 border border-slate-200 hover:border-amber-200 rounded-lg transition-colors"
//                                       >
//                                         Reveal Next Hint
//                                       </button>
//                                     )}
//                                   </motion.div>
//                                 </>
//                               )}
//                             </AnimatePresence>
//                           </div>
//                         )}
//                     </div>

//                     {/* MARKSCHEME PREVIEW DRAWER */}
//                     <AnimatePresence>
//                       {showMarkschemePreview && (
//                         <motion.div
//                           initial={{ height: 0, opacity: 0 }}
//                           animate={{ height: "auto", opacity: 1 }}
//                           exit={{ height: 0, opacity: 0 }}
//                           className="overflow-hidden"
//                         >
//                           <div className="p-5 bg-cyan-50/50 border border-cyan-100 rounded-2xl mb-2">
//                             <div className="text-[10px] font-bold text-cyan-600 uppercase tracking-wider mb-3">
//                               Required Points (
//                               {currentQuestion.markscheme.length})
//                             </div>
//                             <ul className="list-disc pl-5 space-y-1">
//                               {currentQuestion.markscheme.map((point, idx) => (
//                                 <li
//                                   key={idx}
//                                   className="text-sm text-slate-700"
//                                 >
//                                   {point}
//                                 </li>
//                               ))}
//                             </ul>
//                           </div>
//                         </motion.div>
//                       )}
//                     </AnimatePresence>

//                     {/* EDITOR */}
//                     <div className="relative">
//                       <RichEditor
//                         key={`editor-${currentQuestion.id}`}
//                         ref={editorRef}
//                         initialHtml={currentAnswerHtml}
//                         onChange={handleEditorChange}
//                       />
//                       {/* WORD COUNT INDICATOR */}
//                       <div className="absolute bottom-4 right-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest pointer-events-none">
//                         {wordCount} words
//                       </div>
//                     </div>
//                   </div>
//                 ) : (
//                   <div className="space-y-8 mt-4">
//                     <div className="flex flex-col items-center justify-center py-6 bg-cyan-50/50 rounded-2xl border border-cyan-100">
//                       <span className="text-sm font-semibold text-cyan-600 uppercase tracking-widest mb-2">
//                         Score
//                       </span>
//                       <div className="text-5xl font-bold text-slate-900 flex items-baseline gap-1">
//                         {getEvaluation(currentQuestion.id).score}
//                         <span className="text-2xl text-slate-400 font-medium">
//                           / 4
//                         </span>
//                       </div>
//                     </div>

//                     <div className="space-y-4">
//                       <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
//                         Markscheme Breakdown
//                       </h3>
//                       <div className="space-y-3">
//                         {getEvaluation(currentQuestion.id).points.map(
//                           (point, idx) => (
//                             <motion.div
//                               initial={{ opacity: 0, y: 10 }}
//                               animate={{ opacity: 1, y: 0 }}
//                               transition={{ delay: idx * 0.1 + 0.1 }}
//                               key={idx}
//                               className={`p-4 rounded-xl flex gap-4 items-start border ${
//                                 point.awarded
//                                   ? "bg-green-50/30 border-green-100"
//                                   : "bg-red-50/30 border-red-100"
//                               }`}
//                             >
//                               {point.awarded ? (
//                                 <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0 mt-0.5" />
//                               ) : (
//                                 <XCircle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
//                               )}
//                               <div>
//                                 <p className="text-slate-800 font-medium mb-1">
//                                   {point.text}
//                                 </p>
//                                 <div className="flex items-center text-sm gap-2">
//                                   <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
//                                   <span
//                                     className={
//                                       point.awarded
//                                         ? "text-green-700"
//                                         : "text-red-700"
//                                     }
//                                   >
//                                     {point.reason}
//                                   </span>
//                                 </div>
//                               </div>
//                             </motion.div>
//                           )
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </motion.div>
//             </AnimatePresence>
//           </div>
//         </div>
//       </div>

//       {/* FLOATING NAVBAR */}
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

//         <div className="flex-shrink-0 flex items-center justify-center gap-2 min-w-[140px] relative">
//           {/* EXPANDABLE FAB MENU */}
//           {(!isLearningMode || !isCurrentSubmitted) && (
//             <div className="relative">
//               <AnimatePresence>
//                 {showMenu && (
//                   <>
//                     <div
//                       className="fixed inset-0 z-30"
//                       onClick={() => setShowMenu(false)}
//                     />
//                     <motion.div
//                       initial={{ opacity: 0, y: 10, scale: 0.95 }}
//                       animate={{ opacity: 1, y: 0, scale: 1 }}
//                       exit={{ opacity: 0, y: 10, scale: 0.95 }}
//                       transition={{ duration: 0.15 }}
//                       className="absolute bottom-[calc(100%+12px)] left-1/2 -translate-x-1/2 flex items-center gap-1.5 p-1.5 bg-white border border-slate-200 shadow-xl rounded-full z-40"
//                     >
//                       {/* Math Tools */}
//                       <button
//                         onClick={() => insertMathAndClose("general")}
//                         className="w-10 h-10 flex flex-col items-center justify-center bg-slate-50 hover:bg-cyan-50 border border-slate-100 hover:border-cyan-200 text-slate-600 hover:text-cyan-700 rounded-full transition-all group"
//                         title="General Equation"
//                       >
//                         <Sigma className="w-4 h-4 group-hover:scale-110 transition-transform" />
//                       </button>
//                       <button
//                         onClick={() => insertMathAndClose("fraction")}
//                         className="w-10 h-10 flex flex-col items-center justify-center bg-slate-50 hover:bg-cyan-50 border border-slate-100 hover:border-cyan-200 text-slate-600 hover:text-cyan-700 rounded-full transition-all group"
//                         title="Fraction"
//                       >
//                         <Divide className="w-4 h-4 group-hover:scale-110 transition-transform" />
//                       </button>
//                       <button
//                         onClick={() => insertMathAndClose("power")}
//                         className="w-10 h-10 flex flex-col items-center justify-center bg-slate-50 hover:bg-cyan-50 border border-slate-100 hover:border-cyan-200 text-slate-600 hover:text-cyan-700 rounded-full transition-all group font-serif italic text-sm font-bold"
//                         title="Power / Exponent"
//                       >
//                         <span className="group-hover:scale-110 transition-transform tracking-tighter">
//                           x<span className="text-[10px] align-top">n</span>
//                         </span>
//                       </button>

//                       {/* Divider */}
//                       <div className="w-px h-6 bg-slate-200 mx-1" />

//                       {/* Formatting Tools */}
//                       <button
//                         onClick={() => insertListAndClose("bullet")}
//                         className="w-10 h-10 flex flex-col items-center justify-center bg-slate-50 hover:bg-cyan-50 border border-slate-100 hover:border-cyan-200 text-slate-600 hover:text-cyan-700 rounded-full transition-all group"
//                         title="Bullet List"
//                       >
//                         <List className="w-4 h-4 group-hover:scale-110 transition-transform" />
//                       </button>
//                       <button
//                         onClick={() => insertListAndClose("number")}
//                         className="w-10 h-10 flex flex-col items-center justify-center bg-slate-50 hover:bg-cyan-50 border border-slate-100 hover:border-cyan-200 text-slate-600 hover:text-cyan-700 rounded-full transition-all group"
//                         title="Numbered List"
//                       >
//                         <ListOrdered className="w-4 h-4 group-hover:scale-110 transition-transform" />
//                       </button>
//                     </motion.div>
//                   </>
//                 )}
//               </AnimatePresence>

//               <button
//                 onClick={() => setShowMenu(!showMenu)}
//                 className={`w-12 h-12 flex items-center justify-center border transition-all shadow-sm rounded-full ${
//                   showMenu
//                     ? "bg-slate-800 border-slate-800 text-white"
//                     : "bg-slate-50 border-slate-200 hover:border-cyan-300 hover:bg-cyan-50 text-slate-600 hover:text-cyan-700"
//                 }`}
//                 title="Add Math Element"
//               >
//                 <Plus
//                   className={`w-5 h-5 transition-transform duration-300 ${
//                     showMenu ? "rotate-45" : "rotate-0"
//                   }`}
//                 />
//               </button>
//             </div>
//           )}

//           {isLearningMode && !isCurrentSubmitted ? (
//             <button
//               onClick={submitCurrentAnswer}
//               disabled={
//                 (!currentAnswerText.trim() &&
//                   !currentAnswerHtml.includes("inline-math")) ||
//                 isLoading
//               }
//               className="flex items-center justify-center gap-2 w-full py-3 px-6 bg-cyan-600 hover:bg-cyan-700 text-white rounded-full font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
//             >
//               {isLoading ? (
//                 <Loader2 className="w-5 h-5 animate-spin" />
//               ) : (
//                 "Submit"
//               )}
//               {!isLoading && <Send className="w-4 h-4 ml-1" />}
//             </button>
//           ) : isLastQuestion ? (
//             <button
//               onClick={finishPractice}
//               className="flex items-center justify-center gap-2 w-full py-3 px-6 bg-slate-900 hover:bg-slate-800 text-white rounded-full font-medium transition-all shadow-sm"
//             >
//               Finish Set
//               <CheckCircle2 className="w-4 h-4 ml-1" />
//             </button>
//           ) : (
//             <div className="px-4 py-2 font-medium text-slate-400 text-sm tracking-wide">
//               {currentIndex + 1} / {questions.length}
//             </div>
//           )}

//           {/* ADDED REFERENCE MODAL BUTTON */}
//           <div className="w-px h-6 bg-slate-200 mx-1 hidden sm:block" />
//           <button
//             onClick={() => setShowReference(!showReference)}
//             className={`w-12 h-12 flex items-center justify-center border transition-all shadow-sm rounded-full ${
//               showReference
//                 ? "bg-cyan-600 border-cyan-600 text-white"
//                 : "bg-slate-50 border-slate-200 hover:border-cyan-300 hover:bg-cyan-50 text-slate-600 hover:text-cyan-700"
//             }`}
//             title="Reference Materials"
//           >
//             <Info className="w-5 h-5" />
//           </button>
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
//   ArrowRight,
//   Award,
//   Calculator,
//   CheckCircle2,
//   ChevronLeft,
//   ChevronRight,
//   Clock,
//   Delete,
//   Divide,
//   Eye,
//   EyeOff,
//   FileText,
//   GripHorizontal,
//   Info,
//   Lightbulb,
//   List,
//   ListOrdered,
//   Loader2,
//   Play,
//   Plus,
//   Send,
//   Settings2,
//   Sigma,
//   Target,
//   X,
//   XCircle,
// } from "lucide-react";
// import * as math from "mathjs";
// import React, {
//   forwardRef,
//   useEffect,
//   useImperativeHandle,
//   useRef,
//   useState,
// } from "react";

// // --- MOCK DATA ---
// const SET_STATS = {
//   totalQuestions: 3,
//   totalMarks: 12,
//   estimatedMinutes: 10,
// };

// const questions = [
//   {
//     id: 1,
//     question: "Define a physical quantity.",
//     hints: [
//       "Think about what scientists actually measure in the real world.",
//       "A complete definition usually mentions two things: the value (number) and what it's measured in.",
//     ],
//     markscheme: [
//       "A measurable property",
//       "Expressed with numerical value",
//       "Includes a unit",
//       "Used to describe physical systems",
//     ],
//   },
//   {
//     id: 2,
//     question: "Explain the difference between scalar and vector quantities.",
//     hints: [
//       "One of them only tells you 'how much', while the other tells you 'how much' AND 'which way'.",
//       "Providing one example for each will usually secure full marks in this type of question.",
//     ],
//     markscheme: [
//       "Scalar has magnitude only",
//       "Vector has magnitude and direction",
//       "Example of scalar",
//       "Example of vector",
//     ],
//   },
//   {
//     id: 3,
//     question: "State Newton's Second Law.",
//     hints: [],
//     markscheme: [
//       "Force equals mass times acceleration",
//       "F = ma",
//       "Acceleration proportional to force",
//       "Inversely proportional to mass",
//     ],
//   },
// ];

// // --- MOCK EVALUATION LOGIC ---
// const getEvaluation = (questionId: number) => {
//   if (questionId === 1) {
//     return {
//       score: 2,
//       points: [
//         {
//           awarded: true,
//           text: "A measurable property",
//           reason: "User mentioned measurement",
//         },
//         {
//           awarded: true,
//           text: "Expressed with numerical value",
//           reason: "Numerical aspect included",
//         },
//         { awarded: false, text: "Includes a unit", reason: "Units missing" },
//         {
//           awarded: false,
//           text: "Used to describe physical systems",
//           reason: "Context missing",
//         },
//       ],
//     };
//   }
//   if (questionId === 2) {
//     return {
//       score: 0,
//       points: [
//         {
//           awarded: false,
//           text: "Scalar has magnitude only",
//           reason: "Concept missing",
//         },
//         {
//           awarded: false,
//           text: "Vector has magnitude and direction",
//           reason: "Concept missing",
//         },
//         {
//           awarded: false,
//           text: "Example of scalar",
//           reason: "No example provided",
//         },
//         {
//           awarded: false,
//           text: "Example of vector",
//           reason: "No example provided",
//         },
//       ],
//     };
//   }
//   return {
//     score: 4,
//     points: [
//       {
//         awarded: true,
//         text: "Force equals mass times acceleration",
//         reason: "Definition accurate",
//       },
//       { awarded: true, text: "F = ma", reason: "Formula present" },
//       {
//         awarded: true,
//         text: "Acceleration proportional to force",
//         reason: "Relationship correct",
//       },
//       {
//         awarded: true,
//         text: "Inversely proportional to mass",
//         reason: "Relationship correct",
//       },
//     ],
//   };
// };

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

// const MathInline = ({ latex }: { latex: string }) => (
//   <span dangerouslySetInnerHTML={{ __html: safeRenderKatex(latex) }} />
// );

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

// // --- NOTION-LIKE RICH TEXT EDITOR ---
// type MathType = "general" | "fraction" | "power";

// interface EditorRef {
//   insertMath: (type: MathType) => void;
//   insertList: (type: "bullet" | "number") => void;
// }

// const formatTime = (seconds: number) => {
//   const m = Math.floor(seconds / 60);
//   const s = seconds % 60;
//   return `${m}:${s.toString().padStart(2, "0")}`;
// };

// const RichEditor = forwardRef<
//   EditorRef,
//   {
//     initialHtml: string;
//     onChange: (html: string, text: string) => void;
//     readOnly?: boolean;
//   }
// >(({ initialHtml, onChange, readOnly }, ref) => {
//   const editorRef = useRef<HTMLDivElement>(null);

//   const [popover, setPopover] = useState<{
//     id: string;
//     x: number;
//     y: number;
//     type: MathType;
//     latex: string;
//     num: string;
//     den: string;
//     base: string;
//     exp: string;
//   } | null>(null);

//   useEffect(() => {
//     if (editorRef.current) {
//       editorRef.current.innerHTML = initialHtml;
//     }
//   }, []);

//   useImperativeHandle(ref, () => ({
//     insertMath: (type: MathType = "general") => {
//       const editorNode = editorRef.current;
//       if (!editorNode) return;

//       const sel = window.getSelection();
//       if (
//         !sel ||
//         sel.rangeCount === 0 ||
//         !editorNode.contains(sel.anchorNode)
//       ) {
//         editorNode.focus();
//         const range = document.createRange();
//         range.selectNodeContents(editorNode);
//         range.collapse(false);
//         sel?.removeAllRanges();
//         sel?.addRange(range);
//       }

//       const range = window.getSelection()!.getRangeAt(0);

//       const span = document.createElement("span");
//       const mathId = `math-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
//       span.id = mathId;
//       span.contentEditable = "false";
//       span.className =
//         "inline-math cursor-pointer inline-block align-middle bg-slate-100 hover:bg-slate-200 px-1.5 py-0.5 rounded text-cyan-800 mx-1 border border-slate-200 transition-colors shadow-sm select-none";

//       span.dataset.mathType = type;
//       span.dataset.latex = "";
//       span.dataset.num = "";
//       span.dataset.den = "";
//       span.dataset.base = "";
//       span.dataset.exp = "";

//       if (type === "fraction") span.innerHTML = "<i>a/b</i>";
//       else if (type === "power") span.innerHTML = "<i>xⁿ</i>";
//       else span.innerHTML = "<i>ƒ(x)</i>";

//       range.insertNode(span);

//       const zws = document.createTextNode("\u200B");
//       range.collapse(false);
//       range.insertNode(zws);
//       range.setStartAfter(zws);
//       range.setEndAfter(zws);
//       window.getSelection()!.removeAllRanges();
//       window.getSelection()!.addRange(range);

//       const rect = span.getBoundingClientRect();
//       setPopover({
//         id: mathId,
//         x: rect.left,
//         y: rect.bottom + 8,
//         type,
//         latex: "",
//         num: "",
//         den: "",
//         base: "",
//         exp: "",
//       });

//       triggerChange();
//     },
//     insertList: (type: "bullet" | "number") => {
//       const editorNode = editorRef.current;
//       if (!editorNode) return;
//       editorNode.focus();
//       document.execCommand(
//         type === "number" ? "insertOrderedList" : "insertUnorderedList",
//         false
//       );
//       triggerChange();
//     },
//   }));

//   const triggerChange = () => {
//     if (editorRef.current) {
//       onChange(editorRef.current.innerHTML, editorRef.current.innerText);
//     }
//   };

//   const handleEditorClick = (e: React.MouseEvent) => {
//     if (readOnly) return;
//     const target = e.target as HTMLElement;
//     const mathNode = target.closest(".inline-math") as HTMLElement;

//     if (mathNode) {
//       const rect = mathNode.getBoundingClientRect();

//       if (!mathNode.id) {
//         mathNode.id = `math-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
//       }

//       setPopover({
//         id: mathNode.id,
//         x: rect.left,
//         y: rect.bottom + 8,
//         type: (mathNode.dataset.mathType as MathType) || "general",
//         latex: mathNode.dataset.latex || "",
//         num: mathNode.dataset.num || "",
//         den: mathNode.dataset.den || "",
//         base: mathNode.dataset.base || "",
//         exp: mathNode.dataset.exp || "",
//       });
//     }
//   };

//   const updateMathField = (
//     field: "latex" | "num" | "den" | "base" | "exp",
//     val: string
//   ) => {
//     if (!popover) return;

//     const newPopover = { ...popover, [field]: val };
//     setPopover(newPopover);

//     const node = document.getElementById(popover.id);
//     if (node) {
//       node.dataset[field] = val;

//       let finalLatex = "";
//       if (newPopover.type === "general") finalLatex = newPopover.latex;
//       if (newPopover.type === "fraction") {
//         if (newPopover.num || newPopover.den)
//           finalLatex = `\\frac{${newPopover.num || " "}}{${
//             newPopover.den || " "
//           }}`;
//       }
//       if (newPopover.type === "power") {
//         if (newPopover.base || newPopover.exp)
//           finalLatex = `${newPopover.base || " "}^{${newPopover.exp || " "}}`;
//       }

//       if (finalLatex.trim() === "") {
//         if (newPopover.type === "fraction") node.innerHTML = "<i>a/b</i>";
//         else if (newPopover.type === "power") node.innerHTML = "<i>xⁿ</i>";
//         else node.innerHTML = "<i>ƒ(x)</i>";
//       } else {
//         node.innerHTML = safeRenderKatex(finalLatex);
//       }
//       triggerChange();
//     }
//   };

//   let previewLatex = "";
//   if (popover) {
//     if (popover.type === "general") previewLatex = popover.latex;
//     if (popover.type === "fraction" && (popover.num || popover.den))
//       previewLatex = `\\frac{${popover.num || " "}}{${popover.den || " "}}`;
//     if (popover.type === "power" && (popover.base || popover.exp))
//       previewLatex = `${popover.base || " "}^{${popover.exp || " "}}`;
//   }

//   return (
//     <>
//       <style>{`
//         .custom-editor:empty:before {
//           content: attr(data-placeholder);
//           color: #94a3b8;
//           pointer-events: none;
//         }
//         .custom-editor .katex {
//            font-size: 1.15em;
//         }
//         .custom-editor ul {
//            list-style-type: disc;
//            padding-left: 1.5rem;
//            margin-top: 0.5rem;
//            margin-bottom: 0.5rem;
//         }
//         .custom-editor ol {
//            list-style-type: decimal;
//            padding-left: 1.5rem;
//            margin-top: 0.5rem;
//            margin-bottom: 0.5rem;
//         }
//         .custom-editor li {
//            margin-bottom: 0.25rem;
//            padding-left: 0.25rem;
//         }
//       `}</style>

//       <div
//         ref={editorRef}
//         contentEditable={!readOnly}
//         suppressContentEditableWarning
//         onInput={triggerChange}
//         onClick={handleEditorClick}
//         data-placeholder="Write your answer here..."
//         className={`custom-editor w-full min-h-[14rem] p-5 pb-10 bg-slate-50 text-slate-700 border border-slate-200 rounded-2xl transition-all text-lg leading-relaxed shadow-inner focus:outline-none ${
//           !readOnly
//             ? "focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
//             : "opacity-80"
//         }`}
//       />

//       {/* NOTION MATH POPOVER */}
//       {popover && (
//         <>
//           <div
//             className="fixed inset-0 z-40"
//             onClick={() => setPopover(null)}
//           />
//           <motion.div
//             initial={{ opacity: 0, y: -5 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="fixed z-50 bg-white border border-slate-200 shadow-xl rounded-xl p-4 w-[340px] flex flex-col gap-4"
//             style={{
//               top: popover.y,
//               left: Math.min(popover.x, window.innerWidth - 360),
//             }}
//           >
//             <div className="flex justify-between items-center">
//               <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
//                 {popover.type === "fraction"
//                   ? "Fraction"
//                   : popover.type === "power"
//                   ? "Power/Exponent"
//                   : "Inline Equation"}
//               </div>
//               <button
//                 onClick={() => setPopover(null)}
//                 className="text-xs px-3 py-1.5 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 rounded-md font-semibold transition-colors border border-cyan-100"
//               >
//                 Done
//               </button>
//             </div>

//             {popover.type === "general" && (
//               <input
//                 autoFocus
//                 value={popover.latex}
//                 onChange={(e) => updateMathField("latex", e.target.value)}
//                 onKeyDown={(e) => {
//                   if (e.key === "Enter") setPopover(null);
//                 }}
//                 placeholder="e.g. E = mc^2"
//                 className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
//               />
//             )}

//             {popover.type === "fraction" && (
//               <div className="flex flex-col gap-2">
//                 <input
//                   autoFocus
//                   value={popover.num}
//                   onChange={(e) => updateMathField("num", e.target.value)}
//                   placeholder="Numerator (Top)"
//                   className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 font-mono text-sm text-center focus:outline-none focus:ring-2 focus:ring-cyan-500"
//                 />
//                 <div className="w-full h-[2px] bg-slate-200 rounded-full my-0.5" />
//                 <input
//                   value={popover.den}
//                   onChange={(e) => updateMathField("den", e.target.value)}
//                   placeholder="Denominator (Bottom)"
//                   className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 font-mono text-sm text-center focus:outline-none focus:ring-2 focus:ring-cyan-500"
//                 />
//               </div>
//             )}

//             {popover.type === "power" && (
//               <div className="flex items-start gap-2">
//                 <input
//                   autoFocus
//                   value={popover.base}
//                   onChange={(e) => updateMathField("base", e.target.value)}
//                   placeholder="Base (x)"
//                   className="flex-1 bg-slate-50 border border-slate-200 rounded-md p-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
//                 />
//                 <input
//                   value={popover.exp}
//                   onChange={(e) => updateMathField("exp", e.target.value)}
//                   placeholder="Exp (n)"
//                   className="w-[100px] bg-slate-50 border border-slate-200 rounded-md p-2 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500 mt-[-8px] shadow-sm"
//                 />
//               </div>
//             )}

//             <div className="min-h-[3rem] flex justify-center items-center bg-slate-50/50 rounded-md border border-slate-100 p-2 overflow-x-auto text-slate-800">
//               {previewLatex ? (
//                 <span
//                   dangerouslySetInnerHTML={{
//                     __html: safeRenderKatex(previewLatex),
//                   }}
//                 />
//               ) : (
//                 <span className="text-slate-400 text-sm italic">
//                   Live Preview...
//                 </span>
//               )}
//             </div>
//           </motion.div>
//         </>
//       )}
//     </>
//   );
// });
// RichEditor.displayName = "RichEditor";

// // --- MAIN COMPONENT ---
// export default function TheoryPractice() {
//   const [hasStarted, setHasStarted] = useState(false);
//   const [isCompleted, setIsCompleted] = useState(false);

//   const [useTimer, setUseTimer] = useState(true);
//   const [isLearningMode, setIsLearningMode] = useState(true);
//   const [timeLeft, setTimeLeft] = useState(SET_STATS.estimatedMinutes * 60);

//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [direction, setDirection] = useState(1);
//   const [userAnswersHtml, setUserAnswersHtml] = useState<
//     Record<number, string>
//   >({});
//   const [userAnswersText, setUserAnswersText] = useState<
//     Record<number, string>
//   >({});
//   const [submittedQuestions, setSubmittedQuestions] = useState<
//     Record<number, boolean>
//   >({});
//   const [isLoading, setIsLoading] = useState(false);

//   // UI Controls
//   const [showMenu, setShowMenu] = useState(false);
//   const [showMarkschemePreview, setShowMarkschemePreview] = useState(false);
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

//   const editorRef = useRef<EditorRef>(null);

//   const currentQuestion = questions[currentIndex];
//   const isLastQuestion = currentIndex === questions.length - 1;
//   const currentAnswerHtml = userAnswersHtml[currentQuestion.id] || "";
//   const currentAnswerText = userAnswersText[currentQuestion.id] || "";
//   const isCurrentSubmitted = submittedQuestions[currentQuestion.id] || false;

//   const wordCount = currentAnswerText.trim()
//     ? currentAnswerText
//         .trim()
//         .split(/\s+/)
//         .filter((w) => w.length > 0).length
//     : 0;

//   useEffect(() => {
//     const checkDesktop = () => setIsDesktop(window.innerWidth >= 768);
//     checkDesktop();
//     window.addEventListener("resize", checkDesktop);
//     return () => window.removeEventListener("resize", checkDesktop);
//   }, []);

//   useEffect(() => {
//     let timer: NodeJS.Timeout;
//     if (hasStarted && !isCompleted && useTimer && timeLeft > 0) {
//       timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
//     }
//     return () => clearInterval(timer);
//   }, [hasStarted, isCompleted, useTimer, timeLeft]);

//   // Calculator Live Evaluation
//   useEffect(() => {
//     if (!calcInput) {
//       setCalcResult("");
//       return;
//     }
//     try {
//       // Map UI characters to mathjs evaluable strings
//       const evalStr = calcInput
//         .replace(/×/g, "*")
//         .replace(/÷/g, "/")
//         .replace(/²/g, "^2")
//         .replace(/π/g, "pi")
//         .replace(/√\(/g, "sqrt(")
//         .replace(/ln\(/g, "log(") // mathjs log() is natural log
//         .replace(/log\(/g, "log10("); // Map our UI log() to base 10

//       const res = math.evaluate(evalStr);
//       if (res !== undefined && typeof res !== "function") {
//         // Format to avoid long float artifacts
//         setCalcResult(math.format(res, { precision: 10 }));
//       }
//     } catch (e) {
//       // Expression incomplete, hide preview without throwing
//       setCalcResult("");
//     }
//   }, [calcInput]);

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

//   const handleEditorChange = (html: string, text: string) => {
//     setUserAnswersHtml((prev) => ({ ...prev, [currentQuestion.id]: html }));
//     setUserAnswersText((prev) => ({ ...prev, [currentQuestion.id]: text }));
//   };

//   const submitCurrentAnswer = () => {
//     if (!currentAnswerText.trim() && !currentAnswerHtml.includes("inline-math"))
//       return;
//     if (isLoading) return;
//     setIsLoading(true);
//     setTimeout(() => {
//       setIsLoading(false);
//       setSubmittedQuestions((prev) => ({
//         ...prev,
//         [currentQuestion.id]: true,
//       }));
//     }, 500);
//   };

//   const resetHelpers = () => {
//     setShowMarkschemePreview(false);
//     setShowHintPopover(false);
//     setRevealedHints(1);
//     setShowMenu(false);
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

//   const finishPractice = () => setIsCompleted(true);
//   const insertMathAndClose = (type: MathType) => {
//     editorRef.current?.insertMath(type);
//     setShowMenu(false);
//   };
//   const insertListAndClose = (type: "bullet" | "number") => {
//     editorRef.current?.insertList(type);
//     setShowMenu(false);
//   };

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
//             Physics Theory Set #1
//           </h1>
//           <p className="text-slate-500 mb-8">
//             Test your understanding of core physical properties and laws.
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
//       (sum, q) => sum + getEvaluation(q.id).score,
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
//               const evalResult = getEvaluation(q.id);
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
//                       {q.question}
//                     </h3>
//                     <div className="px-3 py-1 bg-cyan-50 text-cyan-700 font-bold rounded-lg text-sm shrink-0">
//                       {evalResult.score} / 4
//                     </div>
//                   </div>
//                   <div
//                     className="custom-editor bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 text-slate-600"
//                     dangerouslySetInnerHTML={{
//                       __html:
//                         userAnswersHtml[q.id] ||
//                         "<span class='italic opacity-60'>No answer provided.</span>",
//                     }}
//                   />
//                   <div className="space-y-3">
//                     {evalResult.points.map((point, pIdx) => (
//                       <div
//                         key={pIdx}
//                         className="flex gap-4 items-start text-sm"
//                       >
//                         {point.awarded ? (
//                           <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
//                         ) : (
//                           <XCircle className="w-5 h-5 text-red-400 shrink-0" />
//                         )}
//                         <div>
//                           <p
//                             className={`font-medium ${
//                               point.awarded
//                                 ? "text-slate-800"
//                                 : "text-slate-500"
//                             }`}
//                           >
//                             {point.text}
//                           </p>
//                           <p
//                             className={
//                               point.awarded ? "text-green-600" : "text-red-500"
//                             }
//                           >
//                             ↳ {point.reason}
//                           </p>
//                         </div>
//                       </div>
//                     ))}
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
//                           <MathInline latex="v = u + at" />
//                         </div>
//                         <div className="flex justify-between items-center">
//                           <span>Displacement</span>{" "}
//                           <MathInline latex="s = ut + \frac{1}{2}at^2" />
//                         </div>
//                       </div>
//                     </div>
//                     <div>
//                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
//                         Dynamics
//                       </p>
//                       <div className="space-y-3 text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">
//                         <div className="flex justify-between items-center">
//                           <span>Force</span> <MathInline latex="F = ma" />
//                         </div>
//                         <div className="flex justify-between items-center">
//                           <span>Momentum</span> <MathInline latex="p = mv" />
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
//                           <MathInline latex="9.81 \, \text{m/s}^2" />
//                         </div>
//                         <div className="flex justify-between items-center">
//                           <span>Speed of Light (c)</span>{" "}
//                           <MathInline latex="3 \times 10^8 \, \text{m/s}" />
//                         </div>
//                         <div className="flex justify-between items-center">
//                           <span>Planck (h)</span>{" "}
//                           <MathInline latex="6.63 \times 10^{-34} \, \text{J s}" />
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
//                           <MathInline latex="\frac{a}{b}" />
//                         </div>
//                         <div className="flex justify-between items-center">
//                           <code className="text-[11px] bg-white px-1.5 py-0.5 rounded border border-slate-200">
//                             x^2
//                           </code>{" "}
//                           <MathInline latex="x^2" />
//                         </div>
//                         <div className="flex justify-between items-center">
//                           <code className="text-[11px] bg-white px-1.5 py-0.5 rounded border border-slate-200">
//                             v_0
//                           </code>{" "}
//                           <MathInline latex="v_0" />
//                         </div>
//                         <div className="flex justify-between items-center">
//                           <code className="text-[11px] bg-white px-1.5 py-0.5 rounded border border-slate-200">
//                             \sqrt{"{x}"}
//                           </code>{" "}
//                           <MathInline latex="\sqrt{x}" />
//                         </div>
//                         <div className="flex justify-between items-center">
//                           <code className="text-[11px] bg-white px-1.5 py-0.5 rounded border border-slate-200">
//                             \Delta
//                           </code>{" "}
//                           <MathInline latex="\Delta" />
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
//               } // Placed on left side
//               className={`fixed z-[70] bg-white border border-slate-200 flex flex-col shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] overflow-hidden ${
//                 isDesktop
//                   ? "rounded-2xl absolute"
//                   : "inset-x-4 bottom-24 rounded-3xl"
//               }`}
//             >
//               {/* Calc Header (Drag Handle) */}
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

//               {/* Display */}
//               <div className="bg-white p-5 border-b border-slate-100 flex flex-col items-end min-h-[100px] justify-end">
//                 <div className="text-slate-400 font-mono text-sm tracking-wider mb-1 w-full text-right overflow-hidden text-ellipsis whitespace-nowrap">
//                   {calcInput || "0"}
//                 </div>
//                 <div className="text-3xl font-semibold text-slate-900 font-mono overflow-hidden text-ellipsis whitespace-nowrap">
//                   {calcResult ? `= ${calcResult}` : "\u00A0"}
//                 </div>
//               </div>

//               {/* Keypad Grid */}
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
//                       "bg-white hover:bg-slate-100 text-slate-600 border border-slate-200"; // default for advanced ops
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

//       {/* MAIN VIEW CONTENT */}
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
//                 <h1 className="text-2xl md:text-3xl font-medium leading-snug text-slate-900 mb-6">
//                   {currentQuestion.question}
//                 </h1>

//                 {!isLearningMode || !isCurrentSubmitted ? (
//                   <div className="space-y-4">
//                     {/* HELPER TOOLBAR (Markscheme Preview & Hints) */}
//                     <div className="flex justify-between items-center relative z-20">
//                       {/* Left: Markscheme Preview Toggle */}
//                       {isLearningMode && (
//                         <button
//                           onClick={() =>
//                             setShowMarkschemePreview(!showMarkschemePreview)
//                           }
//                           className={`flex items-center gap-2 text-sm font-semibold transition-colors ${
//                             showMarkschemePreview
//                               ? "text-cyan-600"
//                               : "text-slate-400 hover:text-cyan-600"
//                           }`}
//                         >
//                           {showMarkschemePreview ? (
//                             <EyeOff className="w-4 h-4" />
//                           ) : (
//                             <Eye className="w-4 h-4" />
//                           )}
//                           {showMarkschemePreview
//                             ? "Hide Markscheme"
//                             : "Preview Markscheme"}
//                         </button>
//                       )}
//                       {!isLearningMode && <div />}{" "}
//                       {/* Spacer if learning mode is off */}
//                       {/* Right: Hint Button & Popover */}
//                       {currentQuestion.hints &&
//                         currentQuestion.hints.length > 0 && (
//                           <div className="relative">
//                             <button
//                               onClick={() =>
//                                 setShowHintPopover(!showHintPopover)
//                               }
//                               className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors border ${
//                                 showHintPopover || revealedHints > 1
//                                   ? "bg-amber-50 text-amber-600 border-amber-200 shadow-sm"
//                                   : "bg-white text-slate-400 border-slate-200 hover:text-amber-500 hover:border-amber-200"
//                               }`}
//                             >
//                               <Lightbulb
//                                 className={`w-4 h-4 ${
//                                   showHintPopover || revealedHints > 1
//                                     ? "fill-amber-100"
//                                     : ""
//                                 }`}
//                               />
//                               Hints {revealedHints > 1 && `(${revealedHints})`}
//                             </button>

//                             {/* Hint Popover Dropdown */}
//                             <AnimatePresence>
//                               {showHintPopover && (
//                                 <>
//                                   <div
//                                     className="fixed inset-0 z-30"
//                                     onClick={() => setShowHintPopover(false)}
//                                   />
//                                   <motion.div
//                                     initial={{ opacity: 0, y: 5, scale: 0.95 }}
//                                     animate={{ opacity: 1, y: 0, scale: 1 }}
//                                     exit={{ opacity: 0, y: 5, scale: 0.95 }}
//                                     transition={{ duration: 0.15 }}
//                                     className="absolute right-0 top-[calc(100%+8px)] w-72 md:w-80 bg-white border border-slate-200 shadow-xl rounded-xl p-4 z-40"
//                                   >
//                                     <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">
//                                       Available Hints
//                                     </div>
//                                     <div className="space-y-2">
//                                       {currentQuestion.hints
//                                         .slice(0, revealedHints)
//                                         .map((hint, idx) => (
//                                           <motion.div
//                                             initial={{ opacity: 0, x: -5 }}
//                                             animate={{ opacity: 1, x: 0 }}
//                                             key={idx}
//                                             className="p-3 bg-amber-50/80 rounded-lg text-sm text-amber-900 border border-amber-100/50 leading-relaxed"
//                                           >
//                                             {hint}
//                                           </motion.div>
//                                         ))}
//                                     </div>
//                                     {revealedHints <
//                                       currentQuestion.hints.length && (
//                                       <button
//                                         onClick={() =>
//                                           setRevealedHints((prev) => prev + 1)
//                                         }
//                                         className="mt-3 w-full py-2 bg-slate-50 hover:bg-amber-50 text-xs font-bold text-slate-500 hover:text-amber-600 border border-slate-200 hover:border-amber-200 rounded-lg transition-colors"
//                                       >
//                                         Reveal Next Hint
//                                       </button>
//                                     )}
//                                   </motion.div>
//                                 </>
//                               )}
//                             </AnimatePresence>
//                           </div>
//                         )}
//                     </div>

//                     {/* MARKSCHEME PREVIEW DRAWER */}
//                     <AnimatePresence>
//                       {showMarkschemePreview && (
//                         <motion.div
//                           initial={{ height: 0, opacity: 0 }}
//                           animate={{ height: "auto", opacity: 1 }}
//                           exit={{ height: 0, opacity: 0 }}
//                           className="overflow-hidden"
//                         >
//                           <div className="p-5 bg-cyan-50/50 border border-cyan-100 rounded-2xl mb-2">
//                             <div className="text-[10px] font-bold text-cyan-600 uppercase tracking-wider mb-3">
//                               Required Points (
//                               {currentQuestion.markscheme.length})
//                             </div>
//                             <ul className="list-disc pl-5 space-y-1">
//                               {currentQuestion.markscheme.map((point, idx) => (
//                                 <li
//                                   key={idx}
//                                   className="text-sm text-slate-700"
//                                 >
//                                   {point}
//                                 </li>
//                               ))}
//                             </ul>
//                           </div>
//                         </motion.div>
//                       )}
//                     </AnimatePresence>

//                     {/* EDITOR */}
//                     <div className="relative">
//                       <RichEditor
//                         key={`editor-${currentQuestion.id}`}
//                         ref={editorRef}
//                         initialHtml={currentAnswerHtml}
//                         onChange={handleEditorChange}
//                       />
//                       {/* WORD COUNT INDICATOR */}
//                       <div className="absolute bottom-4 right-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest pointer-events-none">
//                         {wordCount} words
//                       </div>
//                     </div>
//                   </div>
//                 ) : (
//                   <div className="space-y-8 mt-4">
//                     <div className="flex flex-col items-center justify-center py-6 bg-cyan-50/50 rounded-2xl border border-cyan-100">
//                       <span className="text-sm font-semibold text-cyan-600 uppercase tracking-widest mb-2">
//                         Score
//                       </span>
//                       <div className="text-5xl font-bold text-slate-900 flex items-baseline gap-1">
//                         {getEvaluation(currentQuestion.id).score}
//                         <span className="text-2xl text-slate-400 font-medium">
//                           / 4
//                         </span>
//                       </div>
//                     </div>

//                     <div className="space-y-4">
//                       <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
//                         Markscheme Breakdown
//                       </h3>
//                       <div className="space-y-3">
//                         {getEvaluation(currentQuestion.id).points.map(
//                           (point, idx) => (
//                             <motion.div
//                               initial={{ opacity: 0, y: 10 }}
//                               animate={{ opacity: 1, y: 0 }}
//                               transition={{ delay: idx * 0.1 + 0.1 }}
//                               key={idx}
//                               className={`p-4 rounded-xl flex gap-4 items-start border ${
//                                 point.awarded
//                                   ? "bg-green-50/30 border-green-100"
//                                   : "bg-red-50/30 border-red-100"
//                               }`}
//                             >
//                               {point.awarded ? (
//                                 <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0 mt-0.5" />
//                               ) : (
//                                 <XCircle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
//                               )}
//                               <div>
//                                 <p className="text-slate-800 font-medium mb-1">
//                                   {point.text}
//                                 </p>
//                                 <div className="flex items-center text-sm gap-2">
//                                   <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
//                                   <span
//                                     className={
//                                       point.awarded
//                                         ? "text-green-700"
//                                         : "text-red-700"
//                                     }
//                                   >
//                                     {point.reason}
//                                   </span>
//                                 </div>
//                               </div>
//                             </motion.div>
//                           )
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </motion.div>
//             </AnimatePresence>
//           </div>
//         </div>
//       </div>

//       {/* FLOATING NAVBAR */}
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

//         <div className="flex-shrink-0 flex items-center justify-center gap-2 min-w-[140px] relative">
//           {/* EXPANDABLE FAB MENU */}
//           {(!isLearningMode || !isCurrentSubmitted) && (
//             <div className="relative">
//               <AnimatePresence>
//                 {showMenu && (
//                   <>
//                     <div
//                       className="fixed inset-0 z-30"
//                       onClick={() => setShowMenu(false)}
//                     />
//                     <motion.div
//                       initial={{ opacity: 0, y: 10, scale: 0.95 }}
//                       animate={{ opacity: 1, y: 0, scale: 1 }}
//                       exit={{ opacity: 0, y: 10, scale: 0.95 }}
//                       transition={{ duration: 0.15 }}
//                       className="absolute bottom-[calc(100%+12px)] left-1/2 -translate-x-1/2 flex items-center gap-1.5 p-1.5 bg-white border border-slate-200 shadow-xl rounded-full z-40"
//                     >
//                       <button
//                         onClick={() => insertMathAndClose("general")}
//                         className="w-10 h-10 flex flex-col items-center justify-center bg-slate-50 hover:bg-cyan-50 border border-slate-100 hover:border-cyan-200 text-slate-600 hover:text-cyan-700 rounded-full transition-all group"
//                         title="General Equation"
//                       >
//                         <Sigma className="w-4 h-4 group-hover:scale-110 transition-transform" />
//                       </button>
//                       <button
//                         onClick={() => insertMathAndClose("fraction")}
//                         className="w-10 h-10 flex flex-col items-center justify-center bg-slate-50 hover:bg-cyan-50 border border-slate-100 hover:border-cyan-200 text-slate-600 hover:text-cyan-700 rounded-full transition-all group"
//                         title="Fraction"
//                       >
//                         <Divide className="w-4 h-4 group-hover:scale-110 transition-transform" />
//                       </button>
//                       <button
//                         onClick={() => insertMathAndClose("power")}
//                         className="w-10 h-10 flex flex-col items-center justify-center bg-slate-50 hover:bg-cyan-50 border border-slate-100 hover:border-cyan-200 text-slate-600 hover:text-cyan-700 rounded-full transition-all group font-serif italic text-sm font-bold"
//                         title="Power / Exponent"
//                       >
//                         <span className="group-hover:scale-110 transition-transform tracking-tighter">
//                           x<span className="text-[10px] align-top">n</span>
//                         </span>
//                       </button>

//                       <div className="w-px h-6 bg-slate-200 mx-1" />

//                       <button
//                         onClick={() => insertListAndClose("bullet")}
//                         className="w-10 h-10 flex flex-col items-center justify-center bg-slate-50 hover:bg-cyan-50 border border-slate-100 hover:border-cyan-200 text-slate-600 hover:text-cyan-700 rounded-full transition-all group"
//                         title="Bullet List"
//                       >
//                         <List className="w-4 h-4 group-hover:scale-110 transition-transform" />
//                       </button>
//                       <button
//                         onClick={() => insertListAndClose("number")}
//                         className="w-10 h-10 flex flex-col items-center justify-center bg-slate-50 hover:bg-cyan-50 border border-slate-100 hover:border-cyan-200 text-slate-600 hover:text-cyan-700 rounded-full transition-all group"
//                         title="Numbered List"
//                       >
//                         <ListOrdered className="w-4 h-4 group-hover:scale-110 transition-transform" />
//                       </button>
//                     </motion.div>
//                   </>
//                 )}
//               </AnimatePresence>

//               <button
//                 onClick={() => setShowMenu(!showMenu)}
//                 className={`w-12 h-12 flex items-center justify-center border transition-all shadow-sm rounded-full ${
//                   showMenu
//                     ? "bg-slate-800 border-slate-800 text-white"
//                     : "bg-slate-50 border-slate-200 hover:border-cyan-300 hover:bg-cyan-50 text-slate-600 hover:text-cyan-700"
//                 }`}
//                 title="Add Content"
//               >
//                 <Plus
//                   className={`w-5 h-5 transition-transform duration-300 ${
//                     showMenu ? "rotate-45" : "rotate-0"
//                   }`}
//                 />
//               </button>
//             </div>
//           )}

//           {isLearningMode && !isCurrentSubmitted ? (
//             <button
//               onClick={submitCurrentAnswer}
//               disabled={
//                 (!currentAnswerText.trim() &&
//                   !currentAnswerHtml.includes("inline-math")) ||
//                 isLoading
//               }
//               className="flex items-center justify-center gap-2 w-full py-3 px-6 bg-cyan-600 hover:bg-cyan-700 text-white rounded-full font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
//             >
//               {isLoading ? (
//                 <Loader2 className="w-5 h-5 animate-spin" />
//               ) : (
//                 "Submit"
//               )}
//               {!isLoading && <Send className="w-4 h-4 ml-1" />}
//             </button>
//           ) : isLastQuestion ? (
//             <button
//               onClick={finishPractice}
//               className="flex items-center justify-center gap-2 w-full py-3 px-6 bg-slate-900 hover:bg-slate-800 text-white rounded-full font-medium transition-all shadow-sm"
//             >
//               Finish Set
//               <CheckCircle2 className="w-4 h-4 ml-1" />
//             </button>
//           ) : (
//             <div className="px-4 py-2 font-medium text-slate-400 text-sm tracking-wide">
//               {currentIndex + 1} / {questions.length}
//             </div>
//           )}

//           <div className="w-px h-6 bg-slate-200 mx-1 hidden sm:block" />

//           <button
//             onClick={() => setShowReference(!showReference)}
//             className={`w-12 h-12 flex items-center justify-center border transition-all shadow-sm rounded-full ${
//               showReference
//                 ? "bg-cyan-600 border-cyan-600 text-white"
//                 : "bg-slate-50 border-slate-200 hover:border-cyan-300 hover:bg-cyan-50 text-slate-600 hover:text-cyan-700"
//             }`}
//             title="Reference Materials"
//           >
//             <Info className="w-5 h-5" />
//           </button>

//           {/* CALCULATOR TOGGLE BUTTON */}
//           <button
//             onClick={() => setShowCalculator(!showCalculator)}
//             className={`w-12 h-12 flex items-center justify-center border transition-all shadow-sm rounded-full ${
//               showCalculator
//                 ? "bg-cyan-600 border-cyan-600 text-white"
//                 : "bg-slate-50 border-slate-200 hover:border-cyan-300 hover:bg-cyan-50 text-slate-600 hover:text-cyan-700"
//             }`}
//             title="Scientific Calculator"
//           >
//             <Calculator className="w-5 h-5" />
//           </button>
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

"use client";

import { AnimatePresence, motion, useDragControls } from "framer-motion";
import katex from "katex";
import "katex/dist/katex.min.css";
import {
  ArrowRight,
  Award,
  BookOpenCheck,
  Calculator,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Delete,
  Divide,
  Eye,
  EyeOff,
  FileText,
  GripHorizontal,
  Info,
  Lightbulb,
  List,
  ListOrdered,
  Loader2,
  Play,
  Plus,
  Send,
  Settings2,
  Sigma,
  Target,
  X,
  XCircle,
} from "lucide-react";
import * as math from "mathjs";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

// --- MOCK DATA ---
const SET_STATS = {
  totalQuestions: 3,
  totalMarks: 12,
  estimatedMinutes: 10,
};

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
};

const questions = [
  {
    id: 1,
    question: "Define a physical quantity.",
    hints: [
      "Think about what scientists actually measure in the real world.",
      "A complete definition usually mentions two things: the value (number) and what it's measured in.",
    ],
    markscheme: [
      "A measurable property",
      "Expressed with numerical value",
      "Includes a unit",
      "Used to describe physical systems",
    ],
    mockAnswer:
      "A physical quantity is a property of a material or system that can be quantified by measurement. It is always expressed as the combination of a numerical magnitude and a standard unit (e.g., 5 kg, where 5 is the magnitude and kg is the unit).",
  },
  {
    id: 2,
    question: "Explain the difference between scalar and vector quantities.",
    hints: [
      "One of them only tells you 'how much', while the other tells you 'how much' AND 'which way'.",
      "Providing one example for each will usually secure full marks in this type of question.",
    ],
    markscheme: [
      "Scalar has magnitude only",
      "Vector has magnitude and direction",
      "Example of scalar",
      "Example of vector",
    ],
    mockAnswer:
      "A scalar quantity is defined entirely by its magnitude (size) and has no directional component. An example of a scalar is mass or temperature. In contrast, a vector quantity possesses both magnitude and a specific direction in space. An example of a vector is force or velocity.",
  },
  {
    id: 3,
    question: "State Newton's Second Law.",
    hints: [],
    markscheme: [
      "Force equals mass times acceleration",
      "F = ma",
      "Acceleration proportional to force",
      "Inversely proportional to mass",
    ],
    mockAnswer:
      "Newton's Second Law of Motion states that the rate of change of momentum of a body is directly proportional to the resultant force applied to it, and occurs in the direction of that force. For a constant mass, this is commonly expressed as: the net force acting on an object is equal to the product of its mass and its acceleration (F = ma).",
  },
];

// --- MOCK EVALUATION LOGIC ---
const getEvaluation = (questionId: number) => {
  if (questionId === 1) {
    return {
      score: 2,
      points: [
        {
          awarded: true,
          text: "A measurable property",
          reason: "User mentioned measurement",
        },
        {
          awarded: true,
          text: "Expressed with numerical value",
          reason: "Numerical aspect included",
        },
        { awarded: false, text: "Includes a unit", reason: "Units missing" },
        {
          awarded: false,
          text: "Used to describe physical systems",
          reason: "Context missing",
        },
      ],
    };
  }
  if (questionId === 2) {
    return {
      score: 0,
      points: [
        {
          awarded: false,
          text: "Scalar has magnitude only",
          reason: "Concept missing",
        },
        {
          awarded: false,
          text: "Vector has magnitude and direction",
          reason: "Concept missing",
        },
        {
          awarded: false,
          text: "Example of scalar",
          reason: "No example provided",
        },
        {
          awarded: false,
          text: "Example of vector",
          reason: "No example provided",
        },
      ],
    };
  }
  return {
    score: 4,
    points: [
      {
        awarded: true,
        text: "Force equals mass times acceleration",
        reason: "Definition accurate",
      },
      { awarded: true, text: "F = ma", reason: "Formula present" },
      {
        awarded: true,
        text: "Acceleration proportional to force",
        reason: "Relationship correct",
      },
      {
        awarded: true,
        text: "Inversely proportional to mass",
        reason: "Relationship correct",
      },
    ],
  };
};

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

const MathInline = ({ latex }: { latex: string }) => (
  <span dangerouslySetInnerHTML={{ __html: safeRenderKatex(latex) }} />
);

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

// --- NOTION-LIKE RICH TEXT EDITOR ---
type MathType = "general" | "fraction" | "power";

interface EditorRef {
  insertMath: (type: MathType) => void;
  insertList: (type: "bullet" | "number") => void;
}

const RichEditor = forwardRef<
  EditorRef,
  {
    initialHtml: string;
    onChange: (html: string, text: string) => void;
    readOnly?: boolean;
  }
>(({ initialHtml, onChange, readOnly }, ref) => {
  const editorRef = useRef<HTMLDivElement>(null);

  const [popover, setPopover] = useState<{
    id: string;
    x: number;
    y: number;
    type: MathType;
    latex: string;
    num: string;
    den: string;
    base: string;
    exp: string;
  } | null>(null);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = initialHtml;
    }
  }, []);

  useImperativeHandle(ref, () => ({
    insertMath: (type: MathType = "general") => {
      const editorNode = editorRef.current;
      if (!editorNode) return;

      const sel = window.getSelection();
      if (
        !sel ||
        sel.rangeCount === 0 ||
        !editorNode.contains(sel.anchorNode)
      ) {
        editorNode.focus();
        const range = document.createRange();
        range.selectNodeContents(editorNode);
        range.collapse(false);
        sel?.removeAllRanges();
        sel?.addRange(range);
      }

      const range = window.getSelection()!.getRangeAt(0);

      const span = document.createElement("span");
      const mathId = `math-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      span.id = mathId;
      span.contentEditable = "false";
      span.className =
        "inline-math cursor-pointer inline-block align-middle bg-slate-100 hover:bg-slate-200 px-1.5 py-0.5 rounded text-cyan-800 mx-1 border border-slate-200 transition-colors shadow-sm select-none";

      span.dataset.mathType = type;
      span.dataset.latex = "";
      span.dataset.num = "";
      span.dataset.den = "";
      span.dataset.base = "";
      span.dataset.exp = "";

      if (type === "fraction") span.innerHTML = "<i>a/b</i>";
      else if (type === "power") span.innerHTML = "<i>xⁿ</i>";
      else span.innerHTML = "<i>ƒ(x)</i>";

      range.insertNode(span);

      const zws = document.createTextNode("\u200B");
      range.collapse(false);
      range.insertNode(zws);
      range.setStartAfter(zws);
      range.setEndAfter(zws);
      window.getSelection()!.removeAllRanges();
      window.getSelection()!.addRange(range);

      const rect = span.getBoundingClientRect();
      setPopover({
        id: mathId,
        x: rect.left,
        y: rect.bottom + 8,
        type,
        latex: "",
        num: "",
        den: "",
        base: "",
        exp: "",
      });

      triggerChange();
    },
    insertList: (type: "bullet" | "number") => {
      const editorNode = editorRef.current;
      if (!editorNode) return;
      editorNode.focus();
      document.execCommand(
        type === "number" ? "insertOrderedList" : "insertUnorderedList",
        false
      );
      triggerChange();
    },
  }));

  const triggerChange = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML, editorRef.current.innerText);
    }
  };

  const handleEditorClick = (e: React.MouseEvent) => {
    if (readOnly) return;
    const target = e.target as HTMLElement;
    const mathNode = target.closest(".inline-math") as HTMLElement;

    if (mathNode) {
      const rect = mathNode.getBoundingClientRect();

      if (!mathNode.id) {
        mathNode.id = `math-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      }

      setPopover({
        id: mathNode.id,
        x: rect.left,
        y: rect.bottom + 8,
        type: (mathNode.dataset.mathType as MathType) || "general",
        latex: mathNode.dataset.latex || "",
        num: mathNode.dataset.num || "",
        den: mathNode.dataset.den || "",
        base: mathNode.dataset.base || "",
        exp: mathNode.dataset.exp || "",
      });
    }
  };

  const updateMathField = (
    field: "latex" | "num" | "den" | "base" | "exp",
    val: string
  ) => {
    if (!popover) return;

    const newPopover = { ...popover, [field]: val };
    setPopover(newPopover);

    const node = document.getElementById(popover.id);
    if (node) {
      node.dataset[field] = val;

      let finalLatex = "";
      if (newPopover.type === "general") finalLatex = newPopover.latex;
      if (newPopover.type === "fraction") {
        if (newPopover.num || newPopover.den)
          finalLatex = `\\frac{${newPopover.num || " "}}{${
            newPopover.den || " "
          }}`;
      }
      if (newPopover.type === "power") {
        if (newPopover.base || newPopover.exp)
          finalLatex = `${newPopover.base || " "}^{${newPopover.exp || " "}}`;
      }

      if (finalLatex.trim() === "") {
        if (newPopover.type === "fraction") node.innerHTML = "<i>a/b</i>";
        else if (newPopover.type === "power") node.innerHTML = "<i>xⁿ</i>";
        else node.innerHTML = "<i>ƒ(x)</i>";
      } else {
        node.innerHTML = safeRenderKatex(finalLatex);
      }
      triggerChange();
    }
  };

  let previewLatex = "";
  if (popover) {
    if (popover.type === "general") previewLatex = popover.latex;
    if (popover.type === "fraction" && (popover.num || popover.den))
      previewLatex = `\\frac{${popover.num || " "}}{${popover.den || " "}}`;
    if (popover.type === "power" && (popover.base || popover.exp))
      previewLatex = `${popover.base || " "}^{${popover.exp || " "}}`;
  }

  return (
    <>
      <style>{`
        .custom-editor:empty:before {
          content: attr(data-placeholder);
          color: #94a3b8;
          pointer-events: none;
        }
        .custom-editor .katex {
           font-size: 1.15em;
        }
        .custom-editor ul {
           list-style-type: disc;
           padding-left: 1.5rem;
           margin-top: 0.5rem;
           margin-bottom: 0.5rem;
        }
        .custom-editor ol {
           list-style-type: decimal;
           padding-left: 1.5rem;
           margin-top: 0.5rem;
           margin-bottom: 0.5rem;
        }
        .custom-editor li {
           margin-bottom: 0.25rem;
           padding-left: 0.25rem;
        }
      `}</style>

      <div
        ref={editorRef}
        contentEditable={!readOnly}
        suppressContentEditableWarning
        onInput={triggerChange}
        onClick={handleEditorClick}
        data-placeholder="Write your answer here..."
        className={`custom-editor w-full min-h-[14rem] p-5 pb-10 bg-slate-50 text-slate-700 border border-slate-200 rounded-2xl transition-all text-lg leading-relaxed shadow-inner focus:outline-none ${
          !readOnly
            ? "focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            : "opacity-80"
        }`}
      />

      {/* NOTION MATH POPOVER */}
      {popover && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setPopover(null)}
          />
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed z-50 bg-white border border-slate-200 shadow-xl rounded-xl p-4 w-[340px] flex flex-col gap-4"
            style={{
              top: popover.y,
              left: Math.min(popover.x, window.innerWidth - 360),
            }}
          >
            <div className="flex justify-between items-center">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {popover.type === "fraction"
                  ? "Fraction"
                  : popover.type === "power"
                  ? "Power/Exponent"
                  : "Inline Equation"}
              </div>
              <button
                onClick={() => setPopover(null)}
                className="text-xs px-3 py-1.5 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 rounded-md font-semibold transition-colors border border-cyan-100"
              >
                Done
              </button>
            </div>

            {popover.type === "general" && (
              <input
                autoFocus
                value={popover.latex}
                onChange={(e) => updateMathField("latex", e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") setPopover(null);
                }}
                placeholder="e.g. E = mc^2"
                className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            )}

            {popover.type === "fraction" && (
              <div className="flex flex-col gap-2">
                <input
                  autoFocus
                  value={popover.num}
                  onChange={(e) => updateMathField("num", e.target.value)}
                  placeholder="Numerator (Top)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 font-mono text-sm text-center focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <div className="w-full h-[2px] bg-slate-200 rounded-full my-0.5" />
                <input
                  value={popover.den}
                  onChange={(e) => updateMathField("den", e.target.value)}
                  placeholder="Denominator (Bottom)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 font-mono text-sm text-center focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
            )}

            {popover.type === "power" && (
              <div className="flex items-start gap-2">
                <input
                  autoFocus
                  value={popover.base}
                  onChange={(e) => updateMathField("base", e.target.value)}
                  placeholder="Base (x)"
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-md p-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <input
                  value={popover.exp}
                  onChange={(e) => updateMathField("exp", e.target.value)}
                  placeholder="Exp (n)"
                  className="w-[100px] bg-slate-50 border border-slate-200 rounded-md p-2 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500 mt-[-8px] shadow-sm"
                />
              </div>
            )}

            <div className="min-h-[3rem] flex justify-center items-center bg-slate-50/50 rounded-md border border-slate-100 p-2 overflow-x-auto text-slate-800">
              {previewLatex ? (
                <span
                  dangerouslySetInnerHTML={{
                    __html: safeRenderKatex(previewLatex),
                  }}
                />
              ) : (
                <span className="text-slate-400 text-sm italic">
                  Live Preview...
                </span>
              )}
            </div>
          </motion.div>
        </>
      )}
    </>
  );
});
RichEditor.displayName = "RichEditor";

// --- MAIN COMPONENT ---
export default function TheoryPractice() {
  const [hasStarted, setHasStarted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const [useTimer, setUseTimer] = useState(true);
  const [isLearningMode, setIsLearningMode] = useState(true);
  const [timeLeft, setTimeLeft] = useState(SET_STATS.estimatedMinutes * 60);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [userAnswersHtml, setUserAnswersHtml] = useState<
    Record<number, string>
  >({});
  const [userAnswersText, setUserAnswersText] = useState<
    Record<number, string>
  >({});
  const [submittedQuestions, setSubmittedQuestions] = useState<
    Record<number, boolean>
  >({});
  const [isLoading, setIsLoading] = useState(false);

  // UI Controls
  const [showMenu, setShowMenu] = useState(false);
  const [showMarkschemePreview, setShowMarkschemePreview] = useState(false);
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

  const editorRef = useRef<EditorRef>(null);

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const currentAnswerHtml = userAnswersHtml[currentQuestion.id] || "";
  const currentAnswerText = userAnswersText[currentQuestion.id] || "";
  const isCurrentSubmitted = submittedQuestions[currentQuestion.id] || false;

  const wordCount = currentAnswerText.trim()
    ? currentAnswerText
        .trim()
        .split(/\s+/)
        .filter((w) => w.length > 0).length
    : 0;

  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 768);
    checkDesktop();
    window.addEventListener("resize", checkDesktop);
    return () => window.removeEventListener("resize", checkDesktop);
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (hasStarted && !isCompleted && useTimer && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [hasStarted, isCompleted, useTimer, timeLeft]);

  // Calculator Keydown Listener (Ignores inputs when typing in editor)
  useEffect(() => {
    if (!showCalculator) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Safety Check: Don't steal keystrokes if user is typing in a text field or the rich editor
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

      if (/^[0-9.()]$/.test(key)) {
        handleCalcKey(key);
      } else if (key === "+" || key === "-") {
        handleCalcKey(key);
      } else if (key === "*" || key === "x") {
        handleCalcKey("×");
      } else if (key === "/") {
        e.preventDefault();
        handleCalcKey("÷");
      } else if (key === "Enter" || key === "=") {
        e.preventDefault();
        handleCalcKey("=");
      } else if (key === "Backspace") {
        handleCalcKey("⌫");
      } else if (key === "Escape" || key.toLowerCase() === "c") {
        handleCalcKey("C");
      } else if (key === "^") {
        handleCalcKey("^");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showCalculator, calcResult]); // calcResult needed for the '=' logic inside handleCalcKey

  // Calculator Live Evaluation
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

  const handleEditorChange = (html: string, text: string) => {
    setUserAnswersHtml((prev) => ({ ...prev, [currentQuestion.id]: html }));
    setUserAnswersText((prev) => ({ ...prev, [currentQuestion.id]: text }));
  };

  const submitCurrentAnswer = () => {
    if (!currentAnswerText.trim() && !currentAnswerHtml.includes("inline-math"))
      return;
    if (isLoading) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setSubmittedQuestions((prev) => ({
        ...prev,
        [currentQuestion.id]: true,
      }));
    }, 500);
  };

  const resetHelpers = () => {
    setShowMarkschemePreview(false);
    setShowHintPopover(false);
    setRevealedHints(1);
    setShowMenu(false);
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

  const finishPractice = () => setIsCompleted(true);
  const insertMathAndClose = (type: MathType) => {
    editorRef.current?.insertMath(type);
    setShowMenu(false);
  };
  const insertListAndClose = (type: "bullet" | "number") => {
    editorRef.current?.insertList(type);
    setShowMenu(false);
  };

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
            Physics Theory Set #1
          </h1>
          <p className="text-slate-500 mb-8">
            Test your understanding of core physical properties and laws.
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
      (sum, q) => sum + getEvaluation(q.id).score,
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
              const evalResult = getEvaluation(q.id);
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
                      {q.question}
                    </h3>
                    <div className="px-3 py-1 bg-cyan-50 text-cyan-700 font-bold rounded-lg text-sm shrink-0">
                      {evalResult.score} / 4
                    </div>
                  </div>

                  <div
                    className="custom-editor bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 text-slate-600"
                    dangerouslySetInnerHTML={{
                      __html:
                        userAnswersHtml[q.id] ||
                        "<span class='italic opacity-60'>No answer provided.</span>",
                    }}
                  />

                  <div className="space-y-3 mb-8">
                    {evalResult.points.map((point, pIdx) => (
                      <div
                        key={pIdx}
                        className="flex gap-4 items-start text-sm"
                      >
                        {point.awarded ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-400 shrink-0" />
                        )}
                        <div>
                          <p
                            className={`font-medium ${
                              point.awarded
                                ? "text-slate-800"
                                : "text-slate-500"
                            }`}
                          >
                            {point.text}
                          </p>
                          <p
                            className={
                              point.awarded ? "text-green-600" : "text-red-500"
                            }
                          >
                            ↳ {point.reason}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Mock Answer Block */}
                  {q.mockAnswer && (
                    <div className="space-y-4 pt-6 border-t border-slate-100">
                      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                        <BookOpenCheck className="w-4 h-4 text-cyan-500" />
                        Model Answer
                      </h3>
                      <div className="p-5 bg-cyan-50/30 border border-cyan-100 rounded-2xl text-slate-700 leading-relaxed text-sm">
                        {q.mockAnswer}
                      </div>
                    </div>
                  )}
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
                          <MathInline latex="v = u + at" />
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Displacement</span>{" "}
                          <MathInline latex="s = ut + \frac{1}{2}at^2" />
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Dynamics
                      </p>
                      <div className="space-y-3 text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <div className="flex justify-between items-center">
                          <span>Force</span> <MathInline latex="F = ma" />
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Momentum</span> <MathInline latex="p = mv" />
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
                          <MathInline latex="9.81 \, \text{m/s}^2" />
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Speed of Light (c)</span>{" "}
                          <MathInline latex="3 \times 10^8 \, \text{m/s}" />
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Planck (h)</span>{" "}
                          <MathInline latex="6.63 \times 10^{-34} \, \text{J s}" />
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
                          <MathInline latex="\frac{a}{b}" />
                        </div>
                        <div className="flex justify-between items-center">
                          <code className="text-[11px] bg-white px-1.5 py-0.5 rounded border border-slate-200">
                            x^2
                          </code>{" "}
                          <MathInline latex="x^2" />
                        </div>
                        <div className="flex justify-between items-center">
                          <code className="text-[11px] bg-white px-1.5 py-0.5 rounded border border-slate-200">
                            v_0
                          </code>{" "}
                          <MathInline latex="v_0" />
                        </div>
                        <div className="flex justify-between items-center">
                          <code className="text-[11px] bg-white px-1.5 py-0.5 rounded border border-slate-200">
                            \sqrt{"{x}"}
                          </code>{" "}
                          <MathInline latex="\sqrt{x}" />
                        </div>
                        <div className="flex justify-between items-center">
                          <code className="text-[11px] bg-white px-1.5 py-0.5 rounded border border-slate-200">
                            \Delta
                          </code>{" "}
                          <MathInline latex="\Delta" />
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
              {/* Calc Header (Drag Handle) */}
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

              {/* Display */}
              <div className="bg-white p-5 border-b border-slate-100 flex flex-col items-end min-h-[100px] justify-end">
                <div className="text-slate-400 font-mono text-sm tracking-wider mb-1 w-full text-right overflow-hidden text-ellipsis whitespace-nowrap">
                  {calcInput || "0"}
                </div>
                <div className="text-3xl font-semibold text-slate-900 font-mono overflow-hidden text-ellipsis whitespace-nowrap">
                  {calcResult ? `= ${calcResult}` : "\u00A0"}
                </div>
              </div>

              {/* Keypad Grid */}
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

      {/* MAIN VIEW CONTENT */}
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
                <h1 className="text-2xl md:text-3xl font-medium leading-snug text-slate-900 mb-6">
                  {currentQuestion.question}
                </h1>

                {!isLearningMode || !isCurrentSubmitted ? (
                  <div className="space-y-4">
                    {/* HELPER TOOLBAR (Markscheme Preview & Hints) */}
                    <div className="flex justify-between items-center relative z-20">
                      {/* Left: Markscheme Preview Toggle */}
                      {isLearningMode && (
                        <button
                          onClick={() =>
                            setShowMarkschemePreview(!showMarkschemePreview)
                          }
                          className={`flex items-center gap-2 text-sm font-semibold transition-colors ${
                            showMarkschemePreview
                              ? "text-cyan-600"
                              : "text-slate-400 hover:text-cyan-600"
                          }`}
                        >
                          {showMarkschemePreview ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                          {showMarkschemePreview
                            ? "Hide Markscheme"
                            : "Preview Markscheme"}
                        </button>
                      )}
                      {!isLearningMode && <div />}{" "}
                      {/* Spacer if learning mode is off */}
                      {/* Right: Hint Button & Popover */}
                      {currentQuestion.hints &&
                        currentQuestion.hints.length > 0 && (
                          <div className="relative">
                            <button
                              onClick={() =>
                                setShowHintPopover(!showHintPopover)
                              }
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

                            {/* Hint Popover Dropdown */}
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
                                            className="p-3 bg-amber-50/80 rounded-lg text-sm text-amber-900 border border-amber-100/50 leading-relaxed"
                                          >
                                            {hint}
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
                        )}
                    </div>

                    {/* MARKSCHEME PREVIEW DRAWER */}
                    <AnimatePresence>
                      {showMarkschemePreview && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="p-5 bg-cyan-50/50 border border-cyan-100 rounded-2xl mb-2">
                            <div className="text-[10px] font-bold text-cyan-600 uppercase tracking-wider mb-3">
                              Required Points (
                              {currentQuestion.markscheme.length})
                            </div>
                            <ul className="list-disc pl-5 space-y-1">
                              {currentQuestion.markscheme.map((point, idx) => (
                                <li
                                  key={idx}
                                  className="text-sm text-slate-700"
                                >
                                  {point}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* EDITOR */}
                    <div className="relative">
                      <RichEditor
                        key={`editor-${currentQuestion.id}`}
                        ref={editorRef}
                        initialHtml={currentAnswerHtml}
                        onChange={handleEditorChange}
                      />
                      {/* WORD COUNT INDICATOR */}
                      <div className="absolute bottom-4 right-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest pointer-events-none">
                        {wordCount} words
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-8 mt-4">
                    <div className="flex flex-col items-center justify-center py-6 bg-cyan-50/50 rounded-2xl border border-cyan-100">
                      <span className="text-sm font-semibold text-cyan-600 uppercase tracking-widest mb-2">
                        Score
                      </span>
                      <div className="text-5xl font-bold text-slate-900 flex items-baseline gap-1">
                        {getEvaluation(currentQuestion.id).score}
                        <span className="text-2xl text-slate-400 font-medium">
                          / 4
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
                        Markscheme Breakdown
                      </h3>
                      <div className="space-y-3">
                        {getEvaluation(currentQuestion.id).points.map(
                          (point, idx) => (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: idx * 0.1 + 0.1 }}
                              key={idx}
                              className={`p-4 rounded-xl flex gap-4 items-start border ${
                                point.awarded
                                  ? "bg-green-50/30 border-green-100"
                                  : "bg-red-50/30 border-red-100"
                              }`}
                            >
                              {point.awarded ? (
                                <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0 mt-0.5" />
                              ) : (
                                <XCircle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
                              )}
                              <div>
                                <p className="text-slate-800 font-medium mb-1">
                                  {point.text}
                                </p>
                                <div className="flex items-center text-sm gap-2">
                                  <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                                  <span
                                    className={
                                      point.awarded
                                        ? "text-green-700"
                                        : "text-red-700"
                                    }
                                  >
                                    {point.reason}
                                  </span>
                                </div>
                              </div>
                            </motion.div>
                          )
                        )}
                      </div>
                    </div>

                    {/* MOCK ANSWER BLOCK */}
                    {currentQuestion.mockAnswer && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="space-y-4 pt-6 border-t border-slate-100"
                      >
                        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                          <BookOpenCheck className="w-4 h-4 text-cyan-500" />
                          Model Answer
                        </h3>
                        <div className="p-5 bg-cyan-50/30 border border-cyan-100 rounded-2xl text-slate-700 leading-relaxed text-sm">
                          {currentQuestion.mockAnswer}
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* FLOATING NAVBAR */}
      <motion.div
        initial={{ y: 100, opacity: 0, x: "-50%" }}
        animate={{ y: 0, opacity: 1, x: "-50%" }}
        className="fixed bottom-6 left-1/2 z-30 flex items-center gap-2 p-2 bg-white/80 backdrop-blur-md border border-slate-200/50 shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-full"
      >
        <button
          onClick={goPrev}
          disabled={currentIndex === 0}
          className="w-12 h-12 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          aria-label="Previous Question"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <div className="flex-shrink-0 flex items-center justify-center gap-2 min-w-[140px] relative">
          {/* EXPANDABLE FAB MENU */}
          {(!isLearningMode || !isCurrentSubmitted) && (
            <div className="relative">
              <AnimatePresence>
                {showMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setShowMenu(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute bottom-[calc(100%+12px)] left-1/2 -translate-x-1/2 flex items-center gap-1.5 p-1.5 bg-white border border-slate-200 shadow-xl rounded-full z-40"
                    >
                      <button
                        onClick={() => insertMathAndClose("general")}
                        className="w-10 h-10 flex flex-col items-center justify-center bg-slate-50 hover:bg-cyan-50 border border-slate-100 hover:border-cyan-200 text-slate-600 hover:text-cyan-700 rounded-full transition-all group"
                        title="General Equation"
                      >
                        <Sigma className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      </button>
                      <button
                        onClick={() => insertMathAndClose("fraction")}
                        className="w-10 h-10 flex flex-col items-center justify-center bg-slate-50 hover:bg-cyan-50 border border-slate-100 hover:border-cyan-200 text-slate-600 hover:text-cyan-700 rounded-full transition-all group"
                        title="Fraction"
                      >
                        <Divide className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      </button>
                      <button
                        onClick={() => insertMathAndClose("power")}
                        className="w-10 h-10 flex flex-col items-center justify-center bg-slate-50 hover:bg-cyan-50 border border-slate-100 hover:border-cyan-200 text-slate-600 hover:text-cyan-700 rounded-full transition-all group font-serif italic text-sm font-bold"
                        title="Power / Exponent"
                      >
                        <span className="group-hover:scale-110 transition-transform tracking-tighter">
                          x<span className="text-[10px] align-top">n</span>
                        </span>
                      </button>

                      <div className="w-px h-6 bg-slate-200 mx-1" />

                      <button
                        onClick={() => insertListAndClose("bullet")}
                        className="w-10 h-10 flex flex-col items-center justify-center bg-slate-50 hover:bg-cyan-50 border border-slate-100 hover:border-cyan-200 text-slate-600 hover:text-cyan-700 rounded-full transition-all group"
                        title="Bullet List"
                      >
                        <List className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      </button>
                      <button
                        onClick={() => insertListAndClose("number")}
                        className="w-10 h-10 flex flex-col items-center justify-center bg-slate-50 hover:bg-cyan-50 border border-slate-100 hover:border-cyan-200 text-slate-600 hover:text-cyan-700 rounded-full transition-all group"
                        title="Numbered List"
                      >
                        <ListOrdered className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>

              <button
                onClick={() => setShowMenu(!showMenu)}
                className={`w-12 h-12 flex items-center justify-center border transition-all shadow-sm rounded-full ${
                  showMenu
                    ? "bg-slate-800 border-slate-800 text-white"
                    : "bg-slate-50 border-slate-200 hover:border-cyan-300 hover:bg-cyan-50 text-slate-600 hover:text-cyan-700"
                }`}
                title="Add Math Element"
              >
                <Plus
                  className={`w-5 h-5 transition-transform duration-300 ${
                    showMenu ? "rotate-45" : "rotate-0"
                  }`}
                />
              </button>
            </div>
          )}

          {isLearningMode && !isCurrentSubmitted ? (
            <button
              onClick={submitCurrentAnswer}
              disabled={
                (!currentAnswerText.trim() &&
                  !currentAnswerHtml.includes("inline-math")) ||
                isLoading
              }
              className="flex items-center justify-center gap-2 w-full py-3 px-6 bg-cyan-600 hover:bg-cyan-700 text-white rounded-full font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Submit"
              )}
              {!isLoading && <Send className="w-4 h-4 ml-1" />}
            </button>
          ) : isLastQuestion ? (
            <button
              onClick={finishPractice}
              className="flex items-center justify-center gap-2 w-full py-3 px-6 bg-slate-900 hover:bg-slate-800 text-white rounded-full font-medium transition-all shadow-sm"
            >
              Finish Set
              <CheckCircle2 className="w-4 h-4 ml-1" />
            </button>
          ) : (
            <div className="px-4 py-2 font-medium text-slate-400 text-sm tracking-wide">
              {currentIndex + 1} / {questions.length}
            </div>
          )}

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
        </div>

        <button
          onClick={goNext}
          disabled={isLastQuestion}
          className="w-12 h-12 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          aria-label="Next Question"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </motion.div>
    </div>
  );
}
