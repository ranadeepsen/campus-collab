import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Admin from '../src/server/models/Admin.js';

dotenv.config({ path: '.env.local' });

async function setup() {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    console.error("Missing MONGODB_URI");
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB");

  const email = process.argv[2];
  if (!email) {
    console.error("Please provide an email: node scripts/setupAdmin.js admin@example.com");
    process.exit(1);
  }

  const existing = await Admin.findOne({ email });
  if (existing) {
    console.log("Admin already exists:", existing);
  } else {
    const admin = await Admin.create({
      email,
      role: 'super-admin'
    });
    console.log("Super-admin created:", admin);
  }

  process.exit(0);
}

setup();
