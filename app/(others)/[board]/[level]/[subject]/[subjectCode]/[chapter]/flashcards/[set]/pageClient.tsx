// // "use client";

// // import { Badge } from "@/components/ui/badge";
// // import { Button } from "@/components/ui/button";
// // import {
// //   Card,
// //   CardContent,
// //   CardDescription,
// //   CardHeader,
// //   CardTitle,
// // } from "@/components/ui/card";
// // import { sampleLibrary } from "@/lib/sample-data";
// // import { cn } from "@/lib/utils";
// // import {
// //   Brain,
// //   ChevronDown,
// //   ChevronUp,
// //   Lightbulb,
// //   RefreshCcw,
// // } from "lucide-react";
// // import { useCallback, useEffect, useMemo, useState } from "react";

// // type Flashcard = {
// //   id: string;
// //   question: string;
// //   answer: string;
// //   hint?: string;
// //   tags?: string[];
// // };

// // type Props = {
// //   data?: Flashcard[];
// // };

// // export default function Flashcards({ data: initialData }: Props) {
// //   const data = initialData || sampleLibrary?.sets?.[0]?.cards || [];

// //   // Eagerly initialize the queue to prevent an empty flash on the first render
// //   const [queue, setQueue] = useState<string[]>(() => data.map((c) => c.id));
// //   const [revealed, setRevealed] = useState(false);
// //   const [showHint, setShowHint] = useState(false);
// //   const [reduceMotion, setReduceMotion] = useState(false);

// //   const cardMap = useMemo(() => {
// //     return Object.fromEntries(data.map((c) => [c.id, c]));
// //   }, [data]);

// //   const currentCardId = queue[0];
// //   const currentCard = currentCardId ? cardMap[currentCardId] : null;

// //   // 🔥 THE FIX: Decouple the physical sides of the card from the active queue
// //   const [frontCard, setFrontCard] = useState<Flashcard | null>(currentCard);
// //   const [backCard, setBackCard] = useState<Flashcard | null>(currentCard);

// //   // Sync queue if parent data props change
// //   useEffect(() => {
// //     setQueue(data.map((c) => c.id));
// //   }, [data]);

// //   // Whenever the active card changes (e.g., after a rating), update ONLY the front side.
// //   // This leaves the old answer intact on the back side while it physically flips away.
// //   useEffect(() => {
// //     if (currentCard) {
// //       setFrontCard(currentCard);
// //     }
// //   }, [currentCard]);

// //   const handleReveal = useCallback(() => {
// //     if (!revealed && currentCard) {
// //       // Snap the correct answer onto the back of the card right before we flip it
// //       setBackCard(currentCard);
// //       setRevealed(true);
// //     }
// //   }, [revealed, currentCard]);

// //   const totalCards = data.length;
// //   const mastered = totalCards - queue.length;
// //   const progress = totalCards > 0 ? (mastered / totalCards) * 100 : 0;
// //   const sessionComplete = queue.length === 0 && totalCards > 0;

// //   const handleRating = useCallback(
// //     (rating: "got_it" | "almost" | "forgot") => {
// //       if (!currentCardId) return;

// //       setQueue((prevQueue) => {
// //         const [, ...remaining] = prevQueue;

// //         if (rating === "got_it") return remaining;
// //         if (rating === "almost") return [...remaining, currentCardId];
// //         if (rating === "forgot") {
// //           const insertIndex = Math.min(3, remaining.length);
// //           const newQueue = [...remaining];
// //           newQueue.splice(insertIndex, 0, currentCardId);
// //           return newQueue;
// //         }

// //         return remaining;
// //       });

// //       // Start the flip animation back to the front
// //       setRevealed(false);
// //       setShowHint(false);
// //     },
// //     [currentCardId]
// //   );

// //   // Hotkeys
// //   useEffect(() => {
// //     function handler(e: KeyboardEvent) {
// //       if (!currentCardId) return;

// //       if (e.code === "Space" && !revealed) {
// //         e.preventDefault();
// //         handleReveal();
// //       }

// //       if (!revealed) return;

// //       if (e.code === "Digit1") handleRating("forgot");
// //       if (e.code === "Digit2") handleRating("almost");
// //       if (e.code === "Digit3") handleRating("got_it");
// //     }

// //     window.addEventListener("keydown", handler);
// //     return () => window.removeEventListener("keydown", handler);
// //   }, [revealed, currentCardId, handleRating, handleReveal]);

// //   function restart() {
// //     const initialQueue = data.map((c) => c.id);
// //     setQueue(initialQueue);
// //     setRevealed(false);
// //     setShowHint(false);

// //     if (initialQueue.length > 0) {
// //       const first = cardMap[initialQueue[0]];
// //       setFrontCard(first);
// //       setBackCard(first);
// //     }
// //   }

// //   if (!data || data.length === 0) {
// //     return (
// //       <div className="flex min-h-[400px] items-center justify-center text-muted-foreground">
// //         No cards provided
// //       </div>
// //     );
// //   }

// //   if (sessionComplete) {
// //     return (
// //       <div className="flex min-h-[60vh] items-center justify-center animate-in fade-in duration-500">
// //         <Card className="max-w-xl text-center border-border shadow-sm">
// //           <CardHeader>
// //             <CardTitle className="text-2xl">Session Complete 🎉</CardTitle>
// //             <CardDescription className="text-base">
// //               Outstanding work! You have mastered all {totalCards} cards.
// //             </CardDescription>
// //           </CardHeader>
// //           <CardContent>
// //             <Button
// //               onClick={restart}
// //               className="bg-cyan-600 hover:bg-cyan-700 text-white"
// //             >
// //               <RefreshCcw className="mr-2 h-4 w-4" />
// //               Review Again
// //             </Button>
// //           </CardContent>
// //         </Card>
// //       </div>
// //     );
// //   }

// //   // Fallback while states are syncing
// //   if (!frontCard || !backCard) return null;

// //   return (
// //     <div className="min-h-[80vh] flex flex-col bg-background mt-10">
// //       {/* Progress Navbar */}
// //       <div className="w-full bg-background sticky top-0 z-10">
// //         <div className="max-w-3xl mx-auto px-4 py-4 space-y-3">
// //           <div className="flex justify-between items-center text-sm">
// //             <span className="font-semibold flex items-center gap-2 text-foreground">
// //               <Brain className="h-4 w-4 text-cyan-600" />
// //               Active Recall
// //             </span>
// //             <div className="flex items-center gap-4">
// //               <button
// //                 onClick={() => setReduceMotion(!reduceMotion)}
// //                 className="text-xs text-muted-foreground hover:text-foreground transition-colors bg-cyan-100 px-2 py-1 rounded-md flex items-center gap-1"
// //               >
// //                 {reduceMotion ? "Motion: Reduced" : "Motion: Full"}
// //                 {reduceMotion ? (
// //                   <ChevronUp className="w-5" />
// //                 ) : (
// //                   <ChevronDown className="w-5" />
// //                 )}
// //               </button>
// //               <span className="text-muted-foreground">
// //                 <span className="text-foreground font-medium">{mastered}</span>{" "}
// //                 / {totalCards}
// //               </span>
// //             </div>
// //           </div>

// //           <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
// //             <div
// //               className="h-full bg-cyan-600 transition-all duration-500 ease-out"
// //               style={{ width: `${progress}%` }}
// //             />
// //           </div>
// //         </div>
// //       </div>

// //       {/* Flashcard Area */}
// //       <div className="flex flex-1 justify-center items-center p-4">
// //         <div
// //           className="mx-auto max-w-3xl w-full"
// //           style={{ perspective: "1500px" }}
// //         >
// //           <div
// //             className={cn(
// //               "relative min-h-[420px] transition-all duration-500 ease-out",
// //               !reduceMotion && "[transform-style:preserve-3d]",
// //               !reduceMotion && revealed ? "[transform:rotateY(180deg)]" : ""
// //             )}
// //           >
// //             {/* FRONT */}
// //             <Card
// //               className={cn(
// //                 "absolute inset-0 flex flex-col border shadow-sm bg-card",
// //                 !reduceMotion && "[backface-visibility:hidden]",
// //                 reduceMotion && "transition-opacity duration-500",
// //                 reduceMotion && revealed
// //                   ? "opacity-0 pointer-events-none z-0"
// //                   : "opacity-100 z-10"
// //               )}
// //             >
// //               <CardHeader className="flex-1 flex flex-col justify-between p-8">
// //                 <div className="space-y-6">
// //                   <div className="flex justify-between items-start">
// //                     <Badge
// //                       variant="secondary"
// //                       className="mt-1 bg-cyan-100 text-cyan-800 hover:bg-cyan-100/80"
// //                     >
// //                       Question
// //                     </Badge>
// //                     {frontCard.hint && (
// //                       <Button
// //                         variant="ghost"
// //                         size="icon"
// //                         className="h-8 w-8 text-muted-foreground hover:text-amber-500 hover:bg-amber-50"
// //                         onClick={() => setShowHint(!showHint)}
// //                         title="Toggle hint"
// //                       >
// //                         <Lightbulb className="h-5 w-5" />
// //                       </Button>
// //                     )}
// //                   </div>

// //                   <CardTitle className="text-3xl leading-relaxed font-medium">
// //                     {frontCard.question}
// //                   </CardTitle>

// //                   {/* Fixed height to prevent layout shift when hint appears */}
// //                   <div className="min-h-[60px]">
// //                     {showHint && frontCard.hint && (
// //                       <CardDescription className="text-base bg-muted/50 p-4 rounded-md text-foreground animate-in fade-in duration-300">
// //                         {frontCard.hint}
// //                       </CardDescription>
// //                     )}
// //                   </div>
// //                 </div>

// //                 <div className="flex justify-between items-center pt-8 mt-auto border-t">
// //                   <div className="flex gap-2 text-sm text-muted-foreground items-center">
// //                     <kbd className="px-2 py-1 bg-muted rounded-md border font-mono text-xs">
// //                       Space
// //                     </kbd>
// //                     <span>to reveal</span>
// //                   </div>
// //                   <Button
// //                     onClick={handleReveal}
// //                     className="bg-cyan-600 hover:bg-cyan-700 text-white px-8"
// //                   >
// //                     Reveal Answer
// //                   </Button>
// //                 </div>
// //               </CardHeader>
// //             </Card>

// //             {/* BACK */}
// //             <Card
// //               className={cn(
// //                 "absolute inset-0 flex flex-col border shadow-sm bg-card",
// //                 !reduceMotion &&
// //                   "[backface-visibility:hidden] [transform:rotateY(180deg)]",
// //                 reduceMotion && "transition-opacity duration-500",
// //                 reduceMotion && !revealed
// //                   ? "opacity-0 pointer-events-none z-0"
// //                   : "opacity-100 z-10"
// //               )}
// //             >
// //               <CardHeader className="flex-1 flex flex-col justify-between p-8">
// //                 <div className="space-y-6">
// //                   <div className="flex justify-between items-center">
// //                     <Badge
// //                       variant="secondary"
// //                       className="bg-cyan-100 text-cyan-800 hover:bg-cyan-100/80"
// //                     >
// //                       Answer
// //                     </Badge>
// //                   </div>

// //                   <CardTitle className="text-3xl leading-relaxed font-medium">
// //                     {backCard.answer}
// //                   </CardTitle>

// //                   <div className="min-h-[40px]">
// //                     {backCard.tags && backCard.tags.length > 0 && (
// //                       <div className="flex gap-2 flex-wrap pt-4">
// //                         {backCard.tags.map((tag) => (
// //                           <Badge
// //                             key={tag}
// //                             variant="outline"
// //                             className="text-muted-foreground"
// //                           >
// //                             {tag}
// //                           </Badge>
// //                         ))}
// //                       </div>
// //                     )}
// //                   </div>
// //                 </div>

// //                 <div className="pt-8 mt-auto border-t space-y-4">
// //                   <div className="grid grid-cols-3 gap-4">
// //                     <Button
// //                       onClick={() => handleRating("forgot")}
// //                       className="bg-red-200 hover:bg-red-300 text-white flex flex-col gap-1 h-auto py-4 transition-colors border-none shadow-sm"
// //                     >
// //                       <span className="font-semibold text-red-950 ">
// //                         Forgot
// //                       </span>
// //                     </Button>
// //                     <Button
// //                       onClick={() => handleRating("almost")}
// //                       className="bg-yellow-200 hover:bg-yellow-300 flex flex-col gap-1 h-auto py-4 transition-colors border-none shadow-sm"
// //                     >
// //                       <span className="font-semibold text-yellow-950 ">
// //                         Almost
// //                       </span>
// //                     </Button>
// //                     <Button
// //                       onClick={() => handleRating("got_it")}
// //                       className="bg-green-200 hover:bg-green-300 text-white flex flex-col gap-1 h-auto py-4 transition-colors border-none shadow-sm"
// //                     >
// //                       <span className="font-semibold text-green-950 ">
// //                         Got it
// //                       </span>
// //                     </Button>
// //                   </div>
// //                 </div>
// //               </CardHeader>
// //             </Card>
// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }

// "use client";

// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { cn } from "@/lib/utils";
// import {
//   Brain,
//   ChevronDown,
//   ChevronUp,
//   Lightbulb,
//   RefreshCcw,
// } from "lucide-react";
// import { useCallback, useEffect, useMemo, useState } from "react";
// // 🔥 Required imports for Markdown, Math, and Images
// import "katex/dist/katex.min.css"; // Crucial for rendering the math correctly!
// import ReactMarkdown from "react-markdown";
// import rehypeKatex from "rehype-katex";
// import remarkMath from "remark-math";
// import { useRouter } from "next/navigation"; // Added for navigation

// type Flashcard = {
//   id: string;
//   question: string;
//   answer: string;
//   hint?: string;
//   tags?: string[];
// };

// export default function Flashcards({ flashData, title }: any) {
//     const router = useRouter(); // Initialize router
//   const data = flashData.cards;

//   const [queue, setQueue] = useState<string[]>(() =>
//     data.map((c: Flashcard) => c.id)
//   );
//   const [revealed, setRevealed] = useState(false);
//   const [showHint, setShowHint] = useState(false);
//   const [reduceMotion, setReduceMotion] = useState(false);

//   const cardMap = useMemo(() => {
//     return Object.fromEntries(data.map((c: Flashcard) => [c.id, c]));
//   }, [data]);

//   const currentCardId = queue[0];
//   const currentCard = currentCardId ? cardMap[currentCardId] : null;

//   const [frontCard, setFrontCard] = useState<Flashcard | null>(currentCard);
//   const [backCard, setBackCard] = useState<Flashcard | null>(currentCard);

//   useEffect(() => {
//     setQueue(data.map((c: Flashcard) => c.id));
//   }, [data]);

//   useEffect(() => {
//     if (currentCard) {
//       setFrontCard(currentCard);
//     }
//   }, [currentCard]);

//   const handleReveal = useCallback(() => {
//     if (!revealed && currentCard) {
//       setBackCard(currentCard);
//       setRevealed(true);
//     }
//   }, [revealed, currentCard]);

//   const totalCards = data.length;
//   const mastered = totalCards - queue.length;
//   const progress = totalCards > 0 ? (mastered / totalCards) * 100 : 0;
//   const sessionComplete = queue.length === 0 && totalCards > 0;

//   const handleRating = useCallback(
//     (rating: "got_it" | "almost" | "forgot") => {
//       if (!currentCardId) return;

//       setQueue((prevQueue) => {
//         const [, ...remaining] = prevQueue;

//         if (rating === "got_it") return remaining;
//         if (rating === "almost") return [...remaining, currentCardId];
//         if (rating === "forgot") {
//           const insertIndex = Math.min(3, remaining.length);
//           const newQueue = [...remaining];
//           newQueue.splice(insertIndex, 0, currentCardId);
//           return newQueue;
//         }

//         return remaining;
//       });

//       setRevealed(false);
//       setShowHint(false);
//     },
//     [currentCardId]
//   );

//   // Hotkeys
//   useEffect(() => {
//     function handler(e: KeyboardEvent) {
//       if (!currentCardId) return;

//       if (e.code === "Space" && !revealed) {
//         e.preventDefault();
//         handleReveal();
//       }

//       if (!revealed) return;

//       if (e.code === "Digit1") handleRating("forgot");
//       if (e.code === "Digit2") handleRating("almost");
//       if (e.code === "Digit3") handleRating("got_it");
//     }

//     window.addEventListener("keydown", handler);
//     return () => window.removeEventListener("keydown", handler);
//   }, [revealed, currentCardId, handleRating, handleReveal]);

//   function restart() {
//     const initialQueue = data.map((c: Flashcard) => c.id);
//     setQueue(initialQueue);
//     setRevealed(false);
//     setShowHint(false);

//     if (initialQueue.length > 0) {
//       const first = cardMap[initialQueue[0]];
//       setFrontCard(first);
//       setBackCard(first);
//     }
//   }

//   if (!data || data.length === 0) {
//     return (
//       <div className="flex min-h-[400px] items-center justify-center text-muted-foreground">
//         No cards provided
//       </div>
//     );
//   }

//   if (sessionComplete) {
//     return (
//       <div className="flex min-h-[60vh] items-center justify-center animate-in fade-in duration-500">
//         <Card className="max-w-xl text-center border-border shadow-sm">
//           <CardHeader>
//             <CardTitle className="text-2xl">Session Complete 🎉</CardTitle>
//             <CardDescription className="text-base">
//               Outstanding work! You have mastered all {totalCards} cards.
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             <Button
//               onClick={restart}
//               className="bg-cyan-600 hover:bg-cyan-700 text-white"
//             >
//               <RefreshCcw className="mr-2 h-4 w-4" />
//               Review Again
//             </Button>
//           </CardContent>
//         </Card>
//       </div>
//     );
//   }

//   if (!frontCard || !backCard) return null;

//   return (
//     <div className="min-h-[80vh] flex flex-col bg-background mt-10">
//       {/* Progress Navbar */}
//       <div className="w-full bg-background sticky top-0 z-10">
//         <div className="max-w-3xl mx-auto px-4 py-4 space-y-3">
//           <div className="flex justify-between items-center text-sm">
//             <span className="font-semibold flex items-center gap-2 text-foreground">
//               <Brain className="h-4 w-4 text-cyan-600" />
//               Active Recall
//             </span>
//             <div className="flex items-center gap-4">
//               <button
//                 onClick={() => setReduceMotion(!reduceMotion)}
//                 className="text-xs text-muted-foreground hover:text-foreground transition-colors bg-cyan-100 px-2 py-1 rounded-md flex items-center gap-1"
//               >
//                 {reduceMotion ? "Motion: Reduced" : "Motion: Full"}
//                 {reduceMotion ? (
//                   <ChevronUp className="w-5" />
//                 ) : (
//                   <ChevronDown className="w-5" />
//                 )}
//               </button>
//               <span className="text-muted-foreground">
//                 <span className="text-foreground font-medium">{mastered}</span>{" "}
//                 / {totalCards}
//               </span>
//             </div>
//           </div>

//           <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
//             <div
//               className="h-full bg-cyan-600 transition-all duration-500 ease-out"
//               style={{ width: `${progress}%` }}
//             />
//           </div>
//         </div>
//       </div>

//       {/* Flashcard Area */}
//       <div className="flex flex-1 justify-center items-center p-4">
//         <div
//           className="mx-auto max-w-3xl w-full"
//           style={{ perspective: "1500px" }}
//         >
//           <div
//             className={cn(
//               "relative min-h-[420px] transition-all duration-500 ease-out",
//               !reduceMotion && "[transform-style:preserve-3d]",
//               !reduceMotion && revealed ? "[transform:rotateY(180deg)]" : ""
//             )}
//           >
//             {/* FRONT */}
//             <Card
//               className={cn(
//                 "absolute inset-0 flex flex-col border shadow-sm bg-card",
//                 !reduceMotion && "[backface-visibility:hidden]",
//                 reduceMotion && "transition-opacity duration-500",
//                 reduceMotion && revealed
//                   ? "opacity-0 pointer-events-none z-0"
//                   : "opacity-100 z-10"
//               )}
//             >
//               <CardHeader className="flex-1 flex flex-col justify-between p-8">
//                 <div className="space-y-6">
//                   <div className="flex justify-between items-start">
//                     <Badge
//                       variant="secondary"
//                       className="mt-1 bg-cyan-100 text-cyan-800 hover:bg-cyan-100/80"
//                     >
//                       Question
//                     </Badge>
//                     {frontCard.hint && (
//                       <Button
//                         variant="ghost"
//                         size="icon"
//                         className="h-8 w-8 text-muted-foreground hover:text-amber-500 hover:bg-amber-50"
//                         onClick={() => setShowHint(!showHint)}
//                         title="Toggle hint"
//                       >
//                         <Lightbulb className="h-5 w-5" />
//                       </Button>
//                     )}
//                   </div>

//                   {/* Render Markdown Question */}
//                   <MarkdownRenderer
//                     content={frontCard.question}
//                     className="text-2xl sm:text-3xl leading-relaxed font-medium"
//                   />

//                   {/* Fixed height to prevent layout shift when hint appears */}
//                   <div className="min-h-[60px]">
//                     {showHint && frontCard.hint && (
//                       <CardDescription className="text-base bg-muted/50 p-4 rounded-md text-foreground animate-in fade-in duration-300">
//                         <MarkdownRenderer content={frontCard.hint} />
//                       </CardDescription>
//                     )}
//                   </div>
//                 </div>

//                 <div className="flex justify-between items-center pt-8 mt-auto border-t">
//                   <div className="flex gap-2 text-sm text-muted-foreground items-center">
//                     <kbd className="px-2 py-1 bg-muted rounded-md border font-mono text-xs">
//                       Space
//                     </kbd>
//                     <span>to reveal</span>
//                   </div>
//                   <Button
//                     onClick={handleReveal}
//                     className="bg-cyan-600 hover:bg-cyan-700 text-white px-8"
//                   >
//                     Reveal Answer
//                   </Button>
//                 </div>
//               </CardHeader>
//             </Card>

//             {/* BACK */}
//             <Card
//               className={cn(
//                 "absolute inset-0 flex flex-col border shadow-sm bg-card",
//                 !reduceMotion &&
//                   "[backface-visibility:hidden] [transform:rotateY(180deg)]",
//                 reduceMotion && "transition-opacity duration-500",
//                 reduceMotion && !revealed
//                   ? "opacity-0 pointer-events-none z-0"
//                   : "opacity-100 z-10"
//               )}
//             >
//               <CardHeader
//                 className={cn(
//                   "flex-1 flex flex-col justify-between p-8 transition-opacity",
//                   revealed
//                     ? "opacity-100 duration-500 delay-100"
//                     : "opacity-0 duration-75 pointer-events-none"
//                 )}
//               >
//                 <div className="space-y-6">
//                   <div className="flex justify-between items-center">
//                     <Badge
//                       variant="secondary"
//                       className="bg-cyan-100 text-cyan-800 hover:bg-cyan-100/80"
//                     >
//                       Answer
//                     </Badge>
//                   </div>

//                   {/* Render Markdown Answer */}
//                   <MarkdownRenderer
//                     content={backCard.answer}
//                     className="text-2xl sm:text-3xl leading-relaxed font-medium"
//                   />

//                   <div className="min-h-[40px]">
//                     {backCard.tags && backCard.tags.length > 0 && (
//                       <div className="flex gap-2 flex-wrap pt-4">
//                         {backCard.tags.map((tag) => (
//                           <Badge
//                             key={tag}
//                             variant="outline"
//                             className="text-muted-foreground"
//                           >
//                             {tag}
//                           </Badge>
//                         ))}
//                       </div>
//                     )}
//                   </div>
//                 </div>

//                 <div className="pt-8 mt-auto border-t space-y-4">
//                   <div className="grid grid-cols-3 gap-4">
//                     <Button
//                       onClick={() => handleRating("forgot")}
//                       className="bg-red-200 hover:bg-red-300 text-white flex flex-col gap-1 h-auto py-4 transition-colors border-none shadow-sm"
//                     >
//                       <span className="font-semibold text-red-950 ">
//                         Forgot
//                       </span>
//                     </Button>
//                     <Button
//                       onClick={() => handleRating("almost")}
//                       className="bg-yellow-200 hover:bg-yellow-300 flex flex-col gap-1 h-auto py-4 transition-colors border-none shadow-sm"
//                     >
//                       <span className="font-semibold text-yellow-950 ">
//                         Almost
//                       </span>
//                     </Button>
//                     <Button
//                       onClick={() => handleRating("got_it")}
//                       className="bg-green-200 hover:bg-green-300 text-white flex flex-col gap-1 h-auto py-4 transition-colors border-none shadow-sm"
//                     >
//                       <span className="font-semibold text-green-950 ">
//                         Got it
//                       </span>
//                     </Button>
//                   </div>
//                 </div>
//               </CardHeader>
//             </Card>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// // 🔥 Helper component to render Markdown safely with specific image and text constraints
// function MarkdownRenderer({
//   content,
//   className,
// }: {
//   content: string;
//   className?: string;
// }) {
//   return (
//     <div
//       className={cn(
//         // Ensures <p> tags don't break margins, and limits image sizes so they fit on the card
//         "max-w-none break-words [&_p]:m-0 [&_img]:max-h-56 [&_img]:mx-auto [&_img]:mt-4 [&_img]:rounded-lg [&_img]:object-contain",
//         className
//       )}
//     >
//       <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
//         {content}
//       </ReactMarkdown>
//     </div>
//   );
// }

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Brain,
  ChevronDown,
  ChevronLeft, // Added for back button
  ChevronUp,
  Lightbulb,
  RefreshCcw,
} from "lucide-react";
import { useRouter } from "next/navigation"; // Added for navigation
import { useCallback, useEffect, useMemo, useState } from "react";
// 🔥 Required imports for Markdown, Math, and Images
import "katex/dist/katex.min.css";
import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";

type Flashcard = {
  id: string;
  question: string;
  answer: string;
  hint?: string;
  tags?: string[];
};

export default function Flashcards({ flashData, title }: any) {
  const data = flashData.cards;
  const router = useRouter(); // Initialize router

  const [queue, setQueue] = useState<string[]>(() =>
    data.map((c: Flashcard) => c.id)
  );
  const [revealed, setRevealed] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  const cardMap = useMemo(() => {
    return Object.fromEntries(data.map((c: Flashcard) => [c.id, c]));
  }, [data]);

  const currentCardId = queue[0];
  const currentCard = currentCardId ? cardMap[currentCardId] : null;

  const [frontCard, setFrontCard] = useState<Flashcard | null>(currentCard);
  const [backCard, setBackCard] = useState<Flashcard | null>(currentCard);

  useEffect(() => {
    setQueue(data.map((c: Flashcard) => c.id));
  }, [data]);

  useEffect(() => {
    if (currentCard) {
      setFrontCard(currentCard);
    }
  }, [currentCard]);

  const handleReveal = useCallback(() => {
    if (!revealed && currentCard) {
      setBackCard(currentCard);
      setRevealed(true);
    }
  }, [revealed, currentCard]);

  const totalCards = data.length;
  const mastered = totalCards - queue.length;
  const progress = totalCards > 0 ? (mastered / totalCards) * 100 : 0;
  const sessionComplete = queue.length === 0 && totalCards > 0;

  const handleRating = useCallback(
    (rating: "got_it" | "almost" | "forgot") => {
      if (!currentCardId) return;

      setQueue((prevQueue) => {
        const [, ...remaining] = prevQueue;

        if (rating === "got_it") return remaining;
        if (rating === "almost") return [...remaining, currentCardId];
        if (rating === "forgot") {
          const insertIndex = Math.min(3, remaining.length);
          const newQueue = [...remaining];
          newQueue.splice(insertIndex, 0, currentCardId);
          return newQueue;
        }

        return remaining;
      });

      setRevealed(false);
      setShowHint(false);
    },
    [currentCardId]
  );

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (!currentCardId) return;

      if (e.code === "Space" && !revealed) {
        e.preventDefault();
        handleReveal();
      }

      if (!revealed) return;

      if (e.code === "Digit1") handleRating("forgot");
      if (e.code === "Digit2") handleRating("almost");
      if (e.code === "Digit3") handleRating("got_it");
    }

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [revealed, currentCardId, handleRating, handleReveal]);

  function restart() {
    const initialQueue = data.map((c: Flashcard) => c.id);
    setQueue(initialQueue);
    setRevealed(false);
    setShowHint(false);

    if (initialQueue.length > 0) {
      const first = cardMap[initialQueue[0]];
      setFrontCard(first);
      setBackCard(first);
    }
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center text-muted-foreground">
        No cards provided
      </div>
    );
  }

  if (sessionComplete) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center animate-in fade-in duration-500">
        <Card className="max-w-xl text-center border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Session Complete 🎉</CardTitle>
            <CardDescription className="text-base">
              Outstanding work! You have mastered all {totalCards} cards.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={restart}
              className="bg-cyan-600 hover:bg-cyan-700 text-white"
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              Review Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!frontCard || !backCard) return null;

  return (
    <div className="min-h-[80vh] flex flex-col bg-background mt-6">
      {/* Progress Navbar */}
      <div className="w-full bg-background sticky top-0 z-10 pb-4">
        <div className="max-w-3xl mx-auto px-4 py-4 space-y-4">
          {/* Header with Back Button and Title */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground -ml-2"
              onClick={() => router.back()}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-medium tracking-tight text-foreground truncate">
              {title || "Study Session"}
            </h1>
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className="font-semibold flex items-center gap-4 text-foreground">
              <Brain className="h-4 w-4 text-cyan-600" />
              Active Recall
            </span>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setReduceMotion(!reduceMotion)}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors bg-cyan-50 border border-cyan-100 px-2 py-1 rounded-md flex items-center gap-1"
              >
                {reduceMotion ? "Motion: Reduced" : "Motion: Full"}
                {reduceMotion ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
              <span className="text-muted-foreground font-medium">
                <span className="text-foreground">{mastered}</span> /{" "}
                {totalCards}
              </span>
            </div>
          </div>

          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-cyan-600 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Flashcard Area */}
      <div className="flex flex-1 justify-center items-center p-4">
        <div
          className="mx-auto max-w-3xl w-full"
          style={{ perspective: "1500px" }}
        >
          <div
            className={cn(
              "relative min-h-[420px] transition-all duration-500 ease-out",
              !reduceMotion && "[transform-style:preserve-3d]",
              !reduceMotion && revealed ? "[transform:rotateY(180deg)]" : ""
            )}
          >
            {/* FRONT */}
            <Card
              className={cn(
                "absolute inset-0 flex flex-col border shadow-sm bg-card",
                !reduceMotion && "[backface-visibility:hidden]",
                reduceMotion && "transition-opacity duration-500",
                reduceMotion && revealed
                  ? "opacity-0 pointer-events-none z-0"
                  : "opacity-100 z-10"
              )}
            >
              <CardHeader className="flex-1 flex flex-col justify-between p-8">
                <div className="space-y-6">
                  <div className="flex justify-between items-start">
                    <Badge
                      variant="secondary"
                      className="mt-1 bg-cyan-100 text-cyan-800 hover:bg-cyan-100/80"
                    >
                      Question
                    </Badge>
                    {frontCard.hint && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-amber-500 hover:bg-amber-50"
                        onClick={() => setShowHint(!showHint)}
                        title="Toggle hint"
                      >
                        <Lightbulb className="h-5 w-5" />
                      </Button>
                    )}
                  </div>

                  <MarkdownRenderer
                    content={frontCard.question}
                    className="text-2xl sm:text-3xl leading-relaxed font-medium"
                  />

                  <div className="min-h-[60px]">
                    {showHint && frontCard.hint && (
                      <CardDescription className="text-base bg-muted/50 p-4 rounded-md text-foreground animate-in fade-in duration-300">
                        <MarkdownRenderer content={frontCard.hint} />
                      </CardDescription>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-8 mt-auto border-t">
                  <div className="flex gap-2 text-sm text-muted-foreground items-center">
                    <kbd className="px-2 py-1 bg-muted rounded-md border font-mono text-xs">
                      Space
                    </kbd>
                    <span>to reveal</span>
                  </div>
                  <Button
                    onClick={handleReveal}
                    className="bg-cyan-600 hover:bg-cyan-700 text-white px-8"
                  >
                    Reveal Answer
                  </Button>
                </div>
              </CardHeader>
            </Card>

            {/* BACK */}
            <Card
              className={cn(
                "absolute inset-0 flex flex-col border shadow-sm bg-card",
                !reduceMotion &&
                  "[backface-visibility:hidden] [transform:rotateY(180deg)]",
                reduceMotion && "transition-opacity duration-500",
                reduceMotion && !revealed
                  ? "opacity-0 pointer-events-none z-0"
                  : "opacity-100 z-10"
              )}
            >
              <CardHeader
                className={cn(
                  "flex-1 flex flex-col justify-between p-8 transition-opacity",
                  revealed
                    ? "opacity-100 duration-500 delay-100"
                    : "opacity-0 duration-75 pointer-events-none"
                )}
              >
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <Badge
                      variant="secondary"
                      className="bg-cyan-100 text-cyan-800 hover:bg-cyan-100/80"
                    >
                      Answer
                    </Badge>
                  </div>

                  <MarkdownRenderer
                    content={backCard.answer}
                    className="text-2xl sm:text-3xl leading-relaxed font-medium"
                  />

                  <div className="min-h-[40px]">
                    {backCard.tags && backCard.tags.length > 0 && (
                      <div className="flex gap-2 flex-wrap pt-4">
                        {backCard.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="text-muted-foreground"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-8 mt-auto border-t space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <Button
                      onClick={() => handleRating("forgot")}
                      className="bg-red-200 hover:bg-red-300 text-white flex flex-col gap-1 h-auto py-4 transition-colors border-none shadow-sm"
                    >
                      <span className="font-semibold text-red-950 ">
                        Forgot
                      </span>
                    </Button>
                    <Button
                      onClick={() => handleRating("almost")}
                      className="bg-yellow-200 hover:bg-yellow-300 flex flex-col gap-1 h-auto py-4 transition-colors border-none shadow-sm"
                    >
                      <span className="font-semibold text-yellow-950 ">
                        Almost
                      </span>
                    </Button>
                    <Button
                      onClick={() => handleRating("got_it")}
                      className="bg-green-200 hover:bg-green-300 text-white flex flex-col gap-1 h-auto py-4 transition-colors border-none shadow-sm"
                    >
                      <span className="font-semibold text-green-950 ">
                        Got it
                      </span>
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function MarkdownRenderer({
  content,
  className,
}: {
  content: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "max-w-none break-words [&_p]:m-0 [&_img]:max-h-56 [&_img]:mx-auto [&_img]:mt-4 [&_img]:rounded-lg [&_img]:object-contain",
        className
      )}
    >
      <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
