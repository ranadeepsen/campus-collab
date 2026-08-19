import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/server/lib/db';
import Event from '@/server/models/Event';
import User from '@/server/models/User';
import { getAccessState } from '@/server/lib/getAccessState';

export async function POST(req, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: eventId } = await params;
    
    await connectDB();
    const user = await User.findOne({ clerkId: userId });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const access = getAccessState(user);
    if (!access.canRSVP) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const event = await Event.findById(eventId);
    if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });

    const isRSVPed = event.rsvpIds.includes(user._id);
    
    if (isRSVPed) {
      event.rsvpIds = event.rsvpIds.filter(id => id.toString() !== user._id.toString());
    } else {
      event.rsvpIds.push(user._id);
    }

    await event.save();
    return NextResponse.json({ rsvpCount: event.rsvpIds.length, isRSVPed: !isRSVPed });

  } catch (error) {
    console.error("[RSVP_EVENT_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
