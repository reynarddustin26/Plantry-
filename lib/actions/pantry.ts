'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { pantryItemFormSchema, type PantryFormState } from '@/lib/pantry-validation';

export async function addPantryItem(
  _state: PantryFormState,
  formData: FormData,
): Promise<PantryFormState> {
  const supabase = await createClient();
  if (!supabase) return { message: 'Accounts are unavailable right now.' };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/auth/signin');

  const validated = pantryItemFormSchema.safeParse({
    name: formData.get('name') ?? '',
    quantity: formData.get('quantity') ?? '',
    unit: formData.get('unit') ?? '',
  });
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const { error } = await supabase.from('pantry_items').insert({
    user_id: user.id,
    name: validated.data.name,
    quantity: validated.data.quantity,
    unit: validated.data.unit,
  });
  if (error) {
    console.error('addPantryItem: insert failed:', error.message);
    return { message: 'Could not add that item. Please try again.' };
  }

  revalidatePath('/pantry');
  return undefined;
}

export async function removePantryItem(itemId: string) {
  const supabase = await createClient();
  if (!supabase) return;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/auth/signin');

  // RLS also enforces this scoping — the explicit .eq('user_id', ...) is
  // defence in depth, not the only guard.
  const { error } = await supabase
    .from('pantry_items')
    .delete()
    .eq('id', itemId)
    .eq('user_id', user.id);
  if (error) {
    console.error('Failed to remove pantry item:', error.message);
    return;
  }
  revalidatePath('/pantry');
}
