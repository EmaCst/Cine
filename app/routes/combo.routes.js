// routes/combo.routes.js
module.exports = app => {
  const combos = require("../controllers/combo.controller.js");
  const router = require("express").Router();

  router.post("/create", combos.create);
  router.get("/", combos.findAll);
  router.get("/disponibles", combos.findDisponibles);
  router.get("/:id", combos.findOne);
  router.put("/:id", combos.update);
  router.put("/:id/estado", combos.cambiarEstado);
  router.delete("/:id", combos.delete);

  app.use("/api/combos", router);
};
