import { NextResponse } from 'next/server';
import { verifyAdminSession } from '@/server/lib/adminAuth';
import connectDB from '@/server/lib/db';
import User from '@/server/models/User';
import Club from '@/server/models/Club';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const adminSession = await verifyAdminSession();
    if (!adminSession || !adminSession.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    

    const clubs = await Club.find({ status: 'pending_review' })
      .populate('college', 'name')
      .populate('createdBy', 'firstName lastName profile.name clerkId')
      .sort({ createdAt: -1 });

    return NextResponse.json(clubs);
  } catch (error) {
    console.error("[ADMIN_CLUBS_GET_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
