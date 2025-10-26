// models/pago.model.js
module.exports = (sequelize, Sequelize) => {
  const Pago = sequelize.define("pago", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    subtotal: {                   // <-- agregado
      type: Sequelize.FLOAT,
      allowNull: false,
      defaultValue: 0.0,
    },
    iva: {
      type: Sequelize.FLOAT,
      allowNull: false,
      defaultValue: 0.0,
    },
    descuento: {
      type: Sequelize.FLOAT,
      allowNull: false,
      defaultValue: 0.0,
    },
    totalPagar: {
      type: Sequelize.FLOAT,
      allowNull: false,
      defaultValue: 0.0,
    },
    metodoPago: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    estado: {
      type: Sequelize.ENUM("pendiente", "confirmado", "fallido"),
      defaultValue: "pendiente",
    },
    promocionId: {
      type: Sequelize.INTEGER,
      allowNull: true,
    }
  }, {
    tableName: "pagos",
    timestamps: false
  });

  Pago.associate = (models) => {
    Pago.belongsTo(models.promociones, { foreignKey: "promocionId" });
    Pago.hasMany(models.reservas, { foreignKey: "pagoId" }); // Un pago puede tener muchas reservas
  };

  return Pago;
};
