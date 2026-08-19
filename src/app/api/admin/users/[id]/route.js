import { NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';
import connectDB from '@/server/lib/db';
import User from '@/server/models/User';
import AdminLog from '@/server/models/AdminLog';
import { verifyAdminSession } from '@/server/lib/adminAuth';

export async function POST(req, { params }) {
  try {
    const adminSession = await verifyAdminSession();
    if (!adminSession || !adminSession.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const { action, reason } = await req.json();
    
    await connectDB();
    const user = await User.findById(id);
    
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const client = await clerkClient();

    switch (action) {
      case 'suspend':
        user.status = 'suspended';
        await client.users.banUser(user.clerkId); // Prevent login
        break;
      case 'unsuspend':
        user.status = 'verified'; // Assuming they were verified before. Could be improved.
        await client.users.unbanUser(user.clerkId);
        break;
      case 'ban':
        user.isBanned = true;
        await client.users.banUser(user.clerkId);
        break;
      case 'unban':
        user.isBanned = false;
        await client.users.unbanUser(user.clerkId);
        break;
      case 'force_verify':
        user.status = 'verified';
        break;
      case 'reset_status':
        user.status = 'unverified';
        user.verification_method = null;
        user.review_reason = null;
        break;
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    await user.save();

    // Log the action
    if (adminSession.adminId && ['suspend', 'unsuspend', 'ban', 'unban', 'force_verify', 'reset_status'].includes(action)) {
      await AdminLog.create({
        admin_id: adminSession.adminId,
        target_user_id: user._id,
        action,
        reason: reason || 'No reason provided'
      });
    }

    // Always sync Clerk metadata when the user can still sign in
    if (!user.isBanned && user.status !== 'suspended') {
      await client.users.updateUserMetadata(user.clerkId, {
        publicMetadata: {
          user_type: user.user_type,
          status: user.status,
          profileCompleted: user.profileCompleted,
          isAmbassador: user.isAmbassador
        }
      });
    }

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("[ADMIN_USER_ACTION_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
