// Importamos los módulos necesarios
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config(); // Carga las variables del .env

const app = express();

// ✅ Configuración de CORS
const allowedOrigins = [
  "http://localhost:5173", // Desarrollo local
  "https://zona404cine.vercel.app", // Frontend desplegado
];

const corsOptions = {
  origin: function (origin, callback) {
    // Permite solicitudes sin origen (por ejemplo, herramientas locales o Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn("CORS bloqueado para:", origin);
      callback(new Error("No permitido por CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};

app.use(cors(corsOptions));

// Middleware para parsear JSON y formularios
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Conexión a la base de datos
const db = require("./app/models");
db.sequelize
  .sync()
  .then(() => {
    console.log("✅ Base de datos sincronizada correctamente.");
  })
  .catch((err) => {
    console.error("❌ Error al sincronizar la base de datos:", err.message);
  });

// Ruta simple de prueba
app.get("/", (req, res) => {
  res.json({ message: "Bienvenido a nuestro Cine" });
});

// Importación de rutas
require("./app/routes/asiento.routes")(app);
require("./app/routes/sala.routes")(app);
require("./app/routes/usuario.routes")(app);
require("./app/routes/pelicula.routes")(app);
require("./app/routes/funcion.routes")(app);
require("./app/routes/reserva.routes")(app);
require("./app/routes/promocion.routes")(app);
require("./app/routes/pago.routes")(app);
require("./app/routes/combo.routes")(app);
require("./app/routes/venta.routes")(app);
require("./app/routes/sucursal.routes")(app);
require("./app/routes/Comentario.routes")(app);

const dashboardRoutes = require("./app/routes/Dashboard.routes");
app.use("/api/dashboard", dashboardRoutes);

// Puerto de conexión
const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});
