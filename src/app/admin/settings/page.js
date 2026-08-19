import { verifyAdminSession } from '@/server/lib/adminAuth';
import { AccessDenied } from '../AdminClient';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import SettingsClient from './SettingsClient';

export const metadata = {
  title: 'Admin Settings | Campus Collab',
};

export default async function SettingsPage() {
  const adminSession = await verifyAdminSession();
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in?redirect_url=/admin/settings');
  }

  if (!adminSession || !adminSession.isAdmin) {
    return <AccessDenied userEmail={user?.emailAddresses[0]?.emailAddress} />;
  }

  if (adminSession.role !== 'super-admin') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <div className="text-center p-8 bg-white rounded-2xl border border-red-100 shadow-sm">
          <h2 className="text-xl font-bold text-red-600 mb-2">Insufficient Permissions</h2>
          <p className="text-gray-500">Only Super Admins can access this page.</p>
        </div>
      </div>
    );
  }

  return <SettingsClient currentAdminId={adminSession.adminId?.toString()} />;
}
