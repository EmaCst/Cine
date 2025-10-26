const db = require("../models");
const Venta = db.ventas; // plural como en tu index.js
const VentaDetalle = db.ventadetalles;
const Combo = db.combos;

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { v4: uuidv4 } = require("uuid");

exports.create = async (req, res) => {
  try {
    const { usuarioId, combos, token } = req.body;
    // combos = [{ comboId, cantidad }]

    // Calcular total
    let total = 0;
    for (const item of combos) {
      const combo = await Combo.findByPk(item.comboId);
      if (!combo || combo.estado !== "disponible") {
        return res
          .status(400)
          .send({ message: `Combo no disponible: ID ${item.comboId}` });
      }
      total += combo.precio * item.cantidad;
    }

        // Calcular IVA (ej: 12%) sobre el total
    const iva = parseFloat((total * 0.12).toFixed(2));

    // Crear cargo en Stripe
    const charge = await stripe.charges.create({
      amount: Math.round(total * 100), // centavos
      currency: "gtq",
      description: "Venta de combos de comida",
      source: token.id,
    });

    // Crear venta con ticket
    const ticket = `TICKET-${uuidv4().slice(0, 8).toUpperCase()}`;
    const venta = await Venta.create({
      usuarioId,
      total,
      estadoPago: "pagado",
      ticketCodigo: ticket,
    });

    // Crear detalle
    for (const item of combos) {
      const combo = await Combo.findByPk(item.comboId);
      await VentaDetalle.create({
        ventaId: venta.id,
        comboId: combo.id,
        cantidad: item.cantidad,
        subtotal: combo.precio * item.cantidad,
      });
    }

    res.status(201).send({
      message: "Venta realizada correctamente.",
      venta,
      ticket: `Presente este código en caja: ${ticket}`,
    });
  } catch (error) {
    console.error("Error en venta:", error);
    res.status(500).send({ message: error.message });
  }
};
