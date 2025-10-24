module.exports = (sequelize, Sequelize) => {
  const Sala = sequelize.define("sala", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    filas: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    columnas: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    sucursalId: {
    type: Sequelize.INTEGER,
    allowNull: false, 
    }
  });


    Sala.associate = (models) => {
  Sala.hasMany(models.asientos, { foreignKey: "salaId", as: "asientos" });
};

  return Sala;
};
