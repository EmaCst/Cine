const db = require("../models");
const Promocion = db.promociones;

// Crear promoción
exports.create = async (req, res) => {
  try {
    const { codigo, descripcion, descuento, activo } = req.body;

    if (!codigo || !descuento) {
      return res.status(400).send({ message: "Faltan campos obligatorios." });
    }

    const promo = await Promocion.create({
      codigo,
      descripcion,
      descuento,
      activo
    });

    res.status(201).send(promo);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Obtener todas las promociones
exports.findAll = async (req, res) => {
  try {
    const promos = await Promocion.findAll();
    res.status(200).send(promos);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Obtener promoción por ID
exports.findOne = async (req, res) => {
  try {
    const { id } = req.params;
    const promo = await Promocion.findByPk(id);

    if (!promo) return res.status(404).send({ message: "Promoción no encontrada." });

    res.status(200).send(promo);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Actualizar promoción
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await Promocion.update(req.body, { where: { id } });

    if (updated === 0) return res.status(404).send({ message: "Promoción no encontrada." });

    const promoUpdated = await Promocion.findByPk(id);
    res.status(200).send(promoUpdated);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Eliminar promoción
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Promocion.destroy({ where: { id } });

    if (!deleted) return res.status(404).send({ message: "Promoción no encontrada." });

    res.status(200).send({ message: "Promoción eliminada correctamente." });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};
