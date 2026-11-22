import type { Metadata } from 'next';
import { AccountClient } from '@/components/account/account-client';

export const metadata: Metadata = {
  title: 'Account',
  description: 'Your Growfinix Studio workspace.',
  robots: { index: false, follow: false },
};

export default function AccountPage() {
  return <AccountClient />;
}
