// models/reserva.model.js
module.exports = (sequelize, Sequelize) => {
  const Reserva = sequelize.define("reserva", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    usuarioId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    funcionId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    asientoId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    pagoId: {
      type: Sequelize.INTEGER,
      allowNull: true, // null hasta que se pague
    },
    estado: {
      type: Sequelize.ENUM("pendiente", "confirmado", "cancelado"),
      defaultValue: "pendiente"
    }
  }, {
    tableName: "reservas",
    timestamps: false
  });

  Reserva.associate = (models) => {
    Reserva.belongsTo(models.usuarios, { foreignKey: "usuarioId" });
    Reserva.belongsTo(models.funciones, { foreignKey: "funcionId" });
    Reserva.belongsTo(models.asientos, { foreignKey: "asientoId" });
    Reserva.belongsTo(models.pagos, { foreignKey: "pagoId" }); // Relación hacia el pago
  };

  return Reserva;
};
