import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { sequelize } from './config/db.js';
import HappyClient from './models/HappyClient.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourceDir = path.join(__dirname, '..', 'happy-clients-images');
const destDir = path.join(__dirname, 'uploads');

async function run() {
  try {
    await sequelize.authenticate();
    console.log('✓ Connected to MySQL DB');

    // Create destDir if not exists
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    // Read all files from sourceDir
    if (!fs.existsSync(sourceDir)) {
      console.error('Source directory does not exist:', sourceDir);
      process.exit(1);
    }

    const files = fs.readdirSync(sourceDir).filter(f => f.endsWith('.jpeg') || f.endsWith('.jpg') || f.endsWith('.png'));
    console.log(`Found ${files.length} images to process`);

    const staticClientsInfo = [
      { file: 'man1.png', caption: 'Vikram Mehta - Mercedes C-Class' },
      { file: 'woman1.png', caption: 'Priya Sharma - Hyundai Creta' },
      { file: 'couple.png', caption: 'Rajesh & Family - Honda City' },
      { file: 'woman2.png', caption: 'Anisha Kapoor - BMW 3 Series' },
      { file: 'man2.png', caption: 'Amit Saxena - Toyota Fortuner' },
      { file: 'woman1.png', caption: 'Sanjana Goel - Audi A4' },
      { file: 'man1.png', caption: 'Devendra Singh - Thar 4x4' },
      { file: 'woman2.png', caption: 'Neha Verma - Kia Seltos' },
      { file: 'man2.png', caption: 'Rohit Bal - Porsche Macan' },
      { file: 'woman1.png', caption: 'Dr. Shalini Rai - MG Hector' },
      { file: 'man1.png', caption: 'Gaurav Sen - Maruti Brezza' },
      { file: 'man2.png', caption: 'Arun Bhatia - Audi A6' },
      { file: 'woman2.png', caption: 'Meera Deshmukh - Nexon EV' },
      { file: 'man1.png', caption: 'Kabir Thapar - Skoda Slavia' },
      { file: 'couple.png', caption: 'Rohan & Riya - VW Virtus' },
      { file: 'man2.png', caption: 'Siddharth Roy - BMW X3' },
      { file: 'woman1.png', caption: 'Kavita Sen - Jeep Compass' },
      { file: 'man1.png', caption: 'Vijay Sharma - Scorpio-N' },
      { file: 'woman2.png', caption: 'Aditi Joshi - Land Rover Evoque' },
      { file: 'family.png', caption: 'Deepak Chawla - Honda Amaze' },
      { file: 'man2.png', caption: 'Manoj Verma - Innova Crysta' },
      { file: 'woman1.png', caption: 'Punam Pandey - Thar Diesel' },
      { file: 'man1.png', caption: 'Abhay Goel - Tata Altroz' },
      { file: 'family.png', caption: 'Tushar & Friends - Maruti Swift' },
      { file: 'man2.png', caption: 'Karan Joshi - Mercedes E-Class' },
      { file: 'woman2.png', caption: 'Aishwarya Sen - BMW 5 Series' },
      { file: 'man1.png', caption: 'Raj Kumar - Fortuner Legender' },
      { file: 'woman1.png', caption: 'Kajal Kapoor - Lexus RX' },
      { file: 'woman2.png', caption: 'Ridhima Kapoor - Creta IVT' },
      { file: 'man2.png', caption: 'Sanjay Gupta - Mahindra Thar LX' }
    ];

    // Clean existing database records
    await HappyClient.destroy({ where: {}, truncate: true });
    console.log('✓ Cleared HappyClient table');

    // Process files
    const dbRecords = [];
    for (let i = 0; i < staticClientsInfo.length; i++) {
      const { file: fileName, caption } = staticClientsInfo[i];
      const sourcePath = path.join(sourceDir, fileName);
      
      if (!fs.existsSync(sourcePath)) {
        console.warn(`Warning: image file ${fileName} not found in sourceDir.`);
        continue;
      }

      const safeFileName = `happy_client_${i}_${Date.now()}${path.extname(fileName)}`;
      const destPath = path.join(destDir, safeFileName);
      
      // Copy file to uploads folder
      fs.copyFileSync(sourcePath, destPath);
      
      // Create db record
      dbRecords.push({
        image_url: `/uploads/${safeFileName}`,
        caption: caption,
        orderIndex: i
      });
    }

    await HappyClient.bulkCreate(dbRecords);
    console.log(`✓ Successfully seeded ${dbRecords.length} happy clients into database`);
    process.exit(0);
  } catch (error) {
    console.error('Seeding happy clients failed:', error);
    process.exit(1);
  }
}

run();
