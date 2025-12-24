/**
 * Точка входа сервера
 */

// Загрузка переменных окружения
require('dotenv').config();

const app = require('./app');
const config = require('./config');

const PORT = config.port || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${config.env}`);
});

