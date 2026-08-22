import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/server/lib/db';
import User from '@/server/models/User';
import Connection from '@/server/models/Connection';

export async function PATCH(req, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: connectionId } = await params;
    if (!connectionId) return NextResponse.json({ error: "Missing connection ID" }, { status: 400 });

    const { status } = await req.json();
    if (!['accepted', 'rejected'].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    await connectDB();
    const user = await User.findOne({ clerkId: userId });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const connection = await Connection.findById(connectionId);
    if (!connection) {
      return NextResponse.json({ error: "Connection not found" }, { status: 404 });
    }

    // Only the recipient can accept or reject
    if (connection.recipient.toString() !== user._id.toString()) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    connection.status = status;
    await connection.save();

    if (status === 'accepted') {
      const Notification = (await import('@/server/models/Notification')).default;
      await Notification.create({
        recipient: connection.requester,
        type: 'connection_accepted',
        message: `${user.profile?.name || 'Someone'} accepted your connection request.`,
        link: '/connections',
        relatedUser: user._id
      });
    }

    return NextResponse.json(connection);
  } catch (error) {
    console.error("[CONNECTION_PATCH_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
