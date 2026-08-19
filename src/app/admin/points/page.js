import { verifyAdminSession } from '@/server/lib/adminAuth';
import { AccessDenied } from '../AdminClient';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import PointsClient from './PointsClient';

export const metadata = {
  title: 'Points Ledger | Admin | Campus Collab',
};

export default async function PointsPage() {
  const adminSession = await verifyAdminSession();
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in?redirect_url=/admin/points');
  }

  if (!adminSession || !adminSession.isAdmin) {
    return <AccessDenied userEmail={user?.emailAddresses[0]?.emailAddress} />;
  }

  return <PointsClient />;
}
