const db = require("../models");
const Sala = db.salas;
const Sucursal = db.sucursales;

// Crear y guardar una nueva Sala
exports.create = async (req, res) => {
  try {
    const { nombre, filas, columnas, sucursalId, capacidad } = req.body;

    // Validar campos requeridos
    if (!nombre || !filas || !columnas || !sucursalId) {
      return res.status(400).send({
        message: "Faltan datos obligatorios: nombre, filas, columnas o sucursalId.",
      });
    }

    // Verificar si la sucursal existe antes de crear la sala
    const sucursal = await Sucursal.findByPk(sucursalId);
    if (!sucursal) {
      return res.status(404).send({
        message: `No se puede crear la sala: no existe una sucursal con el ID ${sucursalId}.`,
      });
    }

    // Crear la sala
    const nuevaSala = await Sala.create({
      nombre,
      filas,
      columnas,
      sucursalId,
      capacidad: capacidad ?? filas * columnas, // Calcula si no se envía
    });

    res.status(201).send({
      message: "Sala creada correctamente.",
      sala: nuevaSala,
    });
  } catch (err) {
    console.error("❌ Error al crear la sala:", err);
    res.status(500).send({
      message: err.message || "Ocurrió un error al crear la Sala.",
    });
  }
};

// Obtener todas las Salas
exports.findAll = (req, res) => {
  const nombre = req.query.nombre;
  let condition = nombre ? { nombre: { [Op.iLike]: `%${nombre}%` } } : null;

  Sala.findAll({ where: condition })
    .then(data => res.send(data))
    .catch(err => {
      res.status(500).send({
        message: err.message || "Ocurrió un error al obtener las salas."
      });
    });
};

// Obtener una Sala por ID
exports.findOne = (req, res) => {
  const id = req.params.id;

  Sala.findByPk(id)
    .then(data => {
      if (data) res.send(data);
      else {
        res.status(404).send({
          message: `No se encontró Sala con id=${id}.`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error al obtener Sala con id=" + id
      });
    });
};

// Actualizar una Sala por ID
exports.update = (req, res) => {
  const id = req.params.id;

  Sala.update(req.body, { where: { id: id } })
    .then(num => {
      if (num == 1) res.send({ message: "Sala actualizada correctamente." });
      else {
        res.send({
          message: `No se pudo actualizar Sala con id=${id}. Tal vez no fue encontrada o req.body está vacío.`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error al actualizar Sala con id=" + id
      });
    });
};

// Eliminar una Sala por ID
exports.delete = (req, res) => {
  const id = req.params.id;

  Sala.destroy({ where: { id: id } })
    .then(num => {
      if (num == 1) res.send({ message: "Sala eliminada correctamente." });
      else {
        res.send({
          message: `No se pudo eliminar Sala con id=${id}. Tal vez no fue encontrada.`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "No se pudo eliminar Sala con id=" + id
      });
    });
};

// Eliminar todas las Salas
exports.deleteAll = (req, res) => {
  Sala.destroy({ where: {}, truncate: false })
    .then(nums => {
      res.send({ message: `${nums} Salas fueron eliminadas correctamente.` });
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Ocurrió un error al eliminar todas las salas."
      });
    });
};
