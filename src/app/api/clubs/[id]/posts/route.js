import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/server/lib/db';
import User from '@/server/models/User';
import ClubMembership from '@/server/models/ClubMembership';
import ClubPost from '@/server/models/ClubPost';

export async function GET(req, { params }) {
  try {
    const { id: clubId } = await params;
    await connectDB();
    
    const posts = await ClubPost.find({ club: clubId })
      .populate('createdBy', 'firstName lastName profile.name profile.photo clerkId')
      .populate('comments.user', 'firstName lastName profile.name profile.photo')
      .sort({ createdAt: -1 });

    return NextResponse.json(posts);
  } catch (error) {
    console.error("[CLUB_POSTS_GET_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function POST(req, { params }) {
  try {
    const { userId: myClerkId } = await auth();
    if (!myClerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: clubId } = await params;
    
    await connectDB();
    const myUser = await User.findOne({ clerkId: myClerkId });
    
    // Check if I'm an admin
    const myMembership = await ClubMembership.findOne({ club: clubId, user: myUser._id, role: 'admin' });
    if (!myMembership) return NextResponse.json({ error: "Forbidden: Admins only can post" }, { status: 403 });

    const body = await req.json();
    const { content, imageUrl } = body;

    if (!content) return NextResponse.json({ error: "Missing content" }, { status: 400 });

    const post = await ClubPost.create({
      club: clubId,
      content,
      imageUrl: imageUrl || null,
      createdBy: myUser._id
    });

    const populatedPost = await ClubPost.findById(post._id).populate('createdBy', 'firstName lastName profile.name profile.photo clerkId');

    return NextResponse.json(populatedPost, { status: 201 });
  } catch (error) {
    console.error("[CLUB_POSTS_POST_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
