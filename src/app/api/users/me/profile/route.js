import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import connectDB from '@/server/lib/db';
import User from '@/server/models/User';
import { getAccessState } from '@/server/lib/getAccessState';

import Post from '@/server/models/Post';
import Connection from '@/server/models/Connection';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const user = await User.findOne({ clerkId: userId }).populate('profile.college').lean();
    
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const postsCount = await Post.countDocuments({ author: user._id });
    const connectionsCount = await Connection.countDocuments({
      $or: [{ requester: user._id }, { recipient: user._id }],
      status: 'accepted'
    });

    return NextResponse.json({
      ...user,
      stats: {
        posts: postsCount,
        connections: connectionsCount,
        points: user.ambassadorPoints || 0
      },
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
    const { name, photo, college, course, department, yearOfStudy, bio, interests } = body;

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

    // Save fields if they are provided, regardless of strict user_type (e.g. admins might have null user_type)
    if (college !== undefined) user.profile.college = college;
    if (course !== undefined) user.profile.course = course;
    if (department !== undefined) user.profile.department = department;
    if (yearOfStudy !== undefined) user.profile.yearOfStudy = yearOfStudy;
    if (bio !== undefined) user.profile.bio = bio;
    if (interests !== undefined) user.profile.interests = interests;

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
