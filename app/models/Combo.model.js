// models/combo.model.js
module.exports = (sequelize, Sequelize) => {
  const Combo = sequelize.define("combo", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    descripcion: {
      type: Sequelize.STRING,
    },
    precio: {
      type: Sequelize.FLOAT,
      allowNull: false,
    },
    imagen: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    estado: {
      type: Sequelize.ENUM("disponible", "no_disponible"),
      defaultValue: "disponible",
    }
  }, {
    tableName: "combos",
    timestamps: false,
  });

  return Combo;
};
