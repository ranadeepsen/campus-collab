import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/server/lib/db';
import Report from '@/server/models/Report';
import User from '@/server/models/User';

export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { content_type, content_id, reason } = await req.json();

    if (!content_type || !content_id || !reason) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectDB();
    const user = await User.findOne({ clerkId: userId });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const report = await Report.create({
      reporter_id: user._id,
      content_type,
      content_id,
      reason,
      status: 'open'
    });

    return NextResponse.json({ success: true, reportId: report._id });
  } catch (error) {
    console.error("[REPORT_CREATE_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
