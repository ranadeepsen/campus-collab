import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/server/lib/db';
import Post from '@/server/models/Post';
import User from '@/server/models/User';
import { getAccessState } from '@/server/lib/getAccessState';

export async function GET(req) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const collegeId = searchParams.get('collegeId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const query = collegeId ? { college: collegeId, removed_by_admin: { $ne: true } } : { removed_by_admin: { $ne: true } };

    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'profile.name profile.photo profile.department')
      .populate('college', 'name')
      .populate('comments.author', 'profile.name profile.photo');

    return NextResponse.json(posts);
  } catch (error) {
    console.error("[POSTS_GET_ERROR]", error);
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
    if (!access.canPost) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { type, content, imageUrl } = await req.json();

    const postType = type === 'image' ? 'photo' : type;
    if (!['text', 'photo'].includes(postType)) {
      return NextResponse.json({ error: "Invalid post type" }, { status: 400 });
    }

    if (postType === 'photo' && !imageUrl) {
      return NextResponse.json({ error: "Image URL required for photo posts" }, { status: 400 });
    }

    // Ultimate Safety Net: If user bypassed onboarding/approval and has no college, assign first active college
    let userCollege = user.profile.college;
    if (!userCollege) {
      const mongoose = require('mongoose');
      const College = mongoose.models.College || mongoose.model('College');
      const fallbackCollege = await College.findOne({ is_active: true });
      if (fallbackCollege) {
        userCollege = fallbackCollege._id;
        user.profile.college = fallbackCollege._id;
        await user.save();
      } else {
        return NextResponse.json({ error: "No active colleges available" }, { status: 400 });
      }
    }

    const post = await Post.create({
      author: user._id,
      college: userCollege,
      type: postType,
      content: content || '',
      imageUrl: postType === 'photo' ? imageUrl : null
    });

    const populatedPost = await Post.findById(post._id)
      .populate('author', 'profile.name profile.photo profile.department')
      .populate('college', 'name');

    return NextResponse.json(populatedPost);
  } catch (error) {
    console.error("[POSTS_CREATE_ERROR]", error);
    return NextResponse.json({ error: error.message || "Internal Error" }, { status: 500 });
  }
}
