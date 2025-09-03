import { Router } from "express";
import EntradaRoute from "./entrada.route.js";
import SalidaRoute from "./salida.route.js";
import InventarioRoute from "./inventario.route.js";

const router = Router();

router.use("/entradas", EntradaRoute);
router.use("/salidas", SalidaRoute);
router.use("/inventarios", InventarioRoute);

export default router;