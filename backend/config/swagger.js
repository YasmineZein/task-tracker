let swaggerUi, YAML, path, swaggerDocument;
try {
  swaggerUi = require('swagger-ui-express');
  YAML = require('yamljs');
  path = require('path');
  swaggerDocument = YAML.load(path.join(__dirname, '../swagger.yaml'));
} catch (err) {
  console.error('Swagger setup failed:', err.message);
}

module.exports = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
};
