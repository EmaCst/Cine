// models/funcion.model.js
module.exports = (sequelize, Sequelize) => {
  const Funcion = sequelize.define("funcion", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    fecha: {
      type: Sequelize.DATEONLY,
      allowNull: false,
    },
    hora: {
      type: Sequelize.TIME,
      allowNull: false,
    },
    idioma: {
      type: Sequelize.STRING(50),
      allowNull: true
    },
    subtitulos: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    },
    formato: {
      type: Sequelize.ENUM("2D", "3D"),
      allowNull: true
    },
    peliculaId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    salaId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    }
  }, {
    tableName: "funciones",
    timestamps: false
  });

  return Funcion;
};
