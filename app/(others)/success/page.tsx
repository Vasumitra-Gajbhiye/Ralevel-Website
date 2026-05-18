// // app/success/page.tsx
// import Link from "next/link";
// import { redirect } from "next/navigation";
// import Stripe from "stripe";

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
// export default async function SuccessPage({
//   searchParams,
// }: {
//   // 1. Type it as a Promise
//   searchParams: Promise<{ session_id?: string }>;
// }) {
//   // 2. Await the Promise before reading the ID
//   const resolvedSearchParams = await searchParams;
//   const sessionId = resolvedSearchParams.session_id;

//   // If someone just types /success in the URL without a session ID, boot them out
//   if (!sessionId) {
//     redirect("/");
//   }

//   let session;
//   try {
//     session = await stripe.checkout.sessions.retrieve(sessionId);
//   } catch (err) {
//     // If the session ID is invalid/fake
//     redirect("/");
//   }

//   // Double check the payment actually went through
//   if (session.payment_status !== "paid") {
//     redirect("/");
//   }
//   console.log(session);

//   const customerEmail = session.metadata?.userEmail;
//   const amountPaid = session.amount_total ? session.amount_total / 100 : 0;
//   const tierLabel = session.metadata?.tierLabel || "Custom Contribution";

//   return (
//     <div className="min-h-screen bg-[#f0f7ff] flex flex-col items-center justify-center p-6">
//       <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center border border-blue-100 relative overflow-hidden">
//         {/* Decorative background element */}
//         <div className="absolute -top-16 -right-16 w-32 h-32 bg-teal-50 rounded-full blur-2xl" />
//         <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-cyan-50 rounded-full blur-2xl" />

//         <div className="relative z-10">
//           {/* Success Icon */}
//           <div className="w-20 h-20 bg-teal-100 text-teal-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
//             <svg
//               className="w-10 h-10"
//               fill="none"
//               viewBox="0 0 24 24"
//               stroke="currentColor"
//               strokeWidth={3}
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 d="M5 13l4 4L19 7"
//               />
//             </svg>
//           </div>

//           <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
//             Payment Successful!
//           </h1>

//           <p className="text-gray-600 mb-6 leading-relaxed">
//             Thank you so much for your support. A receipt has been sent to{" "}
//             <span className="font-semibold text-gray-900">{customerEmail}</span>
//             .
//           </p>

//           {/* Receipt Details Card */}
//           <div className="bg-gray-50 rounded-2xl p-5 mb-8 border border-gray-100 text-left space-y-3">
//             <div className="flex justify-between items-center border-b border-gray-200 pb-3">
//               <span className="text-sm text-gray-500 font-medium">
//                 Contribution
//               </span>
//               <span className="text-lg font-bold text-gray-900">
//                 ${amountPaid.toFixed(2)}
//               </span>
//             </div>
//             <div className="flex justify-between items-center pt-1">
//               <span className="text-sm text-gray-500 font-medium">Tier</span>
//               <span className="text-sm font-semibold text-[#0891b2] bg-cyan-50 px-3 py-1 rounded-full">
//                 {tierLabel}
//               </span>
//             </div>
//           </div>

//           <Link
//             href="/"
//             className="block w-full py-3.5 rounded-xl font-bold text-white bg-[#0891b2] hover:bg-[#0e7490] transition-colors shadow-lg shadow-cyan-500/30"
//           >
//             Return to Homepage
//           </Link>

//           <p className="mt-6 text-xs text-gray-400 font-medium">
//             Your Discord role will be synced shortly if applicable.
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }
// app/success/page.tsx
// import Link from "next/link";
// import { redirect } from "next/navigation";
// import Stripe from "stripe";

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// export default async function SuccessPage({
//   searchParams,
// }: {
//   searchParams: Promise<{ session_id?: string }>;
// }) {
//   const resolvedSearchParams = await searchParams;
//   const sessionId = resolvedSearchParams.session_id;

//   if (!sessionId) {
//     redirect("/");
//   }

//   let session;
//   try {
//     session = await stripe.checkout.sessions.retrieve(sessionId);
//   } catch (err) {
//     redirect("/");
//   }

//   if (session.payment_status !== "paid") {
//     redirect("/");
//   }

//   const amountPaid = session.amount_total ? session.amount_total / 100 : 0;
//   const tierLabel = session.metadata?.tierLabel || "Custom Contribution";

//   // We'll use the Payment Intent ID if available, otherwise fallback to the Session ID
//   const transactionId = (session.payment_intent as string) || session.id;

//   // Pre-format the email so the user doesn't have to do any work
//   const mailtoSubject = encodeURIComponent(`Claim Perks: ${tierLabel} Tier`);
//   const mailtoBody = encodeURIComponent(
//     `Hi r/alevel team,\n\nI just contributed and would like to claim my perks!\n\nTransaction ID: ${transactionId}\nDiscord Username: [Type Username Here]\nMinecraft IGN: [Type IGN Here]\n\nThanks!`
//   );
//   const mailtoLink = `mailto:team@ralevel.com?subject=${mailtoSubject}&body=${mailtoBody}`;

//   return (
//     <div className="min-h-screen bg-[#f0f7ff] flex flex-col items-center justify-center p-6">
//       <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center border border-blue-100 relative overflow-hidden">
//         {/* Decorative background elements */}
//         <div className="absolute -top-16 -right-16 w-32 h-32 bg-teal-50 rounded-full blur-2xl pointer-events-none" />
//         <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-cyan-50 rounded-full blur-2xl pointer-events-none" />

//         <div className="relative z-10">
//           {/* Success Icon */}
//           <div className="w-16 h-16 bg-teal-100 text-teal-500 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
//             <svg
//               className="w-8 h-8"
//               fill="none"
//               viewBox="0 0 24 24"
//               stroke="currentColor"
//               strokeWidth={3}
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 d="M5 13l4 4L19 7"
//               />
//             </svg>
//           </div>

//           <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
//             Payment Successful!
//           </h1>
//           <p className="text-sm text-gray-500 mb-8">
//             Thank you for supporting the r/alevel community.
//           </p>

//           {/* 1. Receipt Details Card (Clean & Simple) */}
//           <div className="bg-gray-50 rounded-2xl p-5 mb-6 border border-gray-100 text-left space-y-4 shadow-sm">
//             <div className="flex justify-between items-center border-b border-gray-200 pb-3">
//               <span className="text-sm text-gray-500 font-medium">
//                 Contribution
//               </span>
//               <span className="text-lg font-bold text-gray-900">
//                 ${amountPaid.toFixed(2)}
//               </span>
//             </div>
//             <div className="flex justify-between items-center border-b border-gray-200 pb-3">
//               <span className="text-sm text-gray-500 font-medium">Tier</span>
//               <span className="text-sm font-semibold text-[#0891b2] bg-cyan-50 px-3 py-1 rounded-full">
//                 {tierLabel}
//               </span>
//             </div>
//             <div className="flex flex-col pt-1">
//               <span className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1.5">
//                 Transaction ID
//               </span>
//               <span className="text-sm font-mono text-gray-600 bg-gray-200/60 px-3 py-2 rounded-lg select-all break-all border border-gray-200">
//                 {transactionId}
//               </span>
//             </div>
//           </div>

//           {/* 2. Action Card (The new "Next Steps") */}
//           <div className="bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-100 rounded-2xl p-6 mb-6 shadow-sm">
//             <h2 className="font-bold text-teal-900 mb-2 flex items-center justify-center gap-2">
//               <svg
//                 className="w-5 h-5 text-teal-600"
//                 fill="none"
//                 viewBox="0 0 24 24"
//                 stroke="currentColor"
//                 strokeWidth={2.5}
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   d="M13 10V3L4 14h7v7l9-11h-7z"
//                 />
//               </svg>
//               Claim Your Perks
//             </h2>
//             <p className="text-sm text-teal-800 mb-5 leading-relaxed">
//               To receive your Discord role and Minecraft whitelist, we need your
//               usernames. Click below to generate an email with your ID attached.
//             </p>

//             <a
//               href={mailtoLink}
//               className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-bold text-white bg-[#0891b2] hover:bg-[#0e7490] transition-colors shadow-md shadow-cyan-500/20"
//             >
//               <svg
//                 className="w-5 h-5"
//                 fill="none"
//                 viewBox="0 0 24 24"
//                 stroke="currentColor"
//                 strokeWidth={2}
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
//                 />
//               </svg>
//               Send Info via Email
//             </a>
//           </div>

//           {/* 3. Secondary Action */}
//           <Link
//             href="/"
//             className="block w-full py-3 rounded-xl font-semibold text-gray-500 hover:text-gray-800 hover:bg-gray-50 transition-colors text-sm"
//           >
//             Return to Homepage
//           </Link>
//         </div>
//       </div>
//     </div>
//   );
// }

// app/success/page.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import Stripe from "stripe";
import CopyMessageBlock from "./CopyMessageBlock"; // Import the new client component

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const sessionId = resolvedSearchParams.session_id;

  if (!sessionId) {
    redirect("/");
  }

  let session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch (err) {
    redirect("/");
  }

  if (session.payment_status !== "paid") {
    redirect("/");
  }

  const amountPaid = session.amount_total ? session.amount_total / 100 : 0;
  const tierLabel = session.metadata?.tierLabel || "Custom Contribution";

  // Use Payment Intent ID if available, otherwise fallback to the Session ID
  const transactionId = (session.payment_intent as string) || session.id;

  return (
    <div className="min-h-screenf] flex flex-col items-center justify-center p-6 max-w-2xl mx-auto">
      <div className=" w-full bg-white rounded-3xl shadow-xl p-8 text-center border border-blue-100 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute -top-16 -right-16 w-32 h-32 bg-teal-50 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-cyan-50 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10">
          {/* Success Icon */}
          <div className="w-16 h-16 bg-teal-100 text-teal-500 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
            <svg
              className="w-8 h-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
            Payment Successful!
          </h1>
          <p className="text-sm text-gray-500 mb-8">
            Thank you for supporting the r/alevel community.
          </p>

          {/* 1. Receipt Details Card */}
          <div className="bg-gray-50 rounded-2xl p-5 mb-6 border border-gray-100 text-left space-y-4 shadow-sm">
            <div className="flex justify-between items-center border-b border-gray-200 pb-3">
              <span className="text-sm text-gray-500 font-medium">
                Contribution
              </span>
              <span className="text-lg font-bold text-gray-900">
                ${amountPaid.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 font-medium">Tier</span>
              <span className="text-sm font-semibold text-[#0891b2] bg-cyan-50 px-3 py-1 rounded-full">
                {tierLabel}
              </span>
            </div>
          </div>

          {/* 2. Interactive Copy Block */}
          <CopyMessageBlock
            transactionId={transactionId}
            tierLabel={tierLabel}
          />

          {/* 3. Secondary Action */}
          <Link
            href="/"
            className="block w-full py-3 rounded-xl font-semibold text-gray-500 hover:text-gray-800 hover:bg-gray-50 transition-colors text-sm"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
