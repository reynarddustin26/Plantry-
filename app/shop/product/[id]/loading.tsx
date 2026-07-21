import { Skeleton } from '@/components/ui/Skeleton';

export default function ProductDetailLoading() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-7 w-2/3" />
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-6 w-1/4" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-11 w-full" />
    </div>
  );
}
