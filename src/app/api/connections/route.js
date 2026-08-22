import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/server/lib/db';
import User from '@/server/models/User';
import Connection from '@/server/models/Connection';

export async function GET(req) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const user = await User.findOne({ clerkId: userId });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const pendingIncoming = await Connection.find({ recipient: user._id, status: 'pending' })
      .populate('requester', 'profile.name profile.photo profile.department profile.college')
      .sort({ createdAt: -1 });

    const pendingOutgoing = await Connection.find({ requester: user._id, status: 'pending' })
      .populate('recipient', 'profile.name profile.photo profile.department profile.college')
      .sort({ createdAt: -1 });

    const acceptedConnections = await Connection.find({
      $or: [{ requester: user._id }, { recipient: user._id }],
      status: 'accepted'
    })
      .populate('requester', 'profile.name profile.photo profile.department profile.college')
      .populate('recipient', 'profile.name profile.photo profile.department profile.college')
      .sort({ updatedAt: -1 });

    const accepted = acceptedConnections.map(c => {
      const isRequester = c.requester._id.toString() === user._id.toString();
      return {
        _id: c._id,
        otherPerson: isRequester ? c.recipient : c.requester,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt
      };
    });

    return NextResponse.json({
      pendingIncoming,
      pendingOutgoing,
      accepted
    });
  } catch (error) {
    console.error("[CONNECTIONS_GET_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { targetUserId } = await req.json();
    if (!targetUserId) return NextResponse.json({ error: "Missing target user ID" }, { status: 400 });

    await connectDB();
    const user = await User.findOne({ clerkId: userId });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    if (user._id.toString() === targetUserId) {
      return NextResponse.json({ error: "Cannot connect with yourself" }, { status: 400 });
    }

    const existingConnection = await Connection.findOne({
      $or: [
        { requester: user._id, recipient: targetUserId },
        { requester: targetUserId, recipient: user._id }
      ]
    });

    if (existingConnection) {
      return NextResponse.json({ error: "Connection already exists", connection: existingConnection }, { status: 400 });
    }

    const newConnection = await Connection.create({
      requester: user._id,
      recipient: targetUserId,
      status: 'pending'
    });

    const Notification = (await import('@/server/models/Notification')).default;
    await Notification.create({
      recipient: targetUserId,
      type: 'connection_request',
      message: `${user.profile?.name || 'Someone'} sent you a connection request.`,
      link: '/connections',
      relatedUser: user._id
    });


    return NextResponse.json(newConnection, { status: 201 });
  } catch (error) {
    console.error("[CONNECTIONS_POST_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
