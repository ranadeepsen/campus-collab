import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/server/lib/db';
import ChatThread from '@/server/models/ChatThread';
import User from '@/server/models/User';
import Feedback from '@/server/models/Feedback';
import AmbassadorProfile from '@/server/models/AmbassadorProfile';
import PointsTransaction from '@/server/models/PointsTransaction';
import { getFeedbackPoints } from '@/server/lib/pointsConfig';

export async function POST(req, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: threadId } = await params;
    const { rating, note } = await req.json();

    await connectDB();
    const user = await User.findOne({ clerkId: userId });
    const thread = await ChatThread.findById(threadId).populate('participants');

    if (!user || !thread) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (thread.feedbackSent) return NextResponse.json({ error: "Feedback already sent" }, { status: 400 });

    const mentorId = thread.participants.find(p => p._id.toString() !== user._id.toString())._id;
    const pointsToAward = getFeedbackPoints(rating);

    const feedback = await Feedback.create({
      thread: thread._id,
      fromUser: user._id,
      rating,
      note,
      pointsAwarded: pointsToAward
    });

    thread.feedbackSent = true;
    await thread.save();

    const ambassadorProfile = await AmbassadorProfile.findOne({ user: mentorId });
    if (ambassadorProfile) {
      if (pointsToAward > 0) {
        await PointsTransaction.create({
          ambassador: ambassadorProfile._id,
          amount: pointsToAward,
          reason: 'feedback',
          relatedThread: thread._id
        });
        ambassadorProfile.totalPoints += pointsToAward;
      }
      
      // Update average rating
      const allFeedback = await Feedback.find({ thread: { $in: await ChatThread.find({ participants: mentorId }).distinct('_id') } });
      const avg = allFeedback.reduce((acc, curr) => acc + curr.rating, 0) / allFeedback.length;
      ambassadorProfile.rating = parseFloat(avg.toFixed(1));
      
      await ambassadorProfile.save();
    }

    return NextResponse.json(feedback);
  } catch (error) {
    console.error("[THREAD_FEEDBACK_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
