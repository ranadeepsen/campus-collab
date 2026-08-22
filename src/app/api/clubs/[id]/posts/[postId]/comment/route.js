import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/server/lib/db';
import User from '@/server/models/User';
import ClubMembership from '@/server/models/ClubMembership';
import ClubPost from '@/server/models/ClubPost';

export async function POST(req, { params }) {
  try {
    const { userId: myClerkId } = await auth();
    if (!myClerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: clubId, postId } = await params;
    
    await connectDB();
    const myUser = await User.findOne({ clerkId: myClerkId });
    
    // Check if I'm a member of this club
    const myMembership = await ClubMembership.findOne({ club: clubId, user: myUser._id, role: { $in: ['admin', 'member'] } });
    if (!myMembership) return NextResponse.json({ error: "Forbidden: Members only can comment" }, { status: 403 });

    const body = await req.json();
    const { content } = body;

    if (!content) return NextResponse.json({ error: "Missing content" }, { status: 400 });

    const post = await ClubPost.findById(postId);
    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

    post.comments.push({
      user: myUser._id,
      content
    });

    await post.save();

    const populatedPost = await ClubPost.findById(postId)
      .populate('createdBy', 'firstName lastName profile.name profile.photo clerkId')
      .populate('comments.user', 'firstName lastName profile.name profile.photo');

    return NextResponse.json(populatedPost, { status: 201 });
  } catch (error) {
    console.error("[CLUB_POST_COMMENT_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
