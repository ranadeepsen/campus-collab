import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/server/lib/db';
import User from '@/server/models/User';
import AmbassadorConnection from '@/server/models/AmbassadorConnection';

export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { ambassadorId } = body;

    await connectDB();
    const prospect = await User.findOne({ clerkId: userId });
    
    if (!prospect) return NextResponse.json({ error: "User not found" }, { status: 404 });
    if (prospect.user_type !== 'prospective') {
      return NextResponse.json({ error: "Only prospective students can request ambassador connections" }, { status: 403 });
    }

    const ambassador = await User.findById(ambassadorId);
    if (!ambassador || ambassador.ambassadorStatus !== 'active') {
      return NextResponse.json({ error: "Ambassador not found or not active" }, { status: 404 });
    }

    // Check for existing connection
    const existing = await AmbassadorConnection.findOne({
      ambassadorId: ambassador._id,
      prospectiveStudentId: prospect._id,
      status: { $in: ['requested', 'accepted'] }
    });

    if (existing) {
      return NextResponse.json({ error: "Connection already exists" }, { status: 400 });
    }

    const connection = await AmbassadorConnection.create({
      ambassadorId: ambassador._id,
      prospectiveStudentId: prospect._id,
      status: 'requested'
    });

    return NextResponse.json(connection, { status: 201 });
  } catch (error) {
    console.error("[AMBASSADOR_CONNECT_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
