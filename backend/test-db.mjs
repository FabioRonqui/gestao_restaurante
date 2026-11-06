import 'dotenv/config';
import mysql from 'mysql2/promise';

try {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  const [rows] = await connection.query('SELECT 1 AS conectado');
  console.log('Conexão OK:', rows[0]);
  await connection.end();
} catch (error) {
  console.error('Falha na conexão:', error.message);
  process.exitCode = 1;
}