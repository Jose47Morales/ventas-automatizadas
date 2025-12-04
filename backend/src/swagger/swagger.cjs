const fs = require("fs");
const path = require("path");
const swaggerUi = require("swagger-ui-express");
const yaml = require("js-yaml");

const swaggerPath = path.join(__dirname, "swagger.yaml");

// Carga YAML
const swaggerDocument = yaml.load(fs.readFileSync(swaggerPath, "utf8"));

// Exporta middleware listo para usar
module.exports = {
  swaggerUi,
  swaggerDocument
};