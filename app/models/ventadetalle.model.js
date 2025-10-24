// models/ventadetalle.model.js
module.exports = (sequelize, Sequelize) => {
  const VentaDetalle = sequelize.define("ventadetalle", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    ventaId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    comboId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    cantidad: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    subtotal: {
      type: Sequelize.FLOAT,
      allowNull: false,
    }
  }, {
    tableName: "venta_detalles_comida",
    timestamps: false,
  });

  return VentaDetalle;
};
