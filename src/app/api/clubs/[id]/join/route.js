import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/server/lib/db';
import Club from '@/server/models/Club';
import User from '@/server/models/User';
import { getAccessState } from '@/server/lib/getAccessState';

export async function POST(req, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: clubId } = await params;
    
    await connectDB();
    const user = await User.findOne({ clerkId: userId });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const access = getAccessState(user);
    if (!access.canJoinClubs) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const club = await Club.findById(clubId);
    if (!club) return NextResponse.json({ error: "Club not found" }, { status: 404 });

    const isMember = club.memberIds.includes(user._id);
    
    if (isMember) {
      club.memberIds = club.memberIds.filter(id => id.toString() !== user._id.toString());
    } else {
      club.memberIds.push(user._id);
    }

    await club.save();
    return NextResponse.json({ membersCount: club.memberIds.length, isMember: !isMember });

  } catch (error) {
    console.error("[JOIN_CLUB_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
