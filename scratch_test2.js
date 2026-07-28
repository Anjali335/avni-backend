import { Sequelize, DataTypes, Model } from 'sequelize';
import bcrypt from 'bcryptjs';

const sequelize = new Sequelize('sqlite::memory:');

class Admin extends Model {
  async matchPassword(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
  }
}

Admin.init({
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.STRING, defaultValue: 'admin' },
}, {
  sequelize,
  modelName: 'Admin',
  hooks: {
    beforeSave: async (admin) => {
      if (admin.changed('password')) {
        const salt = await bcrypt.genSalt(12);
        admin.password = await bcrypt.hash(admin.password, salt);
      }
    },
    beforeCreate: async (admin) => {
      if (admin.role === 'super_admin') {
        const existingSuperAdmin = await Admin.findOne({ where: { role: 'super_admin' } });
        if (existingSuperAdmin) {
          throw new Error('A super_admin already exists');
        }
      }
    },
  }
});

async function test() {
  await sequelize.sync({ force: true });
  const superAdmin = await Admin.create({
    name: 'Super Admin',
    email: 'adminavnicarscollections@gmail.com',
    password: 'avniauto1234',
    role: 'super_admin'
  });
  console.log('Created Admin password field (should be hashed):', superAdmin.password);
  
  const foundAdmin = await Admin.findOne({ where: { email: 'adminavnicarscollections@gmail.com' } });
  console.log('Found Admin password field (should be hashed):', foundAdmin.password);
  
  const match = await foundAdmin.matchPassword('avniauto1234');
  console.log('Match?', match);
}

test();
