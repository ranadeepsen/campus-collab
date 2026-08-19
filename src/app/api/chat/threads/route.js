import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/server/lib/db';
import ChatThread from '@/server/models/ChatThread';
import User from '@/server/models/User';
import { getAccessState } from '@/server/lib/getAccessState';

export async function GET(req) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const user = await User.findOne({ clerkId: userId });
    
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const threads = await ChatThread.find({ participants: user._id })
      .populate('participants', 'profile.name profile.photo isAmbassador user_type clerkId')
      .sort({ updatedAt: -1 });
    
    return NextResponse.json(threads);
  } catch (error) {
    console.error("[THREADS_GET_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { targetUserId, type } = await req.json(); // type: 'ambassador' or 'direct'

    await connectDB();
    const user = await User.findOne({ clerkId: userId });
    const targetUser = await User.findById(targetUserId);

    if (!user || !targetUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const access = getAccessState(user);
    if (type === 'ambassador' && !access.canConnectWithAmbassador) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (type === 'direct' && !access.canDMStudents) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check existing thread
    const existingThread = await ChatThread.findOne({
      participants: { $all: [user._id, targetUser._id] },
      threadType: type
    });

    if (existingThread) {
      return NextResponse.json(existingThread);
    }

    const newThread = await ChatThread.create({
      participants: [user._id, targetUser._id],
      threadType: type,
      status: type === 'ambassador' ? 'pending' : 'active',
      connectedAt: type === 'direct' ? new Date() : null
    });

    return NextResponse.json(newThread);
  } catch (error) {
    console.error("[THREAD_CREATE_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
