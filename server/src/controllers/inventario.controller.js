import { crearInventario, 
    actualizarInventario, 
    eliminarInventario, 
    obtenerInventarioPorArticulo, 
    obtenerInventarios,
    bulkCrearInventario
} from "../services/inventario.service.js";
import { Inventario } from "../models/inventario.js";
import xlsx from 'xlsx';

export const uploadExcelInventarioController = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se subió ningún archivo' });
    }

    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames.find(name => name.toUpperCase() === "INVENTARIO");
    if (!sheetName) {
      return res.status(400).json({ error: 'El archivo no contiene la hoja INVENTARIO' });
    }

    const sheet = workbook.Sheets[sheetName];
    const rawData = xlsx.utils.sheet_to_json(sheet);

    // Mapear columnas del Excel a tu modelo
    const data = rawData.map(row => ({
      articulo: row.DESCRIPCION,
      codigo: row.CODIGO,
      entrada: Number(row.ENTRADA) || 0,
      salida: Number(row.SALIDA) || 0,
      cantidad: (Number(row.ENTRADA) || 0) - (Number(row.SALIDA) || 0)
    }));

    // Filtrar filas vacías o sin datos relevantes
    const cleanData = data.filter(d => d.articulo && d.codigo);

    if (cleanData.length === 0) {
      return res.status(400).json({ error: 'No se encontraron registros válidos en la hoja INVENTARIO' });
    }

    await bulkCrearInventario(cleanData);

    res.json({ message: 'Archivo procesado correctamente', count: cleanData.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


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

export const importRegistro = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No se envió ningún archivo." });
    }

    // Leer el archivo Excel subido desde buffer
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheet = workbook.Sheets["REGISTRO"];

    if (!sheet) {
      return res.status(400).json({ error: "No existe la hoja REGISTRO en el archivo." });
    }

    const data = xlsx.utils.sheet_to_json(sheet, { defval: "" });

    for (const row of data) {
      const codigo = row["COD."] || row["COD"];
      const descripcion = row["DESCRIPCION"];

      if (!codigo || !descripcion) continue;

      const existe = await Inventario.findOne({ where: { codigo } });

      if (!existe) {
        await Inventario.create({
          codigo,
          articulo: descripcion,
          cantidad: 0,
        });
      }
    }

    res.json({ message: "Importación de REGISTRO completada." });
  } catch (err) {
    console.error("Error importando REGISTRO:", err);
    res.status(500).json({ error: "Error procesando la hoja REGISTRO." });
  }
};