import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/server/lib/db';
import Message from '@/server/models/Message';
import ChatThread from '@/server/models/ChatThread';
import User from '@/server/models/User';

export async function GET(req, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: threadId } = await params;
    await connectDB();

    const user = await User.findOne({ clerkId: userId });
    const thread = await ChatThread.findById(threadId);

    if (!user || !thread) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const isParticipant = thread.participants.some(
      (participantId) => participantId.toString() === user._id.toString()
    );
    if (!isParticipant) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    
    const messages = await Message.find({ thread: threadId })
      .populate('sender', 'profile.name profile.photo clerkId')
      .sort({ createdAt: 1 });
      
    return NextResponse.json(messages);
  } catch (error) {
    console.error("[MESSAGES_GET_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function POST(req, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: threadId } = await params;
    const { content } = await req.json();

    await connectDB();
    const user = await User.findOne({ clerkId: userId });
    const thread = await ChatThread.findById(threadId);

    if (!user || !thread) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const isParticipant = thread.participants.some(
      (participantId) => participantId.toString() === user._id.toString()
    );
    if (!isParticipant) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    
    if (thread.status !== 'active') {
      return NextResponse.json({ error: "Thread is not active" }, { status: 403 });
    }

    const message = await Message.create({
      thread: threadId,
      sender: user._id,
      content
    });
    
    await thread.updateOne({ updatedAt: new Date() });

    await message.populate('sender', 'profile.name profile.photo clerkId');
    return NextResponse.json(message);
  } catch (error) {
    console.error("[MESSAGES_POST_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
