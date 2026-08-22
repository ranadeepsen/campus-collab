import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("Please define the MONGODB_URI environment variable inside .env.local");
  process.exit(1);
}

const CollegeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email_domains: [{ type: String }],
  departments: [{ type: String }],
  logo: { type: String, default: null },
  is_active: { type: Boolean, default: true },
  verified: { type: Boolean, default: true }
}, {
  timestamps: true
});

const College = mongoose.models.College || mongoose.model('College', CollegeSchema);

const colleges = [
  {
    name: "Jadavpur University – Faculty of Engineering & Technology",
    departments: ["Chemical Engineering", "Civil Engineering", "Computer Science & Engineering", "Construction Engineering", "Electrical Engineering", "Electronics & Telecommunication Engineering", "Food Technology & Biochemical Engineering", "Information Technology", "Instrumentation & Electronics Engineering", "Mechanical Engineering", "Metallurgical & Material Engineering", "Power Engineering", "Printing Engineering", "Production Engineering"],
    email_domains: ["jadavpuruniversity.in"],
    logo: "https://www.google.com/s2/favicons?domain=jadavpuruniversity.in&sz=256"
  },
  {
    name: "University of Calcutta – Technology Campus",
    departments: ["Chemical Engineering", "Chemical Technology", "Computer Science & Engineering", "Electrical Engineering", "Electronics & Communication Engineering", "Information Technology", "Instrumentation Engineering", "Optics & Optoelectronics", "Polymer Science & Technology", "Jute & Fibre Technology"],
    email_domains: ["caluniv.ac.in"],
    logo: "https://www.google.com/s2/favicons?domain=caluniv.ac.in&sz=256"
  },
  {
    name: "Heritage Institute of Technology",
    departments: ["Applied Electronics & Instrumentation", "Biotechnology", "Chemical Engineering", "Civil Engineering", "Computer Science & Engineering", "CSE-AI & ML", "CSE-Data Science", "CSE-IoT", "Computer Science & Business Systems", "Electrical Engineering", "Electronics & Communication Engineering", "Information Technology", "Mechanical Engineering"],
    email_domains: ["heritageit.edu"],
    logo: "https://www.google.com/s2/favicons?domain=heritageit.edu&sz=256"
  },
  {
    name: "Netaji Subhash Engineering College",
    departments: ["Applied Electronics & Instrumentation", "Biomedical Engineering", "Civil Engineering", "Computer Science & Engineering", "CSE-AI & ML", "Computer Science & Business Systems", "Electrical Engineering", "Electronics & Communication Engineering", "Information Technology", "Mechanical Engineering"],
    email_domains: ["nsec.ac.in"],
    logo: "https://www.google.com/s2/favicons?domain=nsec.ac.in&sz=256"
  },
  {
    name: "Institute of Engineering & Management (IEM)",
    departments: ["Computer Science & Engineering", "CSE-AI/ML", "CSE-AI", "CSE-Data Science", "CSE-IoT", "Computer Science & Technology", "Information Technology", "Electronics & Communication Engineering", "Electrical Engineering", "Electrical & Electronics Engineering", "Mechanical Engineering"],
    email_domains: ["iem.edu.in"],
    logo: "https://www.google.com/s2/favicons?domain=iem.edu.in&sz=256"
  },
  {
    name: "University of Engineering & Management (UEM), Kolkata",
    departments: ["Computer Science & Engineering", "CSE-AI & ML", "CSE-AI", "CSE-Data Science", "CSE-IoT", "Information Technology", "Electronics & Communication Engineering", "Electrical Engineering", "Electrical & Electronics Engineering", "Mechanical Engineering", "Biotechnology"],
    email_domains: ["uem.edu.in"],
    logo: "https://www.google.com/s2/favicons?domain=uem.edu.in&sz=256"
  },
  {
    name: "Techno India University, West Bengal",
    departments: ["Computer Science & Engineering", "CSE-AI", "CSE-Data Science", "Electronics & Communication Engineering", "Electrical Engineering", "Information Technology", "Civil Engineering", "Mechanical Engineering", "Chemical Engineering"],
    email_domains: ["technoindiauniversity.ac.in"],
    logo: "https://www.google.com/s2/favicons?domain=technoindiauniversity.ac.in&sz=256"
  },
  {
    name: "Techno Main Salt Lake",
    departments: ["Computer Science & Engineering", "CSE-AI", "CSE-Data Science", "Electronics & Communication Engineering", "Information Technology", "Electrical Engineering", "Civil Engineering", "Mechanical Engineering", "Electronics & Instrumentation Engineering", "Agricultural Engineering", "Food Technology"],
    email_domains: ["ticollege.ac.in"],
    logo: "https://www.google.com/s2/favicons?domain=ticollege.ac.in&sz=256"
  },
  {
    name: "Techno International New Town (TINT)",
    departments: ["Computer Science & Engineering", "CSE-AI & ML", "CSE-Data Science", "CSE-IoT", "Electronics & Communication Engineering", "Electrical Engineering", "Mechanical Engineering", "Civil Engineering", "Information Technology"],
    email_domains: ["tint.edu.in"],
    logo: "https://www.google.com/s2/favicons?domain=tint.edu.in&sz=256"
  },
  {
    name: "St. Thomas' College of Engineering & Technology",
    departments: ["Computer Science & Engineering", "Information Technology", "Electronics & Communication Engineering", "Electrical Engineering", "Mechanical Engineering", "Civil Engineering"],
    email_domains: ["stcet.org"],
    logo: "https://www.google.com/s2/favicons?domain=stcet.org&sz=256"
  },
  {
    name: "RCC Institute of Information Technology (RCCIIT)",
    departments: ["Computer Science & Engineering", "CSE-AI & ML", "Information Technology", "Electronics & Communication Engineering", "Electrical Engineering", "Applied Electronics & Instrumentation"],
    email_domains: ["rcciit.org"],
    logo: "https://www.google.com/s2/favicons?domain=rcciit.org&sz=256"
  },
  {
    name: "B. P. Poddar Institute of Management & Technology",
    departments: ["Computer Science & Engineering", "CSE-AI & ML", "Electronics & Communication Engineering", "Electrical Engineering", "Information Technology"],
    email_domains: ["bppimt.ac.in"],
    logo: "https://www.google.com/s2/favicons?domain=bppimt.ac.in&sz=256"
  },
  {
    name: "Meghnad Saha Institute of Technology",
    departments: ["Computer Science & Engineering", "CSE-AI & ML", "CSE-Data Science", "Information Technology", "Electronics & Communication Engineering", "Electrical Engineering", "Mechanical Engineering", "Civil Engineering"],
    email_domains: ["msit.edu.in"],
    logo: "https://www.google.com/s2/favicons?domain=msit.edu.in&sz=256"
  },
  {
    name: "Bengal Institute of Technology",
    departments: ["Computer Science & Engineering", "CSE-AI & ML", "Electronics & Communication Engineering", "Biotechnology", "Information Technology"],
    email_domains: ["bitcollege.in"],
    logo: "https://www.google.com/s2/favicons?domain=bitcollege.in&sz=256"
  },
  {
    name: "Guru Nanak Institute of Technology (GNIT)",
    departments: ["Computer Science & Engineering", "Electronics & Communication Engineering", "Electrical Engineering", "Information Technology", "Electronics & Computer Science Engineering", "Food Technology"],
    email_domains: ["gnit.ac.in"],
    logo: "https://www.google.com/s2/favicons?domain=gnit.ac.in&sz=256"
  },
  {
    name: "Future Institute of Technology",
    departments: ["Computer Science & Engineering", "CSE-AI & ML", "CSE-IoT & Cyber Security", "Electronics & Communication Engineering", "Electrical Engineering", "Civil Engineering"],
    email_domains: ["teamfuture.in"],
    logo: "https://www.google.com/s2/favicons?domain=teamfuture.in&sz=256"
  },
  {
    name: "Calcutta Institute of Engineering & Management (CIEM)",
    departments: ["Computer Science & Engineering", "CSE-AI & ML", "Electronics & Communication Engineering", "Electrical Engineering", "Mechanical Engineering", "Civil Engineering", "Information Technology"],
    email_domains: [],
    logo: "https://www.google.com/s2/favicons?domain=ciem.ac.in&sz=256"
  },
  {
    name: "Narula Institute of Technology",
    departments: ["Computer Science & Engineering", "CSE-AI & ML", "CSE-Data Science", "Information Technology", "Electronics & Communication Engineering", "Electrical Engineering", "Mechanical Engineering", "Civil Engineering", "Applied Electronics & Instrumentation"],
    email_domains: ["nit.ac.in"],
    logo: "https://www.google.com/s2/favicons?domain=nit.ac.in&sz=256"
  },
  {
    name: "Techno International College of Technology (TICT)",
    departments: ["Computer Science & Engineering", "CSE-AI & ML", "Electronics & Communication Engineering", "Electrical Engineering", "Mechanical Engineering", "Civil Engineering", "Information Technology"],
    email_domains: [],
    logo: "https://www.google.com/s2/favicons?domain=tict.edu.in&sz=256"
  },
  {
    name: "Sister Nivedita University",
    departments: ["Computer Science & Engineering", "CSE-AI & ML", "CSE-Data Science", "CSE-Cyber Security", "Information Technology", "Electronics & Communication Engineering", "Electrical Engineering", "Mechanical Engineering", "Civil Engineering", "Biotechnology"],
    email_domains: ["snuniv.ac.in"],
    logo: "https://www.google.com/s2/favicons?domain=snuniv.ac.in&sz=256"
  }
];

async function seedColleges() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB.");

    try {
      await College.collection.dropIndex("domain_1");
      console.log("Dropped old domain_1 index");
    } catch(e) {
      // Ignore if index doesn't exist
    }

    console.log("Seeding colleges...");
    for (const data of colleges) {
      // Find existing by name
      const existing = await College.findOne({ name: data.name });
      if (existing) {
        console.log(`Updating existing college: ${data.name}`);
        await College.updateOne({ _id: existing._id }, { $set: data });
      } else {
        console.log(`Inserting new college: ${data.name}`);
        await College.create(data);
      }
    }

    console.log("Seeding complete!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding colleges:", error);
    process.exit(1);
  }
}

seedColleges();
