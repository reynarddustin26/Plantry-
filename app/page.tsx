import { Hero } from '@/components/landing/Hero';
import { ProblemSolution } from '@/components/landing/ProblemSolution';
import { AIDemo } from '@/components/landing/AIDemo';
import { FeaturesGrid } from '@/components/landing/FeaturesGrid';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { WhyPlantry } from '@/components/landing/WhyPlantry';
import { StatsBar } from '@/components/landing/StatsBar';
import { HackathonNote } from '@/components/landing/HackathonNote';

export default function Home() {
  return (
    <div className="flex flex-col gap-16">
      <Hero />

      <div id="build-basket" className="scroll-mt-20">
        <ProblemSolution />
      </div>
      <AIDemo />
      <FeaturesGrid />
      <HowItWorks />
      <WhyPlantry />
      <StatsBar />
      <HackathonNote />
    </div>
  );
}
