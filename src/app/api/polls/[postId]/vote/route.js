import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/server/lib/db';
import Post from '@/server/models/Post';
import User from '@/server/models/User';
import PollVote from '@/server/models/PollVote';

export async function POST(req, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { postId } = await params;
    const body = await req.json();
    const { optionIds } = body; // Array of selected option IDs

    if (!Array.isArray(optionIds) || optionIds.length === 0) {
      return NextResponse.json({ error: "No options selected" }, { status: 400 });
    }

    await connectDB();
    const user = await User.findOne({ clerkId: userId });
    
    if (!user || user.user_type !== 'current' || user.status !== 'verified') {
      return NextResponse.json({ error: "Only verified current students can vote" }, { status: 403 });
    }

    const post = await Post.findById(postId);
    if (!post || post.type !== 'poll') {
      return NextResponse.json({ error: "Poll not found" }, { status: 404 });
    }

    const pollData = post.pollData;
    if (!pollData) {
      return NextResponse.json({ error: "Invalid poll structure" }, { status: 500 });
    }

    // Check expiry
    if (pollData.expiresAt && new Date(pollData.expiresAt) < new Date()) {
      return NextResponse.json({ error: "Poll has closed" }, { status: 400 });
    }

    // Single vs Multi check
    if (!pollData.allowMultipleSelection && optionIds.length > 1) {
      return NextResponse.json({ error: "Multiple selection not allowed" }, { status: 400 });
    }

    // Check if valid options
    const validOptionIds = pollData.options.map(o => o._id.toString());
    const allValid = optionIds.every(id => validOptionIds.includes(id));
    if (!allValid) {
      return NextResponse.json({ error: "Invalid option selected" }, { status: 400 });
    }

    // Check existing votes
    const existingVotes = await PollVote.find({ postId, user: user._id });
    
    if (existingVotes.length > 0) {
      return NextResponse.json({ error: "You have already voted" }, { status: 400 });
    }

    // Save votes
    const voteDocs = optionIds.map(oId => ({
      postId: post._id,
      optionId: oId,
      user: user._id
    }));

    await PollVote.insertMany(voteDocs);

    return NextResponse.json({ success: true }, { status: 201 });

  } catch (error) {
    console.error("[POLL_VOTE_ERROR]", error);
    if (error.code === 11000) {
      return NextResponse.json({ error: "You have already voted" }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
