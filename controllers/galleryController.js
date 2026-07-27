import GalleryItem from '../models/Gallery.js';

// @desc    Get all gallery items
// @route   GET /api/gallery
// @access  Public
export const getGalleryItems = async (req, res) => {
  try {
    const { category } = req.query;
    const where = {};
    if (category) where.category = category;

    const items = await GalleryItem.findAll({
      where,
      order: [['orderIndex', 'ASC'], ['createdAt', 'DESC']]
    });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Add a gallery item
// @route   POST /api/gallery
// @access  Private/Admin
export const createGalleryItem = async (req, res) => {
  try {
    const { title, image_url, type, video_url, thumbnail_url, category, caption } = req.body;

    const data = {
      caption: caption || title, // Map title to caption if provided
      image_url,
      type,
      video_url,
      thumbnail_url,
      category,
      url: image_url, // For backwards compatibility
      youtubeUrl: video_url // For backwards compatibility
    };

    const item = await GalleryItem.create(data);
    res.status(201).json(item);
  } catch (error) {
    console.error('createGalleryItem error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update a gallery item
// @route   PUT /api/gallery/:id
// @access  Private/Admin
export const updateGalleryItem = async (req, res) => {
  try {
    const item = await GalleryItem.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Gallery item not found' });
    }

    let parsedOrderIndex = item.orderIndex;
    if (orderIndex !== undefined && orderIndex !== '') {
      parsedOrderIndex = Number(orderIndex);
      if (isNaN(parsedOrderIndex)) parsedOrderIndex = item.orderIndex;
    }

    const data = {
      caption: caption || title,
      image_url: image_url !== undefined ? image_url : item.image_url,
      type: type !== undefined ? type : item.type,
      video_url: video_url !== undefined ? video_url : item.video_url,
      thumbnail_url: thumbnail_url !== undefined ? thumbnail_url : item.thumbnail_url,
      category: category !== undefined ? category : item.category,
      orderIndex: parsedOrderIndex,
      url: image_url !== undefined ? image_url : item.url, // For backwards compatibility
      youtubeUrl: video_url !== undefined ? video_url : item.youtubeUrl // For backwards compatibility
    };

    await item.update(data);
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete a gallery item
// @route   DELETE /api/gallery/:id
// @access  Private/Admin
export const deleteGalleryItem = async (req, res) => {
  try {
    const item = await GalleryItem.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Gallery item not found' });
    }

    await item.destroy();
    res.json({ message: 'Gallery item removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
