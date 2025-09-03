import { Inventario } from "./inventario.js";
import { Salida } from "./salida.js";
import { Entrada } from "./entrada.js";


const relaciones = () => {
    Inventario.hasMany(Salida, { 
        foreignKey: "inventarioId",
        as: "salidas"
    });
    Salida.belongsTo(Inventario, { 
        foreignKey: "inventarioId",
        as: "inventario"
    });
    Inventario.hasMany(Entrada, { 
        foreignKey: "inventarioId",
        as: "entradas"
    });
    Entrada.belongsTo(Inventario, { 
        foreignKey: "inventarioId",
        as: "inventario"
    });
};

export default relaciones;