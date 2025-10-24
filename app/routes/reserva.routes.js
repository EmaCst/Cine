// routes/reserva.routes.js
module.exports = app => {
  const reservas = require("../controllers/reserva.controller.js");

  var router = require("express").Router();

  router.post("/create", reservas.create);
  router.get("/", reservas.findAll);
  router.get("/:id", reservas.findOne);
  router.put("/update/:id", reservas.update);
  router.delete("/delete/:id", reservas.delete);
  router.delete("/delete", reservas.deleteAll);

  app.use("/api/reservas", router);
};
