import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db.js';

class HappyClient extends Model {}

HappyClient.init({
  image_url: { type: DataTypes.STRING, allowNull: false },
  caption: { type: DataTypes.STRING, defaultValue: '' },
  orderIndex: { type: DataTypes.INTEGER, defaultValue: 0 },
}, {
  sequelize,
  modelName: 'HappyClient',
});

export default HappyClient;
