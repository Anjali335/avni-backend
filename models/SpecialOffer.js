import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db.js';

class SpecialOffer extends Model {}

SpecialOffer.init({
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  discountPercentage: { type: DataTypes.INTEGER },
  validityDate: { type: DataTypes.DATE },
  image: { type: DataTypes.STRING },
  ctaText: { type: DataTypes.STRING, defaultValue: 'Claim Offer' },
  active: { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  sequelize,
  modelName: 'SpecialOffer',
});

export default SpecialOffer;
