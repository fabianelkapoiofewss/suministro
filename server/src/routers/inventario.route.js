import { Router } from "express";
import { crearInventarioController, eliminarInventarioController, obtenerInventarioPorArticuloController, obtenerInventariosController, updateInventario } from "../controllers/inventario.controller.js";

const InventarioRoute = Router();

InventarioRoute.post("/", crearInventarioController);
InventarioRoute.delete("/:id", eliminarInventarioController);
InventarioRoute.get("/:articulo", obtenerInventarioPorArticuloController);
InventarioRoute.get("/", obtenerInventariosController);
InventarioRoute.put("/:id", updateInventario);

export default InventarioRoute;