import { Entrada } from "../models/entrada.js";
import { Inventario } from "../models/inventario.js";


export const crearEntrada = async (data) => {
    const { articulo, cantidad, fecha, codigo } = data;
    try {
        let inventario = await Inventario.findOne({ where: { articulo } });
        if (!inventario) {
            // Si no existe, lo crea con la cantidad de la entrada y el código
            inventario = await Inventario.create({ articulo, cantidad, codigo });
        } else {
            await inventario.update({ cantidad: inventario.cantidad + cantidad });
        }
        const nuevaEntrada = await Entrada.create({
            articulo,
            cantidad,
            fecha,
            codigo,
            inventarioId: inventario.id
        });
        return nuevaEntrada;
    } catch (error) {
        throw new Error("Error al crear la entrada: " + error.message);
    }
};

export const obtenerEntradas = async () => {
    try {
        const entradas = await Entrada.findAll({ order: [['createdAt', 'ASC']] });
        if (!entradas || entradas.length === 0) {
            throw new Error("No se encontraron entradas");
        }
        return entradas;
    } catch (error) {
        throw new Error("Error al obtener las entradas: " + error.message);
    }
};


export const editarEntrada = async (id, data) => {
    try {
        const inventario = await Inventario.findOne({ where: { articulo: data.articulo } });
        if (!inventario) {
            throw new Error("Artículo no encontrado en inventario");
        }
        const entrada = await Entrada.findByPk(id);
        if (!entrada) {
            throw new Error("Entrada no encontrada");
        }
        const { articulo, cantidad, fecha, codigo } = data;
        await entrada.update({
            articulo,
            cantidad,
            fecha,
            codigo
        });
        await inventario.update({ cantidad: inventario.cantidad + cantidad });
        return entrada;
    } catch (error) {
        throw new Error("Error al editar la entrada: " + error.message);
    }
};