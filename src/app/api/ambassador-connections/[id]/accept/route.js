import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/server/lib/db';
import User from '@/server/models/User';
import AmbassadorConnection from '@/server/models/AmbassadorConnection';
import ChatThread from '@/server/models/ChatThread';

export async function PATCH(req, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    await connectDB();
    const ambassador = await User.findOne({ clerkId: userId });
    
    if (!ambassador || ambassador.ambassadorStatus !== 'active') {
      return NextResponse.json({ error: "Ambassador not found or not active" }, { status: 403 });
    }

    const connection = await AmbassadorConnection.findById(id);
    if (!connection) {
      return NextResponse.json({ error: "Connection not found" }, { status: 404 });
    }

    if (connection.ambassadorId.toString() !== ambassador._id.toString()) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (connection.status !== 'requested') {
      return NextResponse.json({ error: "Connection already processed" }, { status: 400 });
    }

    // Accept and award base points (+10)
    connection.status = 'accepted';
    connection.acceptedAt = new Date();
    
    if (!connection.basePointsAwarded) {
      ambassador.ambassadorPoints = (ambassador.ambassadorPoints || 0) + 10;
      await ambassador.save();
      connection.basePointsAwarded = true;
    }

    // Create a chat thread
    let thread = await ChatThread.findOne({
      participants: { $all: [ambassador._id, connection.prospectiveStudentId] }
    });

    if (!thread) {
      thread = await ChatThread.create({
        participants: [ambassador._id, connection.prospectiveStudentId],
        lastMessageAt: new Date()
      });
    }
    
    connection.threadId = thread._id;
    await connection.save();

    return NextResponse.json({ success: true, connection, threadId: thread._id });
  } catch (error) {
    console.error("[AMBASSADOR_ACCEPT_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
