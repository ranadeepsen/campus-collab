import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/server/lib/db';
import Post from '@/server/models/Post';
import User from '@/server/models/User';
import Club from '@/server/models/Club';
import { getAccessState } from '@/server/lib/getAccessState';

export async function GET(req) {
  try {
    await connectDB();
    
    // Optional auth check for personalization
    const { userId } = await auth().catch(() => ({ userId: null }));
    let currentUser = null;
    if (userId) {
      currentUser = await User.findOne({ clerkId: userId }).lean();
    }

    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q');
    const tab = searchParams.get('tab') || 'All';
    const collegeId = searchParams.get('collegeId');
    const type = searchParams.get('type');
    const sortBy = searchParams.get('sortBy') || 'recent';
    const timeRange = searchParams.get('timeRange') || 'all';
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const query = { removed_by_admin: { $ne: true } };

    if (collegeId && collegeId !== 'All') {
      query.college = collegeId;
    }

    if (type && type !== 'All') {
      // Map frontend type labels to DB types
      if (type === 'Photo/Video') query.type = 'photo';
      else if (type === 'Text') query.type = 'text';
      else if (type === 'Event') query.type = 'event';
      else if (type === 'Poll') query.type = 'poll';
    }

    if (timeRange && timeRange !== 'all') {
      const now = new Date();
      if (timeRange === 'today') {
        query.createdAt = { $gte: new Date(now.setHours(0, 0, 0, 0)) };
      } else if (timeRange === 'week') {
        const lastWeek = new Date(now.setDate(now.getDate() - 7));
        query.createdAt = { $gte: lastWeek };
      } else if (timeRange === 'month') {
        const lastMonth = new Date(now.setMonth(now.getMonth() - 1));
        query.createdAt = { $gte: lastMonth };
      }
    }

    
    if (q) {
      const escapeRegex = (text) => text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
      const searchRegex = new RegExp(escapeRegex(q), 'i');
      
      // Find matching users
      const matchingUsers = await User.find({
        $or: [
          { 'profile.name': searchRegex },
          { firstName: searchRegex },
          { lastName: searchRegex }
        ]
      }).select('_id').lean();
      const userIds = matchingUsers.map(u => u._id);

      // Find matching clubs
      const matchingClubs = await Club.find({
        name: searchRegex
      }).select('_id').lean();
      const clubIds = matchingClubs.map(c => c._id);

      // Create search query: author match, club match, or content match
      query.$or = [
        { author: { $in: userIds } },
        { club: { $in: clubIds } },
        { content: searchRegex }
      ];
      
      // If it's an event, maybe title matches too
      query.$or.push({ 'eventDetails.title': searchRegex });
    }

    if (tab === 'Following' && currentUser) {
      // Fetch connections
      const Connection = require('@/server/models/Connection').default;
      const connections = await Connection.find({
        $or: [{ requester: currentUser._id }, { recipient: currentUser._id }],
        status: 'accepted'
      }).select('requester recipient').lean();

      const connectedUserIds = connections.map(conn => 
        conn.requester.toString() === currentUser._id.toString() ? conn.recipient : conn.requester
      );
      
      query.author = { $in: connectedUserIds };
    }

    let posts = [];
    if (sortBy === 'active') {
      // Use aggregation for sorting by likes + comments count
      const pipeline = [
        { $match: query },
        {
          $addFields: {
            activityCount: { $add: [{ $size: { $ifNull: ["$likes", []] } }, { $size: { $ifNull: ["$comments", []] } }] }
          }
        },
        { $sort: { activityCount: -1, createdAt: -1 } },
        { $skip: skip },
        { $limit: limit }
      ];
      
      // We must manually populate when using aggregation
      const aggregatedPosts = await Post.aggregate(pipeline);
      posts = await Post.populate(aggregatedPosts, [
        { path: 'author', select: 'profile.name profile.photo profile.department' },
        { path: 'college', select: 'name' },
        { path: 'comments.author', select: 'profile.name profile.photo' }
      ]);
    } else {
      posts = await Post.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('author', 'profile.name profile.photo profile.department')
        .populate('college', 'name')
        .populate('comments.author', 'profile.name profile.photo')
        .lean();
    }

    // Attach user-specific flags
    const postsWithFlags = posts.map(post => {
      const hasLiked = currentUser ? post.likes?.some(id => id.toString() === currentUser._id.toString()) : false;
      const hasSaved = currentUser ? currentUser.savedPosts?.some(id => id.toString() === post._id.toString()) : false;
      return {
        ...post,
        hasLiked,
        hasSaved
      };
    });

    return NextResponse.json(postsWithFlags);
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

    const { type, content, imageUrl, pollData } = await req.json();

    const postType = type === 'image' ? 'photo' : type;
    if (!['text', 'photo', 'poll', 'event'].includes(postType)) {
      return NextResponse.json({ error: "Invalid post type" }, { status: 400 });
    }

    if (postType === 'photo' && !imageUrl) {
      return NextResponse.json({ error: "Image URL required for photo posts" }, { status: 400 });
    }

    if (postType === 'poll') {
      if (!pollData || !pollData.question || !pollData.options || pollData.options.length < 2) {
        return NextResponse.json({ error: "Invalid poll data. Need a question and at least 2 options." }, { status: 400 });
      }
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

    const postPayload = {
      author: user._id,
      college: userCollege,
      type: postType,
      content: content || '',
      imageUrl: postType === 'photo' ? imageUrl : null
    };

    if (postType === 'poll') {
      postPayload.pollData = pollData;
      postPayload.content = ''; // text content not required for poll
    }

    const post = await Post.create(postPayload);

    const populatedPost = await Post.findById(post._id)
      .populate('author', 'profile.name profile.photo profile.department')
      .populate('college', 'name');

    return NextResponse.json(populatedPost);
  } catch (error) {
    console.error("[POSTS_CREATE_ERROR]", error);
    return NextResponse.json({ error: error.message || "Internal Error" }, { status: 500 });
  }
}
