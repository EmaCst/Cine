const db = require("../models");
const Pago = db.pagos;
const Reserva = db.reservas;
const Promocion = db.promociones;
const Funcion = db.funciones;
const Pelicula = db.peliculas;
const Sala = db.salas;
const Asiento = db.asientos;
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
  

// Crear pago (con múltiples reservas, cálculo de IVA, descuento y tickets)
exports.create = async (req, res) => {
  try {
    const { reservaIds, metodoPago, promocionId } = req.body;

    if (!reservaIds || !Array.isArray(reservaIds) || reservaIds.length === 0 || !metodoPago) {
      return res.status(400).json({ message: "reservaIds (array) y metodoPago son requeridos." });
    }

    // Obtener reservas junto con funcion, pelicula, sala y asiento
    const reservas = await Reserva.findAll({
      where: { id: reservaIds },
      include: [
        { 
          model: db.funciones, 
          as: "funcion",
          include: [
            { model: db.peliculas, as: "pelicula", attributes: ["titulo"] },
            { model: db.salas, as: "sala", attributes: ["nombre"] }
          ]
        },
        { model: db.asientos, as: "asiento", attributes: ["numero"] }
      ]
    });

    if (reservas.length !== reservaIds.length) {
      return res.status(404).json({ message: "Una o más reservas no fueron encontradas." });
    }

    // Calcular subtotal sumando precio de cada función (sin IVA)
    let subtotal = 0;
    for (const r of reservas) {
      if (r.funcion && r.funcion.precio != null) {
        subtotal += parseFloat(r.funcion.precio);
      } else {
        return res.status(400).json({ message: `Reserva ${r.id} tiene función sin precio definido.` });
      }
    }

    // Calcular IVA (ej: 12%) sobre el subtotal
    const iva = parseFloat((subtotal * 0.12).toFixed(2));

    // Calcular descuento
    let descuento = 0;
    if (promocionId) {
      const promo = await Promocion.findByPk(promocionId);
      if (promo && promo.activo) {
        descuento = parseFloat((subtotal * promo.descuento).toFixed(2));
      }
    }

    // Total a pagar = subtotal + IVA - descuento
    const totalPagar = parseFloat((subtotal - descuento).toFixed(2));

    // Crear pago en Stripe
    const paymentIntent = await stripe.paym.entIntents.create({
      amount: Math.round(totalPagar * 100), // Stripe usa centavos
      currency: "gtq",
      payment_method_types: ["card"]
    });

    // Registrar el pago en la base de datos
    const nuevoPago = await Pago.create({
      subtotal,
      iva,
      descuento,
      totalPagar,
      metodoPago,
      estado: "pendiente",
      promocionId: promocionId || null
    });

    // Asociar reservas al pago y actualizar estado
    await Reserva.update(
      { pagoId: nuevoPago.id, estado: "confirmado" },
      { where: { id: reservaIds } }
    );

    // Generar tickets
    const tickets = reservas.map(r => ({
      asiento: r.asiento.numero,
      pelicula: r.funcion.pelicula.titulo,
      fecha: r.funcion.fecha,
      hora: r.funcion.hora,
      formato: r.funcion.formato,
      idioma: r.funcion.idioma,
      subtitulos: r.funcion.subtitulos,
      sala: r.funcion.sala.nombre
    }));

    res.status(201).json({
      message: "Pago creado correctamente.",
      pago: nuevoPago,
      tickets,
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
