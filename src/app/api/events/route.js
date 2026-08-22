import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/server/lib/db';
import Event from '@/server/models/Event';
import User from '@/server/models/User';

export async function GET(req) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const college = searchParams.get('college');
    const category = searchParams.get('category');
    const mode = searchParams.get('mode');
    const limit = searchParams.get('limit');

    await connectDB();
    
    // Only show upcoming events
    const query = { dateTime: { $gte: new Date() } };
    
    if (college) query.college = college;
    if (category) query.category = category;
    if (mode) query.mode = mode;
    
    let dbQuery = Event.find(query)
      .populate('college', 'name')
      .populate('createdBy', 'profile.name profile.photo clerkId')
      .sort({ dateTime: 1 });
      
    if (limit) {
      dbQuery = dbQuery.limit(parseInt(limit));
    }
    
    const events = await dbQuery;
    return NextResponse.json(events);
  } catch (error) {
    console.error("[EVENTS_GET_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const user = await User.findOne({ clerkId: userId });
    
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    
    // Permission check: only verified current students can post events
    if (user.user_type !== 'current' || user.status !== 'verified') {
      return NextResponse.json({ error: "Forbidden. Only verified students can create events." }, { status: 403 });
    }

    const body = await req.json();
    const { name, description, dateTime, mode, venue, meetingLink, college, category, coverImageUrl, registrationLink, contactInfo } = body;

    if (!name || !description || !dateTime || !mode || !college || !category) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    
    if (mode === 'offline' && !venue) {
      return NextResponse.json({ error: "Venue is required for offline events" }, { status: 400 });
    }
    
    if (mode === 'online' && !meetingLink) {
      return NextResponse.json({ error: "Meeting link is required for online events" }, { status: 400 });
    }

    const newEvent = await Event.create({
      name,
      description,
      dateTime,
      mode,
      venue: mode === 'offline' ? venue : null,
      meetingLink: mode === 'online' ? meetingLink : null,
      college,
      category,
      coverImageUrl: coverImageUrl || null,
      registrationLink: registrationLink || null,
      contactInfo: contactInfo || null,
      createdBy: user._id
    });

    const populatedEvent = await Event.findById(newEvent._id)
      .populate('college', 'name')
      .populate('createdBy', 'profile.name profile.photo clerkId');

    return NextResponse.json(populatedEvent, { status: 201 });
  } catch (error) {
    console.error("[EVENTS_POST_ERROR]", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
