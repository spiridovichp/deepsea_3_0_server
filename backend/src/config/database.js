/**
 * Конфигурация подключения к базе данных PostgreSQL
 */

const config = {
  development: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'deepsea_3_0',
    user: process.env.DB_USER || process.env.USER || 'spiridovich',
    password: process.env.DB_PASSWORD || '',
    ssl: false,
    max: 20, // максимальное количество клиентов в пуле
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  },
  
  production: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'deepsea_3_0',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    max: 50,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  },
};

// Получаем текущее окружение
const env = process.env.NODE_ENV || 'development';

// Экспортируем конфиг для текущего окружения
module.exports = config[env];

