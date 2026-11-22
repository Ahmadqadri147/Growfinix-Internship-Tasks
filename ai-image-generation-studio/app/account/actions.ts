'use server';

import { revalidatePath } from 'next/cache';
import { getSessionUser } from '@/lib/auth';
import { getRepository } from '@/lib/repository';
import type { ProfileState } from '@/lib/types';
import { profileSchema } from '@/lib/validation';

export async function updateProfileAction(
  _previous: ProfileState,
  formData: FormData
): Promise<ProfileState> {
  const user = await getSessionUser();

  if (!user) {
    return { status: 'error', message: 'Your session has expired. Sign in again.' };
  }

  if (user.isGuest) {
    return {
      status: 'error',
      message: 'Create an account before editing a profile.',
    };
  }

  const parsed = profileSchema.safeParse({ name: formData.get('name') });
  if (!parsed.success) {
    return {
      status: 'error',
      message: parsed.error.issues[0]?.message || 'Enter a valid name.',
    };
  }

  try {
    await getRepository().updateUserName(user.id, parsed.data.name);
    revalidatePath('/account');
    return { status: 'success', message: 'Profile updated.' };
  } catch {
    return { status: 'error', message: 'Could not update your profile. Try again.' };
  }
}
