import dotenv from 'dotenv';
dotenv.config();

import { sequelize } from '../config/db.js';
import Car from '../models/Car.js';
import GalleryItem from '../models/Gallery.js';
import Testimonial from '../models/Testimonial.js';
import SpecialOffer from '../models/SpecialOffer.js';
import Admin from '../models/Admin.js';
import HappyClient from '../models/HappyClient.js';
import HomeContent from '../models/HomeContent.js';
import Policy from '../models/Policy.js';
import AboutContent from '../models/AboutContent.js';

async function testInsert() {
  try {
    await sequelize.authenticate();
    console.log('Connected to DB');

    console.log('Testing Admin creation...');
    const admin = await Admin.build({
      name: 'Test Admin',
      email: `test_admin_${Date.now()}@gmail.com`,
      password: 'password123'
    });
    await admin.save();
    console.log('Admin created successfully');

    console.log('Testing HappyClient creation...');
    const client = await HappyClient.create({
      image_url: 'http://localhost:5000/uploads/clients/man1.png',
      caption: 'Test Client',
      orderIndex: 0
    });
    console.log('HappyClient created successfully:', client.toJSON());

    console.log('Testing Testimonial creation...');
    const testimonial = await Testimonial.create({
      name: 'Test User',
      role: 'Test Role',
      image: 'http://localhost:5000/uploads/clients/man1.png',
      rating: 5,
      text: 'Great service!',
      carPurchased: 'BMW X1 sDrive',
      isVisible: true
    });
    console.log('Testimonial created successfully:', testimonial.toJSON());

    console.log('Testing Car creation...');
    const car = await Car.create({
      name: 'Test Car',
      brand: 'Test Brand',
      year: 2024,
      price: 1500000,
      mileage: 5000,
      fuel: 'Petrol',
      transmission: 'Automatic',
      type: 'SUV',
      color: 'White',
      engine: '2.0L',
      seats: 5,
      ownership: 1,
      state: 'State',
      city: 'City',
      rto: 'RTO',
      insurance: 'Insurance',
      puc: 'PUC',
      hypothecation: 'Hypothecation',
      description: 'Test description',
      features: ['Sunroof'],
      image: 'http://localhost:5000/uploads/cars/BMW X1 sDrive.webp',
      gallery: [],
      featured: true,
      badge: 'Hot Deal',
      availabilityStatus: 'Available',
      placement: 'cars-collections'
    });
    console.log('Car created successfully:', car.toJSON());

    console.log('✓ All inserts succeeded!');
    process.exit(0);
  } catch (error) {
    console.error('✗ Insert failed:', error);
    process.exit(1);
  }
}

testInsert();
