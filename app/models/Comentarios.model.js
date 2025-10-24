module.exports = (sequelize, Sequelize) => {
  const Comentario = sequelize.define("comentario", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    usuarioId: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    peliculaId: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    comentario: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    fecha: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW
    }
  });

  return Comentario;
};
