import { crearSalida,
        actualizarSalida,
        obtenerSalidaPorArticulo,
        obtenerSalidaPorFecha,
        obtenerSalidas
 } from "../services/salida.service.js";


export const crearSalidaController = async (req, res) => {
    try {
        const { articulo, cantidad, codigo, area, destinatario } = req.body;
        if (!articulo || !cantidad || !codigo || !area || !destinatario) {
            return res.status(400).json({ error: "Faltan datos requeridos" });
        }
        const nuevaSalida = await crearSalida({ articulo, cantidad, codigo, area, destinatario });
        res.status(201).json(nuevaSalida);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


export const actualizarSalidaController = async (req, res) => {
    try {
        const { id } = req.params;
        const { articulo, cantidad, codigo, area, destinatario } = req.body;
        if (!articulo || !cantidad || !codigo || !area || !destinatario) {
            return res.status(400).json({ error: "Faltan datos requeridos" });
        }
        const salidaActualizada = await actualizarSalida(id, { articulo, cantidad, codigo, area, destinatario });
        res.status(200).json(salidaActualizada);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


export const obtenerSalidaPorArticuloController = async (req, res) => {
    try {
        const { articulo } = req.params;
        const salida = await obtenerSalidaPorArticulo(articulo);
        if (!salida) {
            return res.status(404).json({ error: "Salida no encontrada" });
        }
        res.status(200).json(salida);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


export const obtenerSalidaPorFechaController = async (req, res) => {
    try {
        const { fecha } = req.params;
        const salida = await obtenerSalidaPorFecha(fecha);
        if (!salida) {
            return res.status(404).json({ error: "Salida no encontrada" });
        }
        res.status(200).json(salida);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


export const obtenerSalidasController = async (req, res) => {
    try {
        const salidas = await obtenerSalidas();
        if (!salidas || salidas.length === 0) {
            return res.status(404).json({ error: "No se encontraron salidas" });
        }
        res.status(200).json(salidas);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};