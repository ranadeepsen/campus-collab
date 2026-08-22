import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/server/lib/db';
import Post from '@/server/models/Post';
import User from '@/server/models/User';
import PollVote from '@/server/models/PollVote';

export async function GET(req, { params }) {
  try {
    const { userId } = await auth();
    const { postId } = await params;

    await connectDB();
    
    let dbUser = null;
    if (userId) {
      dbUser = await User.findOne({ clerkId: userId }).lean();
    }

    const post = await Post.findById(postId).lean();
    if (!post || post.type !== 'poll' || !post.pollData) {
      return NextResponse.json({ error: "Poll not found" }, { status: 404 });
    }

    // Get all votes for this poll
    const allVotes = await PollVote.find({ postId }).lean();
    
    // Total unique users who voted
    const uniqueUsers = new Set(allVotes.map(v => v.user.toString()));
    const totalVotes = uniqueUsers.size;

    // Tally votes per option
    const optionCounts = {};
    post.pollData.options.forEach(o => {
      optionCounts[o._id.toString()] = 0;
    });

    allVotes.forEach(vote => {
      if (optionCounts[vote.optionId.toString()] !== undefined) {
        optionCounts[vote.optionId.toString()]++;
      }
    });

    // Which options did the current user vote for?
    const myVotes = dbUser 
      ? allVotes.filter(v => v.user.toString() === dbUser._id.toString()).map(v => v.optionId.toString())
      : [];

    const results = post.pollData.options.map(option => {
      const count = optionCounts[option._id.toString()];
      // Calculate percentage based on total unique users, not total votes cast (to handle multi-select correctly)
      const percentage = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
      
      return {
        optionId: option._id,
        text: option.text,
        count,
        percentage
      };
    });

    return NextResponse.json({
      totalVotes,
      myVotes,
      results
    });
  } catch (error) {
    console.error("[POLL_RESULTS_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
