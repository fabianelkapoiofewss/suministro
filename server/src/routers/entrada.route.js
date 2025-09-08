import { Router } from "express";
import { crearEntradaController, editarEntradaController, obtenerEntradasController } from "../controllers/entrada.controller.js";
import multer from 'multer';
import { uploadExcelEntradasController } from '../controllers/entrada.controller.js';
const upload = multer({ storage: multer.memoryStorage() });

const EntradaRoute = Router();

EntradaRoute.post("/", crearEntradaController);
EntradaRoute.put("/:id", editarEntradaController);
EntradaRoute.get("/", obtenerEntradasController);
EntradaRoute.post("/upload", upload.single('file'), uploadExcelEntradasController);

export default EntradaRoute;