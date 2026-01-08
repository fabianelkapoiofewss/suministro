import { sequelize } from "../config/configDB.js";
import { DataTypes } from "sequelize";


export const Salida = sequelize.define("salida", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    articulo: {
        type: DataTypes.STRING,
        allowNull: false
    },
    cantidad: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    codigo: {
        type: DataTypes.STRING,
        allowNull: false
    },
    fecha: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    area: {
        type: DataTypes.STRING,
        allowNull: false
    },
    destinatario: {
        type: DataTypes.STRING,
        allowNull: false
    },
},
{
    tableName: "salida",
    timestamps: true
});
