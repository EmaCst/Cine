module.exports = (app) => {
  const promocion = require("../controllers/promocion.controller.js");
  const router = require("express").Router();

  router.post("/create", promocion.create);
  router.get("/", promocion.findAll);
  router.get("/:id", promocion.findOne);
  router.put("/:id", promocion.update);
  router.delete("/:id", promocion.delete);

  app.use("/api/promociones", router);
};
