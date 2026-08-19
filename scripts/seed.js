import mongoose from 'mongoose';
import dotenv from 'dotenv';
import College from '../src/server/models/College.js';
import User from '../src/server/models/User.js';
import Post from '../src/server/models/Post.js';
import Club from '../src/server/models/Club.js';
import Event from '../src/server/models/Event.js';
import AmbassadorProfile from '../src/server/models/AmbassadorProfile.js';

dotenv.config({ path: '.env.local' });

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    // =========================================================================
    // HOW TO REMOVE DEMO DATA
    // =========================================================================
    // When you are ready to remove this demo data in the future, simply run:
    // node scripts/seed.js --clear
    // This will delete all records from the database and exit.
    // =========================================================================

    if (process.argv.includes('--clear')) {
      await College.deleteMany({});
      await User.deleteMany({});
      await Post.deleteMany({});
      await Club.deleteMany({});
      await Event.deleteMany({});
      await AmbassadorProfile.deleteMany({});
      console.log('All demo data cleared successfully!');
      process.exit(0);
    }

    // Clear DB before seeding
    await College.deleteMany({});
    await User.deleteMany({});
    await Post.deleteMany({});
    await Club.deleteMany({});
    await Event.deleteMany({});
    await AmbassadorProfile.deleteMany({});

    // 1. Colleges
    const jadavpur = await College.create({ name: 'Jadavpur University', domain: 'jadavpur.edu.in', departments: ['Engineering', 'Science', 'Arts', 'Humanities', 'Commerce'] });
    const caluniv = await College.create({ name: 'University of Calcutta', domain: 'caluniv.ac.in', departments: ['Arts', 'Science', 'Commerce', 'Law', 'Education'] });
    const presidency = await College.create({ name: 'Presidency University', domain: 'presidency.edu.in', departments: ['Arts', 'Science', 'Engineering', 'Commerce'] });
    const stx = await College.create({ name: 'St. Xavier\'s College', domain: 'stxavier.edu.in', departments: ['Arts', 'Science', 'Commerce', 'Computer Applications'] });
    const iimc = await College.create({ name: 'IIM Calcutta', domain: 'iimcal.ac.in', departments: ['Management', 'Business Analytics', 'Finance'] });
    const isi = await College.create({ name: 'Indian Statistical Institute', domain: 'isi.ac.in', departments: ['Statistics', 'Mathematics', 'Computer Science', 'Economics'] });
    const ladybr = await College.create({ name: 'Lady Brabourne College', domain: 'lbcollege.org', departments: ['Arts', 'Science', 'Commerce', 'Education'] });
    const bethune = await College.create({ name: 'Bethune College', domain: 'bethunecollege.in', departments: ['Arts', 'Science', 'Commerce'] });
    const nsut = await College.create({ name: 'Netaji Subhas University of Technology', domain: 'nsut.ac.in', departments: ['Engineering', 'Computer Science', 'Electronics'] });
    const cse = await College.create({ name: 'Calcutta School of Engineering', domain: 'cse.ac.in', departments: ['Civil', 'Mechanical', 'Electrical', 'Computer'] });
    const techno = await College.create({ name: 'Techno Main Salt Lake', domain: 'techno.edu.in', departments: ['Computer Science', 'Electrical', 'Mechanical', 'Civil'] });

    // 2. Users (Mock Clerk IDs for Demo Data)
    const users = await User.insertMany([
      { clerkId: 'mock_ranadeep', email: 'ranadeep@jadavpur.edu.in', user_type: 'current', status: 'verified', profileCompleted: true, 
        profile: { name: 'Ranadeep Sen', college: jadavpur._id, department: 'Power Engineering', yearOfStudy: 'Junior', photo: 'https://i.pravatar.cc/150?u=ranadeep' } },
      { clerkId: 'mock_aarohi', email: 'aarohi@jadavpur.edu.in', user_type: 'current', status: 'verified', profileCompleted: true, 
        profile: { name: 'Aarohi Singh', college: jadavpur._id, department: 'Science', yearOfStudy: 'Sophomore', photo: 'https://i.pravatar.cc/150?u=aarohi' } },
      { clerkId: 'mock_rohan', email: 'rohan@techno.edu.in', user_type: 'current', status: 'verified', profileCompleted: true, 
        profile: { name: 'Rohan Mehta', college: techno._id, department: 'Computer Science', yearOfStudy: 'Junior', photo: 'https://i.pravatar.cc/150?u=rohan' } },
    ]);

    // 3. Ambassadors
    await AmbassadorProfile.create({
      user: users[0]._id, // Ranadeep
      college: jadavpur._id,
      department: 'Power Engineering',
      responseRate: 100,
      rating: 5.0,
      totalPoints: 320,
      badges: ['Top Contributor']
    });

    // 4. Clubs
    const roboticsClub = await Club.create({
      name: 'Robotics Club',
      college: techno._id,
      department: 'Computer Science',
      description: 'Building the future of robotics.',
      trending: true,
      memberIds: [users[2]._id] // Rohan
    });

    const photoClub = await Club.create({
      name: 'Photography Club',
      college: jadavpur._id,
      department: 'Arts',
      description: 'Capturing moments across campus.',
      trending: true,
      memberIds: [users[1]._id] // Aarohi
    });

    const musicSociety = await Club.create({
      name: 'Music Society',
      college: jadavpur._id,
      department: 'Arts',
      description: 'The official music society.',
      trending: true,
      memberIds: [users[0]._id, users[1]._id]
    });

    // 5. Events
    await Event.create({
      title: 'TechNova 2K25',
      college: jadavpur._id,
      description: 'The biggest tech fest of the year.',
      dateTime: new Date(Date.now() + 86400000 * 10), // 10 days from now
      clubId: roboticsClub._id,
      rsvpIds: [users[0]._id, users[1]._id, users[2]._id],
      visibility: 'public'
    });

    await Event.create({
      title: 'Cultural Night',
      college: jadavpur._id,
      description: 'A night of music and dance.',
      dateTime: new Date(Date.now() + 86400000 * 17), // 17 days from now
      clubId: musicSociety._id,
      rsvpIds: [users[0]._id, users[1]._id],
      visibility: 'public'
    });

    await Event.create({
      title: 'Code Clash',
      college: techno._id,
      description: 'Competitive programming contest.',
      dateTime: new Date(Date.now() + 86400000 * 24), // 24 days from now
      rsvpIds: [users[2]._id],
      visibility: 'public'
    });

    // 6. Posts
    await Post.create({
      author: users[1]._id, // Aarohi
      college: jadavpur._id,
      type: 'photo',
      content: 'The annual tech fest was amazing! Great sessions, even better people. ✨ Grateful to be part of such a vibrant community. #CollegeLife',
      imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      likes: [users[0]._id, users[2]._id],
      comments: [
        { author: users[0]._id, content: 'It was incredible!' }
      ]
    });

    await Post.create({
      author: users[2]._id, // Rohan
      college: techno._id,
      type: 'text',
      content: 'Built something cool this weekend! A college event discovery platform 🚀 Looking for feedback from the community.',
      likes: [users[0]._id, users[1]._id]
    });

    console.log('Database Seeded Successfully!');
    process.exit(0);
  } catch (e) {
    console.error('Seeding failed:', e);
    process.exit(1);
  }
}

seed();
