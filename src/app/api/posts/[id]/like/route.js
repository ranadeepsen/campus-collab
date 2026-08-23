import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/server/lib/db';
import Post from '@/server/models/Post';
import User from '@/server/models/User';
import Notification from '@/server/models/Notification';

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
      // Optionally remove notification here
      await Notification.deleteOne({ 
        recipient: post.author, 
        relatedUser: user._id, 
        type: 'like',
        link: `/post/${post._id}` 
      });
    } else {
      post.likes.push(user._id);
      
      // Notify author if it's not their own post
      if (post.author.toString() !== user._id.toString()) {
        await Notification.create({
          recipient: post.author,
          type: 'like',
          message: `${user.profile?.name || 'Someone'} liked your post.`,
          link: `/post/${post._id}`,
          relatedUser: user._id
        });
      }
    }

    await post.save();
    return NextResponse.json({ likesCount: post.likes.length, hasLiked: !hasLiked });

  } catch (error) {
    console.error("[LIKE_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
