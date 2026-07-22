import { PlantryMascot } from '@/components/common/PlantryMascot';

export function Footer() {
  return (
    <footer className="mt-auto" style={{ background: 'var(--forest-deep)' }}>
      <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-start sm:justify-between lg:max-w-5xl lg:px-8 xl:max-w-7xl">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-lg font-extrabold text-white">
            <PlantryMascot className="h-8 w-8" />
            Plantry
          </div>
          <p className="max-w-xs text-sm italic" style={{ color: 'var(--mint-light)' }}>
            Every recommendation shows its reason, not just a score.
          </p>
        </div>

        <div className="flex flex-col gap-2 text-sm sm:items-end sm:text-right" style={{ color: 'var(--mint-light)' }}>
          <a
            href="https://github.com/reynarddustin26/Plantry-"
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-white hover:underline"
          >
            View on GitHub
          </a>
          <p>Built for ICON UNSW × Lyra Hackathon 2025</p>
        </div>
      </div>

      <div className="border-t px-4 py-4 text-center text-xs" style={{ borderColor: 'var(--forest)', color: 'var(--mint-light)' }}>
        © {new Date().getFullYear()} Plantry.
      </div>
    </footer>
  );
}
