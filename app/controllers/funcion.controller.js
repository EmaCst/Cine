const db = require("../models");
const Funcion = db.funciones;
const Pelicula = db.peliculas;
const Sala = db.salas;

// Crear nueva función (soporta arrays de fechas y/o horas)
exports.create = async (req, res) => {
  try {
    const { fecha, fechas, hora, horas, idioma, subtitulos, formato, peliculaId, salaId } = req.body;

    // Validar que tengamos al menos una fecha y una hora
    if ((!fecha && (!fechas || fechas.length === 0)) || (!hora && (!horas || horas.length === 0)) || !peliculaId || !salaId) {
      return res.status(400).send({ message: "Datos incompletos para crear función." });
    }

    // Normalizar arrays
    const fechasAUsar = fechas && fechas.length > 0 ? fechas : [fecha];
    const horasAUsar = horas && horas.length > 0 ? horas : [hora];

    const funcionesCreadas = [];
    const conflictos = [];

    for (const f of fechasAUsar) {
      for (const h of horasAUsar) {
        // Verificar conflicto en la misma sala, fecha y hora
        const conflicto = await Funcion.findOne({ where: { salaId, fecha: f, hora: h } });
        if (conflicto) {
          conflictos.push({ fecha: f, hora: h });
          continue; // Saltar esta combinación
        }

        const funcion = await Funcion.create({
          fecha: f,
          hora: h,
          idioma: idioma || null,
          subtitulos: subtitulos || false,
          formato: formato || "2D",
          peliculaId,
          salaId
        });

        funcionesCreadas.push(funcion);
      }
    }

    let mensaje = "Funciones creadas correctamente.";
    if (conflictos.length > 0) {
      mensaje += ` Algunas funciones no se pudieron crear por conflictos: ${JSON.stringify(conflictos)}.`;
    }

    res.status(201).send({ message: mensaje, funciones: funcionesCreadas });
  } catch (err) {
    res.status(500).send({ message: err.message || "Error al crear la función." });
  }
};


// Listar todas las funciones (con película y sala incluidas)
exports.findAll = async (req, res) => {
  try {
    const funciones = await Funcion.findAll({
      include: [
        {
          model: Pelicula,
          as: "pelicula",
          attributes: ["id", "titulo", "sinopsis", "carteleraUrl"] // 👈 agrega aquí el campo de la foto
        },
        {
          model: Sala,
          as: "sala",
          attributes: ["id", "nombre"]
        }
      ],
      order: [["fecha", "ASC"], ["hora", "ASC"]]
    });

    res.send(funciones);
  } catch (err) {
    res.status(500).send({ message: err.message || "Error al listar funciones." });
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
