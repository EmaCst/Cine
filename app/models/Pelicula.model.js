module.exports = (sequelize, Sequelize) => {
  const Pelicula = sequelize.define("pelicula", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    titulo: {
      type: Sequelize.STRING(255),
      allowNull: false
    },
    genero: {
      type: Sequelize.STRING(255),
      allowNull: true
    },
    duracion: {
      type: Sequelize.INTEGER,
      allowNull: true
    },
    carteleraUrl: {
      type: Sequelize.STRING(500),
      allowNull: true
    },
    pais: {
      type: Sequelize.STRING(100),
      allowNull: true
    },
    anio: {
      type: Sequelize.INTEGER,
      allowNull: true
    },
    calificacion: {
      type: Sequelize.STRING(10),
      allowNull: true
    },
    sinopsis: {
      type: Sequelize.TEXT,
      allowNull: true
    },

  });

  return Pelicula;
};
