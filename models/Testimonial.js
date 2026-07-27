import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db.js';

class Testimonial extends Model {}

Testimonial.init({
  name: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.STRING },
  image: { type: DataTypes.STRING },
  rating: { type: DataTypes.INTEGER, allowNull: false },
  text: { type: DataTypes.TEXT, allowNull: false },
  carPurchased: { type: DataTypes.STRING },
  isVisible: { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  sequelize,
  modelName: 'Testimonial',
});

export default Testimonial;
