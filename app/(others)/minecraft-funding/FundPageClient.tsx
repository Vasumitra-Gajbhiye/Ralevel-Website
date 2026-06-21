"use client";

import getStripe from "@/lib/stripe-client";
import { useUser } from "@clerk/nextjs";
import { useState } from "react";

// Initialize Stripe outside of component
const stripePromise = getStripe();

// Initialize Stripe outside of component

// ── Progress bar ─────────────────────────────────────────────────────────────
function ProgressBar({
  raised,
  goal,
  noContributors,
}: {
  raised: number;
  goal: number;
  noContributors: number;
}) {
  const pct = Math.min(100, Math.round((raised / goal) * 100));
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm font-medium text-gray-600">
        <span>
          <span className="text-2xl font-bold text-gray-900">
            ${raised.toLocaleString()}
          </span>
          <span className="text-gray-500"> raised</span>
        </span>
        <span className="text-gray-500">Goal: ${goal.toLocaleString()}</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-teal-500 to-cyan-400 transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <span>{pct}% funded</span>
        <span>{noContributors} supporters</span>
      </div>
    </div>
  );
}

// ── Tier card ─────────────────────────────────────────────────────────────────
function TierCard({
  amount,
  label,
  perks,
  accent,
  icon,
  onCheckout,
}: {
  amount: number;
  label: string;
  perks: string[];
  accent: string;
  icon: string;
  onCheckout: (amount: number, label: string) => void;
}) {
  return (
    <div
      className={`relative rounded-2xl border-2 p-6 flex flex-col gap-4 hover:shadow-lg transition-shadow bg-white ${accent}`}
    >
      <div className="flex items-center gap-3">
        <span className="text-3xl">{icon}</span>
        <div>
          <p className="text-2xl font-bold text-gray-900">${amount}</p>
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            {label}
          </p>
        </div>
      </div>
      <ul className="space-y-2 flex-1">
        {perks.map((perk, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
            <svg
              className="w-4 h-4 mt-0.5 shrink-0 text-teal-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
            {perk}
          </li>
        ))}
      </ul>
      <button
        onClick={() => onCheckout(amount, label)}
        className="w-full py-3 rounded-xl font-semibold text-sm text-white bg-[#0891b2] hover:bg-[#0e7490] transition-colors"
      >
        Contribute ${amount}
      </button>
    </div>
  );
}

// ── Trust badge ───────────────────────────────────────────────────────────────
function TrustBadge({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center shrink-0 text-teal-600">
        {icon}
      </div>
      <div>
        <p className="font-semibold text-gray-900 text-sm">{title}</p>
        <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
      </div>
    </div>
  );
}

// ── FAQ item ──────────────────────────────────────────────────────────────────
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 py-4">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center text-left gap-4"
      >
        <span className="font-medium text-gray-900">{q}</span>
        <svg
          className={`w-5 h-5 text-gray-400 shrink-0 transition-transform ${
            open ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {open && (
        <p className="mt-3 text-sm text-gray-600 leading-relaxed">{a}</p>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function FundPageClient({
  initialRaised,
  goal,
  noContributors,
}: {
  initialRaised: number;
  goal: number;
  noContributors: number;
}) {
  const { isSignedIn } = useUser();
  const [customAmount, setCustomAmount] = useState<number | "">("");
  const [loading, setLoading] = useState(false);

  const handleCheckout = async (amount: number, tierLabel: string) => {
    if (!isSignedIn) {
      alert("Please sign in first to contribute!");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, tierLabel }),
      });

      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Something went wrong loading checkout.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* <TopNav /> */}

      {/* ── Hero ── */}
      <section className="bg-[#f0f7ff] border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            {/* Badge */}
            <span className="inline-flex items-center gap-2 bg-teal-50 text-teal-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-teal-200">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
              Community Fundraiser
            </span>

            <h1 className="text-4xl md:text-5xl font-bold leading-relaxed text-gray-900 tracking-wide">
              Help us start the <span className="text-[#0891b2]">r/alevel</span>{" "}
              Minecraft Season 2!
            </h1>

            <p className="text-gray-600 text-lg leading-relaxed">
              A place for 185,000+ A Level students to unwind, connect, and have
              fun — together. Your support keeps it running.
            </p>

            {/* <ProgressBar
              raised={initialRaised}
              goal={goal}
              noContributors={noContributors}
            /> */}

            <div className="flex flex-wrap gap-3 pt-2">
              <a
                href="#tiers"
                className="px-6 py-3 bg-[#0891b2] hover:bg-[#0e7490] text-white font-semibold rounded-xl transition-colors text-sm"
              >
                Support the Server
              </a>
              <a
                href="#faq"
                className="px-6 py-3 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 font-semibold rounded-xl transition-colors text-sm"
              >
                Learn More
              </a>
            </div>
          </div>

          <div className="flex justify-center">
            {/* <MinecraftScene /> */}
            <img src="/mc-img3.png" />
          </div>
        </div>
      </section>

      {/* ── Why ── */}
      <section className="max-w-5xl mx-auto px-6 py-16 space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Why a Minecraft server?
        </h2>
        <div className="prose text-gray-600 leading-relaxed space-y-4 text-[15px]">
          <p>
            r/alevel has always been about more than just exam help. It's a
            community — one where students from Pakistan, Sri Lanka, the UK,
            Nigeria, and dozens of other countries study together, stress
            together, and cheer each other on.
          </p>
          <p>
            A community Minecraft server gives our members a shared world to
            build, explore, and decompress after those brutal revision sessions.
            Server costs — hosting, plugins, moderation tools, and backups — add
            up fast. Every contribution goes directly to keeping it alive and
            well-maintained.
          </p>
          <p>
            This is 100% community-funded. No ads. No selling data. Just
            students supporting students.
          </p>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-3 gap-4 pt-4">
          {[
            { value: "185k+", label: "Reddit members" },
            { value: "40k+", label: "Discord members" },
            { value: "100%", label: "Community run" },
          ].map(({ value, label }) => (
            <div
              key={label}
              className="bg-[#f0f7ff] rounded-2xl p-4 text-center"
            >
              <p className="text-2xl font-extrabold text-[#0891b2]">{value}</p>
              <p className="text-xs text-gray-500 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Tiers ── */}
      <section id="tiers" className="bg-gray-50 border-y border-gray-100 py-16">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900">
              Choose your contribution
            </h2>
            <p className="text-gray-500 mt-2 text-sm">
              Every amount helps. Pick what works for you.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <TierCard
              amount={3}
              label="Wooden Pickaxe"
              icon="🪵"
              accent="border-amber-200"
              perks={["Name in server credits", "Warm fuzzy feeling"]}
              onCheckout={handleCheckout}
            />
            <TierCard
              amount={10}
              label="Stone Pickaxe"
              icon="🪨"
              accent="border-gray-300"
              perks={["Name in server credits", "Supporter Discord role"]}
              onCheckout={handleCheckout}
            />
            <TierCard
              amount={25}
              label="Iron Pickaxe"
              icon="⚔️"
              accent="border-teal-300"
              perks={["Everything in Stone", "In-game donor rank"]}
              onCheckout={handleCheckout}
            />
            <TierCard
              amount={50}
              label="Diamond Pickaxe"
              icon="💎"
              accent="border-cyan-400"
              perks={["Everything in Iron", "Custom in-game title"]}
              onCheckout={handleCheckout}
            />
          </div>

          {/* Custom amount */}
          <div className="mt-6 max-w-md mx-auto bg-white border border-gray-200 rounded-2xl p-6 text-center">
            <p className="text-sm font-medium text-gray-700 mb-3">
              Or enter a custom amount
            </p>
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                  $
                </span>
                <input
                  type="number"
                  min="1"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(Number(e.target.value))}
                  placeholder="5"
                  className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
                />
              </div>
              <button
                onClick={() =>
                  handleCheckout(Number(customAmount) || 5, "Custom Amount")
                }
                disabled={loading}
                className="px-5 py-3 bg-[#0891b2] hover:bg-[#0e7490] text-white font-semibold rounded-xl text-sm transition-colors whitespace-nowrap disabled:opacity-50"
              >
                {loading ? "Loading..." : "Contribute"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust ── */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-xl font-bold text-gray-900 mb-8">
          Why you can trust us
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <TrustBadge
            title="Public & Transparent"
            desc="All funds and expenses will be posted publicly on our Discord."
            icon={
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
          />
          <TrustBadge
            title="No Hidden Fees"
            desc="Every dollar after payment processing goes to server costs."
            icon={
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
          />
          <TrustBadge
            title="Secure Payments"
            desc="Powered by Stripe — your card details never touch our servers."
            icon={
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            }
          />
          <TrustBadge
            title="Community Led"
            desc="r/alevel has been student-run since 2019. We're not going anywhere."
            icon={
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            }
          />
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="bg-gray-50 border-t border-gray-100 py-16">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            Frequently asked questions
          </h2>
          <div>
            <FAQItem
              q="What version of Minecraft will the server run?"
              a="We plan to launch on the latest stable Java Edition release. Bedrock cross-play is on our roadmap depending on funding."
            />
            <FAQItem
              q="When will the server launch?"
              a="Once we hit 60% of our goal we'll spin up a beta and invite our earliest supporters first. Full launch follows at 100%."
            />
            <FAQItem
              q="What if the goal isn't reached?"
              a="If we don't hit the goal, all contributors will be fully refunded. No exceptions."
            />
            <FAQItem
              q="Can I contribute if I'm not an A Level student?"
              a="Absolutely! Anyone who wants to support the community is welcome."
            />
            <FAQItem
              q="Will there be recurring costs?"
              a="Yes — hosting renews monthly. Excess funds from this campaign will cover future months. We'll be open about the balance at all times."
            />
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="bg-[#0891b2] py-16">
        <div className="max-w-2xl mx-auto px-6 text-center space-y-5">
          <h2 className="text-3xl font-extrabold text-white">
            Ready to join the adventure?
          </h2>
          <p className="text-cyan-100 text-base">
            Help us build something special for the r/alevel community.
          </p>
          <a
            href="#tiers"
            className="inline-block px-8 py-4 bg-white text-[#0891b2] font-bold rounded-xl hover:bg-cyan-50 transition-colors text-sm"
          >
            Contribute Now
          </a>
        </div>
      </section>

      {/* ── Footer note ── */}
      <div className="text-center py-6 text-xs text-gray-400">
        r/alevel Minecraft Server Fund · Managed by the r/alevel moderation team
        ·{" "}
        <a
          href="https://discord.gg/alevel"
          className="underline hover:text-gray-600"
        >
          Contact us on Discord
        </a>
      </div>
    </div>
  );
}
