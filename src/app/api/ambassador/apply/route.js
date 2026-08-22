import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/server/lib/db';
import User from '@/server/models/User';
import AmbassadorApplication from '@/server/models/AmbassadorApplication';

export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const user = await User.findOne({ clerkId: userId });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Validate eligibility
    if (user.user_type !== 'current' || user.status !== 'verified') {
      return NextResponse.json({ error: "Only verified current students can apply" }, { status: 403 });
    }

    if (user.ambassadorStatus === 'active') {
      return NextResponse.json({ error: "You are already an active ambassador" }, { status: 400 });
    }

    // Check existing application status
    const existing = await AmbassadorApplication.findOne({ user: user._id }).sort({ createdAt: -1 });
    
    if (existing) {
      if (existing.status === 'pending_review') {
        return NextResponse.json({ error: "You already have a pending application" }, { status: 400 });
      }
      if (existing.status === 'rejected' && existing.cooldownUntil && new Date(existing.cooldownUntil) > new Date()) {
        return NextResponse.json({ error: "You are on cooldown and cannot apply yet" }, { status: 403 });
      }
    }

    const body = await req.json();
    const { yearOfStudy, department, reason, topics, availability } = body;

    if (!yearOfStudy || !department || !reason || !topics || !topics.length) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Update user profile department if it changed
    if (user.profile.department !== department || user.profile.yearOfStudy !== yearOfStudy) {
      user.profile.department = department;
      user.profile.yearOfStudy = yearOfStudy;
      await user.save();
    }

    const application = await AmbassadorApplication.create({
      user: user._id,
      yearOfStudy,
      department,
      reason,
      topics,
      availability: availability || ''
    });

    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    console.error("[AMBASSADOR_APPLY_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
