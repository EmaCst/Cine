const db = require("../models");
const Asiento = db.asientos;
const Sala = db.salas;

// Crear uno o varios asientos en una sala existente
exports.create = async (req, res) => {
  try {
    const { salaId, numeros } = req.body; // numeros es un array de números de asiento

    // Validaciones
    if (!salaId || !Array.isArray(numeros) || numeros.length === 0) {
      return res.status(400).send({
        message: "salaId y un array de números de asiento son requeridos."
      });
    }

    // Verificar que la sala exista
    const sala = await Sala.findByPk(salaId);
    if (!sala) {
      return res.status(404).send({
        message: `No se puede crear los asientos: no existe una sala con el ID ${salaId}.`
      });
    }

    // Crear todos los asientos en paralelo
    const nuevosAsientos = await Promise.all(
      numeros.map(numero => Asiento.create({ numero, salaId }))
    );

    res.status(201).send({
      message: `Se crearon ${nuevosAsientos.length} asientos correctamente.`,
      asientos: nuevosAsientos
    });

  } catch (err) {
    console.error("❌ Error al crear los asientos:", err);
    res.status(500).send({
      message: err.message || "Ocurrió un error al crear los asientos."
    });
  }
};


// Obtener todos los asientos
exports.findAll = async (req, res) => {
  try {
    const data = await Asiento.findAll();
    res.send(data);
  } catch (err) {
    res.status(500).send({
      message: err.message || "Ocurrió un error al obtener los asientos."
    });
  }
};

// Obtener un asiento por id
exports.findOne = async (req, res) => {
  try {
    const id = req.params.id;
    const asiento = await Asiento.findByPk(id);

    if (!asiento) {
      return res.status(404).send({ message: `No se encontró el asiento con id=${id}` });
    }

    res.send(asiento);
  } catch (err) {
    res.status(500).send({
      message: "Error al obtener el asiento con id=" + req.params.id
    });
  }
};

// Actualizar un asiento por id
exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    const [updated] = await Asiento.update(req.body, { where: { id } });

    if (updated === 1) {
      const asiento = await Asiento.findByPk(id);
      res.send(asiento);
    } else {
      res.status(404).send({ message: `No se pudo actualizar el asiento con id=${id}.` });
    }
  } catch (err) {
    res.status(500).send({
      message: "Error al actualizar el asiento con id=" + req.params.id
    });
  }
};

// Eliminar un asiento por id
exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    const deleted = await Asiento.destroy({ where: { id } });

    if (deleted === 1) {
      res.send({ message: "Asiento eliminado correctamente." });
    } else {
      res.status(404).send({ message: `No se encontró el asiento con id=${id}` });
    }
  } catch (err) {
    res.status(500).send({
      message: "Error al eliminar el asiento con id=" + req.params.id
    });
  }
};

// Eliminar todos los asientos
exports.deleteAll = async (req, res) => {
  try {
    const deleted = await Asiento.destroy({ where: {}, truncate: false });
    res.send({ message: `${deleted} asientos fueron eliminados.` });
  } catch (err) {
    res.status(500).send({
      message: err.message || "Ocurrió un error al eliminar todos los asientos."
    });
  }
};

// Obtener todos los asientos de una sala específica
exports.findBySala = async (req, res) => {
  try {
    const { salaId } = req.params;

    if (!salaId) {
      return res.status(400).send({
        message: "Debes proporcionar un salaId en los parámetros."
      });
    }

    // Buscar los asientos por sala
    const asientos = await db.asientos.findAll({
      where: { salaId },
      order: [["numero", "ASC"]],
    });

    if (asientos.length === 0) {
      return res.status(404).send({
        message: `No se encontraron asientos para la sala con ID ${salaId}.`
      });
    }

    res.status(200).send({
      message: `Se encontraron ${asientos.length} asientos para la sala ${salaId}.`,
      asientos
    });
  } catch (err) {
    console.error("❌ Error al obtener los asientos:", err);
    res.status(500).send({
      message: err.message || "Ocurrió un error al obtener los asientos."
    });
  }
};

