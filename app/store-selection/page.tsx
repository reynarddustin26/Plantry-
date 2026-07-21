'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { SelectableCard } from '@/components/ui/Card';
import { useProfileStore } from '@/store/profileStore';
import { staggerContainer } from '@/lib/motion';
import type { Store } from '@/lib/types';

const STORES: Store[] = ['Coles', 'Woolworths', 'IGA'];

export default function StoreSelectionPage() {
  const router = useRouter();
  const preferredStores = useProfileStore((s) => s.profile.preferredStores);
  const updateProfile = useProfileStore((s) => s.updateProfile);

  function toggleStore(store: Store) {
    const has = preferredStores.includes(store);
    updateProfile({
      preferredStores: has
        ? preferredStores.filter((s) => s !== store)
        : [...preferredStores, store],
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold">Where do you shop?</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pick one or more stores — you can change this any time.
        </p>
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="flex flex-col gap-3"
      >
        {STORES.map((store) => (
          <SelectableCard
            key={store}
            selected={preferredStores.includes(store)}
            onClick={() => toggleStore(store)}
          >
            <p className="font-semibold">{store}</p>
          </SelectableCard>
        ))}
      </motion.div>

      <div className="flex justify-between gap-3">
        <Button
          variant="ghost"
          onClick={() => router.push('/onboarding/constraints')}
        >
          Back
        </Button>
        <Button
          disabled={preferredStores.length === 0}
          onClick={() => router.push('/demo-profile')}
        >
          Continue to Shopping
        </Button>
      </div>
    </div>
  );
}
