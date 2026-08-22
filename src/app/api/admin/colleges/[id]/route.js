import { NextResponse } from 'next/server';
import connectDB from '@/server/lib/db';
import College from '@/server/models/College';
import { verifyAdminSession } from '@/server/lib/adminAuth';

export async function PUT(req, { params }) {
  try {
    const adminSession = await verifyAdminSession();
    if (!adminSession || !adminSession.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const updates = await req.json();
    
    await connectDB();
    const updated = await College.findByIdAndUpdate(id, updates, { new: true });
    
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const adminSession = await verifyAdminSession();
    if (!adminSession || !adminSession.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    
    await connectDB();
    const deleted = await College.findByIdAndDelete(id);
    
    if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
