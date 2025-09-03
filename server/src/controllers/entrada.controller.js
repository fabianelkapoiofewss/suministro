import { crearEntrada,
        editarEntrada,
        obtenerEntradas
 } from "../services/entrada.service.js";


export const crearEntradaController = async (req, res) => {
    try {
        const { articulo, cantidad, codigo } = req.body;
        if (!articulo || !cantidad || !codigo) {
            return res.status(400).json({ error: "Faltan datos requeridos" });
        }
        const nuevaEntrada = await crearEntrada({ articulo, cantidad, codigo });
        res.status(201).json(nuevaEntrada);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


export const editarEntradaController = async (req, res) => {
    try {
        const { id } = req.params;
        const { articulo, cantidad, codigo } = req.body;
        if (!articulo || !cantidad || !codigo) {
            return res.status(400).json({ error: "Faltan datos requeridos" });
        }
        const entradaActualizada = await editarEntrada(id, { articulo, cantidad, codigo });
        res.status(200).json(entradaActualizada);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


export const obtenerEntradasController = async (req, res) => {
    try {
        const entradas = await obtenerEntradas();
        if (!entradas || entradas.length === 0) {
            return res.status(404).json({ error: "No se encontraron entradas" });
        }
        res.status(200).json(entradas);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};