// models/promocion.model.js
module.exports = (sequelize, Sequelize) => {
  const Promocion = sequelize.define("promocion", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    codigo: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true, // el código no se puede repetir
    },
    descripcion: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    descuento: {
      type: Sequelize.FLOAT, // porcentaje: ej 0.20 = 20%
      allowNull: false,
    },
    activo: {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
    }
  }, {
    tableName: "promociones",
    timestamps: false
  });

  return Promocion;
};
