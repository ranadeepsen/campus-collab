import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/server/lib/db';
import User from '@/server/models/User';
import AmbassadorConnection from '@/server/models/AmbassadorConnection';

export async function POST(req, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();
    const { rating, feedbackText } = body;

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Valid rating (1-5) is required" }, { status: 400 });
    }

    await connectDB();
    const prospect = await User.findOne({ clerkId: userId });
    if (!prospect) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const connection = await AmbassadorConnection.findById(id);
    if (!connection) {
      return NextResponse.json({ error: "Connection not found" }, { status: 404 });
    }

    if (connection.prospectiveStudentId.toString() !== prospect._id.toString()) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (connection.feedbackSubmittedAt) {
      return NextResponse.json({ error: "Feedback already submitted" }, { status: 400 });
    }

    const ambassador = await User.findById(connection.ambassadorId);
    if (!ambassador) {
      return NextResponse.json({ error: "Ambassador not found" }, { status: 404 });
    }

    connection.rating = rating;
    connection.feedbackText = feedbackText || null;
    connection.feedbackSubmittedAt = new Date();

    // Map rating to bonus points
    // 5 stars -> +20, 4 stars -> +12, 3 stars -> +5, 1-2 stars -> +0
    let bonus = 0;
    if (rating === 5) bonus = 20;
    else if (rating === 4) bonus = 12;
    else if (rating === 3) bonus = 5;

    connection.bonusPointsAwarded = bonus;
    
    if (bonus > 0) {
      ambassador.ambassadorPoints = (ambassador.ambassadorPoints || 0) + bonus;
    }

    // Response-flag logic
    // 1-2 stars and text mentions non-response
    if (rating <= 2 && feedbackText && /response|reply|did not|didn't|ignore/i.test(feedbackText)) {
      ambassador.responseFlags = (ambassador.responseFlags || 0) + 1;
      if (ambassador.responseFlags >= 3) {
        ambassador.ambassadorHidden = true;
      }
    }

    await ambassador.save();
    await connection.save();

    return NextResponse.json({ success: true, bonusAwarded: bonus });
  } catch (error) {
    console.error("[AMBASSADOR_FEEDBACK_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
