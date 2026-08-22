import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/server/lib/db';
import User from '@/server/models/User';
import ClubMembership from '@/server/models/ClubMembership';

export async function GET(req, { params }) {
  try {
    const { userId: myClerkId } = await auth();
    const { id: clubId } = await params;
    
    await connectDB();
    
    // Find all memberships
    const memberships = await ClubMembership.find({ club: clubId })
      .populate('user', 'firstName lastName profile.name profile.photo clerkId')
      .sort({ joinedAt: 1 });

    // Separate into active members and pending requests
    const members = [];
    const pending = [];
    
    let myRole = null;

    memberships.forEach(m => {
      if (myClerkId && m.user && m.user.clerkId === myClerkId) {
        myRole = m.role;
      }
      if (m.role === 'pending') {
        pending.push(m);
      } else {
        members.push(m);
      }
    });

    // If I am not an admin, I should not see pending requests
    if (myRole !== 'admin') {
      return NextResponse.json({ members, pending: [] });
    }

    return NextResponse.json({ members, pending });
  } catch (error) {
    console.error("[CLUB_MEMBERS_GET_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
