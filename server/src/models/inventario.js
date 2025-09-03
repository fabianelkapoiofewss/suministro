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
    }
},
{
    tableName: "inventario",
    timestamps: true
});