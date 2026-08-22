import { NextResponse } from 'next/server';
import { verifyAdminSession } from '@/server/lib/adminAuth';
import connectDB from '@/server/lib/db';
import AmbassadorApplication from '@/server/models/AmbassadorApplication';
import User from '@/server/models/User';
import Notification from '@/server/models/Notification';

export async function PATCH(req, { params }) {
  try {
    const adminSession = await verifyAdminSession();
    if (!adminSession || !adminSession.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { action } = body;

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    await connectDB();
    const application = await AmbassadorApplication.findById(id);
    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const user = await User.findById(application.user);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (action === 'approve') {
      application.status = 'approved';
      user.ambassadorStatus = 'active';
      user.isAmbassador = true; // Syncing old flag just in case
      await user.save();
      
      await Notification.create({
        recipient: user._id,
        type: 'system',
        message: 'Congratulations! Your Campus Ambassador application has been approved. You are now officially an Ambassador!',
        link: '/profile'
      });
      
    } else if (action === 'reject') {
      application.status = 'rejected';
      application.rejectedAt = new Date();
      // 30 days cooldown
      application.cooldownUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      
      await Notification.create({
        recipient: user._id,
        type: 'system',
        message: 'Your Campus Ambassador application was not accepted at this time. You can reapply after 30 days.',
        link: '/ambassador/apply'
      });
    }

    await application.save();

    return NextResponse.json({ success: true, application });
  } catch (error) {
    console.error("[ADMIN_AMBASSADOR_PATCH_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
