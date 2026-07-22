'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

const QUERY = 'Find me a high-protein breakfast under $3';
const EXPLANATION =
  'Greek yoghurt wins here — 20g protein at $0.29/100g, beating the muesli bar by 40% on protein-per-dollar for your muscle goal.';

// A scripted, illustrative walkthrough — not a live API call. Labeled
// "Example" throughout so it's never mistaken for a real live lookup; the
// specific numbers here are a made-up example scenario, not a claim about
// today's actual catalog (contrast with the real AI touchpoints elsewhere
// in the app, which only ever explain lib/scoring.ts's real calculated
// facts). This card's job is to *show the shape* of what the real feature
// does, the same way any product demo video is staged.
export function AIDemo() {
  const [typedChars, setTypedChars] = useState(0);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    if (typedChars < QUERY.length) {
      const t = setTimeout(() => setTypedChars((c) => c + 1), 35);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setShowResult(true), 500);
    return () => clearTimeout(t);
  }, [typedChars]);

  return (
    <section className="full-bleed px-4 py-14 sm:px-6" style={{ background: 'var(--forest-deep)' }}>
      <div className="mx-auto flex max-w-2xl flex-col gap-6">
        <div className="text-center">
          <span
            className="inline-block rounded-full px-3 py-1 text-xs font-semibold"
            style={{ background: 'var(--forest)', color: 'var(--mint-light)' }}
          >
            Example — not a live query
          </span>
          <h2 className="mt-3 text-2xl font-extrabold text-white">See it in action</h2>
        </div>

        <div className="rounded-2xl border p-5" style={{ background: '#0f4a35', borderColor: '#15503c' }}>
          <p className="font-mono text-sm" style={{ color: 'var(--mint-light)' }}>
            <span className="text-white/40">You: </span>
            {QUERY.slice(0, typedChars)}
            <span className="animate-pulse">▍</span>
          </p>

          {showResult && (
            <div className="mt-5 flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-white/5 p-3">
                  <p className="text-sm font-semibold text-white">Greek Yoghurt</p>
                  <p className="text-xs" style={{ color: 'var(--mint-light)' }}>
                    20g protein · $0.29/100g
                  </p>
                </div>
                <div className="rounded-xl bg-white/5 p-3">
                  <p className="text-sm font-semibold text-white">Muesli Bar</p>
                  <p className="text-xs" style={{ color: 'var(--mint-light)' }}>
                    5g protein · $0.41/100g
                  </p>
                </div>
              </div>
              <p className="rounded-xl p-3 text-sm text-white" style={{ background: 'rgba(245, 166, 35, 0.12)' }}>
                🌱 {EXPLANATION}
              </p>
              <p className="text-xs text-white/40">Powered by Gemini AI</p>
            </div>
          )}
        </div>

        <Link
          href="/shop"
          className="mx-auto font-semibold hover:underline"
          style={{ color: 'var(--mint-light)' }}
        >
          Try it with your own goals →
        </Link>
      </div>
    </section>
  );
}
