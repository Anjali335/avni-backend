import HomeContent from '../models/HomeContent.js';
import { uploadToCloudinary, deleteFromCloudinary, getPublicIdFromUrl } from '../utils/cloudinaryHelpers.js';

// @desc    Get home page content
// @route   GET /api/home
// @access  Public
export const getHomeContent = async (req, res) => {
  try {
    let content = await HomeContent.findOne();
    if (!content) {
      content = await HomeContent.create({
        heroTitle: 'Find Your Perfect Pre-Owned Car',
        heroSubtitle: 'Built for the road ahead. Reliable vehicles chosen to match your lifestyle and budget. Exceptional cars, thoughtfully chosen. Because finding the right vehicle should feel effortless.',
        heroBadge: 'Trusted Dealer',
        heroImage: '',
        stats: [
          { label: 'Cars Sold', value: 500, suffix: '+' },
          { label: 'Happy Customers', value: 450, suffix: '+' },
          { label: 'Years Experience', value: 10, suffix: '+' },
        ],
      });
    } else {
      if (
        content.heroSubtitle === 'Explore our premium collection of certified pre-owned vehicles' ||
        content.heroSubtitle === 'Ghar Lao Khushiyon Ki Chabi. Discover verified pre-owned cars, trusted deals, and a seamless car-buying experience tailored to your needs.' ||
        content.heroSubtitle === 'Built for the road ahead. Reliable vehicles chosen to match your lifestyle and budget.' ||
        content.heroSubtitle === 'Exceptional cars, thoughtfully chosen. Because finding the right vehicle should feel effortless.'
      ) {
        await content.update({
          heroSubtitle: 'Built for the road ahead. Reliable vehicles chosen to match your lifestyle and budget. Exceptional cars, thoughtfully chosen. Because finding the right vehicle should feel effortless.'
        });
      }
    }
    res.json(content);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update home page content
// @route   PUT /api/home
// @access  Private/Admin
export const updateHomeContent = async (req, res) => {
  try {
    const data = { ...req.body };

    if (typeof data.stats === 'string') {
      data.stats = JSON.parse(data.stats);
    }

    // Handle hero image upload
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, 'car-dealer/home');
      data.heroImage = result.secure_url;
    }

    let content = await HomeContent.findOne();
    if (content) {
      if (req.file && content.heroImage) {
        const oldId = getPublicIdFromUrl(content.heroImage);
        if (oldId) await deleteFromCloudinary(oldId);
      }
      await content.update(data);
    } else {
      content = await HomeContent.create(data);
    }

    res.json(content);
  } catch (error) {
    console.error('updateHomeContent error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
