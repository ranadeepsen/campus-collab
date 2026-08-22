import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/server/lib/db';
import User from '@/server/models/User';
import ClubMembership from '@/server/models/ClubMembership';

// PATCH: Promote or Demote member
export async function PATCH(req, { params }) {
  try {
    const { userId: myClerkId } = await auth();
    if (!myClerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: clubId, userId: targetUserId } = await params;
    
    await connectDB();
    const myUser = await User.findOne({ clerkId: myClerkId });
    
    // Check if I'm an admin
    const myMembership = await ClubMembership.findOne({ club: clubId, user: myUser._id, role: 'admin' });
    if (!myMembership) return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });

    const body = await req.json();
    const { action } = body; // 'promote' or 'demote'

    const targetMembership = await ClubMembership.findOne({ club: clubId, user: targetUserId });
    if (!targetMembership) return NextResponse.json({ error: "Member not found" }, { status: 404 });

    if (action === 'promote') {
      if (targetMembership.role === 'member') {
        targetMembership.role = 'admin';
        await targetMembership.save();
      }
    } else if (action === 'demote') {
      if (targetMembership.role === 'admin') {
        const adminCount = await ClubMembership.countDocuments({ club: clubId, role: 'admin' });
        if (adminCount <= 1) {
          return NextResponse.json({ error: "A club must have at least one admin. Promote someone else first." }, { status: 400 });
        }
        targetMembership.role = 'member';
        await targetMembership.save();
      }
    } else if (action === 'approve') {
      if (targetMembership.role === 'pending') {
        targetMembership.role = 'member';
        await targetMembership.save();
      }
    } else if (action === 'reject') {
      if (targetMembership.role === 'pending') {
        await ClubMembership.findByIdAndDelete(targetMembership._id);
        return NextResponse.json({ success: true, removed: true });
      }
    }

    return NextResponse.json(targetMembership);
  } catch (error) {
    console.error("[CLUB_MEMBER_PATCH_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

// DELETE: Remove member (or reject pending request)
export async function DELETE(req, { params }) {
  try {
    const { userId: myClerkId } = await auth();
    if (!myClerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: clubId, userId: targetUserId } = await params;
    
    await connectDB();
    const myUser = await User.findOne({ clerkId: myClerkId });
    
    const myMembership = await ClubMembership.findOne({ club: clubId, user: myUser._id, role: 'admin' });
    if (!myMembership) return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });

    const targetMembership = await ClubMembership.findOne({ club: clubId, user: targetUserId });
    if (!targetMembership) return NextResponse.json({ error: "Member not found" }, { status: 404 });

    if (targetMembership.role === 'admin') {
      const adminCount = await ClubMembership.countDocuments({ club: clubId, role: 'admin' });
      if (adminCount <= 1) {
        return NextResponse.json({ error: "Cannot remove the last admin." }, { status: 400 });
      }
    }

    await ClubMembership.findByIdAndDelete(targetMembership._id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[CLUB_MEMBER_DELETE_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
