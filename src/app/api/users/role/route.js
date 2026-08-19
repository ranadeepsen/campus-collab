import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import connectDB from '@/server/lib/db';
import User from '@/server/models/User';

export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { role } = body; // 'current' or 'prospective'

    if (!['current', 'prospective'].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    await connectDB();
    const status = role === 'prospective' ? 'verified' : 'unverified';

    let updatedUser = await User.findOneAndUpdate(
      { clerkId: userId },
      { user_type: role, status },
      { new: true }
    );

    if (!updatedUser) {
      // Fallback if webhook failed locally
      const client = await clerkClient();
      const clerkUser = await client.users.getUser(userId);
      updatedUser = await User.create({
        clerkId: userId,
        email: clerkUser.emailAddresses[0]?.emailAddress || 'unknown@example.com',
        user_type: role,
        status: status
      });
    }

    // Removed redundant check

    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        user_type: updatedUser.user_type,
        status: updatedUser.status,
        profileCompleted: updatedUser.profileCompleted,
        isAmbassador: updatedUser.isAmbassador
      }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("[ROLE_SET_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
