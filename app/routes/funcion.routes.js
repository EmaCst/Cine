module.exports = app => {
  const funciones = require("../controllers/funcion.controller.js");

  var router = require("express").Router();

  // Crear
  router.post("/create", funciones.create);

  // Listar todas
  router.get("/", funciones.findAll);

  // Buscar por ID
  router.get("/:id", funciones.findOne);

  // Actualizar por ID
  router.put("/update/:id", funciones.update);

  // Eliminar por ID
  router.delete("/delete/:id", funciones.delete);

  // Eliminar todas
  router.delete("/delete", funciones.deleteAll);

    // Filtrar funciones por película e idioma
  // Ejemplo de uso: GET /api/funciones/filtrar?titulo=Avatar&idioma=Español
  router.get("/filtrar/buscar", funciones.findByPeliculaYIdioma);

  app.use("/api/funciones", router);
};
