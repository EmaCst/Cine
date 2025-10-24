module.exports = app => {
  const salas = require("../controllers/sala.controller.js");

  var router = require("express").Router();

  router.post("/create", salas.create);
  router.get("/", salas.findAll);
  router.get("/:id", salas.findOne);
  router.put("/update/:id", salas.update);
  router.delete("/delete/:id", salas.delete);
  router.delete("/delete", salas.deleteAll);

  app.use("/api/salas", router);
};
