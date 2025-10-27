const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/Dashboard.controller");

// Ruta GET de pagos por sucursal
router.get("/Sucursal", dashboardController.pagosPorSucursal);

module.exports = router;
