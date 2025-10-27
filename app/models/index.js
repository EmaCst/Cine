// usamos la función requiere para cargar el modulo db.config.js para traer los parametros preconfigurados de la BD
const dbConfig = require("../config/db.config.js");
// cargamos el modulo sequelize "ORM" para el manejo de las entidades como objetos. 
const Sequelize = require("sequelize");
// creamos una variable sequelize y la inicializamos como un Objeto Sequelize con la informacion de la BD 

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  dialectOptions: {
    ssl:{
      require: true,
      rejectUnauthorized: false
    }
  },
  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle,
    // si utilizamos una BD externa, probablemente nos pida ssl = true, cambios la linea de reject por la que esta comentada
    /* ssl:{ requiere: true}*/
    ssl: {
      rejectUnauthorized: false
    }
  }
});
// creamos un objeto db
const db = {};
// la variable db.Sequelize = modulo importado Sequelize que esta declarado previamente donde se importa el modulo
db.Sequelize = Sequelize;
// se define una variable con la configuracion de sequelize
db.sequelize = sequelize;
// se crea una variable clientes que importa el modelo que esta dentro de la carpeta models/cliente.model.js


// ================== IMPORTACIÓN DE MODELOS ==================
db.usuarios      = require("./usuario.model.js")(sequelize, Sequelize);
db.peliculas     = require("./Pelicula.model.js")(sequelize, Sequelize);
db.salas         = require("./Sala.model.js")(sequelize, Sequelize);
db.asientos      = require("./Asiento.model.js")(sequelize, Sequelize);
db.funciones     = require("./Funcion.model.js")(sequelize, Sequelize);
db.reservas      = require("./Reserva.model.js")(sequelize, Sequelize);
db.pagos         = require("./pago.model.js")(sequelize, Sequelize);
db.promociones   = require("./promocion.model.js")(sequelize, Sequelize);
db.combos        = require("./Combo.model.js")(sequelize, Sequelize);
db.ventas        = require("./venta.model.js")(sequelize, Sequelize);
db.ventadetalles = require("./ventadetalle.model.js")(sequelize, Sequelize);
db.sucursales    = require("./sucursal.model.js")(sequelize, Sequelize);
db.comentarios   = require("./Comentarios.model.js")(sequelize, Sequelize);

// === Relaciones de Pago ===
db.pagos.hasMany(db.reservas, { foreignKey: "pagoId", as: "reservasPago" }); // Alias usado para incluir reservas en pagos
db.reservas.belongsTo(db.pagos, { foreignKey: "pagoId", as: "pago" });

// Promociones
db.promociones.hasMany(db.pagos, { foreignKey: "promocionId", as: "pagosPromocion" });
db.pagos.belongsTo(db.promociones, { foreignKey: "promocionId", as: "promocion" });

// === Relaciones de Reserva ===
db.reservas.belongsTo(db.funciones, { foreignKey: "funcionId", as: "funcion" });
db.reservas.belongsTo(db.usuarios, { foreignKey: "usuarioId", as: "usuario" });
db.reservas.belongsTo(db.asientos, { foreignKey: "asientoId", as: "asiento" });

// === Relaciones de Función ===
db.funciones.belongsTo(db.peliculas, { foreignKey: "peliculaId", as: "pelicula" });
db.funciones.belongsTo(db.salas, { foreignKey: "salaId", as: "sala" });
db.funciones.hasMany(db.reservas, { foreignKey: "funcionId", as: "reservas" });

// === Relaciones de Asiento ===
db.asientos.belongsTo(db.salas, { foreignKey: "salaId", as: "sala" });
db.salas.hasMany(db.asientos, { foreignKey: "salaId", as: "asientos" });

// === Relaciones de Película ===
db.peliculas.hasMany(db.funciones, { foreignKey: "peliculaId", as: "funciones" });

// === Relaciones de Sala ===
db.salas.belongsTo(db.sucursales, { foreignKey: "sucursalId", as: "sucursal" });
db.sucursales.hasMany(db.salas, { foreignKey: "sucursalId", as: "salas" });

module.exports = db;
