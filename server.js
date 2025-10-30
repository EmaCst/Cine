// Importamos el modulo express 
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require('dotenv').config();  // Carga las variables del .env

const app = express();

// ✅ Configuración actualizada de CORS
const allowedOrigins = [
  "http://localhost:5173", // desarrollo local
   "https://zona404cine.vercel.app"
];

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

const db = require("./app/models");
db.sequelize.sync();
// // drop the table if it already exists
// db.sequelize.sync({ force: true }).then(() => {
//   console.log("Drop and re-sync db.");
// });

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Bienvenido a nuestro Cine" });
});

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


// set port, listen for requests
const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
