import { crearInventario, 
        actualizarInventario, 
        eliminarInventario, 
        obtenerInventarioPorArticulo, 
        obtenerInventarios 
} from "../services/inventario.service.js";


export const crearInventarioController = async (req, res) => {
    try {
        const { articulo, cantidad, codigo } = req.body;
        if (!articulo || !cantidad || !codigo) {
            return res.status(400).json({ error: "Faltan datos requeridos" });
        }
        const nuevoInventario = await crearInventario({ articulo, cantidad, codigo });
        res.status(201).json(nuevoInventario);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


export const updateInventario = async (req, res) => {
    try {
        const { id } = req.params;
        const { articulo, cantidad, codigo } = req.body;
        if (!articulo || !cantidad || !codigo) {
            return res.status(400).json({ error: "Faltan datos requeridos" });
        }
        const inventarioActualizado = await actualizarInventario(id, { articulo, cantidad, codigo });
        res.status(200).json(inventarioActualizado);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


export const eliminarInventarioController = async (req, res) => {
    try {
        const { id } = req.params;
        await eliminarInventario(id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const obtenerInventarioPorArticuloController = async (req, res) => {
    try {
        const { articulo } = req.params;
        const inventario = await obtenerInventarioPorArticulo(articulo);
        if (!inventario) {
            return res.status(404).json({ error: "Artículo no encontrado" });
        }
        res.status(200).json(inventario);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


export const obtenerInventariosController = async (req, res) => {
    try {
        const inventarios = await obtenerInventarios();
        if (!inventarios || inventarios.length === 0) {
            return res.status(404).json({ error: "No se encontraron inventarios" });
        }
        res.status(200).json(inventarios);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};