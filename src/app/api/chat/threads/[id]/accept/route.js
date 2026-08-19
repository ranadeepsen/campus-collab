import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/server/lib/db';
import ChatThread from '@/server/models/ChatThread';
import User from '@/server/models/User';
import AmbassadorProfile from '@/server/models/AmbassadorProfile';
import PointsTransaction from '@/server/models/PointsTransaction';
import { BASE_CONNECTION_POINTS } from '@/server/lib/pointsConfig';

export async function POST(req, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: threadId } = await params;
    const { action } = await req.json(); // 'accept' or 'decline'

    await connectDB();
    const user = await User.findOne({ clerkId: userId });
    const thread = await ChatThread.findById(threadId);

    if (!user || !thread) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (thread.status !== 'pending') return NextResponse.json({ error: "Thread not pending" }, { status: 400 });

    if (action === 'decline') {
      thread.status = 'closed';
      await thread.save();
      return NextResponse.json(thread);
    }

    if (action === 'accept') {
      thread.status = 'active';
      thread.connectedAt = new Date();
      // Set feedback due 24h later
      thread.feedbackDueAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await thread.save();

      // Award connection points to Ambassador
      const ambassadorProfile = await AmbassadorProfile.findOne({ user: user._id });
      if (ambassadorProfile) {
        // Ensure idempotency: check if transaction already exists
        const existingTx = await PointsTransaction.findOne({
          ambassador: ambassadorProfile._id,
          relatedThread: thread._id,
          reason: 'connection'
        });

        if (!existingTx) {
          await PointsTransaction.create({
            ambassador: ambassadorProfile._id,
            amount: BASE_CONNECTION_POINTS,
            reason: 'connection',
            relatedThread: thread._id
          });

          ambassadorProfile.totalPoints += BASE_CONNECTION_POINTS;
          await ambassadorProfile.save();
        }
      }
      return NextResponse.json(thread);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("[THREAD_ACCEPT_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
