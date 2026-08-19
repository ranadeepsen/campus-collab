import mongoose from 'mongoose';
import dotenv from 'dotenv';
import College from '../src/server/models/College.js';
import User from '../src/server/models/User.js';

dotenv.config({ path: '.env.local' });

async function setupAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    // 1. Find or create Jadavpur University
    let college = await College.findOne({ name: 'Jadavpur University' });
    if (!college) {
      college = await College.create({
        name: 'Jadavpur University',
        domain: 'jadavpuruniversity.in',
        departments: ['Power Engineering', 'Computer Science', 'Mechanical']
      });
      console.log('Created College: Jadavpur University');
    }

    // 2. We need to find the user in Clerk first to get their exact clerkId
    // Since we don't have the clerkClient readily available in this plain node script without Next.js context easily, 
    // we'll use a direct fetch to Clerk API.
    const clerkRes = await fetch('https://api.clerk.com/v1/users?email_address=ranadeepsen2004@gmail.com', {
      headers: {
        'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`
      }
    });
    
    if (!clerkRes.ok) throw new Error('Failed to fetch from Clerk API');
    const clerkUsers = await clerkRes.json();
    
    if (clerkUsers.length === 0) {
      throw new Error('User not found in Clerk. Please sign up on the frontend first with ranadeepsen2004@gmail.com');
    }
    
    const clerkId = clerkUsers[0].id;
    const photoUrl = clerkUsers[0].image_url; // We can use the default Clerk profile photo!

    // 3. Upsert User in MongoDB
    let user = await User.findOne({ clerkId });
    if (!user) {
      user = new User({ clerkId, email: 'ranadeepsen2004@gmail.com' });
    }

    user.user_type = 'current';
    user.status = 'verified';
    user.profileCompleted = true;
    user.isAmbassador = true; // Make you an ambassador too!
    
    user.profile = {
      name: 'Ranadeep Sen',
      photo: photoUrl, // Using the photo from your Google/Clerk account!
      college: college._id,
      department: 'Power Engineering',
      yearOfStudy: '4th year',
      bio: 'love to do development, Cricketer',
      interests: ['Development', 'Cricket', 'Engineering']
    };

    await user.save();
    console.log('Successfully setup user: Ranadeep Sen (Admin)');
    
    process.exit(0);
  } catch (e) {
    console.error('Setup failed:', e.message);
    process.exit(1);
  }
}

setupAdmin();
