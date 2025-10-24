const db = require("../models");
const Usuario = db.usuarios;
const Op = db.Sequelize.Op;

// Crear y guardar un nuevo Usuario
exports.create = (req, res) => {
  if (!req.body.nombre || !req.body.email || !req.body.password || !req.body.rol) {
    return res.status(400).json({
      message: "Faltan campos requeridos (nombre, email, password, rol)."
    });
  }

  const usuario = {
    nombre: req.body.nombre,
    email: req.body.email,
    password: req.body.password,
    rol: req.body.rol
  };

  Usuario.create(usuario)
    .then(data => res.status(201).json(data))
    .catch(err => {
      res.status(500).json({
        message: err.message || "Ocurrió un error al crear el Usuario."
      });
    });
};

// Obtener todos los usuarios
exports.findAll = (req, res) => {
  Usuario.findAll()
    .then(data => res.json(data))
    .catch(err => {
      res.status(500).json({
        message: err.message || "Ocurrió un error al obtener los usuarios."
      });
    });
};

// Obtener un usuario por ID
exports.findOne = (req, res) => {
  const id = req.params.id;

  Usuario.findByPk(id)
    .then(data => {
      if (data) {
        res.json(data);
      } else {
        res.status(404).json({ message: `No se encontró Usuario con id=${id}.` });
      }
    })
    .catch(err => {
      res.status(500).json({
        message: "Error al obtener Usuario con id=" + id
      });
    });
};

// Actualizar usuario por ID
exports.update = (req, res) => {
  const id = req.params.id;

  Usuario.update(req.body, { where: { id } })
    .then(num => {
      if (num == 1) {
        res.json({ message: "Usuario actualizado correctamente." });
      } else {
        res.status(404).json({
          message: `No se pudo actualizar Usuario con id=${id}.`
        });
      }
    })
    .catch(err => {
      res.status(500).json({
        message: "Error al actualizar Usuario con id=" + id
      });
    });
};

// Eliminar un usuario por ID
exports.delete = (req, res) => {
  const id = req.params.id;

  Usuario.destroy({ where: { id } })
    .then(num => {
      if (num == 1) {
        res.json({ message: "Usuario eliminado correctamente." });
      } else {
        res.status(404).json({
          message: `No se pudo eliminar Usuario con id=${id}.`
        });
      }
    })
    .catch(err => {
      res.status(500).json({
        message: "No se pudo eliminar Usuario con id=" + id
      });
    });
};

// Eliminar todos los usuarios
exports.deleteAll = (req, res) => {
  Usuario.destroy({ where: {}, truncate: false })
    .then(nums => {
      res.json({ message: `${nums} Usuarios eliminados correctamente.` });
    })
    .catch(err => {
      res.status(500).json({
        message: err.message || "Ocurrió un error al eliminar todos los usuarios."
      });
    });
};
