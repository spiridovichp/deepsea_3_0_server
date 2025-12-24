/**
 * Главный файл приложения Express
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const apiRoutes = require('./api/routes');
const errorHandler = require('./api/middleware/errorHandler');
const config = require('./config');
const { swaggerUi, swaggerSpec } = require('./config/swagger');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Trust proxy для получения реального IP адреса
app.set('trust proxy', true);

// Функция для динамической загрузки swagger spec
function getSwaggerSpec() {
  const swaggerPath = path.join(__dirname, '../docs/api/swagger.json');
  const swaggerContent = fs.readFileSync(swaggerPath, 'utf8');
  return JSON.parse(swaggerContent);
}

// Swagger UI - загружаем динамически при каждом запросе
app.use('/api-docs', swaggerUi.serve);
app.get('/api-docs', (req, res, next) => {
  const spec = getSwaggerSpec();
  const swaggerUiHandler = swaggerUi.setup(spec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'DeepSea 3.0 API Documentation',
  });
  swaggerUiHandler(req, res, next);
});

// Swagger JSON endpoint - загружаем динамически
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const spec = getSwaggerSpec();
  res.send(spec);
});

// API Routes
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.method} ${req.path} not found`
  });
});

// Error handler (должен быть последним)
app.use(errorHandler);

module.exports = app;

