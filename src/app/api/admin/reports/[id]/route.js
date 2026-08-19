import { NextResponse } from 'next/server';
import connectDB from '@/server/lib/db';
import Report from '@/server/models/Report';
import Post from '@/server/models/Post';
import Club from '@/server/models/Club';
import Event from '@/server/models/Event';
import { verifyAdminSession } from '@/server/lib/adminAuth';

export async function POST(req, { params }) {
  try {
    const adminSession = await verifyAdminSession();
    if (!adminSession || !adminSession.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const { action } = await req.json(); // 'dismiss' | 'remove_content'
    
    await connectDB();
    const report = await Report.findById(id);
    
    if (!report) return NextResponse.json({ error: "Report not found" }, { status: 404 });

    if (action === 'dismiss') {
      report.status = 'dismissed';
      report.reviewed_by = adminSession.adminId;
      report.reviewed_at = new Date();
      await report.save();
      return NextResponse.json({ success: true, status: 'dismissed' });
    }

    if (action === 'remove_content') {
      let Model;
      switch (report.content_type) {
        case 'post': Model = Post; break;
        case 'club': Model = Club; break;
        case 'event': Model = Event; break;
        // Comment would be harder since it's embedded in Post, skipping for MVP unless specified
        default: return NextResponse.json({ error: "Unsupported content type" }, { status: 400 });
      }

      if (Model) {
        await Model.findByIdAndUpdate(report.content_id, { removed_by_admin: true });
      }

      report.status = 'actioned';
      report.reviewed_by = adminSession.adminId;
      report.reviewed_at = new Date();
      await report.save();

      return NextResponse.json({ success: true, status: 'actioned' });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
