import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/server/lib/db';
import Club from '@/server/models/Club';
import User from '@/server/models/User';
import ClubMembership from '@/server/models/ClubMembership';
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

    const existingMembership = await ClubMembership.findOne({ club: clubId, user: user._id });
    
    if (existingMembership) {
      // Leave club logic
      if (existingMembership.role === 'admin') {
        const adminCount = await ClubMembership.countDocuments({ club: clubId, role: 'admin' });
        if (adminCount <= 1) {
          return NextResponse.json({ error: "A club must have at least one admin. Promote someone else first." }, { status: 400 });
        }
      }
      await ClubMembership.findByIdAndDelete(existingMembership._id);
      
      const newCount = await ClubMembership.countDocuments({ club: clubId, role: { $in: ['admin', 'member'] } });
      return NextResponse.json({ membersCount: newCount, myRole: null });
    } else {
      // Join club logic
      const assignedRole = club.joinMode === 'open' ? 'member' : 'pending';
      const newMembership = await ClubMembership.create({
        club: clubId,
        user: user._id,
        role: assignedRole
      });

      const newCount = await ClubMembership.countDocuments({ club: clubId, role: { $in: ['admin', 'member'] } });
      return NextResponse.json({ membersCount: newCount, myRole: assignedRole });
    }

  } catch (error) {
    console.error("[JOIN_CLUB_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
