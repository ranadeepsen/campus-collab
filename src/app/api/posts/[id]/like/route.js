import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/server/lib/db';
import Post from '@/server/models/Post';
import User from '@/server/models/User';

export async function POST(req, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: postId } = await params;
    
    await connectDB();
    const user = await User.findOne({ clerkId: userId });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    if (!user.profileCompleted || user.status !== 'verified') {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const post = await Post.findById(postId);
    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

    const hasLiked = post.likes.some(id => id.toString() === user._id.toString());
    
    if (hasLiked) {
      post.likes = post.likes.filter(id => id.toString() !== user._id.toString());
    } else {
      post.likes.push(user._id);
    }

    await post.save();
    return NextResponse.json({ likesCount: post.likes.length, hasLiked: !hasLiked });

  } catch (error) {
    console.error("[LIKE_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
