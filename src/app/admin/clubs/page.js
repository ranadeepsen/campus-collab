import { verifyAdminSession } from '@/server/lib/adminAuth';
import { AccessDenied } from '../AdminClient';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import AdminClubsClient from './AdminClubsClient';

export const metadata = {
  title: 'Review Clubs | Admin Dashboard',
};

export default async function AdminClubsPage() {
  const adminSession = await verifyAdminSession();
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in?redirect_url=/admin/clubs');
  }

  if (!adminSession || !adminSession.isAdmin) {
    return <AccessDenied userEmail={user?.emailAddresses[0]?.emailAddress} />;
  }

  return <AdminClubsClient adminRole={adminSession.role} />;
}
