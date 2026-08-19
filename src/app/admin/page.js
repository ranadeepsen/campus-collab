import { verifyAdminSession } from '@/server/lib/adminAuth';
import { AccessDenied } from './AdminClient';
import DashboardClient from './DashboardClient';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Admin Dashboard | Campus Collab',
};

export default async function AdminPage() {
  const adminSession = await verifyAdminSession();
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in?redirect_url=/admin');
  }

  if (!adminSession || !adminSession.isAdmin) {
    return <AccessDenied userEmail={user?.emailAddresses[0]?.emailAddress} />;
  }

  return <DashboardClient adminRole={adminSession.role} />;
}
