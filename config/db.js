import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const dialectOptions = {};
if (process.env.DB_SSL === 'true') {
  dialectOptions.ssl = {
    rejectUnauthorized: false
  };
}

export const sequelize = new Sequelize(
  process.env.DB_NAME || 'cardealer',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || 'admin@123',
  {
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false,
    dialectOptions,
    define: {
      timestamps: true,
    },
  }
);

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✓ MySQL Database Connected successfully');
    await sequelize.sync({ alter: true });
    console.log('✓ Database tables synchronized');
  } catch (error) {
    console.error(`✗ MySQL connection error: ${error.message}`);
    process.exit(1);
  }
};

export default sequelize;
