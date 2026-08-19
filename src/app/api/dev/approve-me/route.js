import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import connectDB from '@/server/lib/db';
import User from '@/server/models/User';

export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const user = await User.findOne({ clerkId: userId });
    
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // For Dev Bypass: Assign them to the first available college so they aren't orphaned and can make posts
    const mongoose = require('mongoose');
    const College = mongoose.models.College || mongoose.model('College');
    const firstCollege = await College.findOne({ is_active: true });
    
    user.status = 'verified';
    if (!user.profile.college && firstCollege) {
      user.profile.college = firstCollege._id;
    }
    await user.save();

    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        user_type: user.user_type,
        status: user.status,
        profileCompleted: user.profileCompleted,
        isAmbassador: user.isAmbassador
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DEV_APPROVE_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
