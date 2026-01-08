import { crearSalida,
    actualizarSalida,
    obtenerSalidaPorArticulo,
    obtenerSalidaPorFecha,
    obtenerSalidas
 } from "../services/salida.service.js";
import { Salida } from "../models/salida.js";
 import xlsx from "xlsx";


export const crearSalidaController = async (req, res) => {
    try {
        const { articulo, cantidad, codigo, area, destinatario, fecha } = req.body;
        if (!articulo || !cantidad || !codigo || !area || !destinatario || !fecha) {
            return res.status(400).json({ error: "Faltan datos requeridos" });
        }
        const nuevaSalida = await crearSalida({ articulo, cantidad, codigo, area, destinatario, fecha });
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

// ...existing code...
export const uploadExcelSalidasController = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No se subió ningún archivo" });
    }

    // Eliminar todas las salidas existentes
    await Salida.destroy({ where: {}, truncate: true });

    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames.find(
      (name) => name.toUpperCase() === "DATOS"
    );
    if (!sheetName) {
      return res
        .status(400)
        .json({ error: "El archivo no contiene la hoja DATOS" });
    }

    const sheet = workbook.Sheets[sheetName];
    const raw = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: "" });
    if (!raw || raw.length === 0) {
      return res
        .status(400)
        .json({ error: "La hoja DATOS está vacía o no tiene filas." });
    }

    let headerRowIdx = raw.findIndex(
      (row) =>
        row.some(
          (cell) =>
            typeof cell === "string" && cell.toLowerCase().includes("fecha")
        ) &&
        row.some(
          (cell) =>
            typeof cell === "string" && cell.toLowerCase().includes("area")
        ) &&
        row.some(
          (cell) =>
            typeof cell === "string" && cell.toLowerCase().includes("destino")
        ) &&
        row.some(
          (cell) =>
            typeof cell === "string" &&
            cell.toLowerCase().includes("articulo")
        ) &&
        row.some(
          (cell) =>
            typeof cell === "string" && cell.toLowerCase().includes("canti")
        )
    );

    if (headerRowIdx === -1) {
      return res
        .status(400)
        .json({ error: "No se encontró la fila de títulos esperada." });
    }

    const headers = raw[headerRowIdx];
    const idxFecha = headers.findIndex(
      (h) => h && h.toString().toLowerCase().includes("fecha")
    );
    const idxArea = headers.findIndex(
      (h) => h && h.toString().toLowerCase().includes("area")
    );
    const idxDestino = headers.findIndex(
      (h) => h && h.toString().toLowerCase().includes("destino")
    );
    const idxArticulo = headers.findIndex(
      (h) => h && h.toString().toLowerCase().includes("articulo")
    );
    const idxCantidad = headers.findIndex(
      (h) => h && h.toString().toLowerCase().includes("canti")
    );

    let count = 0;

    for (let i = headerRowIdx + 1; i < raw.length; i++) {
      const row = raw[i];
      const rawFecha = row[idxFecha];
      const area = row[idxDestino];
      const destinatario = row[idxArea];
      const articulo = row[idxArticulo];
      let cantidad = row[idxCantidad];

      if (typeof cantidad === "string") {
        const match = cantidad.match(/\d+/);
        cantidad = match ? parseInt(match[0], 10) : 0;
      }

      // 🔹 PARSEO SEGURO DE FECHA A STRING YYYY-MM-DD
      let parsedFecha = null;

      if (
        typeof rawFecha === "string" &&
        rawFecha.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)
      ) {
        // formato d/m/yyyy
        const [d, m, y] = rawFecha.split("/");
        parsedFecha = `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
      } else if (typeof rawFecha === "number" && !isNaN(rawFecha)) {
        // serial de Excel
    let days = Math.floor(rawFecha);
    const excelEpochMs = Date.UTC(1899, 11, 30);
    const dateMs = excelEpochMs + days * 86400000;
    const dateObj = new Date(dateMs);

        // ⚠️ Solo partes UTC → string
        const y = dateObj.getUTCFullYear();
        const m = String(dateObj.getUTCMonth() + 1).padStart(2, "0");
        const d = String(dateObj.getUTCDate()).padStart(2, "0");
        parsedFecha = `${y}-${m}-${d}`;
      } else if (rawFecha instanceof Date) {
        // si XLSX ya devolvió un Date
        const y = rawFecha.getFullYear();
        const m = String(rawFecha.getMonth() + 1).padStart(2, "0");
        const d = String(rawFecha.getDate()).padStart(2, "0");
        parsedFecha = `${y}-${m}-${d}`;
      }

      if (!articulo || !cantidad || !parsedFecha) continue;

      await Salida.create({
        articulo,
        cantidad,
        fecha: parsedFecha,
        area: area || "",
        destinatario: destinatario || "",
        codigo: "SIN-CODIGO",
        inventarioId: null,
      });

      count++;
    }

    res.json({ message: "Archivo de salidas procesado correctamente", count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
