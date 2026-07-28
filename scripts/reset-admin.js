import { connectDB } from '../config/db.js';
import Admin from '../models/Admin.js';
import dotenv from 'dotenv';

dotenv.config();

const resetAdmin = async () => {
  try {
    await connectDB();
    
    // Wipe all corrupted/existing admin accounts bypassing hooks
    await Admin.destroy({ where: {}, force: true, individualHooks: false });
    
    // Inject fresh super_admin account
    const superAdmin = await Admin.create({
      name: 'Super Admin',
      email: 'adminavnicarscollections@gmail.com',
      password: 'avniauto1234',
      role: 'super_admin'
    });
    
    console.log('\n=============================================');
    console.log('✅ Super Admin account created successfully.');
    console.log('Email: adminavnicarscollections@gmail.com');
    console.log('Password: avniauto1234');
    console.log('=============================================');
    console.log('\n⚠️ IMPORTANT: Remember to revert your Render Start Command');
    console.log('back to "node server.js" to run your application.');
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to reset admin:', err);
    process.exit(1);
  }
};

resetAdmin();
