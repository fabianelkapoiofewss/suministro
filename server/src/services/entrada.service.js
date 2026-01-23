import { Entrada } from "../models/entrada.js";
import { Inventario } from "../models/inventario.js";


export const crearEntrada = async (data) => {
    const { articulo, cantidad, fecha, codigo } = data;
    try {
        let inventario = await Inventario.findOne({ where: { articulo } });
        if (!inventario) {
            // Si no existe, lo crea con la cantidad de la entrada y el código
            inventario = await Inventario.create({ articulo, cantidad, codigo, entrada: cantidad, salida: 0 });
        } else {
            await inventario.update({
                cantidad: inventario.cantidad + cantidad,
                entrada: inventario.entrada + cantidad
            });
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
        const entradas = await Entrada.findAll({ order: [['fecha', 'DESC']] });
        return entradas || [];
    } catch (error) {
        throw new Error("Error al obtener las entradas: " + error.message);
    }
};


export const editarEntrada = async (id, data) => {
    try {
        const entrada = await Entrada.findByPk(id);
        if (!entrada) {
            throw new Error("Entrada no encontrada");
        }

        const inventario = await Inventario.findOne({ where: { articulo: entrada.articulo } });
        if (!inventario) {
            throw new Error("Artículo no encontrado en inventario");
        }

        // Calcular la diferencia de cantidad
        const diferenciaCantidad = data.cantidad - entrada.cantidad;
        
        const { articulo, cantidad, fecha, codigo } = data;
        
        // Si cambió el nombre del artículo, actualizar inventario y salidas
        if (articulo !== entrada.articulo) {
            await inventario.update({ 
                articulo: articulo,
                codigo: codigo,
                cantidad: inventario.cantidad + diferenciaCantidad,
                entrada: inventario.entrada + diferenciaCantidad
            });
            
            // Actualizar todas las salidas con el código anterior
            const { Salida } = await import("../models/salida.js");
            await Salida.update(
                { articulo: articulo, codigo: codigo },
                { where: { codigo: entrada.codigo } }
            );
        } else {
            // Solo ajustar el inventario con la diferencia
            await inventario.update({ 
                codigo: codigo,
                cantidad: inventario.cantidad + diferenciaCantidad,
                entrada: inventario.entrada + diferenciaCantidad
            });
            
            // Si cambió el código, actualizar salidas
            if (codigo !== entrada.codigo) {
                const { Salida } = await import("../models/salida.js");
                await Salida.update(
                    { codigo: codigo },
                    { where: { codigo: entrada.codigo } }
                );
            }
        }
        
        await entrada.update({
            articulo,
            cantidad,
            fecha,
            codigo
        });
        
        return entrada;
    } catch (error) {
        throw new Error("Error al editar la entrada: " + error.message);
    }
};

export const eliminarEntrada = async (id) => {
    try {
        const entrada = await Entrada.findByPk(id);
        if (!entrada) {
            throw new Error("Entrada no encontrada");
        }

        // Buscar el inventario asociado
        const inventario = await Inventario.findOne({ where: { articulo: entrada.articulo } });
        
        if (inventario) {
            // Restar la cantidad del inventario (devolver la cantidad de la entrada)
            await inventario.update({
                cantidad: inventario.cantidad - entrada.cantidad,
                entrada: inventario.entrada - entrada.cantidad
            });
        }

        // Eliminar la entrada
        await entrada.destroy();
        
        return { message: "Entrada eliminada correctamente" };
    } catch (error) {
        throw new Error("Error al eliminar la entrada: " + error.message);
    }
};