import HappyClient from '../models/HappyClient.js';
import { uploadToCloudinary, deleteFromCloudinary, getPublicIdFromUrl } from '../utils/cloudinaryHelpers.js';

// Get all happy clients
export const getHappyClients = async (req, res) => {
  try {
    const clients = await HappyClient.findAll({
      order: [['orderIndex', 'ASC'], ['createdAt', 'DESC']]
    });
    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create a new happy client
export const createHappyClient = async (req, res) => {
  try {
    const { caption, orderIndex } = req.body;
    let image_url = '';

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, 'happy-clients');
      image_url = result.secure_url;
    } else {
      return res.status(400).json({ message: 'Image is required' });
    }

    let parsedOrderIndex = Number(orderIndex);
    if (isNaN(parsedOrderIndex)) parsedOrderIndex = 0;

    const newClient = await HappyClient.create({
      image_url,
      caption: caption || '',
      orderIndex: parsedOrderIndex
    });

    res.status(201).json(newClient);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete a happy client
export const deleteHappyClient = async (req, res) => {
  try {
    const { id } = req.params;
    const client = await HappyClient.findByPk(id);

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    const publicId = getPublicIdFromUrl(client.image_url);
    if (publicId) {
      await deleteFromCloudinary(publicId);
    }

    await client.destroy();
    res.json({ message: 'Client deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
