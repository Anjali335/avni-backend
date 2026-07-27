import { DataTypes, Model } from 'sequelize';
import bcrypt from 'bcryptjs';
import { sequelize } from '../config/db.js';

class Admin extends Model {
  async matchPassword(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
  }

  toJSON() {
    const values = Object.assign({}, this.get());
    delete values.password;
    return values;
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
    beforeUpdate: async (admin) => {
      if (admin.previous('role') === 'super_admin' && admin.role !== 'super_admin') {
        throw new Error('Cannot change the role of a super_admin');
      }
    },
    beforeDestroy: async (admin) => {
      if (admin.role === 'super_admin') {
        throw new Error('Cannot delete the super_admin account');
      }
    }
  }
});

export default Admin;
