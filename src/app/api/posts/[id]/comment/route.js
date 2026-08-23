import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/server/lib/db';
import Post from '@/server/models/Post';
import User from '@/server/models/User';
import Notification from '@/server/models/Notification';
import { getAccessState } from '@/server/lib/getAccessState';

export async function POST(req, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: postId } = await params;
    const { content } = await req.json();

    if (!content || content.length > 500) {
      return NextResponse.json({ error: "Invalid comment" }, { status: 400 });
    }

    await connectDB();
    const user = await User.findOne({ clerkId: userId });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const access = getAccessState(user);
    if (!access.canPost) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const post = await Post.findById(postId);
    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

    const comment = {
      author: user._id,
      content,
      createdAt: new Date()
    };

    post.comments.push(comment);
    await post.save();
    
    // Notify author if it's not their own post
    if (post.author.toString() !== user._id.toString()) {
      await Notification.create({
        recipient: post.author,
        type: 'comment',
        message: `${user.profile?.name || 'Someone'} commented on your post: "${content.substring(0, 30)}${content.length > 30 ? '...' : ''}"`,
        link: `/post/${post._id}`,
        relatedUser: user._id
      });
    }

    // Repopulate author for response
    await post.populate('comments.author', 'profile.name profile.photo');
    const newComment = post.comments[post.comments.length - 1];

    return NextResponse.json(newComment);

  } catch (error) {
    console.error("[COMMENT_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
