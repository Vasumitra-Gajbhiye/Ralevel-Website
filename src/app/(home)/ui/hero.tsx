// import style from "@/app/layout ui/layout.module.css";
// import style from "@/app/(home)/layout ui/layout.module.css";

// export default function Hero() {
//   return (
//     <div className="md:px-16 sm:px-10 p-5 h-screen bg-hero  bg-no-repeat bg-cover -translate-y-20 z-10 flex justify-center items-center">
//       <div
//         className={
//           style.heroText +
//           " hero-text text-white flex flex-col items-center gap-8 max-w-3xl px-6 py-10 md:p-10"
//         }
//       >
//         <div className="md:text-5xl text-4xl font-bold text-center">
//           Welcome to r/alevel
//         </div>
//         <div className="text-center hidden md:block">
//           r/alevel is a vibrant community for A Level students. <br /> It serves
//           as a platform for asking questions, sharing knowledge, and discussing
//           exams, and study plans.
//         </div>
//         <div className="text-center block md:hidden">
//           r/Alevel is a lively hub for A Level students, where they can ask
//           questions, share knowledge, and discuss exams and study plans.
//         </div>
//         <div className="bg-cy-700 px-4 rounded-lg py-2 text-2xl font-bold flex justify-center items-center hover:scale-105 hover:bg-cy-500 min-w-32 transition-all cursor-pointer">
//           <a href="https://www.reddit.com/r/alevel/" target="_blank">
//             Join Now!
//           </a>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";
import style from "@/app/(home)/layout ui/layout.module.css";
import Reveal from "@/components/Reveal";

export default function Hero() {
  return (
    <div className="md:px-16 sm:px-10 p-5 h-screen bg-hero bg-no-repeat bg-cover -translate-y-20 z-10 flex justify-center items-center">
      <div
        className={
          style.heroText +
          " hero-text text-white flex flex-col items-center gap-8 max-w-3xl px-6 py-10 md:p-10"
        }
      >
        <Reveal direction="up">
          <div className="md:text-5xl text-4xl font-bold text-center">
            Welcome to r/alevel
          </div>
        </Reveal>

        <Reveal delay={0.2} direction="up">
          <div className="text-center hidden md:block">
            r/alevel is a vibrant community for A Level students. <br /> It
            serves as a platform for asking questions, sharing knowledge, and
            discussing exams and study plans.
          </div>
        </Reveal>

        <Reveal delay={0.2} direction="up">
          <div className="text-center block md:hidden">
            r/Alevel is a lively hub for A Level students, where they can ask
            questions, share knowledge, and discuss exams and study plans.
          </div>
        </Reveal>

        <Reveal delay={0.3} direction="up">
          <div className="bg-cy-700 px-4 rounded-lg py-2 text-2xl font-bold flex justify-center items-center hover:scale-105 hover:bg-cy-500 min-w-32 transition-all cursor-pointer">
            <a href="https://www.reddit.com/r/alevel/" target="_blank">
              Join Now!
            </a>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
