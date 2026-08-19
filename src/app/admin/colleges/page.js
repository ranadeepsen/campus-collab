import { verifyAdminSession } from '@/server/lib/adminAuth';
import { AccessDenied } from '../AdminClient';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import CollegesClient from './CollegesClient';

export const metadata = {
  title: 'Colleges | Admin | Campus Collab',
};

export default async function CollegesPage() {
  const adminSession = await verifyAdminSession();
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in?redirect_url=/admin/colleges');
  }

  if (!adminSession || !adminSession.isAdmin) {
    return <AccessDenied userEmail={user?.emailAddresses[0]?.emailAddress} />;
  }

  return <CollegesClient />;
}
