const db = require("../models");
const Comentario = db.comentarios;

// Crear un nuevo comentario
exports.create = async (req, res) => {
  try {
    const { usuarioId, peliculaId, comentario } = req.body;

    if (!usuarioId || !peliculaId || !comentario) {
      return res.status(400).send({
        message: "Faltan datos: usuarioId, peliculaId o comentario."
      });
    }

    const nuevoComentario = await Comentario.create({
      usuarioId,
      peliculaId,
      comentario
    });

    res.status(201).send(nuevoComentario);
  } catch (err) {
    console.error("Error al crear comentario:", err);
    res.status(500).send({ message: "Error al crear comentario." });
  }
};

// Obtener todos los comentarios
exports.findAll = async (req, res) => {
  try {
    const comentarios = await Comentario.findAll();
    res.send(comentarios);
  } catch (err) {
    console.error("Error al obtener comentarios:", err);
    res.status(500).send({ message: "Error al obtener comentarios." });
  }
};

// Obtener comentarios por película
exports.findByPelicula = async (req, res) => {
  try {
    const { peliculaId } = req.params;
    const comentarios = await Comentario.findAll({
      where: { peliculaId }
    });
    res.send(comentarios);
  } catch (err) {
    console.error("Error al obtener comentarios por película:", err);
    res.status(500).send({ message: "Error al obtener comentarios por película." });
  }
};

// Obtener comentarios por usuario
exports.findByUsuario = async (req, res) => {
  try {
    const { usuarioId } = req.params;
    const comentarios = await Comentario.findAll({
      where: { usuarioId }
    });
    res.send(comentarios);
  } catch (err) {
    console.error("Error al obtener comentarios por usuario:", err);
    res.status(500).send({ message: "Error al obtener comentarios por usuario." });
  }
};

// Eliminar un comentario por id
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Comentario.destroy({ where: { id } });

    if (deleted) {
      res.send({ message: "Comentario eliminado correctamente." });
    } else {
      res.status(404).send({ message: "Comentario no encontrado." });
    }
  } catch (err) {
    console.error("Error al eliminar comentario:", err);
    res.status(500).send({ message: "Error al eliminar comentario." });
  }
};

// Eliminar todos los comentarios
exports.deleteAll = async (req, res) => {
  try {
    const count = await Comentario.destroy({ where: {}, truncate: false });
    res.send({ message: `${count} comentarios eliminados.` });
  } catch (err) {
    console.error("Error al eliminar todos los comentarios:", err);
    res.status(500).send({ message: "Error al eliminar todos los comentarios." });
  }
};
 