// routes/venta.routes.js
module.exports = app => {
  const ventas = require("../controllers/venta.controller.js");
  const router = require("express").Router();

  router.post("/create", ventas.create);

  app.use("/api/ventacomida", router);
};
