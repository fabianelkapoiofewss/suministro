import { Router } from "express";
import { crearInventarioController, eliminarInventarioController, obtenerInventarioPorArticuloController, obtenerInventariosController, updateInventario, uploadExcelInventarioController, importRegistro, buscarInventariosController } from "../controllers/inventario.controller.js";

import multer from 'multer';
const upload = multer({ storage: multer.memoryStorage() });

const InventarioRoute = Router();

InventarioRoute.post("/", crearInventarioController);
InventarioRoute.post("/upload", upload.single('file'), uploadExcelInventarioController);
InventarioRoute.get("/search", buscarInventariosController); // Ruta de búsqueda debe ir antes de /:articulo
InventarioRoute.delete("/:id", eliminarInventarioController);
InventarioRoute.get("/:articulo", obtenerInventarioPorArticuloController);
InventarioRoute.get("/", obtenerInventariosController);
InventarioRoute.put("/:id", updateInventario);
InventarioRoute.post("/import-registro", upload.single("file"), importRegistro);
export default InventarioRoute;