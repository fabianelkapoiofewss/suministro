import { Router } from "express";
import { actualizarSalidaController, crearSalidaController, obtenerSalidaPorArticuloController, obtenerSalidaPorFechaController, obtenerSalidasController } from "../controllers/salida.controller.js";

const SalidaRoute = Router();

SalidaRoute.post("/", crearSalidaController);
SalidaRoute.put("/:id", actualizarSalidaController);
SalidaRoute.get("/:articulo", obtenerSalidaPorArticuloController);
SalidaRoute.get("/:fecha", obtenerSalidaPorFechaController);
SalidaRoute.get("/", obtenerSalidasController);

export default SalidaRoute;