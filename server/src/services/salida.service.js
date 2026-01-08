import { Salida } from "../models/salida.js";
import { Inventario } from "../models/inventario.js";


export const crearSalida = async (data) => {
    const { articulo, cantidad, fecha, area, destinatario, codigo } = data;
    try {
        const inventario = await Inventario.findOne({ where: { articulo } });
        if (!inventario) {
            throw new Error("Artículo no encontrado en inventario");
        }
        if (inventario.cantidad < cantidad) {
            throw new Error("Cantidad insuficiente en inventario");
        }
        const nuevaSalida = await Salida.create({
            articulo,
            cantidad,
            codigo: codigo || inventario.codigo,
            fecha,
            area,
            destinatario,
            inventarioId: inventario.id
        });
        await inventario.update({
            cantidad: inventario.cantidad - cantidad,
            salida: inventario.salida + cantidad
        });
        return nuevaSalida;
    } catch (error) {
        throw new Error("Error al crear la salida: " + error.message);
    }
};

export const obtenerSalidas = async () => {
    try {
        const salidas = await Salida.findAll({ order: [['fecha', 'DESC']] });
        if (!salidas || salidas.length === 0) {
            throw new Error("No se encontraron salidas");
        }
        return salidas;
    } catch (error) {
        throw new Error("Error al obtener las salidas: " + error.message);
    }
};

export const obtenerSalidaPorFecha = async (fecha) => {
    try {
        const salida = await Salida.findOne({ where: { fecha } });
        if (!salida) {
            throw new Error("Salida no encontrada");
        }
        return salida;
    } catch (error) {
        throw new Error("Error al obtener la salida: " + error.message);
    }
};

export const obtenerSalidaPorArticulo = async (articulo) => {
    try {
        const salida = await Salida.findOne({ where: { articulo } });
        if (!salida) {
            throw new Error("Salida no encontrada");
        }
        return salida;
    } catch (error) {
        throw new Error("Error al obtener la salida: " + error.message);
    }
};

export const actualizarSalida = async (id, data) => {
    try {
        const salida = await Salida.findByPk(id);
        if (!salida) {
            throw new Error("Salida no encontrada");
        }

        const inventario = await Inventario.findOne({ where: { articulo: data.articulo } });
        if (!inventario) {
            throw new Error("Artículo no encontrado en inventario");
        }

        // Calcular la diferencia de cantidad
        const diferenciaCantidad = data.cantidad - salida.cantidad;
        
        // Verificar si hay suficiente inventario para el incremento
        if (diferenciaCantidad > 0 && inventario.cantidad < diferenciaCantidad) {
            throw new Error("Cantidad insuficiente en inventario");
        }

        // Actualizar la salida
        const { articulo, cantidad, fecha, area, destinatario } = data;
        await salida.update({
            articulo,
            cantidad,
            fecha,
            area,
            destinatario
        });

        // Ajustar el inventario (restar la diferencia)
        await inventario.update({ cantidad: inventario.cantidad - diferenciaCantidad });
        
        return salida;
    } catch (error) {
        throw new Error("Error al actualizar la salida: " + error.message);
    }
};