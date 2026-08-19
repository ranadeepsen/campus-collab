import { NextResponse } from 'next/server';
import connectDB from '@/server/lib/db';
import Report from '@/server/models/Report';
import { verifyAdminSession } from '@/server/lib/adminAuth';

export async function GET() {
  try {
    const adminSession = await verifyAdminSession();
    if (!adminSession || !adminSession.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const reports = await Report.find({ status: 'open' })
      .populate('reporter_id', 'profile.name email')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(reports);
  } catch (error) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
