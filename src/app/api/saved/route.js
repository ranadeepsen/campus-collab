import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/server/lib/db';
import Post from '@/server/models/Post';
import User from '@/server/models/User';

export async function GET(req) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const user = await User.findOne({ clerkId: userId }).lean();
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Ensure we have an array
    const savedPostIds = user.savedPosts || [];

    if (savedPostIds.length === 0) {
      return NextResponse.json([]);
    }

    // Fetch the actual posts
    const savedPosts = await Post.find({
      _id: { $in: savedPostIds },
      removed_by_admin: { $ne: true }
    })
      .sort({ createdAt: -1 })
      .populate('author', 'profile.name profile.photo profile.department')
      .populate('college', 'name')
      .populate('comments.author', 'profile.name profile.photo')
      .lean();

    // Map flags so PostCard component displays them correctly
    const postsWithFlags = savedPosts.map(post => ({
      ...post,
      hasLiked: post.likes?.some(id => id.toString() === user._id.toString()),
      hasSaved: true // By definition, it's saved!
    }));

    return NextResponse.json(postsWithFlags);
  } catch (error) {
    console.error("[SAVED_POSTS_GET_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
