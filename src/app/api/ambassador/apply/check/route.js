import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/server/lib/db';
import User from '@/server/models/User';
import AmbassadorApplication from '@/server/models/AmbassadorApplication';

export async function GET(req) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const user = await User.findOne({ clerkId: userId });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Check if user is already an active ambassador
    if (user.ambassadorStatus === 'active') {
      return NextResponse.json({ status: 'approved' });
    }

    // Check for recent application
    const application = await AmbassadorApplication.findOne({ user: user._id }).sort({ createdAt: -1 });
    
    if (!application) {
      return NextResponse.json({ status: null, userProfile: user.profile });
    }

    return NextResponse.json({
      status: application.status,
      cooldownUntil: application.cooldownUntil,
      userProfile: user.profile
    });
  } catch (error) {
    console.error("[AMBASSADOR_CHECK_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
