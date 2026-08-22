import { verifyAdminSession } from '@/server/lib/adminAuth';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }) {
  const adminSession = await verifyAdminSession();
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in?redirect_url=/admin');
  }

  if (!adminSession || !adminSession.isAdmin) {
    // If we want to return AccessDenied, we could do it here. 
    // But AccessDenied is a client component. Let's just redirect or return a simple access denied UI.
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-red-100 p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-500 text-sm mb-6">
            You do not have administrator privileges.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FC] flex flex-col md:flex-row">
      <AdminSidebar adminRole={adminSession.role} />
      <div className="flex-1 p-4 sm:p-8 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
