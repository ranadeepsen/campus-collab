import { NextResponse } from 'next/server';
import { verifyAdminSession } from '@/server/lib/adminAuth';
import connectDB from '@/server/lib/db';
import AmbassadorApplication from '@/server/models/AmbassadorApplication';
import User from '@/server/models/User';
import College from '@/server/models/College';

export async function GET(req) {
  try {
    const adminSession = await verifyAdminSession();
    if (!adminSession || !adminSession.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectDB();
    
    // Using populate for nested user profile and college
    const applications = await AmbassadorApplication.find({ status: 'pending_review' })
      .populate({
        path: 'user',
        select: 'clerkId firstName lastName profile',
        populate: {
          path: 'profile.college',
          model: College,
          select: 'name'
        }
      })
      .sort({ createdAt: -1 });

    return NextResponse.json(applications);
  } catch (error) {
    console.error("[ADMIN_AMBASSADOR_GET_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
