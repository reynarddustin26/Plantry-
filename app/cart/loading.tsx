import { CartLineSkeleton, Skeleton } from '@/components/ui/Skeleton';

export default function CartLoading() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-7 w-40" />
      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <CartLineSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
