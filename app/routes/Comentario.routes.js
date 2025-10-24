module.exports = app => {
  const comentarios = require("../controllers/Comentario.controller.js");
  const router = require("express").Router();

  // Crear un nuevo comentario
  router.post("/create", comentarios.create);

  // Obtener todos los comentarios
  router.get("/", comentarios.findAll);

  // Obtener comentarios por película
  router.get("/pelicula/:peliculaId", comentarios.findByPelicula);

  // Obtener comentarios por usuario
  router.get("/usuario/:usuarioId", comentarios.findByUsuario);

  // Eliminar un comentario por id
  router.delete("/delete/:id", comentarios.delete);

  // Eliminar todos los comentarios
  router.delete("/delete", comentarios.deleteAll);

  app.use("/api/comentarios", router);
};
