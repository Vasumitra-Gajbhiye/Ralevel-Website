// app/canceled/page.tsx
import Link from "next/link";

export default function CanceledPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 max-w-2xl mx-auto">
      <div className="w-full bg-white rounded-3xl shadow-xl p-8 text-center border border-red-100 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute -top-16 -right-16 w-32 h-32 bg-red-50 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-rose-50 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10">
          {/* Cancelled Icon */}
          <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>

          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
            Payment Cancelled
          </h1>
          <p className="text-gray-600 mb-2 leading-relaxed">
            Your transaction was not completed.
          </p>
          <p className="text-sm text-gray-500 mb-8">
            Don't worry — no charges were made to your account.
          </p>

          {/* Action Box */}
          <div className="bg-gray-50 rounded-2xl p-6 mb-6 border border-gray-100 shadow-sm">
            <h2 className="font-bold text-gray-800 mb-2">
              Still want to help?
            </h2>
            <p className="text-sm text-gray-600 mb-5 leading-relaxed">
              If you had trouble with your payment method or changed your mind
              about the tier, you can always try again. Every bit helps us keep
              the server running!
            </p>

            <Link
              href="/minecraft-funding"
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-bold text-white bg-gray-800 hover:bg-gray-900 transition-colors shadow-md shadow-gray-500/20"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Try Again
            </Link>
          </div>

          {/* Secondary Action */}
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
