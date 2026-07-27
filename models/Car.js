import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db.js';

class Car extends Model {}

Car.init({
  name: { type: DataTypes.STRING, allowNull: false },
  brand: { type: DataTypes.STRING, allowNull: false },
  year: { type: DataTypes.INTEGER, allowNull: false },
  price: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  mileage: { type: DataTypes.INTEGER, allowNull: false },
  fuel: { type: DataTypes.STRING, allowNull: false },
  transmission: { type: DataTypes.STRING, allowNull: false },
  type: { type: DataTypes.STRING, allowNull: false },
  color: { type: DataTypes.STRING },
  engine: { type: DataTypes.STRING },
  seats: { type: DataTypes.INTEGER },
  ownership: { type: DataTypes.INTEGER },
  state: { type: DataTypes.STRING },
  city: { type: DataTypes.STRING },
  rto: { type: DataTypes.STRING },
  insurance: { type: DataTypes.STRING },
  puc: { type: DataTypes.STRING },
  hypothecation: { type: DataTypes.STRING },
  description: { type: DataTypes.TEXT },
  features: { type: DataTypes.JSON, defaultValue: [] },
  image: { type: DataTypes.STRING, allowNull: false },
  gallery: { type: DataTypes.JSON, defaultValue: [] },
  featured: { type: DataTypes.BOOLEAN, defaultValue: false },
  badge: { type: DataTypes.STRING },
  availabilityStatus: {
    type: DataTypes.ENUM('Available', 'Sold', 'Reserved'),
    defaultValue: 'Available'
  },
  placement: { type: DataTypes.STRING, defaultValue: 'cars-collections' },
}, {
  sequelize,
  modelName: 'Car',
});

export default Car;
