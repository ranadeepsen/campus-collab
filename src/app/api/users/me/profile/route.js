import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import connectDB from '@/server/lib/db';
import User from '@/server/models/User';
import { getAccessState } from '@/server/lib/getAccessState';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const user = await User.findOne({ clerkId: userId }).populate('profile.college').lean();
    
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json({
      ...user,
      access: getAccessState(user)
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { name, photo, department, yearOfStudy, bio, interests } = body;

    await connectDB();
    let user = await User.findOne({ clerkId: userId });
    
    if (!user) {
      const client = await clerkClient();
      const clerkUser = await client.users.getUser(userId);
      user = await User.create({
        clerkId: userId,
        email: clerkUser.emailAddresses[0]?.emailAddress || 'unknown@example.com',
        user_type: 'current',
      });
    }

    user.profile.name = name || user.profile.name;
    user.profile.photo = photo || user.profile.photo;

    if (user.user_type === 'current') {
      user.profile.department = department || user.profile.department;
      user.profile.yearOfStudy = yearOfStudy || user.profile.yearOfStudy;
      user.profile.bio = bio || user.profile.bio;
      user.profile.interests = interests || user.profile.interests;
    } else if (user.user_type === 'prospective') {
      user.profile.bio = bio || user.profile.bio;
    }

    user.profileCompleted = true;
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

    return NextResponse.json(user);
  } catch (error) {
    console.error("[PROFILE_UPDATE_ERROR]", error);
    return NextResponse.json({ error: error.message || "Internal Error" }, { status: 500 });
  }
}
