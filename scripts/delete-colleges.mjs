import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({path:'.env.local'});
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const College = mongoose.models.College || mongoose.model('College', new mongoose.Schema({ name: String }));
  const res = await College.deleteMany({ name: { $in: ['Harvard University', 'Massachusetts Institute of Technology (MIT)', 'Stanford University'] } });
  console.log('Deleted:', res.deletedCount);
  process.exit(0);
});
