import { Inventario } from "../models/inventario.js";

export const crearInventario = async (data) => {
    const { articulo, cantidad, codigo } = data;
    try {
        const nuevoInventario = await Inventario.create({
            articulo,
            cantidad,
            codigo
        });
        return nuevoInventario;
    } catch (error) {
        throw new Error("Error al crear el inventario: " + error.message);
    }
};


export const obtenerInventarios = async () => {
    try {
        const inventarios = await Inventario.findAll({ order: [['articulo', 'ASC']] });
        return inventarios || [];
    } catch (error) {
        throw new Error("Error al obtener los inventarios: " + error.message);
    }
};

export const obtenerInventarioPorArticulo = async (articulo) => {
    try {
        const inventario = await Inventario.findOne({ where: { articulo } });
        if (!inventario) {
            throw new Error("Inventario no encontrado");
        }
        return inventario;
    } catch (error) {
        throw new Error("Error al obtener el inventario: " + error.message);
    }
};

export const actualizarInventario = async (id, data) => {
    try {
        const inventario = await Inventario.findByPk(id);
        if (!inventario) {
            throw new Error("Inventario no encontrado");
        }
        const { articulo, cantidad, codigo } = data;
        await inventario.update({
            articulo,
            cantidad,
            codigo
        });
        return inventario;
    } catch (error) {
        throw new Error("Error al actualizar el inventario: " + error.message);
    }
};


export const eliminarInventario = async (id) => {
    try {
        const inventario = await Inventario.findByPk(id);
        if (!inventario) {
            throw new Error("Inventario no encontrado");
        }
        await inventario.destroy();
        return { message: "Inventario eliminado correctamente" };
    } catch (error) {
        throw new Error("Error al eliminar el inventario: " + error.message);
    }
};

export const bulkCrearInventario = async (dataArray) => {
    try {
        for (const row of dataArray) {
            if (!row.articulo || !row.codigo) continue;

            // Buscar si el artículo ya existe
            const existente = await Inventario.findOne({ where: { articulo: row.articulo } });

            // Si el Excel trae entrada/salida, usarlas. Si no, usar cantidad como entrada y salida 0.
            const entrada = typeof row.entrada === 'number' ? row.entrada : (typeof row.entrada === 'string' ? Number(row.entrada) : (typeof row.cantidad === 'number' ? row.cantidad : 0));
            const salida = typeof row.salida === 'number' ? row.salida : (typeof row.salida === 'string' ? Number(row.salida) : 0);
            const cantidad = entrada - salida;

            if (existente) {
                // Actualizar los valores
                await existente.update({
                    cantidad,
                    entrada,
                    salida,
                    codigo: row.codigo
                });
            } else {
                await Inventario.create({
                    articulo: row.articulo,
                    cantidad,
                    entrada,
                    salida,
                    codigo: row.codigo
                });
            }
        }
    } catch (error) {
        throw new Error("Error al procesar el archivo: " + error.message);
    }
};