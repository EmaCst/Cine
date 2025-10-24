const db = require("../models");
const Reserva = db.reservas;

// Crear una reserva
exports.create = async (req, res) => {
  try {
    const { usuarioId, funcionId, asientoId } = req.body;

    if (!usuarioId || !funcionId || !asientoId) {
      return res.status(400).json({ message: "Faltan campos obligatorios." });
    }

    // Validar existencia de entidades
    const [usuario, funcion, asiento] = await Promise.all([
      db.usuarios.findByPk(usuarioId),
      db.funciones.findByPk(funcionId),
      db.asientos.findByPk(asientoId)
    ]);

    if (!usuario) return res.status(404).json({ message: "Usuario no encontrado." });
    if (!funcion) return res.status(404).json({ message: "Función no encontrada." });
    if (!asiento) return res.status(404).json({ message: "Asiento no encontrado." });

    // Verificar que el asiento no esté reservado para esa función
    const yaReservado = await db.reservas.findOne({
      where: {
        funcionId,
        asientoId
      }
    });

    if (yaReservado) {
      return res.status(409).json({ message: "Ese asiento ya está reservado para esta función." });
    }

    // Crear reserva (estado: pendiente, sin pagoId aún)
    const nuevaReserva = await Reserva.create({
      usuarioId,
      funcionId,
      asientoId,
      estado: "pendiente",
      pagoId: null
    });

    res.status(201).json(nuevaReserva);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Obtener todas las reservas
exports.findAll = async (req, res) => {
  try {
    const reservas = await Reserva.findAll({
      include: [
        { model: db.usuarios, as: "usuario", attributes: ["id", "nombre", "email"] },
        { model: db.funciones, as: "funcion", attributes: ["id", "fecha", "hora"] },
        {
          model: db.asientos,
          as: "asiento",
          attributes: ["id", "numero", "salaId"],
          include: [
            {
              model: db.salas,
              attributes: ["id", "nombre", "filas", "columnas"]
            }
          ]
        }
      ]
    });
    res.json(reservas);
  } catch (err) {
    console.error("Error en findAll reservas:", err);
    res.status(500).json({ message: err.message });
  }
};

// Obtener una reserva por ID
exports.findOne = async (req, res) => {
  try {
    const reserva = await Reserva.findByPk(req.params.id, {
      include: [
        { model: db.usuarios, as: "usuario", attributes: ["id", "nombre", "email"] },
        { model: db.funciones, as: "funcion", attributes: ["id", "fecha", "hora"] },
        {
          model: db.asientos,
          as: "asiento",
          attributes: ["id", "numero", "salaId"],
          include: [
            {
              model: db.salas,
              attributes: ["id", "nombre", "filas", "columnas"]
            }
          ]
        }
      ]
    });

    if (!reserva) {
      return res.status(404).json({ message: "Reserva no encontrada" });
    }
    res.json(reserva);
  } catch (err) {
    console.error("Error en findOne reserva:", err);
    res.status(500).json({ message: err.message });
  }
};


// Actualizar una reserva (solo si está pendiente)
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { usuarioId, funcionId, asientoId } = req.body;

    const reserva = await Reserva.findByPk(id);
    if (!reserva) {
      return res.status(404).json({ message: "Reserva no encontrada." });
    }

    if (reserva.estado === "confirmado") {
      return res.status(400).json({ message: "No se puede modificar una reserva confirmada." });
    }

    // Validar que el asiento no esté ya reservado para esa función
    const yaReservado = await db.reservas.findOne({
      where: {
        funcionId,
        asientoId,
        id: { [db.Sequelize.Op.ne]: id } // Excluir la misma reserva
      }
    });

    if (yaReservado) {
      return res.status(409).json({ message: "Ese asiento ya está reservado para esta función." });
    }

    await reserva.update({ usuarioId, funcionId, asientoId });
    res.json(reserva);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Eliminar una reserva
exports.delete = async (req, res) => {
  try {
    const result = await Reserva.destroy({ where: { id: req.params.id } });
    if (result === 0) {
      return res.status(404).json({ message: "Reserva no encontrada" });
    }
    res.json({ message: "Reserva eliminada exitosamente" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Eliminar todas las reservas (solo admin, opcional)
exports.deleteAll = async (req, res) => {
  try {
    await Reserva.destroy({ where: {} });
    res.json({ message: "Todas las reservas eliminadas" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
