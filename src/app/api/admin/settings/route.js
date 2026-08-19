import { NextResponse } from 'next/server';
import connectDB from '@/server/lib/db';
import Admin from '@/server/models/Admin';
import { verifyAdminSession } from '@/server/lib/adminAuth';

export async function GET() {
  try {
    const adminSession = await verifyAdminSession();
    if (!adminSession || !adminSession.isAdmin || adminSession.role !== 'super-admin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const admins = await Admin.find().sort({ createdAt: -1 }).lean();

    return NextResponse.json(admins);
  } catch (error) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const adminSession = await verifyAdminSession();
    if (!adminSession || !adminSession.isAdmin || adminSession.role !== 'super-admin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { email, role } = await req.json();
    
    await connectDB();
    
    const existing = await Admin.findOne({ email });
    if (existing) {
      return NextResponse.json({ error: "Admin with this email already exists." }, { status: 400 });
    }

    const newAdmin = await Admin.create({
      email,
      role,
      added_by: adminSession.adminId
    });

    return NextResponse.json(newAdmin);
  } catch (error) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const adminSession = await verifyAdminSession();
    if (!adminSession || !adminSession.isAdmin || adminSession.role !== 'super-admin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (id === adminSession.adminId?.toString()) {
      return NextResponse.json({ error: "Cannot remove yourself." }, { status: 400 });
    }

    await connectDB();
    await Admin.findByIdAndDelete(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
