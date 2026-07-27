import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db.js';

class Policy extends Model {}

Policy.init({
  type: { type: DataTypes.STRING, allowNull: false, unique: true },
  title: { type: DataTypes.STRING, allowNull: false },
  content: { type: DataTypes.TEXT, allowNull: false },
}, {
  sequelize,
  modelName: 'Policy',
});

export default Policy;
