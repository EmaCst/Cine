const express = require("express");
const router = express.Router();
const SucursalController = require("../controllers/sucursal.controller.js");

module.exports = (app) => {
  // Crear sucursal
  router.post("/create", SucursalController.create);

  // Listar todas las sucursales
  router.get("/", SucursalController.findAll);

  // Registrar las rutas bajo el prefijo /api/sucursales
  app.use("/api/sucursales", router); // ✅ usamos router, no sucursalRoutes
};
