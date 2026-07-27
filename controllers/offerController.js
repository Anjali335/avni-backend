import SpecialOffer from '../models/SpecialOffer.js';
import { uploadToCloudinary, deleteFromCloudinary, getPublicIdFromUrl } from '../utils/cloudinaryHelpers.js';

// Helper to sanitize offer data for MySQL
const sanitizeOfferData = (data) => {
  const sanitized = { ...data };

  if (sanitized.discountPercentage === '' || sanitized.discountPercentage === undefined || sanitized.discountPercentage === null) {
    sanitized.discountPercentage = null;
  } else {
    sanitized.discountPercentage = Number(sanitized.discountPercentage);
    if (isNaN(sanitized.discountPercentage)) sanitized.discountPercentage = null;
  }

  if (sanitized.validityDate === '' || sanitized.validityDate === undefined || sanitized.validityDate === null || sanitized.validityDate === 'Invalid date') {
    sanitized.validityDate = null;
  } else {
    const parsedDate = new Date(sanitized.validityDate);
    if (isNaN(parsedDate.getTime())) {
      sanitized.validityDate = null;
    } else {
      sanitized.validityDate = parsedDate;
    }
  }

  if (sanitized.active !== undefined) {
    sanitized.active = sanitized.active === 'true' || sanitized.active === true;
  }

  return sanitized;
};

// @desc    Get all active special offers
// @route   GET /api/offers
// @access  Public
export const getOffers = async (req, res) => {
  try {
    const { all } = req.query;
    const where = all === 'true' ? {} : { active: true };

    const offers = await SpecialOffer.findAll({
      where,
      order: [['createdAt', 'DESC']]
    });
    res.json(offers);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create a special offer
// @route   POST /api/offers
// @access  Private/Admin
export const createOffer = async (req, res) => {
  try {
    let data = { ...req.body };

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, 'car-dealer/offers');
      data.image = result.secure_url;
    }

    data = sanitizeOfferData(data);

    const offer = await SpecialOffer.create(data);
    res.status(201).json(offer);
  } catch (error) {
    console.error('createOffer error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update a special offer
// @route   PUT /api/offers/:id
// @access  Private/Admin
export const updateOffer = async (req, res) => {
  try {
    const offer = await SpecialOffer.findByPk(req.params.id);
    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    let data = { ...req.body };

    if (req.file) {
      const oldId = getPublicIdFromUrl(offer.image);
      if (oldId) await deleteFromCloudinary(oldId);

      const result = await uploadToCloudinary(req.file.buffer, 'car-dealer/offers');
      data.image = result.secure_url;
    }

    data = sanitizeOfferData(data);

    await offer.update(data);
    res.json(offer);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete a special offer
// @route   DELETE /api/offers/:id
// @access  Private/Admin
export const deleteOffer = async (req, res) => {
  try {
    const offer = await SpecialOffer.findByPk(req.params.id);
    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    const publicId = getPublicIdFromUrl(offer.image);
    if (publicId) await deleteFromCloudinary(publicId);

    await offer.destroy();
    res.json({ message: 'Offer removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
