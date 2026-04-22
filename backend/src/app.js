const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const { config } = require('./config/env');
const { swaggerSpec } = require('./docs/swagger');
const authRoutes = require('./routes/auth.routes');
const taskRoutes = require('./routes/task.routes');
const {
  errorHandler,
  notFoundHandler,
} = require('./middleware/error-handler');

const app = express();

app.use(
  cors({
    origin: config.clientOrigin,
    credentials: true,
  }),
);

app.use(express.json({ limit: '10kb' }));

app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/tasks', taskRoutes);

const frontendDist = path.resolve(__dirname, '../../frontend/dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) {
      return next();
    }
    return res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
