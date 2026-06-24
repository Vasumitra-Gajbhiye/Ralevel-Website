// app/success/CopyMessageBlock.tsx
"use client";

import { useState } from "react";

export default function CopyMessageBlock({
  transactionId,
  tierLabel,
}: {
  transactionId: string;
  tierLabel: string;
}) {
  const [copied, setCopied] = useState(false);

  const messageTemplate = `Hi r/alevel team,

I just contributed to the Minecraft Season 2 fund and would like to claim my perks!

Tier: ${tierLabel}
Transaction ID: ${transactionId}
Contact Email: [Type Email Here]
Discord Username: [Type Discord Here]
Minecraft IGN: [Type IGN Here]

Thanks!`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(messageTemplate);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500); // Reset after 2.5s
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <div className="bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-100 rounded-2xl p-6 mb-6 shadow-sm">
      <h2 className="font-bold text-teal-900 mb-2">Claim Your Perks</h2>
      <p className="text-sm text-teal-800 mb-4 leading-relaxed">
        Please copy the message below, fill in your details, and send it to{" "}
        <a
          href="mailto:team@ralevel.com"
          className="font-bold underline hover:text-teal-600"
        >
          team@ralevel.com
        </a>
      </p>

      {/* The Code Block */}
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-200 to-cyan-200 rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-200"></div>
        <div className="relative bg-white border border-gray-200 rounded-xl p-4 text-left">
          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="absolute top-3 right-3 p-2 bg-gray-50 hover:bg-teal-50 text-gray-500 hover:text-teal-600 border border-gray-200 rounded-lg transition-colors flex items-center gap-1.5"
            title="Copy to clipboard"
          >
            {copied ? (
              <>
                <svg
                  className="w-4 h-4 text-teal-500"
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
                <span className="text-xs font-bold text-teal-600">Copied!</span>
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-xs font-medium">Copy</span>
              </>
            )}
          </button>

          <pre className="text-sm font-mono text-gray-700 whitespace-pre-wrap leading-relaxed pr-16">
            {messageTemplate}
          </pre>
        </div>
      </div>
    </div>
  );
}
