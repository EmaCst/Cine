const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/Dashboard.controller");

// Ruta GET de pagos por sucursal
router.get("/ventas-totales", dashboardController.getVentasTotales);
router.get("/Sucursal", dashboardController.pagosPorSucursal);
router.get("/ventas-por-pelicula", dashboardController.ventasPorPelicula);
router.get("/entradas-por-pelicula", dashboardController.entradasPorPelicula);
router.get("/ventas-comida-totales", dashboardController.ventasComidaTotales);
router.get("/peliculas-mas-vistas", dashboardController.peliculasMasVistas);
router.get("/diagnostico-peliculas", dashboardController.diagnosticoPeliculas);
router.get("/horarios-mas-demandados", dashboardController.horariosMasDemandados);
router.get("/efectividad-promociones", dashboardController.efectividadPromociones);

module.exports = router;
