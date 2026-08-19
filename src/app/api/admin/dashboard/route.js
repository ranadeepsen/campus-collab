import { NextResponse } from 'next/server';
import connectDB from '@/server/lib/db';
import User from '@/server/models/User';
import Post from '@/server/models/Post';
import AmbassadorProfile from '@/server/models/AmbassadorProfile';
import { verifyAdminSession } from '@/server/lib/adminAuth';

export async function GET() {
  try {
    const adminSession = await verifyAdminSession();
    if (!adminSession || !adminSession.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();

    // 1. User counts
    const totalUsers = await User.countDocuments();
    const verifiedUsers = await User.countDocuments({ status: 'verified' });
    const pendingUsers = await User.countDocuments({ status: 'pending_review' });
    const suspendedUsers = await User.countDocuments({ $or: [{ status: 'suspended' }, { isBanned: true }] });
    const currentStudents = await User.countDocuments({ user_type: 'current' });
    const prospectiveStudents = await User.countDocuments({ user_type: 'prospective' });

    // 2. Ambassador count
    const ambassadors = await AmbassadorProfile.countDocuments();

    // 3. Top 10 colleges
    const topCollegesRaw = await User.aggregate([
      { $match: { 'profile.college': { $ne: null } } },
      { $group: { _id: '$profile.college', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $lookup: { from: 'colleges', localField: '_id', foreignField: '_id', as: 'collegeInfo' } },
      { $unwind: '$collegeInfo' },
      { $project: { _id: 1, name: '$collegeInfo.name', count: 1 } }
    ]);

    // 4. Posts per day (Last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const postsPerDay = await Post.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo }, removed_by_admin: false } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    return NextResponse.json({
      users: {
        total: totalUsers,
        verified: verifiedUsers,
        pending: pendingUsers,
        suspended: suspendedUsers,
        current: currentStudents,
        prospective: prospectiveStudents
      },
      ambassadors,
      topColleges: topCollegesRaw,
      postsPerDay
    });
  } catch (error) {
    console.error("[DASHBOARD_API_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
