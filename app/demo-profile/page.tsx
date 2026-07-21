'use client';

import Link from 'next/link';
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
        <h1 className="text-2xl font-extrabold lg:text-4xl">{profile.displayName}</h1>
        <p className="mt-1 text-sm text-muted-foreground lg:mt-3 lg:text-base">
          This profile works entirely offline — no Supabase, no account, no
          network calls.
        </p>
      </div>

      <Card className="grid grid-cols-2 gap-4 lg:grid-cols-4">
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
          className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4"
        >
          {sampleProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </motion.div>
      </div>

      <Card className="flex flex-col gap-3">
        <div>
          <p className="text-sm font-semibold">Want this to follow you across devices?</p>
          <p className="text-xs text-muted-foreground">
            An account saves your real profile and pantry to Plantry — the
            Demo Profile above keeps working either way.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/auth/signup">
            <Button variant="secondary">Create an account</Button>
          </Link>
          <Link href="/auth/signin">
            <Button variant="ghost">Sign in</Button>
          </Link>
          <Link href="/pantry">
            <Button variant="ghost">Pantry</Button>
          </Link>
        </div>
      </Card>

      <div className="flex justify-start">
        <Button variant="ghost" onClick={() => router.push('/')}>
          Back
        </Button>
      </div>
    </div>
  );
}
