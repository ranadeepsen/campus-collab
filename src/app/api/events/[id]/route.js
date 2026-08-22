import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/server/lib/db';
import Event from '@/server/models/Event';
import User from '@/server/models/User';

export async function DELETE(req, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const user = await User.findOne({ clerkId: userId });
    
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const event = await Event.findById(params.id);
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (event.createdBy.toString() !== user._id.toString()) {
      return NextResponse.json({ error: "Forbidden. You can only delete your own events." }, { status: 403 });
    }

    await Event.findByIdAndDelete(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[EVENT_DELETE_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
