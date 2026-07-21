import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { removePantryItem } from '@/lib/actions/pantry';
import { PantryForm } from '@/components/pantry/PantryForm';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default async function PantryPage() {
  const supabase = await createClient();
  if (!supabase) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <h1 className="text-2xl font-extrabold">Pantry unavailable</h1>
        <p className="text-sm text-muted-foreground">
          Supabase isn&apos;t configured in this environment. Pantry tracking
          needs an account — the Demo Profile and shop still work fully
          offline.
        </p>
        <Link href="/demo-profile">
          <Button>Go to Demo Profile</Button>
        </Link>
      </div>
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/auth/signin');

  const { data: items } = await supabase
    .from('pantry_items')
    .select('id, name, quantity, unit, added_at')
    .eq('user_id', user.id)
    .order('added_at', { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold">Pantry</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          What you already have on hand — synced to your account.
        </p>
      </div>

      <PantryForm />

      <div className="flex flex-col gap-2">
        {(items ?? []).map((item) => (
          <Card key={item.id} className="flex items-center justify-between">
            <p className="text-sm">
              <span className="font-semibold">{item.name}</span>
              {item.quantity != null && (
                <span className="text-muted-foreground">
                  {' '}
                  — {item.quantity}
                  {item.unit ?? ''}
                </span>
              )}
            </p>
            <form action={removePantryItem.bind(null, item.id)}>
              <button
                type="submit"
                aria-label={`Remove ${item.name} from pantry`}
                className="flex h-11 w-11 items-center justify-center rounded-lg text-danger hover:bg-danger-bg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                ✕
              </button>
            </form>
          </Card>
        ))}
        {(items ?? []).length === 0 && (
          <p className="text-sm text-muted-foreground">Your pantry is empty.</p>
        )}
      </div>
    </div>
  );
}
