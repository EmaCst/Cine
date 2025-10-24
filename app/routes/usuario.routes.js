const express = require("express");
const router = express.Router();
const usuarios = require("../controllers/usuario.controller.js");
module.exports = app=>{
// Crear nuevo usuario
router.post("/create", usuarios.create);

// Obtener todos los usuarios
router.get("/", usuarios.findAll);

// Obtener usuario por ID
router.get("/:id", usuarios.findOne);

// Actualizar usuario por ID
router.put("/:id", usuarios.update);

// Eliminar usuario por ID
router.delete("/:id", usuarios.delete);

// Eliminar todos los usuarios
router.delete("/", usuarios.deleteAll);
app.use("/api/usuario", router);

};