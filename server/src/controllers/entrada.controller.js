import { crearEntrada,
        editarEntrada,
        obtenerEntradas,
        eliminarEntrada
 } from "../services/entrada.service.js";
import xlsx from "xlsx";
import { Entrada } from "../models/entrada.js";

export const uploadExcelEntradasController = async (req, res) => {
    try {
            if (!req.file) {
                return res.status(400).json({ error: "No se subió ningún archivo" });
            }

            // Eliminar todas las entradas existentes
            await Entrada.destroy({ where: {}, truncate: true });

            const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
            const sheetName = workbook.SheetNames.find(name => name.toUpperCase() === "ENTRADAS");
            if (!sheetName) {
                return res.status(400).json({ error: "El archivo no contiene la hoja ENTRADAS" });
            }

            const sheet = workbook.Sheets[sheetName];
            const rows = xlsx.utils.sheet_to_json(sheet, { defval: "" });
            let count = 0;
            for (const row of rows) {
                const codigo = row["CODIGO"] || row["Código"] || row["codigo"];
                const articulo = row["DESCRIPCION"] || row["Descripción"] || row["descripcion"];
                let cantidad = row["CANTIDAD"] || row["Cantidad"] || row["cantidad"];
                let fecha = row["FECHA"] || row["Fecha"] || row["fecha"];
                if (typeof cantidad === "string") {
                    const match = cantidad.match(/\d+/);
                    cantidad = match ? parseInt(match[0], 10) : 0;
                }
                if (typeof fecha === "string" && fecha.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
                    const [d, m, y] = fecha.split("/");
                    fecha = `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
                } else if (typeof fecha === "number" && !isNaN(fecha)) {
                        // Serial de Excel a fecha UTC sin problema de timezone
                        let days = Math.floor(fecha);
                        const excelEpochMs = Date.UTC(1899, 11, 30);
                        const dateMs = excelEpochMs + days * 86400000;
                        const dateObj = new Date(dateMs);
                        const y = dateObj.getUTCFullYear();
                        const m = String(dateObj.getUTCMonth() + 1).padStart(2, "0");
                        const d = String(dateObj.getUTCDate()).padStart(2, "0");
                        fecha = `${y}-${m}-${d}`;
                }
                if (!articulo || !cantidad || !fecha || !codigo) continue;
                await Entrada.create({
                    articulo,
                    cantidad,
                    fecha,
                    codigo
                });
                count++;
            }
            res.json({ message: "Archivo de entradas procesado correctamente", count });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const crearEntradaController = async (req, res) => {
    try {
        const { articulo, cantidad, codigo, fecha } = req.body;
        if (!articulo || !cantidad || !codigo || !fecha) {
            return res.status(400).json({ error: "Faltan datos requeridos" });
        }
        const nuevaEntrada = await crearEntrada({ articulo, cantidad, codigo, fecha });
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
export const eliminarEntradaController = async (req, res) => {
    try {
        const { id } = req.params;
        const resultado = await eliminarEntrada(id);
        res.status(200).json(resultado);
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