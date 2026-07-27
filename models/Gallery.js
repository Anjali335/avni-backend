import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db.js';

class GalleryItem extends Model {}

GalleryItem.init({
  url: { type: DataTypes.STRING, defaultValue: '' },
  image_url: { type: DataTypes.STRING, defaultValue: '' },
  type: {
    type: DataTypes.ENUM('image', 'video', 'youtube'),
    defaultValue: 'image'
  },
  youtubeUrl: { type: DataTypes.STRING, defaultValue: '' },
  video_url: { type: DataTypes.STRING, defaultValue: '' },
  thumbnail_url: { type: DataTypes.STRING, defaultValue: '' },
  caption: { type: DataTypes.STRING, defaultValue: '' },
  category: { type: DataTypes.STRING, defaultValue: '' },
  orderIndex: { type: DataTypes.INTEGER, defaultValue: 0 },
  carId: { type: DataTypes.STRING, defaultValue: null },
}, {
  sequelize,
  modelName: 'GalleryItem',
});

export default GalleryItem;
