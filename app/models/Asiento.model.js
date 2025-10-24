// models/asiento.model.js
module.exports = (sequelize, Sequelize) => {
  const Asiento = sequelize.define("asiento", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    numero: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    salaId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    }
  }, {
    tableName: "asientos",
    timestamps: false
  });

  Asiento.associate = (models) => {
  Asiento.belongsTo(models.salas, { foreignKey: "salaId", as: "sala" });
};
  return Asiento;


};
