import { Op } from 'sequelize';
import Car from '../models/Car.js';
import GalleryItem from '../models/Gallery.js';
import { uploadToCloudinary, deleteFromCloudinary, getPublicIdFromUrl } from '../utils/cloudinaryHelpers.js';

// @desc    Get all cars (with optional filters)
// @route   GET /api/cars
// @access  Public
export const getCars = async (req, res) => {
  try {
    const {
      search, brand, type, fuel, transmission,
      state, city, minPrice, maxPrice,
      featured, status, sort, page = 1, limit = 20
    } = req.query;

    const where = {};

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { brand: { [Op.like]: `%${search}%` } },
        { type: { [Op.like]: `%${search}%` } },
        { city: { [Op.like]: `%${search}%` } },
      ];
    }
    if (brand) where.brand = brand;
    if (type) where.type = type;
    if (fuel) where.fuel = fuel;
    if (transmission) where.transmission = transmission;
    if (state) where.state = state;
    if (city) where.city = city;
    if (featured !== undefined) where.featured = featured === 'true';
    if (status) where.availabilityStatus = status;
    
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price[Op.gte] = Number(minPrice);
      if (maxPrice) where.price[Op.lte] = Number(maxPrice);
    }

    // Sorting
    let order = [['createdAt', 'DESC']];
    if (sort === 'price_asc') order = [['price', 'ASC']];
    else if (sort === 'price_desc') order = [['price', 'DESC']];
    else if (sort === 'year_desc') order = [['year', 'DESC']];
    else if (sort === 'mileage_asc') order = [['mileage', 'ASC']];

    const limitNum = Number(limit);
    const offset = (Number(page) - 1) * limitNum;

    const { count, rows } = await Car.findAndCountAll({
      where,
      order,
      limit: limitNum,
      offset,
    });

    res.json({
      cars: rows,
      page: Number(page),
      totalPages: Math.ceil(count / limitNum),
      totalCars: count,
    });
  } catch (error) {
    console.error('getCars error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single car by ID
// @route   GET /api/cars/:id
// @access  Public
export const getCarById = async (req, res) => {
  try {
    const car = await Car.findByPk(req.params.id);
    if (car) {
      res.json(car);
    } else {
      res.status(404).json({ message: 'Car not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Helper to sanitize car data for MySQL
const sanitizeCarData = (data) => {
  const sanitized = { ...data };

  // Parse JSON fields if they come as strings
  if (typeof sanitized.features === 'string') {
    try {
      sanitized.features = JSON.parse(sanitized.features);
    } catch {
      sanitized.features = [];
    }
  }
  if (typeof sanitized.gallery === 'string') {
    try {
      sanitized.gallery = JSON.parse(sanitized.gallery);
    } catch {
      sanitized.gallery = [];
    }
  }

  // Sanitize numeric fields for MySQL
  const numericFields = ['year', 'price', 'mileage', 'seats', 'ownership'];
  numericFields.forEach(field => {
    if (sanitized[field] === '' || sanitized[field] === undefined || sanitized[field] === null) {
      delete sanitized[field];
    } else {
      sanitized[field] = Number(sanitized[field]);
      if (isNaN(sanitized[field])) delete sanitized[field];
    }
  });

  if (sanitized.featured !== undefined) {
    sanitized.featured = sanitized.featured === 'true' || sanitized.featured === true;
  }

  return sanitized;
};

// @desc    Create a new car
// @route   POST /api/cars
// @access  Private/Admin
export const createCar = async (req, res) => {
  try {
    let carData = { ...req.body };

    carData = sanitizeCarData(carData);

    // Handle main image upload
    if (req.files && req.files.image && req.files.image[0]) {
      const result = await uploadToCloudinary(req.files.image[0].buffer, 'car-dealer/cars');
      carData.image = result.secure_url;
    }

    // Handle gallery images upload
    if (req.files && req.files.galleryImages) {
      const galleryUrls = [];
      for (const file of req.files.galleryImages) {
        const result = await uploadToCloudinary(file.buffer, 'car-dealer/cars/gallery');
        galleryUrls.push(result.secure_url);
      }
      carData.gallery = galleryUrls;
    }

    const car = await Car.create(carData);

    // Sync to Gallery if requested
    if (req.body.placement === 'everywhere' && car.image) {
      try {
        await GalleryItem.create({
          caption: car.name,
          image_url: car.image,
          type: 'image',
          category: car.brand || 'Cars',
          url: car.image,
          carId: String(car.id)
        });
      } catch (err) {
        console.error('Failed to sync to gallery:', err);
      }
    }

    res.status(201).json(car);
  } catch (error) {
    console.error('createCar error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update a car
// @route   PUT /api/cars/:id
// @access  Private/Admin
export const updateCar = async (req, res) => {
  try {
    const car = await Car.findByPk(req.params.id);
    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    let carData = { ...req.body };

    carData = sanitizeCarData(carData);

    // Handle main image update
    if (req.files && req.files.image && req.files.image[0]) {
      // Delete old image from Cloudinary
      const oldPublicId = getPublicIdFromUrl(car.image);
      if (oldPublicId) await deleteFromCloudinary(oldPublicId);

      const result = await uploadToCloudinary(req.files.image[0].buffer, 'car-dealer/cars');
      carData.image = result.secure_url;
    }

    // Handle gallery images update (append)
    if (req.files && req.files.galleryImages) {
      const existingGallery = carData.gallery || car.gallery || [];
      const newUrls = [];
      for (const file of req.files.galleryImages) {
        const result = await uploadToCloudinary(file.buffer, 'car-dealer/cars/gallery');
        newUrls.push(result.secure_url);
      }
      carData.gallery = [...existingGallery, ...newUrls];
    }

    await car.update(carData);

    // Sync to Gallery based on placement
    if (req.body.placement === 'everywhere') {
      try {
        const existingItem = await GalleryItem.findOne({ where: { carId: String(car.id) } });
        const galleryData = {
          caption: car.name,
          image_url: car.image,
          url: car.image,
          category: car.brand || 'Cars',
          type: 'image'
        };
        if (existingItem) {
          await existingItem.update(galleryData);
        } else {
          await GalleryItem.create({
            ...galleryData,
            carId: String(car.id)
          });
        }
      } catch (err) {
        console.error('Failed to sync to gallery during update:', err);
      }
    } else if (req.body.placement === 'cars-collections') {
      try {
        const existingItem = await GalleryItem.findOne({ where: { carId: String(car.id) } });
        if (existingItem) {
          await existingItem.destroy();
        }
      } catch (err) {
        console.error('Failed to remove from gallery during update:', err);
      }
    }

    res.json(car);
  } catch (error) {
    console.error('updateCar error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete a car
// @route   DELETE /api/cars/:id
// @access  Private/Admin
export const deleteCar = async (req, res) => {
  try {
    const car = await Car.findByPk(req.params.id);
    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    // Delete images from Cloudinary
    const mainPublicId = getPublicIdFromUrl(car.image);
    if (mainPublicId) await deleteFromCloudinary(mainPublicId);

    if (car.gallery && car.gallery.length > 0) {
      for (const url of car.gallery) {
        const publicId = getPublicIdFromUrl(url);
        if (publicId) await deleteFromCloudinary(publicId);
      }
    }

    // Delete linked gallery item
    try {
      const existingItem = await GalleryItem.findOne({ where: { carId: String(car.id) } });
      if (existingItem) {
        await existingItem.destroy();
      }
    } catch (err) {
      console.error('Failed to delete synced gallery item:', err);
    }

    await car.destroy();
    res.json({ message: 'Car removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get filter options (distinct brands, types, etc.)
// @route   GET /api/cars/filters
// @access  Public
export const getFilterOptions = async (req, res) => {
  try {
    const getDistinct = async (column) => {
      const results = await Car.findAll({
        attributes: [column],
        group: [column],
        raw: true
      });
      return results.map(r => r[column]).filter(Boolean).sort();
    };

    const [brands, types, fuels, transmissions, states, cities] = await Promise.all([
      getDistinct('brand'),
      getDistinct('type'),
      getDistinct('fuel'),
      getDistinct('transmission'),
      getDistinct('state'),
      getDistinct('city'),
    ]);

    res.json({
      brands,
      types,
      fuels,
      transmissions,
      states,
      cities,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
