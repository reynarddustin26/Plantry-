'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { SelectableCard } from '@/components/ui/Card';
import { Hero } from '@/components/landing/Hero';
import { ProblemSolution } from '@/components/landing/ProblemSolution';
import { AIDemo } from '@/components/landing/AIDemo';
import { FeaturesGrid } from '@/components/landing/FeaturesGrid';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { WhyPlantry } from '@/components/landing/WhyPlantry';
import { StatsBar } from '@/components/landing/StatsBar';
import { HackathonNote } from '@/components/landing/HackathonNote';
import { useProfileStore } from '@/store/profileStore';
import { staggerContainer } from '@/lib/motion';
import type { Intent } from '@/lib/types';

const INTENTS: { id: Intent; label: string; description: string }[] = [
  { id: 'budget', label: 'Budget', description: 'Stretch every dollar further' },
  { id: 'health', label: 'Health', description: 'Hit my nutrition targets' },
  { id: 'quick', label: 'Quick', description: 'Minimal time in the kitchen' },
  {
    id: 'convenience',
    label: 'Convenience',
    description: 'Easiest possible shop',
  },
];

export default function Home() {
  const router = useRouter();
  const selectedIntent = useProfileStore((s) => s.selectedIntent);
  const setSelectedIntent = useProfileStore((s) => s.setSelectedIntent);

  return (
    <div className="flex flex-col gap-16">
      <Hero />

      <div id="build-basket" className="scroll-mt-20 flex flex-col gap-6">
        <div>
          <h2 className="text-2xl font-extrabold">
            What are you shopping for today?
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Tell Plantry your goal — it turns groceries into a basket, and a
            basket into meals.
          </p>
        </div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4"
        >
          {INTENTS.map((intent) => (
            <SelectableCard
              key={intent.id}
              selected={selectedIntent === intent.id}
              onClick={() => setSelectedIntent(intent.id)}
            >
              <p className="font-semibold">{intent.label}</p>
              <p className="text-sm text-muted-foreground">
                {intent.description}
              </p>
            </SelectableCard>
          ))}
        </motion.div>

        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => router.push('/demo-profile')}>
            View Demo Profile
          </Button>
          <Button
            disabled={!selectedIntent}
            onClick={() => router.push('/onboarding/constraints')}
          >
            Continue
          </Button>
        </div>
      </div>

      <ProblemSolution />
      <AIDemo />
      <FeaturesGrid />
      <HowItWorks />
      <WhyPlantry />
      <StatsBar />
      <HackathonNote />
    </div>
  );
}
