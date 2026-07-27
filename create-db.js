import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function createDB() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'admin@123',
      port: process.env.DB_PORT || 3306,
    });
    const dbName = process.env.DB_NAME || 'cardealer';
    console.log(`Creating database ${dbName} if not exists...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
    console.log(`Database '${dbName}' is ready.`);
    await connection.end();
  } catch (error) {
    console.error('Error creating database:', error);
  }
}
createDB();
