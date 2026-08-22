import { verifyAdminSession } from '@/server/lib/adminAuth';
import { AccessDenied } from '../AdminClient';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import AdminAmbassadorsClient from './AdminAmbassadorsClient';

export const metadata = {
  title: 'Review Ambassadors | Admin Dashboard',
};

export default async function AdminAmbassadorsPage() {
  const adminSession = await verifyAdminSession();
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in?redirect_url=/admin/ambassadors');
  }

  if (!adminSession || !adminSession.isAdmin) {
    return <AccessDenied userEmail={user?.emailAddresses[0]?.emailAddress} />;
  }

  return <AdminAmbassadorsClient adminRole={adminSession.role} />;
}
