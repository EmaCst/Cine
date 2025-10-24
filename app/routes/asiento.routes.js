module.exports = app => {
  const asientos = require("../controllers/asiento.controller.js");

  var router = require("express").Router();

  // Crear un nuevo Asiento
  router.post("/create", asientos.create);

  // Obtener todos los Asientos
  router.get("/", asientos.findAll);

  // Obtener un Asiento por id
  router.get("/:id", asientos.findOne);

  // Actualizar un Asiento por id
  router.put("/update/:id", asientos.update);

  // Eliminar un Asiento por id
  router.delete("/delete/:id", asientos.delete);

  // Eliminar todos los Asientos
  router.delete("/delete", asientos.deleteAll);

   // Obtener asientos por sala
router.get("/sala/:salaId", asientos.findBySala);

  app.use("/api/asientos", router);
};
