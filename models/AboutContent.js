import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db.js';

class AboutContent extends Model {}

AboutContent.init({
  heroTitle: { type: DataTypes.STRING, allowNull: false, defaultValue: 'Our Story' },
  heroSubtitle: { type: DataTypes.STRING },
  establishedYear: { type: DataTypes.STRING, defaultValue: '2012' },
  legacyText: { type: DataTypes.TEXT },
  vehiclesSold: { type: DataTypes.STRING, defaultValue: '5,000+' },
  yearsExperience: { type: DataTypes.STRING, defaultValue: '12+' },
  trustedFeatures: { type: DataTypes.JSON, defaultValue: [] },
  visionText: { type: DataTypes.TEXT },
  missionText: { type: DataTypes.TEXT },
  directorName: { type: DataTypes.STRING },
  directorRole: { type: DataTypes.STRING },
  directorMessage: { type: DataTypes.TEXT },
  directorImage: { type: DataTypes.STRING },
  popularBrands: { type: DataTypes.JSON, defaultValue: [] },
  financePartners: { type: DataTypes.JSON, defaultValue: [] }
}, {
  sequelize,
  modelName: 'AboutContent',
});

export default AboutContent;
