import {
  getAllEncargados,
  createEncargadoWithAreas,
  assignEncargadoToAreas,
  removeEncargadoFromArea,
  getEncargadosByArea,
  getAreasByEncargado,
  deleteEncargado
} from '../services/encargados.service.js';
// Eliminar encargado por id
export const deleteEncargadoController = async (req, res) => {
  try {
    const { id } = req.params;
    await deleteEncargado(id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener todos los encargados
export const getAllEncargadosController = async (req, res) => {
  try {
    const encargados = await getAllEncargados();
    res.status(200).json(encargados);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Crear encargado y asignar áreas
export const createEncargadoWithAreasController = async (req, res) => {
  try {
    const { nombre, areaIds } = req.body;
    const encargado = await createEncargadoWithAreas(nombre, areaIds);
    res.status(201).json(encargado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Asignar encargado a áreas
export const assignEncargadoToAreasController = async (req, res) => {
  try {
    const { encargadoId, areaIds } = req.body;
    const encargado = await assignEncargadoToAreas(encargadoId, areaIds);
    res.status(200).json(encargado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Quitar encargado de un área
export const removeEncargadoFromAreaController = async (req, res) => {
  try {
    const { encargadoId, areaId } = req.body;
    const encargado = await removeEncargadoFromArea(encargadoId, areaId);
    res.status(200).json(encargado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener encargados por área
export const getEncargadosByAreaController = async (req, res) => {
  try {
    const { areaId } = req.params;
    const encargados = await getEncargadosByArea(areaId);
    res.status(200).json(encargados);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener áreas por encargado
export const getAreasByEncargadoController = async (req, res) => {
  try {
    const { encargadoId } = req.params;
    const areas = await getAreasByEncargado(encargadoId);
    res.status(200).json(areas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
