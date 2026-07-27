import Testimonial from '../models/Testimonial.js';
import { uploadToCloudinary, deleteFromCloudinary, getPublicIdFromUrl } from '../utils/cloudinaryHelpers.js';

// @desc    Get all visible testimonials
// @route   GET /api/testimonials
// @access  Public
export const getTestimonials = async (req, res) => {
  try {
    const { all } = req.query;
    const where = all === 'true' ? {} : { isVisible: true };

    const testimonials = await Testimonial.findAll({
      where,
      order: [['createdAt', 'DESC']]
    });
    res.json(testimonials);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Helper to sanitize testimonial data for MySQL
const sanitizeTestimonialData = (data) => {
  const sanitized = { ...data };

  if (sanitized.rating === '' || sanitized.rating === undefined || sanitized.rating === null) {
    sanitized.rating = 5; // Default rating
  } else {
    sanitized.rating = Number(sanitized.rating);
    if (isNaN(sanitized.rating)) sanitized.rating = 5;
  }

  if (sanitized.isVisible !== undefined) {
    sanitized.isVisible = sanitized.isVisible === 'true' || sanitized.isVisible === true;
  }

  return sanitized;
};

// @desc    Create a testimonial
// @route   POST /api/testimonials
// @access  Private/Admin
export const createTestimonial = async (req, res) => {
  try {
    let data = { ...req.body };

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, 'car-dealer/testimonials');
      data.image = result.secure_url;
    }

    data = sanitizeTestimonialData(data);

    const testimonial = await Testimonial.create(data);
    res.status(201).json(testimonial);
  } catch (error) {
    console.error('createTestimonial error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update a testimonial
// @route   PUT /api/testimonials/:id
// @access  Private/Admin
export const updateTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findByPk(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }

    let data = { ...req.body };

    if (req.file) {
      const oldId = getPublicIdFromUrl(testimonial.image);
      if (oldId) await deleteFromCloudinary(oldId);

      const result = await uploadToCloudinary(req.file.buffer, 'car-dealer/testimonials');
      data.image = result.secure_url;
    }

    data = sanitizeTestimonialData(data);

    await testimonial.update(data);
    res.json(testimonial);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete a testimonial
// @route   DELETE /api/testimonials/:id
// @access  Private/Admin
export const deleteTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findByPk(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }

    const publicId = getPublicIdFromUrl(testimonial.image);
    if (publicId) await deleteFromCloudinary(publicId);

    await testimonial.destroy();
    res.json({ message: 'Testimonial removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
