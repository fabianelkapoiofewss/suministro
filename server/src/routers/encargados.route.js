import { Router } from 'express';
import {
  getAllEncargadosController,
  createEncargadoWithAreasController,
  assignEncargadoToAreasController,
  removeEncargadoFromAreaController,
  getEncargadosByAreaController,
  getAreasByEncargadoController,
  deleteEncargadoController
} from '../controllers/encargados.controller.js';

const router = Router();

router.get('/', getAllEncargadosController);
router.post('/', createEncargadoWithAreasController);
router.post('/assign', assignEncargadoToAreasController);
router.post('/remove', removeEncargadoFromAreaController);
router.get('/area/:areaId', getEncargadosByAreaController);
router.get('/encargado/:encargadoId', getAreasByEncargadoController);
router.delete('/encargado/:id', deleteEncargadoController);

export default router;
