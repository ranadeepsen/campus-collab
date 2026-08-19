import { auth, currentUser } from '@clerk/nextjs/server';
import connectDB from './db';
import Admin from '../models/Admin';

export async function verifyAdminSession() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return false;
    }

    const user = await currentUser();
    if (!user) {
      return false;
    }

    const email = user.emailAddresses[0]?.emailAddress;

    await connectDB();
    
    // Check if the user is in the Admin collection by clerkId or email
    const adminRecord = await Admin.findOne({
      $or: [
        { clerkId: userId },
        { email: email }
      ]
    });

    if (adminRecord) {
      // If we matched by email but clerkId is missing, backfill it
      if (!adminRecord.clerkId) {
        adminRecord.clerkId = userId;
        await adminRecord.save();
      }
      return { isAdmin: true, role: adminRecord.role, adminId: adminRecord._id };
    }

    return false;
  } catch (err) {
    console.error("[ADMIN_AUTH_ERROR]", err);
    return false;
  }
}
