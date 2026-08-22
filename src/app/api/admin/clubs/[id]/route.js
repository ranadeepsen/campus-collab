import { NextResponse } from 'next/server';
import connectDB from '@/server/lib/db';
import Club from '@/server/models/Club';
import { verifyAdminSession } from '@/server/lib/adminAuth';

export async function PATCH(req, { params }) {
  try {
    const adminSession = await verifyAdminSession();
    if (!adminSession || !adminSession.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: clubId } = await params;
    
    await connectDB();

    const body = await req.json();
    const { action } = body; // 'approve' or 'reject'

    const club = await Club.findById(clubId);
    if (!club) return NextResponse.json({ error: "Club not found" }, { status: 404 });

    const Notification = (await import('@/server/models/Notification')).default;

    if (action === 'approve') {
      club.status = 'approved';
      
      // Notify creator
      await Notification.create({
        recipient: club.createdBy,
        type: 'club_approved',
        message: `Your club "${club.name}" has been approved! It is now live.`,
        link: `/clubs/${club._id}`
      });

    } else if (action === 'reject') {
      club.status = 'rejected';
      
      // Notify creator
      await Notification.create({
        recipient: club.createdBy,
        type: 'club_rejected',
        message: `Your club "${club.name}" registration was not approved.`,
        link: `/clubs`
      });

    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    await club.save();
    return NextResponse.json(club);
  } catch (error) {
    console.error("[ADMIN_CLUBS_PATCH_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
