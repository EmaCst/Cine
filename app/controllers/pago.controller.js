const db = require("../models");
const Pago = db.pagos;
const Reserva = db.reservas;
const Promocion = db.promociones;
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
  

// Crear pago (con múltiples reservas)
exports.create = async (req, res) => {
  try {
    const { reservaIds, metodoPago, promocionId } = req.body;

    if (!reservaIds || !Array.isArray(reservaIds) || reservaIds.length === 0 || !metodoPago) {
      return res.status(400).json({ message: "reservaIds (array) y metodoPago son requeridos." });
    }

    const reservas = await Reserva.findAll({ where: { id: reservaIds } });
    if (reservas.length !== reservaIds.length) {
      return res.status(404).json({ message: "Una o más reservas no fueron encontradas." });
    }

    // Calcular monto base
    let montoTotal = reservas.length * 50; // Precio fijo por boleto (puedes cambiarlo)

    // Aplicar promoción si existe y está activa
    if (promocionId) {
      const promo = await Promocion.findByPk(promocionId);
      if (promo && promo.activo) {
        montoTotal -= montoTotal * promo.descuento;
      }
    }

    // Crear pago en Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(montoTotal * 100), // Stripe usa centavos
      currency: "usd",
      payment_method_types: ["card"]
    });

    // Registrar el pago en la base de datos
    const nuevoPago = await Pago.create({
      montoTotal,
      metodoPago,
      estado: "pendiente",
      promocionId: promocionId || null
    });

    // Asociar reservas al pago
    await Reserva.update({ pagoId: nuevoPago.id }, { where: { id: reservaIds } });

    res.status(201).json({
      message: "Pago creado correctamente.",
      pago: nuevoPago,
      clientSecret: paymentIntent.client_secret
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al crear el pago", error: error.message });
  }
};

// Obtener todos los pagos
exports.findAll = async (req, res) => {
  try {
    const pagos = await Pago.findAll({
      include: [
        { model: Reserva },
        { model: Promocion, attributes: ["codigo", "descuento", "activo"] }
      ]
    });
    res.json(pagos);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener pagos", error: error.message });
  }
};

// Obtener un pago por ID
exports.findOne = async (req, res) => {
  try {
    const pago = await Pago.findByPk(req.params.id, {
      include: [
        { model: Reserva },
        { model: Promocion, attributes: ["codigo", "descuento", "activo"] }
      ]
    });

    if (!pago) return res.status(404).json({ message: "Pago no encontrado" });
    res.json(pago);
  } catch (error) {
    res.status(500).json({ message: "Error al buscar el pago", error: error.message });
  }
};

// Actualizar estado del pago
exports.update = async (req, res) => {
  try {
    const { estado } = req.body;

    if (!["pendiente", "confirmado", "fallido"].includes(estado)) {
      return res.status(400).json({ message: "Estado no válido." });
    }

    const pago = await Pago.findByPk(req.params.id);
    if (!pago) return res.status(404).json({ message: "Pago no encontrado." });

    await pago.update({ estado });
    res.json({ message: "Estado actualizado correctamente", pago });

  } catch (error) {
    res.status(500).json({ message: "Error al actualizar el estado", error: error.message });
  }
};

// Eliminar un pago
exports.delete = async (req, res) => {
  try {
    const deleted = await Pago.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ message: "Pago no encontrado." });

    res.json({ message: "Pago eliminado correctamente." });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar el pago", error: error.message });
  }
};

// Eliminar todos los pagos (opcional)
exports.deleteAll = async (req, res) => {
  try {
    await Pago.destroy({ where: {} });
    res.json({ message: "Todos los pagos han sido eliminados." });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar pagos", error: error.message });
  }
};
