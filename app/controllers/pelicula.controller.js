const db = require("../models");
const Pelicula = db.peliculas;
const Funcion = db.funciones; // relación con funciones
const Op = db.Sequelize.Op;

// Crear y guardar una nueva Película
exports.create = async (req, res) => {
  try {
    const { titulo, genero, duracion, calificacion, sinopsis, carteleraUrl, pais, anio } = req.body;

    if (!titulo) {
      return res.status(400).send({ message: "El título de la película es obligatorio." });
    }

    const nuevaPelicula = await Pelicula.create({
      titulo,
      genero,
      duracion,
      calificacion,
      sinopsis,
      carteleraUrl,
      pais,
      anio
    });

    res.status(201).send(nuevaPelicula);
  } catch (err) {
    res.status(500).send({
      message: err.message || "Ocurrió un error al crear la película."
    });
  }
};

  // Obtener todas las Películas (opcional: filtro por título)
  exports.findAll = async (req, res) => {
    try {
      const { titulo } = req.query;
      const condition = titulo ? { titulo: { [Op.iLike]: `%${titulo}%` } } : null;

      const peliculas = await Pelicula.findAll({
        where: condition,
        include: [
          {
            model: Funcion,
            as: "funciones", // alias definido en associate
            attributes: ["id", "fecha", "hora", "idioma", "subtitulos", "formato", "salaId"]
          }
        ],
        order: [["id", "ASC"]]
      });

      res.send(peliculas);
    } catch (err) {
      res.status(500).send({
        message: err.message || "Ocurrió un error al obtener las películas."
      });
    }
  };

  // Obtener una Película por ID (con funciones asociadas)
  exports.findOne = async (req, res) => {
    try {
      const id = req.params.id;

      const pelicula = await Pelicula.findByPk(id, {
        include: [
          {
            model: Funcion,
            as: "funciones",
            attributes: ["id", "fecha", "hora", "idioma", "subtitulos", "formato", "salaId"]
          }
        ]
      });

      if (!pelicula) {
        return res.status(404).send({ message: `No se encontró Película con id=${id}.` });
      }

      res.send(pelicula);
    } catch (err) {
      res.status(500).send({
        message: "Error al obtener Película con id=" + req.params.id
      });
    }
  };

  // Actualizar una Película por ID
  exports.update = async (req, res) => {
    try {
      const id = req.params.id;
      const [num] = await Pelicula.update(req.body, { where: { id } });

      if (num === 1) {
        res.send({ message: "Película actualizada correctamente." });
      } else {
        res.status(404).send({
          message: `No se pudo actualizar Película con id=${id}. Tal vez no fue encontrada o el cuerpo está vacío.`
        });
      }
    } catch (err) {
      res.status(500).send({
        message: "Error al actualizar Película con id=" + req.params.id
      });
    }
  };

  // Eliminar una Película por ID
  exports.delete = async (req, res) => {
    try {
      const id = req.params.id;
      const num = await Pelicula.destroy({ where: { id } });

      if (num === 1) {
        res.send({ message: "Película eliminada correctamente." });
      } else {
        res.status(404).send({
          message: `No se pudo eliminar Película con id=${id}. Tal vez no fue encontrada.`
        });
      }
    } catch (err) {
      res.status(500).send({
        message: "No se pudo eliminar Película con id=" + req.params.id
      });
    }
  };

  // Eliminar todas las Películas
  exports.deleteAll = async (req, res) => {
    try {
      const count = await Pelicula.destroy({ where: {}, truncate: false });
      res.send({ message: `${count} Películas fueron eliminadas correctamente.` });
    } catch (err) {
      res.status(500).send({
        message: err.message || "Ocurrió un error al eliminar todas las películas."
      });
    }
  };

