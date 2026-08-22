import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/server/lib/db';
import AmbassadorConnection from '@/server/models/AmbassadorConnection';
import User from '@/server/models/User';

export async function GET(req, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: threadId } = await params;
    await connectDB();

    const user = await User.findOne({ clerkId: userId });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const connection = await AmbassadorConnection.findOne({ threadId })
      .populate('ambassadorId', 'profile.name');

    if (!connection) {
      return NextResponse.json({ connection: null });
    }

    return NextResponse.json({ 
      connection,
      isProspect: connection.prospectiveStudentId.toString() === user._id.toString()
    });
  } catch (error) {
    console.error("[THREAD_CONNECTION_GET_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
