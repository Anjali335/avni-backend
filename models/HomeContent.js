import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db.js';

class HomeContent extends Model {}

HomeContent.init({
  heroTitle: { type: DataTypes.STRING, allowNull: false },
  heroSubtitle: { type: DataTypes.STRING },
  heroBadge: { type: DataTypes.STRING },
  heroImage: { type: DataTypes.STRING },
  stats: { type: DataTypes.JSON, defaultValue: [] }
}, {
  sequelize,
  modelName: 'HomeContent',
});

export default HomeContent;
