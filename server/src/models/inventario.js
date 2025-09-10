import { sequelize } from "../config/configDB.js";
import { DataTypes } from "sequelize";

export const Inventario = sequelize.define("inventario", {
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
    entrada: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    salida: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    }
},
{
    tableName: "inventario",
    timestamps: true
});