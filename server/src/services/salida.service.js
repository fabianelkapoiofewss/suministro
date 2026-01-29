import { Salida } from "../models/salida.js";
import { Inventario } from "../models/inventario.js";
import { Areas } from "../models/areas.js";
import { Encargados } from "../models/encargados.js";
import { Sequelize } from "sequelize";


export const crearSalida = async (data) => {
    const { articulo, cantidad, fecha, area, areaId, destinatario, destinatarioId, destinatarioIsNew, codigo } = data;
    try {
        // 1. Buscar o crear el área si no existe
        let areaIdFinal = areaId;
        if (!areaId && area) {
            // Buscar área por nombre (case insensitive)
            let areaExistente = await Areas.findOne({
                where: Sequelize.where(
                    Sequelize.fn('LOWER', Sequelize.col('nombre')),
                    Sequelize.fn('LOWER', area.trim())
                )
            });
            
            if (!areaExistente) {
                // Crear área nueva
                areaExistente = await Areas.create({ nombre: area.trim() });
            }
            areaIdFinal = areaExistente.id;
        }

        // 2. Buscar o crear el encargado si no existe
        let encargadoIdFinal = destinatarioId;
        if (!destinatarioId && destinatario) {
            // Buscar encargado por nombre (case insensitive)
            let encargadoExistente = await Encargados.findOne({
                where: Sequelize.where(
                    Sequelize.fn('LOWER', Sequelize.col('nombre')),
                    Sequelize.fn('LOWER', destinatario.trim())
                )
            });
            
            if (!encargadoExistente) {
                // Crear encargado nuevo
                encargadoExistente = await Encargados.create({ nombre: destinatario.trim() });
            }
            encargadoIdFinal = encargadoExistente.id;
            
            // Asociar el encargado al área si ambos existen
            if (areaIdFinal) {
                await encargadoExistente.addArea(areaIdFinal);
            }
        } else if (destinatarioId && areaIdFinal) {
            // Si se seleccionó un encargado existente, asegurarse de que esté asociado al área
            const encargado = await Encargados.findByPk(destinatarioId);
            if (encargado) {
                const areas = await encargado.getAreas();
                const yaAsociado = areas.some(a => a.id === Number(areaIdFinal));
                if (!yaAsociado) {
                    await encargado.addArea(areaIdFinal);
                }
            }
        }

        // 3. Buscar el artículo en inventario
        let inventario = await Inventario.findOne({ where: { articulo } });
        
        let inventarioId = null;
        let codigoFinal = codigo || 'S/C';
        
        if (!inventario) {
            // Si no existe, crear el producto en inventario con cantidad 0
            inventario = await Inventario.create({
                articulo,
                codigo: codigoFinal,
                cantidad: 0,
                entrada: 0,
                salida: 0
            });
            inventarioId = inventario.id;
        } else {
            inventarioId = inventario.id;
            codigoFinal = codigo || inventario.codigo;
        }
        
        // 4. Actualizar inventario (restar cantidad y aumentar salida)
        await inventario.update({
            cantidad: inventario.cantidad - cantidad,
            salida: inventario.salida + cantidad
        });
        
        // 5. Crear la salida
        const nuevaSalida = await Salida.create({
            articulo,
            cantidad,
            codigo: codigoFinal,
            fecha,
            area: area || '',
            destinatario: destinatario || '',
            inventarioId
        });
        
        return nuevaSalida;
    } catch (error) {
        throw new Error("Error al crear la salida: " + error.message);
    }
};

export const obtenerSalidas = async () => {
    try {
        const salidas = await Salida.findAll({ order: [['fecha', 'DESC']] });
        return salidas || [];
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

export const eliminarSalida = async (id) => {
    try {
        const salida = await Salida.findByPk(id);
        if (!salida) {
            throw new Error("Salida no encontrada");
        }

        // Buscar el inventario asociado
        const inventario = await Inventario.findOne({ where: { articulo: salida.articulo } });
        
        if (inventario) {
            // Devolver la cantidad al inventario (sumar la cantidad de la salida)
            await inventario.update({
                cantidad: inventario.cantidad + salida.cantidad,
                salida: inventario.salida - salida.cantidad
            });
        }

        // Eliminar la salida
        await salida.destroy();
        
        return { message: "Salida eliminada correctamente" };
    } catch (error) {
        throw new Error("Error al eliminar la salida: " + error.message);
    }
};