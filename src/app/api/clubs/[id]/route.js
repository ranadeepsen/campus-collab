import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/server/lib/db';
import Club from '@/server/models/Club';
import User from '@/server/models/User';
import ClubMembership from '@/server/models/ClubMembership';
import ClubPost from '@/server/models/ClubPost';

export async function GET(req, { params }) {
  try {
    const { userId } = await auth();
    const { id } = await params;
    
    await connectDB();
    const club = await Club.findById(id).populate('college', 'name').populate('createdBy', 'firstName lastName profile.name');
    
    if (!club) return NextResponse.json({ error: "Club not found" }, { status: 404 });

    let myRole = null;
    let myMembershipId = null;

    if (userId) {
      const user = await User.findOne({ clerkId: userId });
      if (user) {
        const membership = await ClubMembership.findOne({ club: id, user: user._id });
        if (membership) {
          myRole = membership.role;
          myMembershipId = membership._id;
        }
      }
    }

    const membersCount = await ClubMembership.countDocuments({ club: id, role: { $in: ['admin', 'member'] } });

    // Admin only fields logic:
    // If not admin and status is not approved, hide
    if (club.status !== 'approved' && myRole !== 'admin') {
       // Allow platform admins? For now, if they are not club admin, return 403 or 404
       // We can just return 404
       return NextResponse.json({ error: "Club not found" }, { status: 404 });
    }

    const doc = club.toObject();
    doc.membersCount = membersCount;
    doc.myRole = myRole; // 'admin', 'member', 'pending', or null

    return NextResponse.json(doc);
  } catch (error) {
    console.error("[CLUB_GET_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    await connectDB();
    const user = await User.findOne({ clerkId: userId });
    
    const membership = await ClubMembership.findOne({ club: id, user: user._id, role: 'admin' });
    if (!membership) {
      return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
    }

    const body = await req.json();
    const { name, collegeId, description, category, coverImageUrl, logoUrl, joinMode } = body;

    const club = await Club.findById(id);
    if (!club) return NextResponse.json({ error: "Club not found" }, { status: 404 });

    let resetToPending = false;
    
    if (name && name !== club.name) {
      club.name = name;
      resetToPending = true;
    }
    
    if (collegeId && collegeId !== club.college.toString()) {
      club.college = collegeId;
      resetToPending = true;
    }

    if (description !== undefined) club.description = description;
    if (category !== undefined) club.category = category;
    if (coverImageUrl !== undefined) club.coverImageUrl = coverImageUrl;
    if (logoUrl !== undefined) club.logoUrl = logoUrl;
    if (joinMode !== undefined) club.joinMode = joinMode;

    if (resetToPending) {
      club.status = 'pending_review';
    }

    await club.save();
    return NextResponse.json(club);
  } catch (error) {
    console.error("[CLUB_PATCH_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    await connectDB();
    const user = await User.findOne({ clerkId: userId });
    
    const membership = await ClubMembership.findOne({ club: id, user: user._id, role: 'admin' });
    if (!membership) {
      return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
    }

    await Club.findByIdAndDelete(id);
    await ClubMembership.deleteMany({ club: id });
    await ClubPost.deleteMany({ club: id });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[CLUB_DELETE_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
