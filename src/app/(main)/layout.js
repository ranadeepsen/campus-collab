import AppShell from '@/components/layout/AppShell';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function MainLayout({ children }) {
  const { sessionClaims } = await auth.protect();
  
  const metadata = sessionClaims?.publicMetadata || {};
  const { user_type, status, profileCompleted } = metadata;

  // Onboarding redirection (mirrors middleware — backup if middleware is bypassed)
  if (!user_type) {
    redirect('/role-selection');
  }

  if (profileCompleted && status === 'rejected') {
    redirect('/verify-email');
  }

  if (!profileCompleted) {
    if (user_type === 'current' && status === 'unverified') {
      redirect('/verify-email');
    }
    if (user_type === 'current' && status === 'pending_review') {
      redirect('/verification-pending');
    }
    if (status === 'rejected') {
      redirect('/verify-email');
    }
    if (status === 'verified') {
      redirect('/complete-profile');
    }
  }

  return (
    <AppShell>
      {children}
    </AppShell>
  );
}
