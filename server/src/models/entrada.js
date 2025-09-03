import { sequelize } from "../config/configDB.js";
import { DataTypes } from "sequelize";

export const Entrada = sequelize.define("entrada", {
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
        type: DataTypes.DATE,
        allowNull: false
    },
},
{
    tableName: "entrada",
    timestamps: true
});
