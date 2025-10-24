// models/venta.model.js
module.exports = (sequelize, Sequelize) => {
  const Venta = sequelize.define("venta", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    usuarioId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    total: {
      type: Sequelize.FLOAT,
      allowNull: false,
    },
    fecha: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
    },
    estadoPago: {
      type: Sequelize.ENUM("pendiente", "pagado"),
      defaultValue: "pendiente",
    },
    ticketCodigo: {
      type: Sequelize.STRING,
      allowNull: true,
    }
  }, {
    tableName: "ventas_comida",
    timestamps: false,
  });

  return Venta;
};
