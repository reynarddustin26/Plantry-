'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { PlantryMascot } from '@/components/common/PlantryMascot';
import { useProfile } from '@/lib/hooks/useProfile';

export function Hero() {
  const { profile } = useProfile();

  return (
    <section
      className="hero-gradient-bg full-bleed -mt-[96px] flex min-h-screen flex-col justify-center overflow-hidden px-4 pb-16 pt-[96px] sm:px-6 lg:-mt-[112px] lg:pt-[112px]"
    >
      <div className="hero-orb hero-orb-1" />
      <div className="hero-orb hero-orb-2" />
      <div className="hero-orb hero-orb-3" />
      <div className="hero-orb hero-orb-4" />

      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col-reverse items-center gap-10 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col items-center gap-5 text-center lg:items-start lg:text-left">
          <span
            className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-semibold"
            style={{
              borderColor: 'var(--emerald)',
              background: 'rgba(11, 61, 46, 0.6)',
              color: 'var(--mint-light)',
            }}
          >
            🌱 AI-powered grocery
          </span>

          <h1 className="text-4xl font-extrabold leading-[1.1] text-white sm:text-5xl lg:text-[56px]">
            Your grocery list,
            <br />
            <span style={{ color: 'var(--amber)' }}>optimised by AI.</span>
          </h1>

          <p className="max-w-md text-base lg:text-lg" style={{ color: 'var(--mint-light)' }}>
            Tell Plantry your budget, goals and allergies. It compares Coles,
            Woolworths and IGA, builds your basket, and turns it into a week
            of meals — automatically.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 lg:justify-start">
            {profile ? (
              <Link href="/shop">
                <Button>Go to my basket →</Button>
              </Link>
            ) : (
              <>
                <Link href="/auth/signup">
                  <Button>Get started free</Button>
                </Link>
                <Link
                  href="/auth/signin"
                  className="flex min-h-[44px] items-center gap-1 rounded-lg px-3 text-sm font-semibold hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  style={{ color: 'var(--mint-light)' }}
                >
                  Sign in
                </Link>
              </>
            )}
          </div>

          {!profile && (
            <p className="text-xs" style={{ color: 'var(--mint-light)', opacity: 0.75 }}>
              No credit card required to sign up.
            </p>
          )}
        </div>

        <PlantryMascot className="mascot-float h-40 w-40 shrink-0 lg:h-56 lg:w-56" />
      </div>

      <a
        href="#build-basket"
        aria-label="Scroll to how it works"
        className="scroll-indicator absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-white/40 hover:text-white/70"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 5v14M5 12l7 7 7-7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </a>
    </section>
  );
}
