import { verifyAdminSession } from '@/server/lib/adminAuth';
import { AccessDenied, AdminDashboard as QueueDashboard } from '../AdminClient';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Verification Queue | Admin | Campus Collab',
};

export default async function QueuePage() {
  const adminSession = await verifyAdminSession();
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in?redirect_url=/admin/queue');
  }

  if (!adminSession || !adminSession.isAdmin) {
    return <AccessDenied userEmail={user?.emailAddresses[0]?.emailAddress} />;
  }

  return <QueueDashboard adminRole={adminSession.role} />;
}
