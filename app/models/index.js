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

// Relaciones
db.peliculas.hasMany(db.comentarios, { as: "comentarios", foreignKey: "peliculaId" });
db.usuarios.hasMany(db.comentarios, { as: "comentarios", foreignKey: "usuarioId" });
db.comentarios.belongsTo(db.peliculas, { as: "pelicula", foreignKey: "peliculaId" });
db.comentarios.belongsTo(db.usuarios, { as: "usuario", foreignKey: "usuarioId" });


db.peliculas.hasMany(db.funciones, { as: "funciones", foreignKey: "peliculaId" });
db.funciones.belongsTo(db.peliculas, { as: "pelicula", foreignKey: "peliculaId" });

db.salas.hasMany(db.funciones, { as: "funciones", foreignKey: "salaId" });
db.funciones.belongsTo(db.salas, { as: "sala", foreignKey: "salaId" });

db.sucursales.hasMany(db.salas, { as: "salas", foreignKey: "sucursalId" });
db.salas.belongsTo(db.sucursales, { as: "sucursal", foreignKey: "sucursalId" });


// ================= RELACIONES RESERVAS =================

// Un usuario puede tener muchas reservas
db.usuarios.hasMany(db.reservas, { as: "reservas", foreignKey: "usuarioId" });
db.reservas.belongsTo(db.usuarios, { as: "usuario", foreignKey: "usuarioId" });

// Una función puede tener muchas reservas
db.funciones.hasMany(db.reservas, { as: "reservas", foreignKey: "funcionId" });
db.reservas.belongsTo(db.funciones, { as: "funcion", foreignKey: "funcionId" });

// Un asiento puede estar en muchas reservas (para distintas funciones)
db.asientos.hasMany(db.reservas, { as: "reservas", foreignKey: "asientoId" });
db.reservas.belongsTo(db.asientos, { as: "asiento", foreignKey: "asientoId" }); 
// ================= RELACIÓN SALA ↔ ASIENTO =================
db.salas.hasMany(db.asientos, { as: "asientos", foreignKey: "salaId" });
db.asientos.belongsTo(db.salas, { as: "sala", foreignKey: "salaId" });

module.exports = db;
