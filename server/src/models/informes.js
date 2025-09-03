import { sequelize } from "../config/configDB.js";
import { DataTypes } from "sequelize";


export const Informes = sequelize.define("informes", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    cantidad: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    fecha: {
        type: DataTypes.DATE,
        allowNull: false
    },
},
{
    tableName: "informes",
    timestamps: true
});