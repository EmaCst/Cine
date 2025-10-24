// controllers/combo.controller.js
const db = require("../models");
const Combo = db.combos;

exports.create = async (req, res) => {
  try {
    const { nombre, descripcion, precio, imagen } = req.body;
    const combo = await Combo.create({ nombre, descripcion, precio, imagen });
    res.status(201).send(combo);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.findAll = async (req, res) => {
  try {
    const combos = await Combo.findAll();
    res.status(200).send(combos);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.findDisponibles = async (req, res) => {
  try {
    const combos = await Combo.findAll({ where: { estado: "disponible" } });
    res.status(200).send(combos);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.findOne = async (req, res) => {
  try {
    const combo = await Combo.findByPk(req.params.id);
    if (!combo) return res.status(404).send({ message: "Combo no encontrado." });
    res.status(200).send(combo);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    const updated = await Combo.update(req.body, { where: { id } });
    if (updated == 1) res.send({ message: "Combo actualizado correctamente." });
    else res.send({ message: "No se encontró el combo o no se modificó nada." });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.cambiarEstado = async (req, res) => {
  try {
    const id = req.params.id;
    const { estado } = req.body;

    if (!["disponible", "no_disponible"].includes(estado))
      return res.status(400).send({ message: "Estado inválido." });

    const combo = await Combo.findByPk(id);
    if (!combo) return res.status(404).send({ message: "Combo no encontrado." });

    combo.estado = estado;
    await combo.save();

    res.status(200).send({ message: `Estado actualizado a ${estado}.`, combo });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    const deleted = await Combo.destroy({ where: { id } });
    if (deleted == 1) res.send({ message: "Combo eliminado correctamente." });
    else res.send({ message: "No se encontró el combo." });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};
