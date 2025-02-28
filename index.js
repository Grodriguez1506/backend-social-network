import express from "express";
import connectDb from "./database/db.js";
import userRoutes from "./routes/user.routes.js";
import followRoutes from "./routes/follow.routes.js";
import publicationRoutes from "./routes/publication.routes.js";
import cookieParser from "cookie-parser";
import cors from "cors";

// Metodo para conectar a la base de datos
connectDb();

// Instanciar el modulo express
const app = express();

// Definir el puerto
const port = process.env.PORT || 3000;

// Configuracion para procesar los datos en JSON
app.use(express.json());

// Configuración para procesar los datos enviados por formularios
app.use(express.urlencoded({ extended: true }));

// Middleware para leer las cookies
app.use(cookieParser());

// Configuración de cors para acceder a las cookies desde el frontend
app.use(
  cors({
    origin: process.env.FRONTEND_DOMAIN,
    credentials: true,
  })
);

// Utilizar rutas desde los controladores
app.use("/api", userRoutes);
app.use("/api", followRoutes);
app.use("/api", publicationRoutes);

// Escuchar el puerto configurado
app.listen(port, () => {
  console.log("Server runing on port", port);
});
