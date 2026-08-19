import { verifyAdminSession } from '@/server/lib/adminAuth';
import { AccessDenied } from '../AdminClient';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import ReportsClient from './ReportsClient';

export const metadata = {
  title: 'Reports | Admin | Campus Collab',
};

export default async function ReportsPage() {
  const adminSession = await verifyAdminSession();
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in?redirect_url=/admin/reports');
  }

  if (!adminSession || !adminSession.isAdmin) {
    return <AccessDenied userEmail={user?.emailAddresses[0]?.emailAddress} />;
  }

  return <ReportsClient />;
}
