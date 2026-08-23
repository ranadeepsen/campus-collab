import { NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';
import connectDB from '@/server/lib/db';
import User from '@/server/models/User';
import IdVerificationQueue from '@/server/models/IdVerificationQueue';
import { verifyAdminSession } from '@/server/lib/adminAuth';

export async function GET(req) {
  try {
    const adminSession = await verifyAdminSession();
    if (!adminSession || !adminSession.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();

    const queue = await IdVerificationQueue.find({ status: 'pending' })
      .populate({
        path: 'user',
        select: 'profile email verification_method customCollegeRequest',
        populate: { path: 'profile.college', select: 'name email_domains' }
      })
      .sort({ createdAt: 1 });
      
    return NextResponse.json(queue);
  } catch (error) {
    console.error("[ADMIN_QUEUE_GET_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const adminSession = await verifyAdminSession();
    if (!adminSession || !adminSession.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { requestId, action } = await req.json(); // action: 'approve' | 'reject'
    
    await connectDB();

    const queueItem = await IdVerificationQueue.findById(requestId);
    if (!queueItem) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const userToVerify = await User.findById(queueItem.user);
    if (!userToVerify) return NextResponse.json({ error: "User not found" }, { status: 404 });

    if (action === 'approve') {
      queueItem.status = 'approved';
      queueItem.reviewedBy = adminSession.adminId?.toString() || "admin";
      queueItem.reviewedAt = new Date();
      await queueItem.save();

      userToVerify.status = 'verified';
      await userToVerify.save();

      // Sync with Clerk
      const client = await clerkClient();
      await client.users.updateUserMetadata(userToVerify.clerkId, {
        publicMetadata: {
          user_type: userToVerify.user_type,
          status: userToVerify.status,
          profileCompleted: userToVerify.profileCompleted,
          isAmbassador: userToVerify.isAmbassador
        }
      });
      
      return NextResponse.json({ success: true, status: 'approved' });
    } else if (action === 'reject') {
      queueItem.status = 'rejected';
      queueItem.reviewedBy = adminSession.adminId?.toString() || "admin";
      queueItem.reviewedAt = new Date();
      await queueItem.save();

      userToVerify.status = 'rejected';
      await userToVerify.save();
      
      const client = await clerkClient();
      await client.users.updateUserMetadata(userToVerify.clerkId, {
        publicMetadata: {
          user_type: userToVerify.user_type,
          status: userToVerify.status,
          profileCompleted: userToVerify.profileCompleted,
          isAmbassador: userToVerify.isAmbassador
        }
      });

      return NextResponse.json({ success: true, status: 'rejected' });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("[ADMIN_QUEUE_POST_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

