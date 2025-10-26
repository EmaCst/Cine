const db = require("../models");
const Funcion = db.funciones;
const Pelicula = db.peliculas;
const Sala = db.salas;


// Crear nuevas funciones
exports.create = async (req, res) => {
  try {
    const { fechas, horas, idioma, subtitulos, formato, peliculaId, salaId, precio } = req.body;

    // ✅ Validación de campos obligatorios
    if (!fechas || !Array.isArray(fechas) || fechas.length === 0) {
      return res.status(400).send({ message: "Debe enviar al menos una fecha." });
    }
    if (!horas || !Array.isArray(horas) || horas.length === 0) {
      return res.status(400).send({ message: "Debe enviar al menos una hora." });
    }
    if (!peliculaId || !salaId) {
      return res.status(400).send({ message: "Debe especificar la película y la sala." });
    }
    if (precio === undefined || precio === null || precio === "") {
      return res.status(400).send({ message: "Debe especificar el precio de la función." });
    }

    const funcionesCreadas = [];
    const funcionesDuplicadas = [];

    for (const fecha of fechas) {
      for (const hora of horas) {
        // 🔍 Verificar si ya existe una función en esa fecha, hora y sala
        const existe = await Funcion.findOne({
          where: { fecha, hora, salaId }
        });

        if (existe) {
          funcionesDuplicadas.push({ fecha, hora });
          continue; // saltar esta combinación
        }

        // ✅ Crear nueva función si no está duplicada
        const nuevaFuncion = await Funcion.create({
          fecha,
          hora,
          idioma,
          subtitulos,
          formato,
          peliculaId,
          salaId,
          precio
        });
        funcionesCreadas.push(nuevaFuncion);
      }
    }

    if (funcionesCreadas.length === 0) {
      return res.status(400).send({
        message: "No se pudieron crear funciones porque ya existen en esas fechas y horas.",
        duplicadas: funcionesDuplicadas
      });
    }

    res.status(201).send({
      message: "Funciones creadas correctamente.",
      funciones: funcionesCreadas,
      duplicadas: funcionesDuplicadas.length > 0 ? funcionesDuplicadas : undefined
    });
  } catch (error) {
    console.error("Error al crear las funciones:", error);
    res.status(500).send({
      message: "Ocurrió un error al crear las funciones.",
      error: error.message
    });
  }
};

// Listar todas las funciones
exports.findAll = async (req, res) => {
  try {
    const funciones = await Funcion.findAll();
    res.status(200).send(funciones);
  } catch (error) {
    console.error("Error al obtener las funciones:", error);
    res.status(500).send({
      message: "Ocurrió un error al obtener las funciones.",
      error: error.message
    });
  }
};



// Buscar una función por ID
exports.findOne = async (req, res) => {
  try {
    const id = req.params.id;
    const funcion = await Funcion.findByPk(id, {
      include: [
        { model: Pelicula, as: "pelicula" },
        { model: Sala, as: "sala" }
      ]
    });

    if (!funcion) {
      return res.status(404).send({ message: `No se encontró función con id=${id}` });
    }
    res.send(funcion);
  } catch (err) {
    res.status(500).send({ message: err.message || "Error al buscar función." });
  }
};

// 🔍 Filtrar funciones por película y opcionalmente por idioma
exports.findByPeliculaYIdioma = async (req, res) => {
  try {
    const { titulo, idioma } = req.query;

    if (!titulo) {
      return res.status(400).send({ message: "Debe especificar el título de la película." });
    }

    // Buscar película por título
    const pelicula = await Pelicula.findOne({ where: { titulo } });
    if (!pelicula) {
      return res.status(404).send({ message: `No se encontró la película "${titulo}".` });
    }

    // Armar condición para idioma (opcional)
    const whereCondition = { peliculaId: pelicula.id };
    if (idioma) {
      whereCondition.idioma = idioma;
    }

    // Buscar funciones asociadas
    const funciones = await Funcion.findAll({
      where: whereCondition,
      include: [
        { model: Pelicula, as: "pelicula" },
        { model: Sala, as: "sala" }
      ],
      order: [["fecha", "ASC"], ["hora", "ASC"]]
    });

    res.send(funciones);
  } catch (err) {
    res.status(500).send({ message: err.message || "Error al filtrar funciones." });
  }
};


// Actualizar función por ID
exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    const { precio } = req.body;

    // Validar precio si se envía
    if (precio !== undefined && (isNaN(precio) || Number(precio) <= 0)) {
      return res.status(400).send({ message: "El precio debe ser un número positivo." });
    }

    const [updated] = await Funcion.update(req.body, { where: { id } });

    if (updated === 0) {
      return res.status(404).send({ message: `No se pudo actualizar función con id=${id}` });
    }

    const funcionActualizada = await Funcion.findByPk(id, {
      include: [
        { model: Pelicula, as: "pelicula" },
        { model: Sala, as: "sala" }
      ]
    });

    res.send(funcionActualizada);
  } catch (err) {
    res.status(500).send({ message: err.message || "Error al actualizar función." });
  }
};


// Eliminar función por ID
exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    const deleted = await Funcion.destroy({ where: { id } });

    if (!deleted) {
      return res.status(404).send({ message: `No se encontró función con id=${id}` });
    }

    res.send({ message: "Función eliminada correctamente." });
  } catch (err) {
    res.status(500).send({ message: err.message || "Error al eliminar función." });
  }
};

// Eliminar todas las funciones
exports.deleteAll = async (req, res) => {
  try {
    const deleted = await Funcion.destroy({ where: {}, truncate: false });
    res.send({ message: `${deleted} funciones eliminadas.` });
  } catch (err) {
    res.status(500).send({ message: err.message || "Error al eliminar todas las funciones." });
  }
};
