import { FadeUp } from '@/components/common/FadeUp';

export function HackathonNote() {
  return (
    <FadeUp as="section" className="full-bleed px-4 py-10 text-center sm:px-6" style={{ background: 'var(--forest)' }}>
      <span
        className="inline-block rounded-full px-4 py-1.5 text-sm font-semibold"
        style={{ background: 'var(--forest-deep)', color: 'var(--gold)' }}
      >
        Built for the ICON UNSW × Lyra Hackathon 2025
      </span>
      <p className="mt-3 text-sm" style={{ color: 'var(--mint-light)' }}>
        Theme: Save time through personalisation
      </p>
    </FadeUp>
  );
}
