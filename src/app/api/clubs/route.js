import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/server/lib/db';
import Club from '@/server/models/Club';
import User from '@/server/models/User';
import ClubMembership from '@/server/models/ClubMembership';
import { getAccessState } from '@/server/lib/getAccessState';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const user = await User.findOne({ clerkId: userId });
    
    const { searchParams } = new URL(req.url);
    const collegeId = searchParams.get('collegeId');
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit')) || 0;

    let query = { 
      removed_by_admin: { $ne: true },
      status: "approved"
    };

    if (collegeId && collegeId !== 'all') {
      query.college = collegeId;
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    const clubs = await Club.find(query)
      .populate('college', 'name')
      .sort({ is_featured: -1, trending: -1, createdAt: -1 })
      .limit(limit);
    
    // Get member counts for each club
    const clubIds = clubs.map(c => c._id);
    const membershipCounts = await ClubMembership.aggregate([
      { $match: { club: { $in: clubIds }, role: { $in: ['admin', 'member'] } } },
      { $group: { _id: '$club', count: { $sum: 1 } } }
    ]);

    const countMap = {};
    membershipCounts.forEach(m => countMap[m._id.toString()] = m.count);

    const enrichedClubs = clubs.map(c => {
      const doc = c.toObject();
      doc.memberIds = Array.from({ length: countMap[c._id.toString()] || 0 }); // Fallback for components expecting length
      doc.membersCount = countMap[c._id.toString()] || 0;
      return doc;
    });
    
    return NextResponse.json(enrichedClubs);
  } catch (error) {
    console.error("[CLUBS_GET_ERROR]", error);
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

    const access = getAccessState(user);
    if (!access.canCreateClubs) {
      return NextResponse.json({ error: "Only verified current students can create clubs" }, { status: 403 });
    }

    const body = await req.json();
    const { name, description, category, coverImageUrl, logoUrl, joinMode, proofText, proofFileUrl, website, instagram, facebook, twitter } = body;

    if (!name || !description || !category || !proofText) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const collegeId = user.profile?.college?.toString();
    if (!collegeId) {
      return NextResponse.json({ error: "No college associated with your profile" }, { status: 403 });
    }

    const newClub = await Club.create({
      name,
      description,
      category,
      college: collegeId,
      coverImageUrl: coverImageUrl || null,
      logoUrl: logoUrl || null,
      website: website || '',
      socialLinks: {
        instagram: instagram || '',
        facebook: facebook || '',
        twitter: twitter || ''
      },
      status: "pending_review",
      joinMode: joinMode || "request",
      proofText,
      proofFileUrl: proofFileUrl || null,
      createdBy: user._id
    });

    // Creator gets admin membership
    await ClubMembership.create({
      club: newClub._id,
      user: user._id,
      role: 'admin'
    });

    return NextResponse.json(newClub, { status: 201 });
  } catch (error) {
    console.error("[CLUBS_POST_ERROR]", error);
    return NextResponse.json({ error: error.message || "Internal Error" }, { status: 500 });
  }
}
