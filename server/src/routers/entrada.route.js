import { Router } from "express";
import { crearEntradaController, editarEntradaController, obtenerEntradasController } from "../controllers/entrada.controller.js";

const EntradaRoute = Router();

EntradaRoute.post("/", crearEntradaController);
EntradaRoute.put("/:id", editarEntradaController);
EntradaRoute.get("/", obtenerEntradasController);

export default EntradaRoute;