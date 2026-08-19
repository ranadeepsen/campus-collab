import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/server/lib/db';
import Event from '@/server/models/Event';
import User from '@/server/models/User';

export async function GET(req) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const user = await User.findOne({ clerkId: userId });
    
    // Simple filter: upcoming events
    const query = { dateTime: { $gte: new Date() }, removed_by_admin: { $ne: true } };
    
    if (user?.profile?.college) {
      query.college = user.profile.college;
    }
    
    const events = await Event.find(query).populate('college', 'name').populate('clubId', 'name').sort({ is_featured: -1, dateTime: 1 });
    
    return NextResponse.json(events);
  } catch (error) {
    console.error("[EVENTS_GET_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
