'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProductCard } from '@/components/common/ProductCard';
import { useProfileStore } from '@/store/profileStore';
import { formatAud } from '@/lib/utils';
import { getSeedProducts } from '@/lib/seed-data';
import { staggerContainer } from '@/lib/motion';

export default function DemoProfilePage() {
  const router = useRouter();
  const profile = useProfileStore((s) => s.profile);
  const sampleProducts = getSeedProducts().slice(0, 4);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold">{profile.displayName}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          This profile works entirely offline — no Supabase, no account, no
          network calls.
        </p>
      </div>

      <Card className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-muted-foreground">Weekly budget</p>
          <p className="font-semibold">{formatAud(profile.weeklyBudget)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Max cooking time</p>
          <p className="font-semibold">{profile.maxCookingMinutes} min</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Calorie target</p>
          <p className="font-semibold">{profile.calorieTarget} kcal</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Protein target</p>
          <p className="font-semibold">{profile.proteinTarget} g</p>
        </div>
      </Card>

      <div>
        <p className="mb-2 text-sm font-semibold">Allergies</p>
        <div className="flex flex-wrap gap-2">
          {profile.allergies.length === 0 ? (
            <span className="text-sm text-muted-foreground">None set</span>
          ) : (
            profile.allergies.map((a) => (
              <Badge key={a} variant="danger">
                ⚠ {a}
              </Badge>
            ))
          )}
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold">Preferred stores</p>
        <div className="flex flex-wrap gap-2">
          {profile.preferredStores.map((s) => (
            <Badge key={s}>{s}</Badge>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold">Sample products</p>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="grid grid-cols-1 gap-3 sm:grid-cols-2"
        >
          {sampleProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </motion.div>
      </div>

      <div className="flex justify-start">
        <Button variant="ghost" onClick={() => router.push('/')}>
          Back
        </Button>
      </div>
    </div>
  );
}
